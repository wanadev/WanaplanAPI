/* global API */
/* global console */


/*
 * @module Wanaplan
 * @submodule Component
 */

var ApiFriendlyComponent = (function() {

    /*
     * Highlight room in blue on mouse hover
     * Join all subslopes at point on double click
     * Store and retrieve data 'people' on Enter pressed
     * Start an animation of a wall thickness on Space bar pressed
     *
     * @class ApiFriendlyComponent
     * @constructor
     * @extends BaseComponent2D
     */
    var comp = function(core) {
        BaseComponent2D.call(this, core, 'ApiFriendlyComponent');
        return this;
    };

    comp.prototype = new BaseComponent2D();

    comp.prototype.initialize = function() {
        this.startListening();
    };

    comp.prototype.startListening = function() {
        this.onMouseMove = this.onMouseMove.bind(this);
        this.onDblClick = this.onDblClick.bind(this);
        this.onKeyDown = this.onKeyDown.bind(this);
        document.addEventListener('mousemove', this.onMouseMove, false);
        document.addEventListener('dblclick', this.onDblClick, false);
        document.body.addEventListener('keydown', this.onKeyDown, false);
    };

    comp.prototype.stopListening = function() {
        document.removeEventListener('mousemove', this.onMouseMove, false);
        document.removeEventListener('dblclick', this.onDblClick, false);
        document.body.removeEventListener('keydown', this.onKeyDown, false);
    };

    comp.prototype.onMouseMove = function() {

        var rooms = API.getRooms();
        var pos = API.e2D.getMousePos();

        for (var i = 0; i < rooms.length; i++) {
            if (rooms[i].isPointIn(pos)) {
                rooms[i].setColor('#AAAAFF');
            } else {
                rooms[i].setColor('#FFFFFF');
            }
        }

        API.e2D.requestStaticDraw();
    }

    comp.prototype.onDblClick = function() {

        var rooms = API.getRooms();
        var pos = API.e2D.getMousePos();

        if ((API.getMode() & API.MODE_2D_SUBSLOPE) != 0)  {
            for (var i = 0; i < rooms.length; i++) {
                if (rooms[i].isPointIn(pos)) {
                    for (var j = 0; j < rooms[i].walls.length; j++) {
                        for (var k = 0; k < rooms[i].walls[j].subSlopes.length; k++) {
                            if (pos.subtract(rooms[i].walls[j].subSlopes[k].points[0]).dot(rooms[i].walls[j].subSlopes[k].side[0])>0)
                                rooms[i].walls[j].subSlopes[k].offset = pos.distToSegment(rooms[i].walls[j].subSlopes[k].points[0], rooms[i].walls[j].subSlopes[k].points[1]) - 0.1;
                            else
                                rooms[i].walls[j].subSlopes[k].offset = 0;
                        }
                    }
                } 
            }
            //update polygon points once all offsets are modified
            for (var i = 0; i < rooms.length; i++) {
                if (rooms[i].isPointIn(pos)) {
                    for (var j = 0; j < rooms[i].walls.length; j++) {
                        for (var k = 0; k < rooms[i].walls[j].subSlopes.length; k++) {
                            rooms[i].walls[j].subSlopes[k].computePolygonPoints(true);
                        }
                    }
                }
            }
        }

        API.e2D.requestStaticDraw();
    };

    comp.prototype.onKeyDown = function(event) {
        //on enter, store data
        if (event.keyCode == 13) customDataTest();
        //on space bar, start animation
        else if (event.keyCode == 32) animationTest();
    };

    //store some data and retrieve it
    var customDataTest = function() {
        var myData0 = {
            vector: new BABYLON.Vector2(0, 1),
            coucou: 'coucou'
        };
        var myData1 = {
            position: new BABYLON.Vector2(1, 0),
            salut: 'salut'
        };
        API.setData('people', [myData0, myData1]);
        console.log(API.getData('people'));
    };

    // Animation that progressively increases thickness of one wall
    var animationTest = function() {
        var walls = API.getWalls();
        var fn = function(thickness) {
            walls[0].thickness = thickness;
            walls[0].needsUpdate = true;
            API.e2D.requestStaticDraw();
        };
        var anim = wnp.AnimationHandler.Create(walls[0], 10000, {
            thickness: {
                start: 15,
                end: 50,
                callback: fn
            }
        });

        anim.start();
    };

    return comp;

})();
