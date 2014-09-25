/* global API */
/* global console */


/**
 * @module Wanaplan
 * @submodule Component
 */

var PointSelectionComponent = (function() {

    /**
     * This component allows the user to select several points at the same time and apply a translation
     * onto them.
     *
     * Note that this component is always active. Therefore, it disables the dragging on the canvas.
     * This is bad, if you want to have this selection feature, you must implement a way to active/desactive the selection mode.
     * 
     * @class PointSelectionComponent
     * @constructor
     * @extends BaseComponent2D
     */
    var comp = function(core) {
        BaseComponent2D.call(this, core, 'PointSelectionComponent');

        // Less priority than the Wall and PointComponent, to keep the classic behaviour
        this.priority = 9;

        // For the selection rectangle
        this.currentCursorPos = null;
        this.origin = null;

        // Flag that indicates if we must drag the selected point or draw the selection rectangle
        this.pointDragging = false

        // Selection rectangle
        this.selectionRectangle = [
            new BABYLON.Vector2(),
            new BABYLON.Vector2(),
            new BABYLON.Vector2(),
            new BABYLON.Vector2()
        ];

        // Selected points
        this.selectedPoints = [];

        // Style of the selection rectangle
        this.strokeStyle = 'rgba(186, 228, 50, 1.0)';
        this.fillStyle = 'rgba(137, 184, 8, 0.3)';

        // Symbols helper
        this.symbols2D = null;

        return this;
    };

    comp.prototype = new BaseComponent2D();

    comp.prototype.initialize = function() {
        this.symbols2D = API.e2D.getSymbols2D();
    };

    comp.prototype.startListening = function() {
        wanaplan.engine2D.registerEventCb("PointSelectionComponent.click", this.priority, "click", wanaplan.engine2D.MODE_NORMAL, null, this.onClick.bind(this), null);
        wanaplan.engine2D.registerEventCb("PointSelectionComponent.drag-start", this.priority, "drag-start", wanaplan.engine2D.MODE_NORMAL, null, this.onDragStart.bind(this), null);
        wanaplan.engine2D.registerEventCb("PointSelectionComponent.dynamic-draw", this.priority, "dynamic-draw", null, null, this.onDynamicDraw.bind(this), null);
    };

    comp.prototype.stopListening = function() {
        wanaplan.engine2D.unregisterEventCb("PointSelectionComponent.click");
        wanaplan.engine2D.unregisterEventCb("PointSelectionComponent.drag-start");
        wanaplan.engine2D.unregisterEventCb("PointSelectionComponent.dynamic-draw");
    };

    // *** Logic ***

    // Compute the selection rectangle from the origin to the current mouse pos.
    comp.prototype.computeSelectionRectangle = function() {
        if (!this.origin || !this.currentCursorPos)
            return;

        var p0 = this.currentCursorPos;
        var p1 = this.origin;
        // Bottom-left
        this.selectionRectangle[0].copyFromFloats(Math.min(p0.x, p1.x), Math.min(p0.y, p1.y));
        // Top-left
        this.selectionRectangle[1].copyFromFloats(Math.min(p0.x, p1.x), Math.max(p0.y, p1.y));
        // Top-right
        this.selectionRectangle[2].copyFromFloats(Math.max(p0.x, p1.x), Math.max(p0.y, p1.y));
        // Bottom-right
        this.selectionRectangle[3].copyFromFloats(Math.max(p0.x, p1.x), Math.min(p0.y, p1.y));
    };

    // Empty the selected point list
    comp.prototype.purgeSelection = function() {
        this.selectedPoints.length = 0;
    };

    // Computes which points must be selected, given the current state of the selection rectangle
    comp.prototype.computeContainedPoints = function() {
        // Empty the array
        this.purgeSelection();

        // Retrieve all points
        var points = API.getPoints();
        var pos;

        for (var i = 0, il = points.length; i < il; i++) {
            pos = points[i].position;
            // Check if the point is in the selection rectangle
            if (pos.isPointInPolygon(this.selectionRectangle)) {
                this.selectedPoints.push(points[i]);
            }
        }
    };

    // Applies a translation on every selected point
    comp.prototype.translateSelectedPoints = function(deltaV) {
        for (var i = 0, il = this.selectedPoints.length; i < il; i++) {
            this.selectedPoints[i].translate(deltaV);
            this.selectedPoints[i].needsUpdate = true;
        }
    };

    // *** Drawing ***

    // Selection rectangle draw
    comp.prototype.drawSelectionRectangle = function(ctx, translation, zoom) {
        var ctxPoint;

        if (!this.origin || !this.currentCursorPos)
            return;


        ctx.save();

        ctx.strokeStyle = this.strokeStyle;
        ctx.fillStyle = this.fillStyle;

        ctx.beginPath();

        for (var i = 0; i < 4; i++) {
            // Switch from screen mouse position, to canvas coordinates, taking zoom and translation into account
            ctxPoint = API.e2D.toRealCoord(this.selectionRectangle[i]);
            if (i === 0) {
                ctx.moveTo(ctxPoint.x, ctxPoint.y);
            } else {
                ctx.lineTo(ctxPoint.x, ctxPoint.y);
            }
        }

        ctx.fill();
        ctx.stroke();

        ctx.restore();
    };

    // Selected points symbol
    comp.prototype.drawSelectedPoints = function(ctx, translation, zoom) {
        for (var i = 0, il = this.selectedPoints.length; i < il; i++) {
            this.symbols2D.drawPointHover(ctx, API.e2D.toRealCoord(this.selectedPoints[i].position), zoom);
        }
    };

    // *** Event management ***

    comp.prototype.onDynamicDraw = function(ctx, translation, zoom, data) {
        // Green selectors are drawn in this function, on the top (dynamic) canvas
        if (!this.pointDragging) {
            this.drawSelectionRectangle(ctx, translation, zoom);
        }
        this.drawSelectedPoints(ctx, translation, zoom);
    };

    comp.prototype.onClick = function(event, target, mstate, data) {
        // When we click, we must reset the selection
        this.purgeSelection();
        // And draw the dynamic canvas to make the symbols disappear
        API.e2D.requestDynamicDraw();
    };
    comp.prototype.onDragStart = function(event, target, mstate, data) {
        wanaplan.engine2D.registerEventCb("PointSelectionComponent.dragging", this.priority, "dragging", wanaplan.engine2D.MODE_DRAG, null, this.onDragging.bind(this), target);
        wanaplan.engine2D.registerEventCb("PointSelectionComponent.drag-end", this.priority, "drag-end", wanaplan.engine2D.MODE_DRAG, null, this.onDragEnd.bind(this), target);

        if (!this.pointDragging) {
            // We are not dragging a point, we must set up a rectangle selection
            this.purgeSelection();
            this.origin = mstate.planPos.clone();
            this.currentCursorPos = mstate.planPos.clone();
        }
        else {
            // We are dragging the selected points, we must reset the rectangle selection
            this.origin = null;
        }

        return false;
    };

    comp.prototype.onDragging = function(event, target, mstate, data) {
        this.currentCursorPos = mstate.planPos.clone();
        if (this.pointDragging) {
            // Applying the current zoom level on the translation before translation
            this.translateSelectedPoints(mstate.posDelta.scale(1 / API.e2D.getZoom()));

            // Redraw the whole structure (static canvas)
            API.e2D.requestStaticDraw();
        } else {
            this.computeSelectionRectangle();
            this.computeContainedPoints();

            // Redraw the the dynamic canvas because only the selection changed, not the structure
            API.e2D.requestDynamicDraw();
        }

        return false;
    };

    comp.prototype.onDragEnd = function(event, target, mstate, data) {
        wanaplan.engine2D.unregisterEventCb("PointSelectionComponent.dragging");
        wanaplan.engine2D.unregisterEventCb("PointSelectionComponent.drag-end");
        this.origin = null;
        this.pointDragging = false;

        // Drawing the dynamic canvas to make the rectangle disappear
        API.e2D.requestDynamicDraw();
    };

    return comp;

})();

/************************
 * Substitution example *
 ************************/

 // NB : The proper to handle events in this case are
 // to set a bigger priority on your own component and
 // delegate events to native components.

 // But for the sake of the example, we are doing it the ugly way.

(function(){

    var dragStartClassic = PointComponent2D.prototype.onDragStart;
    var draggingClassic = PointComponent2D.prototype.onDragging;
    var PSC;

    PointComponent2D.prototype.onDragStart = function(event, target, mstate, data) {
        PSC = PSC || API.getComponent('PointSelectionComponent');

        // If no points have been selected, keep the original behaviour
        if (PSC.selectedPoints.length === 0) {
            dragStartClassic.call(this, event, target, mstate, data);
            return false;
        }

        PSC.pointDragging = true;
        PSC.onDragStart(event, target, mstate, data)
    };

    PointComponent2D.prototype.onDragging = function(event, target, mstate, data) {
        PSC = PSC || API.getComponent('PointSelectionComponent');

        // If no points have been selected, keep the original behaviour
        if (PSC.selectedPoints.length === 0) {
            draggingClassic.call(this, event, target, mstate, data);
            return false;
        }

        PSC.onDragging(event, target, mstate, data)
    };
})();