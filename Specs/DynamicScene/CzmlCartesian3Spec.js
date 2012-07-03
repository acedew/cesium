/*global defineSuite*/
defineSuite([
             'DynamicScene/CzmlCartesian3',
             'Core/Cartesian3'
            ], function(
              CzmlCartesian3,
              Cartesian3) {
    "use strict";
    /*global it,expect*/

    var cartesian1 = new Cartesian3(123.456, 789.101112, 321.312);
    var cartesian2 = new Cartesian3(789.101112, 123.456, 521.312);

    var constantCartesianInterval = {
        cartesian : [cartesian1.x, cartesian1.y, cartesian1.z]
    };

    var sampledCartesianInterval = {
        cartesian : [0, cartesian1.x, cartesian1.y, cartesian1.z, 1, cartesian2.x, cartesian2.y, cartesian2.z]
    };

    it('unwrapInterval', function() {
        expect(CzmlCartesian3.unwrapInterval(constantCartesianInterval)).toEqualArray(constantCartesianInterval.cartesian);
        expect(CzmlCartesian3.unwrapInterval(sampledCartesianInterval)).toEqualArray(sampledCartesianInterval.cartesian);
    });

    it('isSampled', function() {
        expect(CzmlCartesian3.isSampled(constantCartesianInterval.cartesian)).toEqual(false);
        expect(CzmlCartesian3.isSampled(sampledCartesianInterval.cartesian)).toEqual(true);
    });

    it('getValue', function() {
        expect(CzmlCartesian3.getValue(constantCartesianInterval.cartesian)).toEqual(cartesian1);
    });

    it('getValueFromArray', function() {
        expect(CzmlCartesian3.getValueFromArray(sampledCartesianInterval.cartesian, 5)).toEqual(cartesian2);
    });
});