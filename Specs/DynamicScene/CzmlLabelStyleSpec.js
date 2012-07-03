/*global defineSuite*/
defineSuite([
             'DynamicScene/CzmlLabelStyle',
             'Scene/LabelStyle'
            ], function(
              CzmlLabelStyle,
              LabelStyle) {
    "use strict";
    /*global it,expect*/

    var simpleLabelStyle = 'FILL';

    var constantLabelStyleInterval = {
        labelStyle : 'OUTLINE'
    };

    it('unwrapInterval', function() {
        expect(CzmlLabelStyle.unwrapInterval(simpleLabelStyle)).toEqual(simpleLabelStyle);
        expect(CzmlLabelStyle.unwrapInterval(constantLabelStyleInterval)).toEqual(constantLabelStyleInterval.labelStyle);
    });

    it('isSampled', function() {
        expect(CzmlLabelStyle.isSampled()).toEqual(false);
    });

    it('getValue', function() {
        expect(CzmlLabelStyle.getValue(simpleLabelStyle)).toEqual(LabelStyle.FILL);
        expect(CzmlLabelStyle.getValue(constantLabelStyleInterval.labelStyle)).toEqual(LabelStyle.OUTLINE);
    });
});
