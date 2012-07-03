/*global defineSuite*/
defineSuite([
             'DynamicScene/DynamicPoint',
             'DynamicScene/DynamicObject',
             'Core/JulianDate',
             'Core/Color',
             'Core/Iso8601',
             'Core/TimeInterval'
            ], function(
              DynamicPoint,
              DynamicObject,
              JulianDate,
              Color,
              Iso8601,
              TimeInterval) {
    "use strict";
    /*global it,expect*/

    it('processCzmlPacket adds data for infinite point.', function() {
        var pointPacket = {
            point : {
                color : {
                    rgbaf : [0.1, 0.1, 0.1, 0.1]
                },
                pixelSize : 1.0,
                outlineColor : {
                    rgbaf : [0.2, 0.2, 0.2, 0.2]
                },
                outlineWidth : 1.0,
                show : true
            }
        };

        var dynamicObject = new DynamicObject('dynamicObject');
        expect(DynamicPoint.processCzmlPacket(dynamicObject, pointPacket)).toEqual(true);

        expect(dynamicObject.point).toBeDefined();
        expect(dynamicObject.point.color.getValue(Iso8601.MINIMUM_VALUE)).toEqual(new Color(0.1, 0.1, 0.1, 0.1));
        expect(dynamicObject.point.pixelSize.getValue(Iso8601.MINIMUM_VALUE)).toEqual(pointPacket.point.pixelSize);
        expect(dynamicObject.point.outlineColor.getValue(Iso8601.MINIMUM_VALUE)).toEqual(new Color(0.2, 0.2, 0.2, 0.2));
        expect(dynamicObject.point.outlineWidth.getValue(Iso8601.MINIMUM_VALUE)).toEqual(pointPacket.point.outlineWidth);
        expect(dynamicObject.point.show.getValue(Iso8601.MINIMUM_VALUE)).toEqual(true);
    });

    it('processCzmlPacket adds data for constrained point.', function() {
        var pointPacket = {
            point : {
                interval : '2000-01-01/2001-01-01',
                color : {
                    rgbaf : [0.1, 0.1, 0.1, 0.1]
                },
                pixelSize : 1.0,
                outlineColor : {
                    rgbaf : [0.2, 0.2, 0.2, 0.2]
                },
                outlineWidth : 1.0,
                show : true
            }
        };

        var validTime = TimeInterval.fromIso8601(pointPacket.point.interval).start;
        var invalidTime = validTime.addSeconds(-1);

        var dynamicObject = new DynamicObject('dynamicObject');
        expect(DynamicPoint.processCzmlPacket(dynamicObject, pointPacket)).toEqual(true);

        expect(dynamicObject.point).toBeDefined();
        expect(dynamicObject.point.color.getValue(validTime)).toEqual(new Color(0.1, 0.1, 0.1, 0.1));
        expect(dynamicObject.point.pixelSize.getValue(validTime)).toEqual(pointPacket.point.pixelSize);
        expect(dynamicObject.point.outlineColor.getValue(validTime)).toEqual(new Color(0.2, 0.2, 0.2, 0.2));
        expect(dynamicObject.point.outlineWidth.getValue(validTime)).toEqual(pointPacket.point.outlineWidth);
        expect(dynamicObject.point.show.getValue(validTime)).toEqual(true);

        expect(dynamicObject.point.color.getValue(invalidTime)).toBeUndefined();
        expect(dynamicObject.point.pixelSize.getValue(invalidTime)).toBeUndefined();
        expect(dynamicObject.point.outlineColor.getValue(invalidTime)).toBeUndefined();
        expect(dynamicObject.point.outlineWidth.getValue(invalidTime)).toBeUndefined();
        expect(dynamicObject.point.show.getValue(invalidTime)).toBeUndefined();
    });

    it('processCzmlPacket returns false if no data.', function() {
        var packet = {};
        var dynamicObject = new DynamicObject('dynamicObject');
        expect(DynamicPoint.processCzmlPacket(dynamicObject, packet)).toEqual(false);
        expect(dynamicObject.point).toBeUndefined();
    });

    it('mergeProperties does not change a fully configured point', function() {
        var objectToMerge = new DynamicObject('objectToMerge');
        objectToMerge.point = new DynamicPoint();
        objectToMerge.point.color = 1;
        objectToMerge.point.pixelSize = 2;
        objectToMerge.point.outlineColor = 3;
        objectToMerge.point.outlineWidth = 4;
        objectToMerge.point.show = 5;

        var targetObject = new DynamicObject('targetObject');
        targetObject.point = new DynamicPoint();
        objectToMerge.point.color = 6;
        objectToMerge.point.pixelSize = 7;
        objectToMerge.point.outlineColor = 8;
        objectToMerge.point.outlineWidth = 9;
        objectToMerge.point.show = 10;

        DynamicPoint.mergeProperties(targetObject, objectToMerge);

        expect(targetObject.point.color).toEqual(targetObject.point.color);
        expect(targetObject.point.pixelSize).toEqual(targetObject.point.pixelSize);
        expect(targetObject.point.outlineColor).toEqual(targetObject.point.outlineColor);
        expect(targetObject.point.outlineWidth).toEqual(targetObject.point.outlineWidth);
        expect(targetObject.point.show).toEqual(targetObject.point.show);
    });

    it('mergeProperties creates and configures an undefined point', function() {
        var objectToMerge = new DynamicObject('objectToMerge');
        objectToMerge.point = new DynamicPoint();
        objectToMerge.point.color = 1;
        objectToMerge.point.pixelSize = 2;
        objectToMerge.point.outlineColor = 3;
        objectToMerge.point.outlineWidth = 4;
        objectToMerge.point.show = 5;

        var targetObject = new DynamicObject('targetObject');

        DynamicPoint.mergeProperties(targetObject, objectToMerge);

        expect(targetObject.point.color).toEqual(objectToMerge.point.color);
        expect(targetObject.point.pixelSize).toEqual(objectToMerge.point.pixelSize);
        expect(targetObject.point.outlineColor).toEqual(objectToMerge.point.outlineColor);
        expect(targetObject.point.outlineWidth).toEqual(objectToMerge.point.outlineWidth);
        expect(targetObject.point.show).toEqual(objectToMerge.point.show);
    });

    it('mergeProperties does not change when used with an undefined point', function() {
        var objectToMerge = new DynamicObject('objectToMerge');

        var targetObject = new DynamicObject('targetObject');
        targetObject.point = new DynamicPoint();
        targetObject.point = new DynamicPoint();
        targetObject.point.color = 1;
        targetObject.point.pixelSize = 2;
        targetObject.point.outlineColor = 3;
        targetObject.point.outlineWidth = 4;
        targetObject.point.show = 5;

        DynamicPoint.mergeProperties(targetObject, objectToMerge);

        expect(targetObject.point.scale).toEqual(targetObject.point.scale);
        expect(targetObject.point.horizontalOrigin).toEqual(targetObject.point.horizontalOrigin);
        expect(targetObject.point.verticalOrigin).toEqual(targetObject.point.verticalOrigin);
        expect(targetObject.point.color).toEqual(targetObject.point.color);
        expect(targetObject.point.eyeOffset).toEqual(targetObject.point.eyeOffset);
        expect(targetObject.point.pixelOffset).toEqual(targetObject.point.pixelOffset);
        expect(targetObject.point.show).toEqual(targetObject.point.show);
    });

    it('undefineProperties works', function() {
        var testObject = new DynamicObject('testObject');
        testObject.point = new DynamicPoint();
        DynamicPoint.undefineProperties(testObject);
        expect(testObject.point).toBeUndefined();
    });
});