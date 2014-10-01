/**
 * @module Wanaplan
 * @submodule Component
 */

var ApiEditionComponent = (function() {

    var comp = function(core) {
        BaseComponent3D.call(this, core, 'ApiEditionComponent');

        this.material = null;

        return this;
    };

    comp.prototype = new BaseComponent3D();

    comp.prototype.initialize = function() {
        API.e3D.addWidget("http://localhost/wanaplan/js/core/Api/widget/Move.js","Move")
        this.startListening();
    };

    comp.prototype.startListening = function() {
        document.addEventListener("wnp.engine3D.click", this.onClick, false);
    };

    comp.prototype.stopListening = function() {
        document.removeEventListener("wnp.engine3D.click", this.onClick, false);
    };

    comp.prototype.onClick = function(event) {
        if (event.button !== 1) return;

        var collided = event.collided;
        var objects = API.getObjects();

        for (var i = 0; i < objects.length; i++) {
            API.e3D.addToGroup( objects[i].objectInstance , API.e3D.getSelectedObject() );

            API.e3D.deselectObject();
        }

        API.e3D.selectObject(collided.pickedMesh.getTopLevelObject());            
    }


    return comp;

})();