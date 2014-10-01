/* global API */
/* global console */


/**
 * @module Wanaplan
 * @submodule Component
 */

var ApiStairwayComponent = (function() {

    /**
     * ApiStairwayComponent.
     *
     * @class ApiStairwayComponent
     * @constructor
     * @extends BaseComponent2D
     */
    var comp = function(core) {
        BaseComponent2D.call(this, core, 'ApiStairwayComponent');
        return this;
    };

    comp.prototype = new BaseComponent2D();

    comp.prototype.initialize = function() {
        this.startListening();
    };

    comp.prototype.startListening = function() {
        document.addEventListener('dblclick', this.onDblClick, false);
    };

    comp.prototype.stopListening = function() {
        document.removeEventListener('dblclick', this.onDblClick, false);
    };

    comp.prototype.onDblClick = function() {

        var stairways = API.getStairways();
        var floor = API.getCurrentFloor();


        for (var i = 0; i < stairways.length; i++) {
           floor.addWallsAsPolygon(stairways[i].getHopperPoints());
        }

        API.e2D.requestStaticDraw();
    };

    return comp;

})();