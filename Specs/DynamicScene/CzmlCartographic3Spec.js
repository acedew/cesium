/*global defineSuite*/
defineSuite([
             'DynamicScene/CzmlCartographic3',
             'Core/Cartographic3',
             'Core/Math'
            ], function(
              CzmlCartographic3,
              Cartographic3,
              CesiumMath) {
    "use strict";
    /*global it,expect*/

    var cartographic1 = new Cartographic3(123.456, 789.101112, 321.312);
    var cartographic2 = new Cartographic3(789.101112, 123.456, 521.312);

    var constantCartographicInterval = {
        cartographicRadians : [cartographic1.longitude, cartographic1.latitude, cartographic1.height]
    };

    var constantCartographicDegreesInterval = {
        cartographicDegrees : [CesiumMath.toDegrees(cartographic1.longitude), CesiumMath.toDegrees(cartographic1.latitude), cartographic1.height]
    };

    var sampledCartographicInterval = {
        cartographicRadians : [0, cartographic1.longitude, cartographic1.latitude, cartographic1.height, 1, cartographic2.longitude, cartographic2.latitude, cartographic2.height]
    };

    var sampledCartographicDegreesInterval = {
        cartographicDegrees : [0, CesiumMath.toDegrees(cartographic1.longitude), CesiumMath.toDegrees(cartographic1.latitude), cartographic1.height, 1, CesiumMath.toDegrees(cartographic2.longitude),
                CesiumMath.toDegrees(cartographic2.latitude), cartographic2.height]
    };

    it('unwrapInterval', function() {
        expect(CzmlCartographic3.unwrapInterval(constantCartographicInterval)).toEqualArray(constantCartographicInterval.cartographicRadians);
        expect(CzmlCartographic3.unwrapInterval(constantCartographicDegreesInterval)).toEqualArray(constantCartographicInterval.cartographicRadians);
        expect(CzmlCartographic3.unwrapInterval(sampledCartographicInterval)).toEqualArray(sampledCartographicInterval.cartographicRadians);
        expect(CzmlCartographic3.unwrapInterval(sampledCartographicDegreesInterval)).toEqualArray(sampledCartographicInterval.cartographicRadians);
    });

    it('isSampled', function() {
        expect(CzmlCartographic3.isSampled(constantCartographicInterval.cartographicRadians)).toEqual(false);
        expect(CzmlCartographic3.isSampled(sampledCartographicInterval.cartographicRadians)).toEqual(true);
    });

    it('getValue', function() {
        expect(CzmlCartographic3.getValue(constantCartographicInterval.cartographicRadians)).toEqual(cartographic1);
    });

    it('getValueFromArray', function() {
        expect(CzmlCartographic3.getValueFromArray(sampledCartographicInterval.cartographicRadians, 5)).toEqual(cartographic2);
    });
});