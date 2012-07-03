/*global defineSuite*/
defineSuite([
             'DynamicScene/CzmlUnitQuaternion',
             'Core/Quaternion',
             'Core/Math'
            ], function(
              CzmlUnitQuaternion,
              Quaternion,
              CesiumMath) {
    "use strict";
    /*global it,expect*/

    var quaternion1 = new Quaternion(1, 2, 3, 4).normalize();
    var quaternion2 = new Quaternion(4, 5, 6, 7).normalize();

    var constantQuaternionInterval = {
        unitQuaternion : [quaternion1.x, quaternion1.y, quaternion1.z, quaternion1.w]
    };

    var sampledQuaternionInterval = {
        unitQuaternion : [0, quaternion1.x, quaternion1.y, quaternion1.z, quaternion1.w, 1, quaternion2.x, quaternion2.y, quaternion2.z, quaternion2.w]
    };

    it('unwrapInterval', function() {
        expect(CzmlUnitQuaternion.unwrapInterval(constantQuaternionInterval)).toEqualArray(constantQuaternionInterval.unitQuaternion);
        expect(CzmlUnitQuaternion.unwrapInterval(sampledQuaternionInterval)).toEqualArray(sampledQuaternionInterval.unitQuaternion);
    });

    it('isSampled', function() {
        expect(CzmlUnitQuaternion.isSampled(constantQuaternionInterval.unitQuaternion)).toEqual(false);
        expect(CzmlUnitQuaternion.isSampled(sampledQuaternionInterval.unitQuaternion)).toEqual(true);
    });

    it('getValue', function() {
        expect(CzmlUnitQuaternion.getValue(constantQuaternionInterval.unitQuaternion)).toEqualEpsilon(quaternion1, CesiumMath.EPSILON15);
    });

    it('getValueFromArray', function() {
        expect(CzmlUnitQuaternion.getValueFromArray(sampledQuaternionInterval.unitQuaternion, 6)).toEqualEpsilon(quaternion2, CesiumMath.EPSILON15);
    });

    it('packValuesForInterpolation and getValueFromInterpolationResult', function() {
        var destination = [];
        var source = [quaternion1.x, quaternion1.y, quaternion1.z, quaternion1.w, quaternion2.x, quaternion2.y, quaternion2.z, quaternion2.w];
        CzmlUnitQuaternion.packValuesForInterpolation(source, destination, 0, 1);
        expect(CzmlUnitQuaternion.getValueFromInterpolationResult(destination, undefined, source, 0, 1)).toEqualEpsilon(quaternion1, CesiumMath.EPSILON15);
    });
});