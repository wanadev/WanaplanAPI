/* global API */
/* global console */


/**
 * @module Wanaplan
 * @submodule Component
 */

var HoupperCutComponent2D = (function() {

    /**
     * This components inject a new action in the 2D editor menu.
     * The action allows the use to draw an axis on the plan, which will cut the room in half and then select one of the side to create a hopper from this shape.
     *
     * @class HoupperCutComponent2D
     * @constructor
     * @extends BaseComponent2D
     */
    var C = function(core) {
        BaseComponent2D.call(this, core, 'HoupperCutComponent2D');

        this._A = new BABYLON.Vector2();
        this._B = new BABYLON.Vector2();

        this.state = 'off';
    };

    C.prototype = new BaseComponent2D();


    C.prototype.initialize = function() {
        this.startListening();
        this._injectButton();
    };

    var PolygonFragment = function(polygon) {
        this.polygon = polygon;
    }

    C.prototype.getTargeted = function(p) {

        // several behavior depending on the state
        switch (this.state) {
            case 'selectCut':

                // for this state, return the hovered parts

                if (!this._parts)
                    break;

                for (var i = this._parts.length; i--;)
                    if (p.isPointInPolygon(this._parts[i]))

                    // return the hovered object
                    // wrap it in an object in order to identify it easily
                        return new PolygonFragment(this._parts[i]);
        }
    };

    /**
     * Inject the button into the menu.
     * The button will throw specific event when pressed.
     *
     *
     * @method _injectButton
     * @private
     */
    C.prototype._injectButton = function() {
        var _item = {
            id: 'houperCut',
            title: 'houper cut',
            action: 'wnp.request.houperCut.start',
            cancelAction: 'wnp.request.houperCut.stop'
        };

        ujs.notify('wnp.menu.main.add', {
            item: _item,
            menuPath: 'draw2D',
            position: 6
        });
    };

    /**
     * Build the _handlers set, which contains the event handlers binded to the instance.
     *
     *
     * @method _initHandlers
     * @private
     */
    C.prototype._initHandlers = function() {

        // bind this functions to the instance context
        // which means that when the function this._handlers.requestStart is called, the context is always the intance
        // this is useful when dealing with event which set the context of the callback functions

        this._handlers = {}
        this._handlers.requestStart = requestStart.bind(this)
        this._handlers.requestStop = requestStop.bind(this)

        this._handlers.startDrag = startDrag.bind(this)
        this._handlers.drag = drag.bind(this)
        this._handlers.stopDrag = stopDrag.bind(this)

        this._handlers.hover = hover.bind(this)
        this._handlers.leave = leave.bind(this)
        this._handlers.clickOnPart = clickOnPart.bind(this)

        this._handlers.drawCut = drawCut.bind(this)
        this._handlers.drawParts = drawParts.bind(this)
    };

    /**
     * Append a new hopper to the floorStructure.
     *
     * @method buildHopper
     * @param polygon          {Array of BABYLON.Vector2} The polygon which describe the hopper.
     * @param [floorStructure] {FloorStructure}   The floorStructure, default is the current one
     */
    C.prototype.buildHopper = function(polygon, floorStructure) {

        // structure of the floor
        floorStructure = floorStructure || API.getCurrentFloor();

        // create the hopperStructure
        var hopperStructure = new HopperStructure(polygon);

        // append the hopper
        floorStructure.hoppers.push(hopperStructure);

    };

    /**
     * Determine a set of polygon which result from the cut of all the polygon of the floor along the specified axis
     * Put them in the _parts attribute
     *
     * @method cut
     * @param A                {Point}            one point of the axis
     * @param B                {Point}            a second point of the axis
     * @param [floorStructure] {FloorStructure}   the floorStructure, default is the current one
     */
    C.prototype.cut = function(A, B, floorStructure) {

        // comptue the axis

        // o the origin
        var O = A,

            // v the direction vector
            v = new BABYLON.Vector2(B.x - A.x, B.y - A.y),

            // n the normal
            n = new BABYLON.Vector2(B.y - A.y, A.x - B.x)


        // store the parts in this
        var parts = []

        // structure of the floor
        floorStructure = floorStructure || API.getCurrentFloor();

        // the floorStructure contains one or several structure which describe the rooms ( RoomStructure )

        // iterate througt this structure
        for (var i = floorStructure.internalRooms.length; i--;) {

            var roomStructure = floorStructure.internalRooms[i];

            parts = parts.concat(cutPolygonAlongAxis(O, v, roomStructure.points))
        }

        this._parts = parts;
    };

    //C.prototype.getTargeted = function(){};

    C.prototype.startListening = function() {

        // init the handlers if needed
        if (!this._handlers)
            this._initHandlers();

        // add event listeners
        API.listen('wnp.request.houperCut.start', this._handlers.requestStart);
        API.listen('wnp.request.houperCut.stop', this._handlers.requestStop);
    };

    C.prototype.stopListening = function() {

        // init the handlers if needed
        if (!this._handlers)
            this._initHandlers();

        // remove event listeners
        API.unListen('wnp.request.houperCut.start', this._handlers.requestStart);
        API.unListen('wnp.request.houperCut.stop', this._handlers.requestStop);
    };

    /////////////////////////////////////
    ///// State Machine            //////
    /////////////////////////////////////

    C.prototype.state;

    /**
     * Set the state, will perform related action
     *
     * @method setState
     * @param newState         {string}           the new state
     */
    C.prototype.setState = function(newState) {

        _state.finish[this.state].call(this)

        this.state = newState

        _state.prepare[this.state].call(this)
    };

    // this is a set of actions to perform when a state is finished or when a state begin
    // basically, it listen to event related to the state, and unlisten then when the stat ends
    // no need to expose this in the class scope as they are private and should not be called for the outside
    _state = {
        prepare: {
            off: function() {},
            ready: function() {

                API.e2D.registerEventCb(
                    'houperCut.startDrag', // an identifier for the binding
                    3, // the priority
                    'drag-start', // the listened event
                    null, // the state in which the engine must to trigger the callback, null is always trigger
                    null, // the class from which the current target must be to trigger the callback, null is always trigger
                    this._handlers.startDrag, // the handler
                    null // data, will be passed as additionnal arguments
                );

            },
            drawingCut: function() {

                // listen to drag and end-drag event
                API.e2D.registerEventCb('houperCut.drag', 3, 'dragging', null, null, this._handlers.drag, null);
                API.e2D.registerEventCb('houperCut.stopDrag', 3, 'drag-end', null, null, this._handlers.stopDrag, null);

                // draw the cut
                API.e2D.registerEventCb('houperCut.drawCut', 3, 'dynamic-draw', null, null, this._handlers.drawCut, null);
            },
            selectCut: function() {

                // draw the cut
                API.e2D.registerEventCb('houperCut.drawParts', 1, 'dynamic-draw', null, null, this._handlers.drawParts, null);

                // feedback on hover
                API.e2D.registerEventCb('houperCut.hover', 3, 'hover', null, PolygonFragment, this._handlers.hover, null);
                API.e2D.registerEventCb('houperCut.leave', 3, 'leave', null, PolygonFragment, this._handlers.leave, null);

                API.e2D.registerEventCb('houperCut.click', 3, 'click', null, null, this._handlers.clickOnPart, null);
            },
        },


        finish: {
            off: function() {},
            ready: function() {
                API.e2D.unregisterEventCb('houperCut.startDrag');
            },
            drawingCut: function() {
                API.e2D.unregisterEventCb('houperCut.drag');
                API.e2D.unregisterEventCb('houperCut.stopDrag');
                API.e2D.unregisterEventCb('houperCut.drawCut');
            },
            selectCut: function() {

                API.e2D.unregisterEventCb('houperCut.hover');
                API.e2D.unregisterEventCb('houperCut.leave');

                API.e2D.unregisterEventCb('houperCut.drawParts');

                API.e2D.unregisterEventCb('houperCut.click');
            },
        }
    }


    /////////////////////////////////////
    ///// Event handlers           //////
    /////////////////////////////////////

    // this functions are meant to be bind to each instance of the class with .bind(this)
    // no need to expose them in the class scope as they are private and should not be called for the outside

    // when the button in the menu is pressed
    var requestStart = function() {
        this.setState('ready');
    }

    // when the button in the menu is pressed a second time
    var requestStop = function() {
        this.setState('off');

        // ask for a redraw of the dynamic canvas
        API.e2D.requestDynamicDraw();
    }

    // when the user have to draw the line, when he first clic
    var startDrag = function(event, target, mstate) {

        // hold the first point
        this._A.copyFrom(mstate.planPos);
        this._B.copyFrom(mstate.planPos);

        this.setState('drawingCut');


        // this is important,
        // when returning false, the engine will stop the propagation of the event
        // therefor, the next component which are registered to to this event will not react -> in this case the translation of the editor will not start
        return false
    }

    // when the user have to draw the line, when he move his mouse
    var drag = function(event, target, mstate) {

        // hold the second point
        this._B.copyFrom(mstate.planPos);

        // ask for a redraw of the dynamic canvas
        API.e2D.requestDynamicDraw();
    }

    // when the user have to draw the line, when he release his mouse
    var stopDrag = function(event, target, mstate) {

        this.setState('selectCut');

        // make the cut
        this.cut(this._A, this._B);

        // ask for a redraw of the dynamic canvas
        API.e2D.requestDynamicDraw();
    }

    // when the user cursor is hover a part
    var hover = function(event, target, mstate) {

        var polygon = target ? target.polygon : null;

        // not changed
        if (polygon == this._selected)
            return;

        this._selected = polygon;

        // ask for a redraw of the dynamic canvas
        API.e2D.requestDynamicDraw();
    }

    // when the user cursor leaves a part
    var leave = function(event, target, mstate) {
        this._handlers.hover(event, null, mstate);
    }

    // when the user click on a part
    var clickOnPart = function(event, target, mstate) {

        if (this._selected)
            this.buildHopper(this._selected);

        this.setState('ready');

        // ask for a redraw of the static ( and dynamic ) canvas
        API.e2D.requestStaticDraw();
    }

    // when the dynamic canvas is redrawn
    var drawCut = function(ctx, translation, zoom, data) {

        if (!this._A || !this._B)
            return;

        var A = this._A,
            B = this._B;


        var As = API.e2D.toRealCoord(A, translation, zoom),
            Bs = API.e2D.toRealCoord(B, translation, zoom);

        ctx.save();

        drawScissorLine(ctx, As, Bs, 0.5);

        ctx.restore();
    }

    // when the dynamic canvas is redrawn
    var drawParts = function(ctx, translation, zoom, data) {

        if (!this._parts)
            return;

        // grab theses
        var parts = this._parts;
        var selected = this._selected;


        ctx.save();

        var realP;

        // for each fragments, draw the polygon
        for (var i = parts.length; i--;) {

            ctx.lineWidth = 2;
            ctx.lineCap = 'round';
            ctx.strokeStyle = parts[i] == selected ? API.e2D.getColorConstants().COLOR_ACTIVE_STROKE : API.e2D.getColorConstants().COLOR_ACTIVE_STROKE_DARKER;

            ctx.fillStyle = parts[i] == selected ? 'rgba(140, 187, 11, 0.5)' : 'rgba(140, 187, 11, 0.2)';

            realP = API.e2D.toRealCoord(parts[i][0], translation, zoom);

            ctx.beginPath();
            ctx.moveTo(realP.x, realP.y);
            for (var j = parts[i].length; j--;) {
                realP = API.e2D.toRealCoord(parts[i][j], translation, zoom);
                ctx.lineTo(realP.x, realP.y);
            }
            ctx.fill();
            ctx.stroke();
        }

        ctx.restore();

        // also draw the cut
        drawCut.call(this, ctx, translation, zoom, data);
    }



    /////////////////////////////////////
    ///// private static functions //////
    /////////////////////////////////////

    /**
     * Draw a dashed line with scissors
     *
     * @method drawScissorLine
     * @static
     * @private
     * @param ctx {context} the context on which the line will be drawn
     * @param A   {Point}   start point of the line
     * @param B   {Point}   end point of the line
     * @param gap {Number}  the gap between the two scissor ( it's more the angle in fact ) between [0,1]
     */
    var drawScissorLine = (function() {

        var drawScissor = function(ctx, A, B, gap) {

            gap = gap || 0

            gap = Math.PI * (gap * 0.2 + 0.03)

            var C = {
                x: A.x * 0.65 + B.x * 0.35,
                y: A.y * 0.65 + B.y * 0.35
            }

            var l = Math.sqrt((A.x - B.x) * (A.x - B.x) + (A.y - B.y) * (A.y - B.y))

            var angle = Math.atan2(B.y - A.y, B.x - A.x)

            for (var k = -1; k <= 1; k += 2) {

                var H = {
                    x: C.x - Math.cos(angle + gap * k) * l * 0.35,
                    y: C.y - Math.sin(angle + gap * k) * l * 0.35,
                }

                var K = {
                    x: C.x + Math.cos(angle + gap * k) * l * 0.65,
                    y: C.y + Math.sin(angle + gap * k) * l * 0.65,
                }

                drawOneScissor(ctx, H, K, !(k + 1))

            }
        }

        var drawOneScissor = (function() {

            var canvas = document.createElement('canvas')
            canvas.width = canvas.height = 100

            var ctx = canvas.getContext('2d')

            ctx.scale(canvas.width, canvas.height)

            ctx.scale(0.98, 0.6)

            ctx.translate(0.01, 0.5)

            ctx.beginPath()
            ctx.arc(0.2, 0.1, 0.21, 0, Math.PI * 2)
            ctx.fill()

            ctx.beginPath()
            ctx.moveTo(0.47, 0.05)
            ctx.lineTo(1, 0.05)
            ctx.quadraticCurveTo(1, -0.1, 0.8, -0.12);
            ctx.lineTo(0.3, -0.12)
            ctx.lineTo(0.1, 0.0)
            ctx.lineTo(0.4, 0.15)
            ctx.quadraticCurveTo(0.43, 0.05, 0.47, 0.05)
            ctx.fill()

            ctx.globalCompositeOperation = 'destination-out';

            ctx.beginPath()
            ctx.arc(0.2, 0.1, 0.12, 0, Math.PI * 2)
            ctx.fill()


            return function(ctx, A, B, sens) {

                var l = Math.sqrt((A.x - B.x) * (A.x - B.x) + (A.y - B.y) * (A.y - B.y))

                var angle = Math.atan2(B.y - A.y, B.x - A.x)

                ctx.save()

                ctx.translate(A.x, A.y)

                ctx.rotate(angle)

                ctx.scale(l, l * ((sens << 1) - 1))

                ctx.translate(0, -0.27)

                ctx.drawImage(canvas, 0, 0, canvas.width, canvas.height, 0, 0, 1, 1)

                ctx.restore()
            }
        })()


        return function(ctx, A, B, gap) {

            var w = 50,
                W = 20

            var l = Math.sqrt((A.x - B.x) * (A.x - B.x) + (A.y - B.y) * (A.y - B.y))

            ctx.beginPath()
            for (var t = 0; t < l; t += w + W) {
                var k = t / l
                k_ = Math.min(1, (t + W) / l)

                ctx.moveTo(B.x * k + A.x * (1 - k), B.y * k + A.y * (1 - k))
                ctx.lineTo(B.x * k_ + A.x * (1 - k_), B.y * k_ + A.y * (1 - k_))
            }

            ctx.strokeStyle = '#000'
            ctx.lineWidth = 5
            ctx.lineCap = 'round'

            ctx.stroke()


            var w = 200,
                W = 60

            for (var t = 100; t < l; t += w + W) {
                var k = t / l
                k_ = (t + W) / l

                if (t + 2 * W > l)
                    break


                var H = {
                    x: B.x * k + A.x * (1 - k),
                    y: B.y * k + A.y * (1 - k)
                }
                var K = {
                    x: B.x * k_ + A.x * (1 - k_),
                    y: B.y * k_ + A.y * (1 - k_)
                }

                drawScissor(ctx, H, K, gap)
            }
        }

    })();


    /**
     * Cut a polygon along an axis
     * the result could be :
     *  - two polygons if the axis pass throught the polygon shape
     *  - the whole polygon if the axis does not intersect the polygon shape
     *  - the whole polygon if the polygon is not convex and the cut should result in more than two fragments ( because, well it's difficult to do and I don't want to )
     *
     * @method cutPolygonAlongAxis
     * @static
     * @private
     * @param o        {Point}           one point of the line
     * @param v        {Point}           vector director of the line
     * @param polygon  {Array of Point}  the polygon
     * @return { Array of Array of Point } Array of polygons, fragments of the original one
     */
    var cutPolygonAlongAxis = function(o, v, polygon) {

        var intersections = 0

        var frag = [
            [],
            []
        ]

        var a = polygon[0],
            b,
            e;

        var k = 0;

        for (var i = polygon.length; i--;) {

            frag[k].push(a)

            b = a;
            a = polygon[i];

            if ((e = BABYLON.Vector2.intersectLineSegment(o, v, a, b))) {

                frag[k].push(e)

                k = +(!k)

                frag[k].push(e)


                intersections++
                if (intersections > 2)
                // non convex polygon with critical cut
                // nop nop nop
                // abandon
                    return [polygon]
            }
        }

        if (!intersections)
            return [frag[0]]

        return frag
    }


    return C;
})();
