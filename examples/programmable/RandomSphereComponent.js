/* global API */
/* global console */


/**
 * @module Wanaplan
 * @submodule Component
 */

var RandomSphereComponent = (function() {

    /**
     * This components add the programmable sphere when the user click with the mouse wheel.
     *
     * @class RandomSphereComponent
     * @constructor
     * @extends BaseComponent3D
     */
    var C = function RandomSphereComponent(core) {
        BaseComponent3D.call(this, core, 'RandomSphereComponent');
    };

    C.prototype = new BaseComponent3D();


    /**
     * Add a sphere programmable of the specified size at the specific position.
     *
     * @method RandomSphereComponent
     * @param position {BABYLON.Vector3} the position of the sphere
     * @param size     {number}          the size of the sphere
     */
    C.prototype.addSphere = function( position , size ){

       

        // instanciate a new objectstructure
        var objectStructure = new ObjectStructure(

            // programmable file name
            'RoundedSphere.js' ,

            // url to the file
            'js/Core/Api/examples/Programmable/' ,

            // tranformation params
            {
                position : position,
            }
        );


         // shpere programmable params
        var objectParams = {

            materials : {
                'main' : null
            },

           size : size,
        };

        // callback
        var callback = function(){
            console.log( 'sphere added');
        };

        // grab the component
        var objectComponent3D = API.getComponent('ObjectComponent3D');

        // build the object
        // will load the js file if needed,
        // build the mesh,
        // append it to the floor
        objectComponent3D.buildObject( objectStructure , objectParams, null , callback );

    };

    /**
     * build the _handlers set, which contains the event handlers binded to the instance
     *
     * @method _initHandlers
     * @private
     */
    C.prototype._initHandlers = function() {

        // bind this functions to the instance context
        // which means that when the function this._handlers.requestStart is called, the context is always the intance
        // this is useful when dealing with event which set the context of the callback functions

        this._handlers = {}
        this._handlers.click = click.bind(this)
    };

    C.prototype.startListening = function() {

        // init the handlers if needed
        if (!this._handlers)
            this._initHandlers();

        // add event listeners
        API.listen('wnp.engine3D.click', this._handlers.click );
    };

    C.prototype.stopListening = function() {

        // init the handlers if needed
        if (!this._handlers)
            this._initHandlers();

        // remove event listeners
        API.unListen('wnp.engine3D.click', this._handlers.click );
    };

    /////////////////////////////////////
    ///// Event handlers           //////
    /////////////////////////////////////

    var click = function( event ) {
        if( event.which == 2 )
            this.addSphere( new BABYLON.Vector3( Math.random()*500-250, Math.random()*200+20 , Math.random()*500-250 ) , Math.random()*90+10 )
    }

    return C;
})();
