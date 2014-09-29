/* global API */
/* global console */


/**
 * @module Wanaplan
 * @submodule Component
 */

var WallPaneMassEditor = (function() {

    /**
     * This component allows the user to change the material of all the wall panes in a room at once.
     *
     * It opens a preview window on 3D context switching, with a room selector. 
     * Then, when clicking on a material on the menu "decorate",
     * it changes all the material of the wall panes in the selected room.
     *
     * @class WallPaneMassEditor
     * @constructor
     * @extends BaseComponent3D
     */
    var comp = function(core) {
        BaseComponent3D.call(this, core, 'WallPaneMassEditor');

        // UI container object
        this.UI = {};

        // Rooms
        this.rooms = null;
        this.selectedRoom = null;

        // Pointer to the decoration component
        this.decorationComponent = null;

        return this;
    };

    comp.prototype = Object.create(BaseComponent3D.prototype);

    comp.prototype.initialize = function() {
        this.buildEditBox = this.buildEditBox.bind(this);
    };

    comp.prototype.startListening = function() {
        // Retrieve the decoration component to enable/disable its behaviour
        this.decorationComponent = API.getComponent('DecorationComponent3D');
        // Retrieve rooms
        this.rooms = API.getRooms();
        this.buildEditBox();
    };

    comp.prototype.stopListening = function() {
    };

    comp.prototype.interceptPainting = function(event) {
        // We change the UI displayed thumb
        // Two different behaviour, if the selection is a color or a texture
        if (event.params.diffuseTexture) {
            this.UI.img.src = event.params.diffuseTexture;
        } else {
            ctx.fillStyle =
                'rgb(' + Math.round(event.color.r * 255) +
                ',' + Math.round(event.color.g * 255) +
                ',' + Math.round(event.color.b * 255) +
                ')';
            ctx.rect(0, 0, 120, 120);
            ctx.fill();
        }

        // We must build the material from parameters, we use the material factory
        var material = wnp.MaterialFactory.ImportWNPMaterial(event.params);

        // Get all the panes from the selected room in the UI
        var panes = this.selectedRoom.getWallPanes();

        for (var i = 0, il = panes.length; i < il; i++) {
            // Change the materials on the pane
            panes[i].addMaterial(material);

            // Apply it on the mesh
            panes[i].apply();
        }
    };

    comp.prototype.buildEditBox = function() {
        // Create the edit box
        var layout = new photonui.BoxLayout();
        this.UI.editBox = new photonui.Window({
            title: _('Wall Pane Mass Editor'),
            x: 0,
            y: 0,
            visible: true,
            child: layout
        });

        // Center it on the screen
        this.UI.editBox.center();

        // List all rooms as photonui items
        var items = [];
        for (var i = 0, il = this.rooms.length; i < il; i++) {
            items.push(new photonui.MenuItem({value: i, text: this.rooms[i].label}));
        }
        this.selectedRoom = this.rooms[0];

        // Create the room selector
        this.UI.sel = new photonui.Select({
            children: items,
            height : 30,
            width : 120
        });

        // Callback when the value is changed
        var selectRoom = function(widget, value) {
            this.selectedRoom = this.rooms[+value];
        }.bind(this);

        this.UI.sel.registerCallback('change', 'value-changed', selectRoom);
        layout.addChild(this.UI.sel);

        // Create the texture preview
        this.UI.imageContainer = new photonui.Canvas();
        this.UI.imageContainer.width = 140;
        this.UI.imageContainer.height = 140;

        layout.addChild(this.UI.imageContainer);
        var ctx = this.UI.imageContainer.getContext('2d');
        this.UI.img = new Image();

        // Put a placeholder first
        this.UI.img.src = 'images/placeholder-nowebgl.png';
        this.UI.img.onload = function() {
            ctx.drawImage(this.UI.img, 0, 0, 120, 120);
        }.bind(this);

        // Add a close function to the widget
        var callback = this.interceptPainting.bind(this);

        var close = function(widget) {
            widget.destroy();
            // Enables the decoration component
            if (this.decorationComponent) {
                this.decorationComponent.startListening();
            }
            // And disables our custom function
            document.removeEventListener('wnp.engine3D.paint', callback, false);
        }.bind(this);
        this.UI.editBox.registerCallback('clwin', 'close-button-clicked', close);

        // Bind the painting in the menu with our own function
        document.addEventListener('wnp.engine3D.paint', callback, false);

    };

    return comp;

})();

