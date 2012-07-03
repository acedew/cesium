/*global define*/
define(['./TimelineTrack',
        './TimelineHighlightRange',
        '../Core/Clock',
        '../Core/ClockRange',
        '../Core/JulianDate'
        ], function (
         TimelineTrack,
         TimelineHighlightRange,
         Clock,
         ClockRange,
         JulianDate) {
        "use strict";

    var timelineWheelDelta = 1e12;

    var timelineMouseMode = {
        none : 0,
        scrub : 1,
        slide : 2,
        zoom : 3,
        touchOnly : 4
    };
    var timelineTouchMode = {
        none : 0,
        scrub : 1,
        slideZoom : 2,
        singleTap : 3,
        ignore : 4
    };

    var timelineTicScales = [0.001, 0.002, 0.005, 0.01, 0.02, 0.05, 0.1, 0.25, 0.5, 1.0, 2.0, 5.0, 10.0, 15.0, 30.0, 60.0, // 1min
    120.0, // 2min
    300.0, // 5min
    600.0, // 10min
    900.0, // 15min
    1800.0, // 30min
    3600.0, // 1hr
    7200.0, // 2hr
    14400.0, // 4hr
    21600.0, // 6hr
    43200.0, // 12hr
    86400.0, // 24hr
    172800.0, // 2days
    345600.0, // 4days
    604800.0, // 7days
    1296000.0, // 15days
    2592000.0, // 30days
    5184000.0, // 60days
    7776000.0, // 90days
    15552000.0, // 180days
    31536000.0, // 365days
    63072000.0, // 2years
    126144000.0, // 4years
    157680000.0, // 5years
    315360000.0, // 10years
    630720000.0, // 20years
    1261440000.0, // 40years
    1576800000.0, // 50years
    3153600000.0, // 100years
    6307200000.0, // 200years
    12614400000.0, // 400years
    15768000000.0, // 500years
    31536000000.0 // 1000years
    ];

    var timelineMonthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    function Timeline(id, clock) {
        if (typeof (id) === 'string') {
            this._topElement = document.getElementById(id);
        } else {
            this._topElement = id;
        }
        this._clock = clock;
        this._scrubJulian = clock.currentTime;
        this._mouseMode = timelineMouseMode.none;
        this._touchMode = timelineTouchMode.none;
        this._touchState = {
            centerX : 0,
            spanX : 0
        };
        this._mouseX = 0;
        var self = this;

        this._topElement.className += ' timelineMain';
        this._topElement.innerHTML = '<div class="timelineBar"></div><div class="timelineTrackContainer">' +
                                     '<canvas class="timelineTracks" width="10" height="1">' +
                                     '</canvas></div><div class="timelineNeedle"></div><span class="timelineRuler"></span>';
        this._timeBarEle = this._topElement.childNodes[0];
        this._trackContainer = this._topElement.childNodes[1];
        this._trackListEle = this._topElement.childNodes[1].childNodes[0];
        this._needleEle = this._topElement.childNodes[2];
        this._rulerEle = this._topElement.childNodes[3];
        this._context = this._trackListEle.getContext('2d');

        this._trackList = [];
        this._highlightRanges = [];

        this.zoomTo(clock.startTime, clock.stopTime);

        this._timeBarEle.addEventListener('mousedown', function(e) {
            self._handleMouseDown(e);
        }, false);
        document.addEventListener('mouseup', function(e) {
            self._handleMouseUp(e);
        }, false);
        document.addEventListener('mousemove', function(e) {
            self._handleMouseMove(e);
        }, false);
        this._timeBarEle.addEventListener('DOMMouseScroll', function(e) {
            self._handleMouseWheel(e);
        }, false); // Mozilla mouse wheel
        this._timeBarEle.addEventListener('mousewheel', function(e) {
            self._handleMouseWheel(e);
        }, false);
        this._timeBarEle.addEventListener('touchstart', function(e) {
            self._handleTouchStart(e);
        }, false);
        document.addEventListener('touchmove', function(e) {
            self._handleTouchMove(e);
        }, false);
        document.addEventListener('touchend', function(e) {
            self._handleTouchEnd(e);
        }, false);
        this._topElement.oncontextmenu = function() {
            return false;
        };

        window.addEventListener('resize', function() {
            self.handleResize();
        }, false);

        this.addEventListener = function(type, listener, useCapture) {
            self._topElement.addEventListener(type, listener, useCapture);
        };
    }

    Timeline.prototype.addHighlightRange = function(color, heightInPx) {
        var newHighlightRange = new TimelineHighlightRange(color, heightInPx);
        this._highlightRanges.push(newHighlightRange);
        this.handleResize();
        return newHighlightRange;
    };

    Timeline.prototype.addTrack = function(interval, heightInPx, color, backgroundColor) {
        var newTrack = new TimelineTrack(interval, heightInPx, color, backgroundColor);
        this._trackList.push(newTrack);
        this.handleResize();
        return newTrack;
    };

    Timeline.prototype.zoomTo = function(startJulianDate, endJulianDate) {
        this._timeBarSecondsSpan = startJulianDate.getSecondsDifference(endJulianDate);
        if (this._timeBarSecondsSpan >= 0) {
            this._startJulian = startJulianDate;
            this._endJulian = endJulianDate;
        } else {
            this._timeBarSecondsSpan = -this._timeBarSecondsSpan;
            this._startJulian = endJulianDate;
            this._endJulian = startJulianDate;
        }

        // If clock is not unbounded, clamp timeline range to clock.
        if (this._clock && (this._clock.clockRange !== ClockRange.UNBOUNDED)) {
            var clockStart = this._clock.startTime;
            var clockEnd = this._clock.stopTime;
            var clockSpan = clockStart.getSecondsDifference(clockEnd);
            var startOffset = this._startJulian.getSecondsDifference(clockStart);
            var endOffset = this._endJulian.getSecondsDifference(clockEnd);

            if (this._timeBarSecondsSpan >= clockSpan) {
                // if new duration longer than clock range duration, clamp to full range.
                this._timeBarSecondsSpan = clockSpan;
                this._startJulian = this._clock.startTime;
                this._endJulian = this._clock.stopTime;
            } else if (startOffset > 0) {
                // if timeline start is before clock start, shift right
                this._endJulian = this._endJulian.addSeconds(startOffset);
                this._startJulian = clockStart;
                this._timeBarSecondsSpan = this._startJulian.getSecondsDifference(this._endJulian);
            } else if (endOffset < 0) {
                // if timeline end is after clock end, shift left
                this._startJulian = this._startJulian.addSeconds(endOffset);
                this._endJulian = clockEnd;
                this._timeBarSecondsSpan = this._startJulian.getSecondsDifference(this._endJulian);
            }
        }

        this.handleResize();

        var evt = document.createEvent('Event');
        evt.initEvent('setzoom', true, true);
        evt.startJulian = this._startJulian;
        evt.endJulian = this._endJulian;
        this._topElement.dispatchEvent(evt);
    };

    Timeline.prototype.zoomFrom = function(amount) {
        var centerSec = this._startJulian.getSecondsDifference(this._scrubJulian);
        if ((centerSec < 0) || (centerSec > this._timeBarSecondsSpan)) {
            centerSec = this._timeBarSecondsSpan * 0.5;
        }
        var centerSecFlip = this._timeBarSecondsSpan - centerSec;
        this.zoomTo(this._startJulian.addSeconds(centerSec - (centerSec * amount)), this._endJulian.addSeconds((centerSecFlip * amount) - centerSecFlip));
    };

    function twoDigits(num) {
        return ((num < 10) ? ('0' + num.toString()) : num.toString());
    }

    Timeline.prototype.makeLabel = function(date) {
        var hours = date.getUTCHours();
        var ampm = (hours < 12) ? ' AM' : ' PM';
        if (hours >= 13) {
            hours -= 12;
        } else if (hours === 0) {
            hours = 12;
        }
        var mils = date.getUTCMilliseconds(), milString = '';
        if ((mils > 0) && (this._timeBarSecondsSpan < 3600)) {
            milString = mils.toString();
            while (milString.length < 3) {
                milString = '0' + milString;
            }
            milString = '.' + milString;
        }

        return timelineMonthNames[date.getUTCMonth()] + ' ' + date.getUTCDate() + ' ' + date.getUTCFullYear() + ' ' + twoDigits(hours) + ':' + twoDigits(date.getUTCMinutes()) + ':' +
                twoDigits(date.getUTCSeconds()) + milString + ampm;
    };

    Timeline.prototype._makeTics = function() {
        var timeBar = this._timeBarEle;

        var seconds = this._startJulian.getSecondsDifference(this._scrubJulian);
        var xPos = seconds * this._topElement.clientWidth / this._timeBarSecondsSpan;
        var scrubX = xPos - 8, tic;
        var self = this;

        this._needleEle.style.left = xPos.toString() + 'px';

        var tics = '<span class="timelineIcon16" style="left:' + scrubX + 'px;bottom:0;background-position: 0px 0px;"></span>';

        var MinimumDuration = 0.01;
        var MaximumDuration = 31536000000.0; // ~1000 years
        var Epsilon = 1e-10;

        // If time step size is known, enter it here...
        var minSize = 0;

        // StartTime is the number of seconds into the day of _startJulian.
        var StartTime = this._startJulian.getSecondsOfDay() - 0.0001;
        var Duration = this._timeBarSecondsSpan;
        if (Duration < MinimumDuration) {
            Duration = MinimumDuration;
            this._timeBarSecondsSpan = MinimumDuration;
            this._endJulian = this._startJulian.addSeconds(MinimumDuration);
        } else if (Duration > MaximumDuration) {
            Duration = MaximumDuration;
            this._timeBarSecondsSpan = MaximumDuration;
            this._endJulian = this._startJulian.addSeconds(MaximumDuration);
        }

        var epochJulian;
        if (Duration > 31536000) { // 365 days
            epochJulian = JulianDate.fromDate(new Date(this._startJulian.toDate().getFullYear().toString().substring(0, 3) + '0-01-01'));
            StartTime = epochJulian.addSeconds(0.01).getSecondsDifference(this._startJulian);
        } else if (Duration > 86400) { // 1 day
            epochJulian = JulianDate.fromDate(new Date(this._startJulian.toDate().getFullYear().toString() + '-01-01'));
            StartTime = epochJulian.addSeconds(0.01).getSecondsDifference(this._startJulian);
        } else {
            epochJulian = this._startJulian.addSeconds(-StartTime);
        }
        var EndTime = StartTime + Duration;
        var timeBarWidth = this._timeBarEle.clientWidth;
        if (timeBarWidth < 10) {
            timeBarWidth = 10;
        }
        var startJulian = this._startJulian;

        function getStartTic(ticScale) {
            return Math.ceil((StartTime / ticScale) - 1.0) * ticScale;
        }

        function getNextTic(tic, ticScale) {
            return Math.ceil((tic / ticScale) + 0.5) * ticScale;
        }

        function getAlpha(time) {
            return (time - StartTime) / Duration;
        }

        function getTicLabel(tic) {
            var date = startJulian.addSeconds(tic - StartTime).toDate();
            //return date.toString();
            return self.makeLabel(date);
        }

        function remainder(x, y) {
            //return x % y;
            return x - (y * Math.round(x / y));
        }

        // Width in pixels of a typical label, plus padding
        this._rulerEle.innerHTML = getTicLabel(EndTime - MinimumDuration);
        var sampleWidth = this._rulerEle.offsetWidth + 20;

        var origMinSize = minSize;
        minSize -= Epsilon;

        var renderState = {
            y : 0,
            startTime : StartTime,
            startJulian : startJulian,
            epochJulian : epochJulian,
            duration : Duration,
            timeBarWidth : timeBarWidth,
            getAlpha : getAlpha
        };
        this._highlightRanges.forEach(function(highlightRange) {
            tics += highlightRange.render(renderState);
        });

        // Calculate tic mark label spacing in the TimeBar.
        var mainTic = 0.0, subTic = 0.0, tinyTic = 0.0;
        // Ideal labeled tic as percentage of zoom interval
        var idealTic = sampleWidth / timeBarWidth;
        if (idealTic > 1.0) {
            // Clamp to width of window, for thin windows.
            idealTic = 1.0;
        }
        // Ideal labeled tic size in seconds
        idealTic *= this._timeBarSecondsSpan;
        var ticIndex = -1, smallestIndex = -1;

        var i, ticScaleLen = timelineTicScales.length;
        for (i = 0; i < ticScaleLen; ++i) {
            var sc = timelineTicScales[i];
            ++ticIndex;
            mainTic = sc;
            // Find acceptable main tic size not smaller than ideal size.
            if ((sc > idealTic) && (sc > minSize)) {
                break;
            }
            if ((smallestIndex < 0) && ((timeBarWidth * (sc / this._timeBarSecondsSpan)) >= 3.0)) {
                smallestIndex = ticIndex;
            }
        }
        if (ticIndex > 0) {
            while (ticIndex > 0) // Compute sub-tic size that evenly divides main tic.
            {
                --ticIndex;
                if (Math.abs(remainder(mainTic, timelineTicScales[ticIndex])) < 0.00001) {
                    if (timelineTicScales[ticIndex] >= minSize) {
                        subTic = timelineTicScales[ticIndex];
                    }
                    break;
                }
            }

            if (smallestIndex >= 0) {
                while (smallestIndex < ticIndex) // Compute tiny tic size that evenly divides sub-tic.
                {
                    if ((Math.abs(remainder(subTic, timelineTicScales[smallestIndex])) < 0.00001) && (timelineTicScales[smallestIndex] >= minSize)) {
                        tinyTic = timelineTicScales[smallestIndex];
                        break;
                    }
                    ++smallestIndex;
                }
            }
        }

        minSize = origMinSize;
        if ((minSize > Epsilon) && (tinyTic < 0.00001) && (Math.abs(minSize - mainTic) > Epsilon)) {
            tinyTic = minSize;
            if (minSize <= (mainTic + Epsilon)) {
                subTic = 0.0;
            }
        }

        var lastTextLeft = -999999, textWidth;
        if ((timeBarWidth * (tinyTic / this._timeBarSecondsSpan)) >= 3.0) {
            for (tic = getStartTic(tinyTic); tic <= EndTime; tic = getNextTic(tic, tinyTic)) {
                tics += '<span class="timelineTicTiny" style="left: ' + Math.round(timeBarWidth * getAlpha(tic)).toString() + 'px;"></span>';
            }
        }
        if ((timeBarWidth * (subTic / this._timeBarSecondsSpan)) >= 3.0) {
            for (tic = getStartTic(subTic); tic <= EndTime; tic = getNextTic(tic, subTic)) {
                tics += '<span class="timelineTicSub" style="left: ' + Math.round(timeBarWidth * getAlpha(tic)).toString() + 'px;"></span>';
            }
        }
        if ((timeBarWidth * (mainTic / this._timeBarSecondsSpan)) >= 2.0) {
            for (tic = getStartTic(mainTic); tic <= (EndTime + mainTic); tic = getNextTic(tic, mainTic)) {
                var ticLeft = Math.round(timeBarWidth * getAlpha(tic));
                var ticLabel = getTicLabel(tic);
                this._rulerEle.innerHTML = ticLabel;
                textWidth = this._rulerEle.offsetWidth;
                var labelLeft = ticLeft - ((textWidth / 2) - 1);
                if (labelLeft > lastTextLeft) {
                    lastTextLeft = labelLeft + textWidth + 5;
                    tics += '<span class="timelineTicMain" style="left: ' + ticLeft.toString() + 'px;"></span>' + '<span class="timelineTicLabel" style="left: ' + labelLeft.toString() +
                            'px;">' + ticLabel + '</span>';
                } else {
                    tics += '<span class="timelineTicSub" style="left: ' + ticLeft.toString() + 'px;"></span>';
                }
            }
        }

        timeBar.innerHTML = tics;
        this._scrubElement = timeBar.childNodes[0];

        renderState.y = 0;
        this._trackList.forEach(function(track) {
            track.render(self._context, renderState);
            renderState.y += track.height;
        });
    };

    Timeline.prototype.updateFromClock = function() {
        this._scrubJulian = this._clock.currentTime;

        var seconds = this._startJulian.getSecondsDifference(this._scrubJulian);
        var xPos = seconds * this._topElement.clientWidth / this._timeBarSecondsSpan;

        if (this._scrubElement) {
            var scrubX = xPos - 8;
            this._scrubElement.style.left = scrubX.toString() + 'px';
            this._needleEle.style.left = xPos.toString() + 'px';
        }
    };

    Timeline.prototype._setTimeBarTime = function(xPos, seconds) {
        this._scrubJulian = this._startJulian.addSeconds(seconds);
        if (this._scrubElement) {
            var scrubX = xPos - 8;
            this._scrubElement.style.left = scrubX.toString() + 'px';
            this._needleEle.style.left = xPos.toString() + 'px';
        }

        var evt = document.createEvent('Event');
        evt.initEvent('settime', true, true);
        evt.clientX = xPos;
        evt.timeSeconds = seconds;
        evt.timeJulian = this._scrubJulian;
        this._topElement.dispatchEvent(evt);
    };

    Timeline.prototype._handleMouseDown = function(e) {
        if (this._mouseMode !== timelineMouseMode.touchOnly) {
            if (e.button === 0) {
                this._mouseMode = timelineMouseMode.scrub;
                if (this._scrubElement) {
                    this._scrubElement.style.backgroundPosition = '-16px 0';
                }
                this._handleMouseMove(e);
            } else {
                this._mouseX = e.clientX;
                if (e.button === 2) {
                    this._mouseMode = timelineMouseMode.zoom;
                } else {
                    this._mouseMode = timelineMouseMode.slide;
                }
            }
        }
        e.preventDefault();
    };
    Timeline.prototype._handleMouseUp = function(e) {
        this._mouseMode = timelineMouseMode.none;
        if (this._scrubElement) {
            this._scrubElement.style.backgroundPosition = '0px 0px';
        }
    };
    Timeline.prototype._handleMouseMove = function(e) {
        var dx;
        if (this._mouseMode === timelineMouseMode.scrub) {
            e.preventDefault();
            var x = e.clientX - this._topElement.getBoundingClientRect().left;
            if ((x >= 0) && (x <= this._topElement.clientWidth)) {
                this._setTimeBarTime(x, x * this._timeBarSecondsSpan / this._topElement.clientWidth);
            }
        } else if (this._mouseMode === timelineMouseMode.slide) {
            dx = this._mouseX - e.clientX;
            this._mouseX = e.clientX;
            if (dx !== 0) {
                var dsec = dx * this._timeBarSecondsSpan / this._topElement.clientWidth;
                this.zoomTo(this._startJulian.addSeconds(dsec), this._endJulian.addSeconds(dsec));
            }
        } else if (this._mouseMode === timelineMouseMode.zoom) {
            dx = this._mouseX - e.clientX;
            this._mouseX = e.clientX;
            if (dx !== 0) {
                this.zoomFrom(Math.pow(1.01, dx));
            }
        }
    };
    Timeline.prototype._handleMouseWheel = function(e) {
        var dy = e.wheelDeltaY || e.wheelDelta || (-e.detail);
        timelineWheelDelta = Math.max(Math.min(Math.abs(dy), timelineWheelDelta), 1);
        dy /= timelineWheelDelta;
        this.zoomFrom(Math.pow(1.05, -dy));
    };

    Timeline.prototype._handleTouchStart = function(e) {
        var len = e.touches.length, seconds, xPos, leftX = this._topElement.getBoundingClientRect().left;
        e.preventDefault();
        this._mouseMode = timelineMouseMode.touchOnly;
        if (len === 1) {
            seconds = this._startJulian.getSecondsDifference(this._scrubJulian);
            xPos = seconds * this._topElement.clientWidth / this._timeBarSecondsSpan + leftX;
            if (Math.abs(e.touches[0].clientX - xPos) < 50) {
                this._touchMode = timelineTouchMode.scrub;
                if (this._scrubElement) {
                    this._scrubElement.style.backgroundPosition = (len === 1) ? '-16px 0' : '0 0';
                }
            } else {
                this._touchMode = timelineTouchMode.singleTap;
                this._touchState.centerX = e.touches[0].clientX - leftX;
            }
        } else if (len === 2) {
            this._touchMode = timelineTouchMode.slideZoom;
            this._touchState.centerX = (e.touches[0].clientX + e.touches[1].clientX) * 0.5 - leftX;
            this._touchState.spanX = Math.abs(e.touches[0].clientX - e.touches[1].clientX);
        } else {
            this._touchMode = timelineTouchMode.ignore;
        }
    };
    Timeline.prototype._handleTouchEnd = function(e) {
        var len = e.touches.length, leftX = this._topElement.getBoundingClientRect().left;
        if (this._touchMode === timelineTouchMode.singleTap) {
            this._touchMode = timelineTouchMode.scrub;
            this._handleTouchMove(e);
        } else if (this._touchMode === timelineTouchMode.scrub) {
            this._handleTouchMove(e);
        }
        this._mouseMode = timelineMouseMode.touchOnly;
        if (len !== 1) {
            this._touchMode = (len > 0) ? timelineTouchMode.ignore : timelineTouchMode.none;
        } else if (this._touchMode === timelineTouchMode.slideZoom) {
            this._touchState.centerX = e.touches[0].clientX - leftX;
        }
        if (this._scrubElement) {
            this._scrubElement.style.backgroundPosition = '0 0';
        }
    };
    Timeline.prototype._handleTouchMove = function(e) {
        var dx, x, len, newCenter, newSpan, newStartTime, zoom = 1, leftX = this._topElement.getBoundingClientRect().left;
        if (this._touchMode === timelineTouchMode.singleTap) {
            this._touchMode = timelineTouchMode.slideZoom;
        }
        this._mouseMode = timelineMouseMode.touchOnly;
        if (this._touchMode === timelineTouchMode.scrub) {
            e.preventDefault();
            if (e.changedTouches.length === 1) {
                x = e.changedTouches[0].clientX - leftX;
                if ((x >= 0) && (x <= this._topElement.clientWidth)) {
                    this._setTimeBarTime(x, x * this._timeBarSecondsSpan / this._topElement.clientWidth);
                }
            }
        } else if (this._touchMode === timelineTouchMode.slideZoom) {
            len = e.touches.length;
            if (len === 2) {
                newCenter = (e.touches[0].clientX + e.touches[1].clientX) * 0.5 - leftX;
                newSpan = Math.abs(e.touches[0].clientX - e.touches[1].clientX);
            } else if (len === 1) {
                newCenter = e.touches[0].clientX - leftX;
                newSpan = 0;
            }

            if (typeof newCenter !== 'undefined') {
                if ((newSpan > 0) && (this._touchState.spanX > 0)) {
                    // Zoom and slide
                    zoom = (this._touchState.spanX / newSpan);
                    newStartTime = this._startJulian.addSeconds(((this._touchState.centerX * this._timeBarSecondsSpan) - (newCenter * this._timeBarSecondsSpan * zoom)) /
                            this._topElement.clientWidth);
                } else {
                    // Slide to newCenter
                    dx = this._touchState.centerX - newCenter;
                    newStartTime = this._startJulian.addSeconds(dx * this._timeBarSecondsSpan / this._topElement.clientWidth);
                }

                this.zoomTo(newStartTime, newStartTime.addSeconds(this._timeBarSecondsSpan * zoom));
                this._touchState.centerX = newCenter;
                this._touchState.spanX = newSpan;
            }
        }
    };

    Timeline.prototype.handleResize = function() {
        var containerHeight = this._topElement.getBoundingClientRect().height - this._timeBarEle.getBoundingClientRect().height - 2;
        this._trackContainer.style.height = containerHeight.toString() + 'px';

        var trackListHeight = 1;
        this._trackList.forEach(function(track) {
            trackListHeight += track.height;
        });
        this._trackListEle.style.height = trackListHeight.toString() + 'px';
        this._trackListEle.width = this._trackListEle.clientWidth;
        this._trackListEle.height = trackListHeight;
        this._makeTics();
    };

    return Timeline;
});