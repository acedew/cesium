/*global defineSuite*/
defineSuite([
             'DynamicScene/processCzml',
             'DynamicScene/DynamicObjectCollection',
             'DynamicScene/DynamicBillboard',
             'Core/JulianDate'
            ], function(
              processCzml,
              DynamicObjectCollection,
              DynamicBillboard,
              JulianDate) {
    "use strict";
    /*global it,expect,waitsFor*/

    var czml = {
        'id' : 'test',
        'billboard' : {
            'show' : true
        },
        'label' : {
            'show' : false
        }
    };

    var czmlArray = [{
        'id' : 'test',
        'billboard' : {
            'show' : true
        }
    }, {
        'id' : 'test',
        'label' : {
            'show' : false
        }
    }];

    var czmlNoID = {
        'billboard' : {
            'show' : true
        }
    };

    it('processCzml throws if czml is undefined', function() {
        var dynamicObjectCollection = new DynamicObjectCollection();
        expect(function() {
            processCzml(undefined, dynamicObjectCollection);
        }).toThrow();
    });

    it('processCzml throws if dynamicObjectCollection is undefined', function() {
        expect(function() {
            processCzml(czml, undefined);
        }).toThrow();
    });

    it('processCzml populates dynamicObjectCollection with expected data for an array of packets', function() {
        var dynamicObjectCollection = new DynamicObjectCollection();
        processCzml(czmlArray, dynamicObjectCollection);

        var testObject = dynamicObjectCollection.getObject('test');
        expect(testObject).toBeDefined();
        expect(testObject.billboard).toBeDefined();
        expect(testObject.billboard.show).toBeDefined();
        expect(testObject.billboard.show.getValue(new JulianDate())).toEqual(true);
        expect(testObject.label).toBeDefined();
        expect(testObject.label.show).toBeDefined();
        expect(testObject.label.show.getValue(new JulianDate())).toEqual(false);
    });

    it('processCzml populates dynamicObjectCollection with expected data for a single packet', function() {
        var dynamicObjectCollection = new DynamicObjectCollection();
        processCzml(czml, dynamicObjectCollection);

        var testObject = dynamicObjectCollection.getObject('test');
        expect(testObject).toBeDefined();
        expect(testObject.billboard).toBeDefined();
        expect(testObject.billboard.show).toBeDefined();
        expect(testObject.billboard.show.getValue(new JulianDate())).toEqual(true);
        expect(testObject.label).toBeDefined();
        expect(testObject.label.show).toBeDefined();
        expect(testObject.label.show.getValue(new JulianDate())).toEqual(false);
    });

    it('processCzml uses user-supplied updater functions', function() {
        var dynamicObjectCollection = new DynamicObjectCollection();
        processCzml(czml, dynamicObjectCollection, undefined, [DynamicBillboard.processCzmlPacket]);

        var testObject = dynamicObjectCollection.getObject('test');
        expect(testObject).toBeDefined();
        expect(testObject.billboard).toBeDefined();
        expect(testObject.billboard.show).toBeDefined();
        expect(testObject.billboard.show.getValue(new JulianDate())).toEqual(true);
        expect(testObject.label).toBeUndefined();
    });

    it('processCzml raises dynamicObjectCollection event', function() {
        var eventTriggered = false;
        var dynamicObjectCollection = new DynamicObjectCollection();
        dynamicObjectCollection.objectPropertiesChanged.addEventListener(function(dynamicObjectCollectionParam, updatedObjects) {
            expect(dynamicObjectCollectionParam).toEqual(dynamicObjectCollection);
            expect(updatedObjects.length).toEqual(1);
            expect(updatedObjects[0]).toEqual(dynamicObjectCollection.getObject('test'));
            expect(eventTriggered).toEqual(false);
            eventTriggered = true;
        });
        processCzml(czml, dynamicObjectCollection);
        waitsFor(function() {
            return eventTriggered;
        });
    });

    it('processCzml creates a new object for packets with no id.', function() {
        var dynamicObjectCollection = new DynamicObjectCollection();
        processCzml(czmlNoID, dynamicObjectCollection);

        var objects = dynamicObjectCollection.getObjects();
        expect(objects.length).toEqual(1);
        var testObject = objects[0];
        expect(testObject).toBeDefined();
        expect(testObject.id).toBeDefined();
        expect(testObject.billboard).toBeDefined();
        expect(testObject.billboard.show).toBeDefined();
        expect(testObject.billboard.show.getValue(new JulianDate())).toEqual(true);
    });

});