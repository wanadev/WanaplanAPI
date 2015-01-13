/**
 * @module Wanaplan
 * @submodule Component
 */

var ApiInstanceComponent = (function() {
    /**
     * This component allows to copy the material of an object with the middle mouse button
     * and apply it to another object the same way
     * 
     * @class ApiInstanceComponent
     * @constructor
     * @extends BaseComponent3D
     */
    var comp = function(core) {
        BaseComponent3D.call(this, core, 'ApiInstanceComponent');

        this.material = null;

        return this;
    };

    comp.prototype = new BaseComponent3D();

    comp.prototype.initialize = function() {
    };

    comp.prototype.startListening = function() {
        document.addEventListener("wnp.engine3D.click", this.onClick, false);
    };

    comp.prototype.stopListening = function() {
        document.removeEventListener("wnp.engine3D.click", this.onClick, false);
    };

    comp.prototype.onClick = function(event) {
        // Stop the function if the user do not click on the middle button
        if (event.button !== 1) return;

        // Get the instance
        var instance = API.e3D.getInstance(event.mstate.pos);

        if (instance) {
            if (!this.material) {
                // Get the material with the mouse cursor
                this.material = API.e3D.getMaterialFromMousePosition(event.mstate.pos);
            } else {
                // Set the material
                API.e3D.setMaterialFromMousePosition(event.mstate.pos, this.material);
                this.material = null;
            }
        }
    }

    return comp;

})();
