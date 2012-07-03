/*global defineSuite*/
defineSuite([
         'Core/Event'
     ], function(
         Event) {
    "use strict";
    /*global it expect*/

    it('Event works with no scope', function() {
        var e = new Event();
        var someValue = 123;
        var callbackCalled = false;

        this.myCallback = function(expectedValue) {
            callbackCalled = true;
            expect(expectedValue).toEqual(someValue);
            expect(this).toBeUndefined();
        };

        e.addEventListener(this.myCallback);
        expect(callbackCalled).toEqual(false);

        e.raiseEvent(someValue);
        expect(callbackCalled).toEqual(true);

        callbackCalled = false;
        e.removeEventListener(this.myCallback);
        e.raiseEvent(someValue);
        expect(callbackCalled).toEqual(false);
    });

    it('Event works with scope', function() {
        var e = new Event();
        var someValue = 123;
        var callbackCalled = false;
        var that = this;
        this.myCallback = function(expectedValue) {
            callbackCalled = true;
            expect(expectedValue).toEqual(someValue);
            expect(this).toEqual(that);
        };

        e.addEventListener(this.myCallback, this);
        expect(callbackCalled).toEqual(false);

        e.raiseEvent(someValue);
        expect(callbackCalled).toEqual(true);

        callbackCalled = false;
        e.removeEventListener(this.myCallback);
        e.raiseEvent(someValue);
        expect(callbackCalled).toEqual(false);
    });

    it('Event works with no listeners', function() {
        var e = new Event();
        e.raiseEvent(123);
    });

    it('addEventListener throws with existing listener', function() {
        var e = new Event();

        function callback() {
        }

        e.addEventListener(callback);

        expect(function() {
            e.addEventListener(callback);
        }).toThrow();
    });

    it('addEventListener throws with undefined listener', function() {
        var e = new Event();
        expect(function() {
            e.addEventListener(undefined);
        }).toThrow();
    });

    it('addEventListener throws with null listener', function() {
        var e = new Event();
        expect(function() {
            e.addEventListener(null);
        }).toThrow();
    });

    it('addEventListener throws with non-function listener', function() {
        var e = new Event();
        expect(function() {
            e.addEventListener({});
        }).toThrow();
    });

    it('removeEventListener throws with undefined listener', function() {
        var e = new Event();
        expect(function() {
            e.removeEventListener(undefined);
        }).toThrow();
    });

    it('removeEventListener throws with null listener', function() {
        var e = new Event();
        expect(function() {
            e.removeEventListener(null);
        }).toThrow();
    });

    it('removeEventListener throws with non registered listener', function() {
        var e = new Event();
        expect(function() {
            e.removeEventListener(function() {
            });
        }).toThrow();
    });
});