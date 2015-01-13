/**
 * @module Wanaplan
 * Leaves a green box at last position when moving an object
 */

var wnp = window.wnp || {};
wnp.Widget = wnp.Widget || {};

wnp.Widget.Move = (function () {

    // Private scope
    var _moveMesh = null;
    var _lastPosition = null;
    var _edcmp;
    var that;


    var move = function (edcmp) {
        _edcmp = edcmp;
        that = this;

        _edcmp.on('deselectObject', this.onDeselectObject);
        _edcmp.on('mousedown', this.onMouseDown);
        _edcmp.on('mouseup', this.onMouseUp);
    }

    move.prototype.onDeselectObject = function () {
        if (_moveMesh){
            _moveMesh.dispose();
        }
        _moveMesh = null;
    }

    move.prototype.onMouseDown = function(event) {
        var collided = event.collided;

        if (collided.pickedMesh.getTopLevelObject() === _edcmp.getSelectedObject()) {
            
            _lastPosition = _edcmp.getSelectedObject().position.clone();
            that.getMoveMesh(_edcmp.getSelectedObject(), new BABYLON.Color3(0., 1., 0.));

        }
    }

    move.prototype.onMouseUp = function(event) {
        that.onDeselectObject(event);
        _lastPosition = null;
    }

    move.prototype.getMoveMesh = function(mesh, color) {
        var bbox = mesh.getBoundingBox(true);
        var size = bbox.maximum.subtract(bbox.minimum);
        _moveMesh = BABYLON.Mesh.CreateBloc("move", size.x, size.y, size.z, API.e3D.getScene());
        var elevation = API.getCurrentFloor().elevation + size.y / 2;
        _moveMesh.position = _lastPosition.add(new BABYLON.Vector3(0, elevation, 0));
        _moveMesh.rotation = mesh.rotation;
        _moveMesh.material = API.material.PlasticMaterial("move", {baseColor : color});
        _moveMesh.material.alpha = 0.2;
    };

    return move;
})();
