/**
 * @module Wanaplan
 * name widget for scene objects
 */

var wnp = window.wnp || {};
wnp.Widget = wnp.Widget || {};

wnp.Widget.Name = (function () {
    var _edcmp;

    var name = function (edcmp) {
        _edcmp = edcmp;

        // Listeners
        edcmp.on('click', this.onClick);
        edcmp.on('refresh', this.onRefreshObject);
        edcmp.on('selectObject', this.onSelectObject);
        edcmp.on('deselectObject', this.onDeselectObject);
        edcmp.on('mousedown', this.onMouseDown);
        edcmp.on('mouseup', this.onMouseUp);
        edcmp.on('mousemove', this.onMouseMove);
        edcmp.on('objectMoves', this.onObjectMove);

        this.setupHistory();
    }

    name.prototype.onRefreshObject = function (event) {
    }

    name.prototype.onSelectObject = function (event) {
    }

    name.prototype.onDeselectObject = function () {
    }

    name.prototype.onClick = function(event) {
    }

    name.prototype.onMouseMove = function(event) {
    }

    name.prototype.onMouseDown = function(event) {
    }

    name.prototype.onMouseUp = function(event) {
    }

    name.prototype.onObjectMove = function(event) {
    }

    return name;
})();