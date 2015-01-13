/**
 * @module Wanaplan
 * @submodule Component
 */

var ApiHistoryComponent = (function() {
    /**
     * ApiHistoryComponent stores history of camera changes (first person to orbit)
     * and therefore allows to undo/redo camera change
     *
     * @class ApiHistoryComponent
     * @constructor
     * @extends BaseComponent3D
     */

    this.CAMERACHANGEDACTION = 0;

    var comp = function(core) {
        BaseComponent3D.call(this, core, 'ApiHistoryComponent');
        return this;
    };

    comp.prototype = new BaseComponent3D();

    comp.prototype.initialize = function() {
        API.registerAction(this.CAMERACHANGEDACTION, this.undoChange, this.redoChange, this);
        this.startListening();
    };

    comp.prototype.startListening = function() {
        this.onCameraChanged = this.onCameraChanged.bind(this);

        document.addEventListener("wnp.request.cameraChanged", this.onCameraChanged, false);
    };

    comp.prototype.stopListening = function() {
        document.removeEventListener("wnp.request.cameraChanged", this.onCameraChanged, false);
    };

    // Callback annulation du déplacement
    comp.prototype.undoChange = function(target, params) {
        ujs.notify("wnp.request.cameraChanged");
    };

    // Callback remise du déplacement
    comp.prototype.redoChange = function(target, params) {
        ujs.notify("wnp.request.cameraChanged");
    };

    comp.prototype.onCameraChanged = function() {
        API.addHistory(null, null, this.CAMERACHANGEDACTION, this);
    }

    return comp;

})();
