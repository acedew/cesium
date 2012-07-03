/*global document,window,define*/
define(['dojo',
        'dijit/dijit',
        'Core/Clock',
        'Core/Color',
        'Core/JulianDate',
        'Core/TimeInterval',
        'Widgets/Timeline'
    ], function(
         dojo,
         dijit,
         Clock,
         Color,
         JulianDate,
         TimeInterval,
         Timeline) {
    "use strict";

    var startDatePart, endDatePart, startTimePart, endTimePart;
    var timeline, clock;

    function handleSetTime(e) {
        if (typeof timeline !== 'undefined') {
            var scrubJulian = e.timeJulian;
            clock.currentTime = scrubJulian;
            var date = scrubJulian.toDate();
            document.getElementById('mousePos').innerHTML = date.toUTCString();
        }
    }

    function handleSetZoom(e) {
        var span = timeline._timeBarSecondsSpan, spanUnits = 'sec';
        if (span > 31536000) {
            span /= 31536000;
            spanUnits = 'years';
        } else if (span > 2592000) {
            span /= 2592000;
            spanUnits = 'months';
        } else if (span > 604800) {
            span /= 604800;
            spanUnits = 'weeks';
        } else if (span > 86400) {
            span /= 86400;
            spanUnits = 'days';
        } else if (span > 3600) {
            span /= 3600;
            spanUnits = 'hours';
        } else if (span > 60) {
            span /= 60;
            spanUnits = 'minutes';
        }

        dojo.byId('formatted').innerHTML = '<br/>Start: ' + e.startJulian.toDate().toUTCString() + '<br/>Stop: ' + e.endJulian.toDate().toUTCString() + '<br/>Span: ' + span + ' ' + spanUnits;
        document.getElementById('mousePos').innerHTML = clock.currentTime.toDate().toUTCString();
    }

    function makeTimeline(startJulian, scrubJulian, endJulian) {
        clock = new Clock({
            startTime : startJulian,
            currentTime : scrubJulian,
            stopTime : endJulian
        });

        timeline = new Timeline('time1', clock);
        timeline.addEventListener('settime', handleSetTime, false);
        timeline.addEventListener('setzoom', handleSetZoom, false);

        timeline.addTrack(new TimeInterval(startJulian, startJulian.addSeconds(60*60)), 8, Color.RED, new Color(0.75, 0.75, 0.75, 0.5));
        timeline.addTrack(new TimeInterval(endJulian.addSeconds(-60*60), endJulian), 8, Color.GREEN);
        var middle = startJulian.getSecondsDifference(endJulian) / 4;
        timeline.addTrack(new TimeInterval(startJulian.addSeconds(middle), startJulian.addSeconds(middle * 3)), 8, Color.BLUE, new Color(0.75, 0.75, 0.75, 0.5));
    }

    // Adjust start/end dates in reaction to any calendar/time clicks
    //
    function newDatesSelected() {
        var startJulian, endJulian, startDate, endDate;

        if (startDatePart && startTimePart) {
            startDate = dojo.date.stamp.fromISOString(startDatePart + startTimePart + 'Z'); // + 'Z' for UTC
            startJulian = new JulianDate.fromDate(startDate);
        }
        if (endDatePart && endTimePart) {
            endDate = dojo.date.stamp.fromISOString(endDatePart + endTimePart + 'Z');
            endJulian = new JulianDate.fromDate(endDate);
        }

        if (startJulian && endJulian) {
            if (!timeline) {
                makeTimeline(startJulian, startJulian, endJulian);
            }
            clock.startTime = startJulian;
            clock.stopTime = endJulian;
            timeline.zoomTo(startJulian, endJulian);
        }
    }

    // React to calendar date clicks
    //
    function newStartDateSelected(newDate) {
        startDatePart = dojo.date.stamp.toISOString(newDate, {
            selector : 'date'
        });
        newDatesSelected();
    }
    function newEndDateSelected(newDate) {
        endDatePart = dojo.date.stamp.toISOString(newDate, {
            selector : 'date'
        });
        newDatesSelected();
    }

    // React to time-of-day selectors
    //
    function newStartTimeSelected(newTime) {
        startTimePart = newTime.toString().replace(/.*1970\s(\S+).*/, 'T$1');
        newDatesSelected();
    }
    function newEndTimeSelected(newTime) {
        endTimePart = newTime.toString().replace(/.*1970\s(\S+).*/, 'T$1');
        newDatesSelected();
    }

    dojo.ready(function() {
        dojo.connect(dijit.byId('startCal'), 'onChange', newStartDateSelected);
        dojo.connect(dijit.byId('endCal'), 'onChange', newEndDateSelected);
        dojo.connect(dijit.byId('startTimeSel'), 'onChange', newStartTimeSelected);
        dojo.connect(dijit.byId('endTimeSel'), 'onChange', newEndTimeSelected);

        dijit.byId('startTimeSel').set('value', 'T00:00:00');
        dijit.byId('endTimeSel').set('value', 'T24:00:00');

        var now = new Date();
        var today = now.getFullYear() + '-' + (now.getMonth() + 1) + '-' + now.getDate();
        var tomorrow = now.getFullYear() + '-' + (now.getMonth() + 1) + '-' + (now.getDate() + 1);
        dijit.byId('startCal').set('value', today);
        dijit.byId('endCal').set('value', tomorrow);
    });
});
