/*global defineSuite*/
defineSuite([
        'Scene/Materials/CheckerboardMaterial',
        '../Specs/renderMaterial',
        '../Specs/createContext',
        '../Specs/destroyContext',
        'Renderer/PixelFormat'
    ], function(
        CheckerboardMaterial,
        renderMaterial,
        createContext,
        destroyContext,
        PixelFormat) {
    "use strict";
    /*global it,expect*/

    it("draws a checkerboard material", function() {
        var context = createContext();
        var pixel = renderMaterial(new CheckerboardMaterial({
            lightColor: {
                red: 1.0,
                green: 1.0,
                blue: 0.0,
                alpha: 0.75
            },
            darkColor: {
                red: 0.0,
                green: 1.0,
                blue: 1.0,
                alpha: 0.75
            },
            sRepeat : 5,
            tRepeat : 5
        }), context);
        expect(pixel).not.toEqualArray([0, 0, 0, 0]);
        destroyContext(context);
    });
});