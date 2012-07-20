/*global require*/
require({
    baseUrl : '../..',
    packages : [{
        name : 'dojo',
        location : 'ThirdParty/dojo-release-1.7.2-src/dojo'
    }, {
        name : 'dijit',
        location : 'ThirdParty/dojo-release-1.7.2-src/dijit'
    }, {
        name : 'Core',
        location : 'Source/Core'
    }, {
        name : 'Widgets',
        location : 'Source/Widgets'
    }, {
        name : 'DojoWidgets',
        location : 'Source/DojoWidgets'
    }, {
        name : 'DynamicScene',
        location : 'Source/DynamicScene'
    }, {
        name : 'Renderer',
        location : 'Source/Renderer'
    }, {
        name : 'Scene',
        location : 'Source/Scene'
    }, {
        name : 'Shaders',
        location : 'Source/Shaders'
    }, {
        name : 'ThirdParty',
        location : 'Source/ThirdParty'
    }, {
        name : 'CesiumViewer',
        location : 'Apps/CesiumViewer'
    }]
}, [
    'dojo/parser',
    'dojo/dom-class',
    'dojo/_base/window',
    'dijit/form/Button',
    'dijit/form/TextBox',
    'dijit/form/ToggleButton',
    'dijit/form/DropDownButton',
    'dijit/TooltipDialog',
    'DojoWidgets/TimelineWidget',
    'CesiumViewer/CesiumViewer',
    'dojo/domReady!'
], function(
    parser,
    domClass,
    win) {
    "use strict";

    //checkForChromeFrame();
    parser.parse();
    domClass.remove(win.body(), 'loading');
});