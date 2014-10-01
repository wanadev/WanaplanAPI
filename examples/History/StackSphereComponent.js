/**
 * @module Wanaplan
 * @submodule Component
 */

var StackSphereComponent = (function () {

    var C = function StackSphereComponent(core) {
        BaseComponent3D.call(this, core, "StackSphereComponent");

        this._initHandlers();
    };

    C.prototype = Object.create(BaseComponent3D.prototype);



    C.prototype.initialize = function () {
        this._registerHistoryAction()

        this.stack = []
    };

    C.prototype._registerHistoryAction = function( historycmp ){

        var that = this

        var undoStack = function( target , params ){
            that.copyStack( params.oldStack )
            that.renderStack()
        }

        var redoStack = function( target , params ){
            that.copyStack( params.newStack )
            that.renderStack()
        }

        API.registerAction( 'stackSphere.stack'  , undoStack , redoStack , this );
    };

    C.prototype.startListening = function () {
        API.listen('wnp.engine3D.click', this._handlers.click );
    };

    C.prototype.stopListening = function () {
        API.unListen('wnp.engine3D.click', this._handlers.click );
    };


    /**
     *  add an entity to the stack
     *  call renderStack to update the scene according to the new stack
     *
     * @method stackSphere
     * @param r {number}  radius of the netity to be pushed to the stack
     */
    C.prototype.stackSphere = function( r ){
        
        var oldStack = this.stack.slice();

        this.stack.push( r );

        var newStack = this.stack.slice();


        API.addHistory( 
            null , 
            { oldStack : oldStack , newStack : newStack } ,
            'stackSphere.stack' ,
            this
        );
    };

    /**
     *  copy the current stack from the one passed in params
     *
     *  @method copyStack
     *  @param otherStack {Array of number} the stack
     */
    C.prototype.copyStack = function( otherStack ){
        this.stack.length=0
        for( var i=0;i<otherStack.length;i++)
            this.stack.push( otherStack[i] )
    };

    /**
     *  display the current stack
     *
     * @method renderStack
     */
    C.prototype.renderStack = function( ) {

        var scene = this.scene;

        var stack = this.stack;

        if( !this._stackNode ){
            this._stackNode = new BABYLON.Mesh( 'stackNode' , scene);
            this._stackNode.isVisible = false;
        }

        var stackNode = this._stackNode

        // remove the old sphere
        var c = stackNode.getChildren()
        for( var i=c.length;i--;)
            c[i].dispose()

        // add the new ones
        var sum=0
        for( var k=0;k<stack.length;k++){

            var sphere = BABYLON.Mesh.CreateSphere('randomSphere', 10 , stack[k] , scene);

            sphere.position.copyFromFloats( 0 , sum + stack[k]/2 , 0 )

            sphere.parent = stackNode

            sum += stack[k]
        }
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
    
    var click = function( event ) {
        if( event.which == 1 ){
            this.stackSphere( Math.random()*30 + 10 )
            this.renderStack()
        }
            
    };

    return C;
})();