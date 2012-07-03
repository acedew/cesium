/*global defineSuite*/
defineSuite([
             'DynamicScene/ReferenceProperty',
             'DynamicScene/DynamicObjectCollection',
             'DynamicScene/DynamicObject',
             'Core/Iso8601'
            ], function(
              ReferenceProperty,
              DynamicObjectCollection,
              DynamicObject,
              Iso8601) {
    "use strict";
    /*global it,expect*/

    var testObjectLink = 'testObject.property';
    function createTestObject(dynamicObjectCollection, methodName) {
        var testObject = dynamicObjectCollection.getOrCreateObject('testObject');
        testObject.property = {};
        testObject.property[methodName] = function(time, result) {
            result.expectedTime = time;
            result.expectedValue = true;
            return result;
        };
        return testObject;
    }

    it('constructor throws if missing dynamicObjectCollection parameter', function() {
        expect(function(){
            return new ReferenceProperty(undefined, 'object', 'property');
        }).toThrow();
    });

    it('constructor throws if missing targetObjectId parameter', function() {
        expect(function(){
            return new ReferenceProperty(new DynamicObjectCollection(), undefined, 'property');
        }).toThrow();
    });

    it('constructor throws if missing targetPropertyName parameter', function() {
        expect(function(){
            return new ReferenceProperty(new DynamicObjectCollection(), 'object', undefined);
        }).toThrow();
    });

    it('fromString throws if missing dynamicObjectCollection parameter', function() {
        expect(function(){
            return ReferenceProperty.fromString(undefined, 'object.property');
        }).toThrow();
    });

    it('fromString throws if missing string parameter', function() {
        expect(function(){
            return ReferenceProperty.fromString(new DynamicObjectCollection(), undefined);
        }).toThrow();
    });

    it('fromString throws if invalid string parameter', function() {
        expect(function(){
            return ReferenceProperty.fromString(new DynamicObjectCollection(), 'a.b.c');
        }).toThrow();
    });

    it('getValue returned undefined for unresolved property', function() {
        var property = ReferenceProperty.fromString(new DynamicObjectCollection(), 'object.property');
        expect(property.getValue()).toBeUndefined();
    });

    it('getValueCartographic returned undefined for unresolved property', function() {
        var property = ReferenceProperty.fromString(new DynamicObjectCollection(), 'object.property');
        expect(property.getValueCartographic()).toBeUndefined();
    });

    it('getValueCartesian returned undefined for unresolved property', function() {
        var property = ReferenceProperty.fromString(new DynamicObjectCollection(), 'object.property');
        expect(property.getValueCartesian()).toBeUndefined();
    });

    it('getValueSpherical returned undefined for unresolved property', function() {
        var property = ReferenceProperty.fromString(new DynamicObjectCollection(), 'object.property');
        expect(property.getValueSpherical()).toBeUndefined();
    });

    it('Resolves getValue property on direct collection', function() {
        var dynamicObjectCollection = new DynamicObjectCollection();
        createTestObject(dynamicObjectCollection, 'getValue');
        var property = ReferenceProperty.fromString(dynamicObjectCollection, testObjectLink);
        var result = {};
        expect(property.getValue(Iso8601.MINIMUM_VALUE, result)).toEqual(result);
        expect(result.expectedValue).toEqual(true);
        expect(result.expectedTime).toEqual(Iso8601.MINIMUM_VALUE);
    });

    it('Resolves getValue property on parent collection', function() {
        var parent = new DynamicObjectCollection();
        var dynamicObjectCollection = new DynamicObjectCollection();
        dynamicObjectCollection.compositeCollection = parent;
        createTestObject(parent, 'getValue');
        var property = ReferenceProperty.fromString(dynamicObjectCollection, testObjectLink);
        var result = {};
        expect(property.getValue(Iso8601.MINIMUM_VALUE, result)).toEqual(result);
        expect(result.expectedValue).toEqual(true);
        expect(result.expectedTime).toEqual(Iso8601.MINIMUM_VALUE);
    });

    it('Resolves getValue property on direct collection', function() {
        var dynamicObjectCollection = new DynamicObjectCollection();
        createTestObject(dynamicObjectCollection, 'getValue');
        var property = ReferenceProperty.fromString(dynamicObjectCollection, testObjectLink);
        var result = {};
        expect(property.getValue(Iso8601.MINIMUM_VALUE, result)).toEqual(result);
        expect(result.expectedValue).toEqual(true);
        expect(result.expectedTime).toEqual(Iso8601.MINIMUM_VALUE);
    });

    it('Resolves getValueCartographic property on direct collection', function() {
        var dynamicObjectCollection = new DynamicObjectCollection();
        createTestObject(dynamicObjectCollection, 'getValueCartographic');
        var property = ReferenceProperty.fromString(dynamicObjectCollection, testObjectLink);
        var result = {};
        expect(property.getValueCartographic(Iso8601.MINIMUM_VALUE, result)).toEqual(result);
        expect(result.expectedValue).toEqual(true);
        expect(result.expectedTime).toEqual(Iso8601.MINIMUM_VALUE);
    });

    it('Resolves getValueCartesian property on direct collection', function() {
        var dynamicObjectCollection = new DynamicObjectCollection();
        createTestObject(dynamicObjectCollection, 'getValueCartesian');
        var property = ReferenceProperty.fromString(dynamicObjectCollection, testObjectLink);
        var result = {};
        expect(property.getValueCartesian(Iso8601.MINIMUM_VALUE, result)).toEqual(result);
        expect(result.expectedValue).toEqual(true);
        expect(result.expectedTime).toEqual(Iso8601.MINIMUM_VALUE);
    });

    it('Resolves getValueSpherical property on direct collection', function() {
        var dynamicObjectCollection = new DynamicObjectCollection();
        createTestObject(dynamicObjectCollection, 'getValueSpherical');
        var property = ReferenceProperty.fromString(dynamicObjectCollection, testObjectLink);
        var result = {};
        expect(property.getValueSpherical(Iso8601.MINIMUM_VALUE, result)).toEqual(result);
        expect(result.expectedValue).toEqual(true);
        expect(result.expectedTime).toEqual(Iso8601.MINIMUM_VALUE);
    });
});