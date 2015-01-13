/**
 * @module Wanaplan
 * @submodule Component
 */

var ApiOvertureComponent = (function() {

    /**
     * ApiOvertureComponent adds an overture on the nearest wall at double click
     *
     * @class ApiOvertureComponent
     * @constructor
     * @extends BaseComponent2D
     */
    var comp = function(core) {
        BaseComponent2D.call(this, core, 'ApiOvertureComponent');
        return this;
    };

    comp.prototype = new BaseComponent2D();

    comp.prototype.initialize = function() {
        this.startListening();
    };

    comp.prototype.startListening = function() {
        this.onDblClick = this.onDblClick.bind(this);
        document.addEventListener('dblclick', this.onDblClick, false);
    };

    comp.prototype.stopListening = function() {
        document.removeEventListener('dblclick', this.onDblClick, false);
    };

    comp.prototype.onDblClick = function() {

        if ((API.getMode() & API.MODE_2D_NORMAL) != 0)  {
            var overture = new OvertureStructure();

            API.getCurrentFloor().insertElement("overtures", overture);
            var nearestWall = API.e2D.getNearestWallFromMousePos();

            var proj = nearestWall.getNearestPoint(API.e2D.getMousePos());
            var x = proj.distanceTo(nearestWall.getPoints(0).position);
            overture.position.x = x;
            overture.setParentWall(nearestWall);
        }

        API.e2D.requestStaticDraw();
    };

    return comp;

})();
