/**
 * @module Wanaplan
 * @submodule Component
 */

var ApiEditionComponent = (function() {
    /**
     * Component allowing to group all objects of a floor on middle click (virtual group)
     * Also uses an external widget to display a green mark at last position when moving objects
     *
     * @class ApiEditionComponent
     * @constructor
     * @extends BaseComponent3D
     */
    var comp = function(core) {
        BaseComponent3D.call(this, core, 'ApiEditionComponent');

        this.material = null;

        return this;
    };

    comp.prototype = new BaseComponent3D();

    comp.prototype.initialize = function() {
        //external widget that leaves trace when moving an object
        API.e3D.addWidget("http://localhost/wanaplan/js/Core/Api/widget/Move.js","Move")
    };

    comp.prototype.startListening = function() {
        API.listen("wnp.engine3D.click", this.onClick);
    };

    comp.prototype.stopListening = function() {
        API.unListen("wnp.engine3D.click", this.onClick);
    };

    comp.prototype.onClick = function(event) {
        if (event.button !== 1) return;

        var collided = event.collided;
        var objects = API.getObjects();

        API.e3D.deselectObject();
        for (var i = 0; i < objects.length; i++) {
            API.e3D.addToGroup( objects[i].objectInstance );
        }
        API.e3D.selectObject(collided.pickedMesh.getTopLevelObject());
    };


    return comp;

})();
