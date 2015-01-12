/* global API */
/* global console */


/**
 * @module Wanaplan
 * @submodule Component
 */

var RoomExampleComponent = (function() {

    /**
     * This components highlights 3D room meshes in green when hovered.
     * If the user then clicks on a room, the camera zooms on it.
     *
     * @class RoomExampleComponent
     * @constructor
     * @extends BaseComponent3D
     */
    var comp = function(core) {
        BaseComponent3D.call(this, core, 'RoomExampleComponent');

        //
        this.previousCameraState = null;
        this.rooms = [];
        this.selectedRoom = null;

        this.highlightMaterial = new wnp.PlasticMaterial('highlightMaterial', API.e3D.getScene());
        this.highlightMaterial.setBaseColor(new BABYLON.Color3(0.2, 1.0, 0.1));

        this.highlightedIndex = -1;
        this.highlightedMesh = null;

        return this;
    };

    comp.prototype = new BaseComponent3D();

    comp.prototype.initialize = function() {
        // This event must be listened at all times
        this.onRoomsUpdated = this.onRoomsUpdated.bind(this);
        document.addEventListener('wnp.engine3D.roomsReady', this.onRoomsUpdated, false);
    };

    comp.prototype.startListening = function() {
        this.onClick = this.onClick.bind(this);
        this.onMouseMove = this.onMouseMove.bind(this);

        document.addEventListener('wnp.engine3D.click', this.onClick, false);
        document.addEventListener('wnp.engine3D.mouse-move', this.onMouseMove, false);
    };

    comp.prototype.stopListening = function() {
        document.removeEventListener('wnp.engine3D.click', this.onClick, false);
        document.removeEventListener('wnp.engine3D.mouse-move', this.onMouseMove, false);
    };

    // *** Event management ***

    comp.prototype.onClick = function(event) {
        // Retrieves the clicked room mesh, and zooms on it

        var mstate = event.mstate;
        var pickingInfo = API.e3D.intersect(mstate.pos.x, mstate.pos.y, this.rooms);

        if (pickingInfo && pickingInfo.hit) {
            var newSelected = pickingInfo.pickedMesh.subMeshes[pickingInfo.pickedSubMeshIndex].objectInstance;

            this.selectedRoom = newSelected;

            // The mesh name is "RoomMesh_X" where X is the floor ID.
            this.selectedFloorId = + pickingInfo.pickedMesh.name.substr(9, 1);
            this.zoomOnRoom(this.selectedRoom);
        }
        else if (this.selectedRoom) {
            // When zoomed on a room, a side click allows the user to go back to the previous view
            this.unZoomOnRoom(this.selectedRoom);
            this.selectedRoom = null;
            this.selectedFloorId = -1;
        }

    };

    comp.prototype.onRoomsUpdated = function() {
        // Builds the 3D room mesh list

        var meshes = API.e3D.getMeshes();
        this.rooms.length = 0;

        for (var i = 0, il = meshes.length; i < il; i++) {
            if (meshes[i].name.indexOf('RoomMesh_') !== -1) {
                this.rooms.push(meshes[i]);
            }
        }
    };

    comp.prototype.onMouseMove = function(event) {
        // Highlights with green a room when hovered by the mouse.

        var pickingInfo,
            subMeshIndex,
            isCeiling;
        var mstate = event.mstate;
        pickingInfo = API.e3D.intersect(mstate.pos.x, mstate.pos.y, this.rooms);

        if (pickingInfo && pickingInfo.hit) {
            subMeshIndex = pickingInfo.pickedSubMeshIndex;

            isCeiling = pickingInfo.pickedMesh.subMeshes[subMeshIndex].boundingBox.ceil;
            if (isCeiling) {
                return;
            }

            // Color the room
            if (this.highlightedIndex != subMeshIndex) {
                this.unHighlight();
                this.highlight(pickingInfo.pickedMesh, subMeshIndex);
            }
        } else {
            this.unHighlight();
        }
    };

    // *** Material switching functions ***

    comp.prototype.highlight = function(mesh, subMeshIndex) {
        if (this.highlightedIndex === -1) {
            this.switchMaterials(mesh, subMeshIndex);
            this.highlightedIndex = subMeshIndex;
            this.highlightedMesh = mesh;
        }
    };

    comp.prototype.unHighlight = function() {
        if (this.highlightedIndex !== -1) {
            this.switchMaterials(this.highlightedMesh, this.highlightedIndex);
            this.highlightedIndex = -1;
            this.highlightedMesh = null;
        }
    };

    comp.prototype.switchMaterials = function(mesh, materialIndex) {
        if (!mesh.__roomEditorMaterial) {
            mesh.__roomEditorMaterial = this.highlightMaterial;
        }

        var x = mesh.__roomEditorMaterial;
        mesh.__roomEditorMaterial = mesh.material.subMaterials[materialIndex];
        mesh.material.subMaterials[materialIndex] = x;
    };

    // *** Camera functions ***

    comp.prototype.zoomOnRoom = function(room) {
        var camera = API.e3D.getCamera();
        var camF = API.e3D.getCameraFeatures();

        var roomCenter = room.getCenter();
        // Elevate the lookat point, so we don't look at the shoes
        // IMPORTANT : the 'z' coordinate is '-roomCenter.y' because in BJS, the frames are indirect !!!
        // So, when unprojecting a 2D point (x, y), we get (x, ... , -y).
        roomCenter = new BABYLON.Vector3(roomCenter.x, API.getCurrentFloor().elevation + 175, - roomCenter.y);

        this.previousCameraState = {
            target: camera.target.clone(),
            alpha: camera.alpha,
            beta: camera.beta,
            radius: camera.radius
        };

        var src = this.previousCameraState;

        var dst = {
            target: roomCenter,
            alpha: Math.PI / 2,
            beta: 0,
            radius: room.height * 4
        };

        camF.computeAnimation(
            camera,
            src,
            dst, {
                duration: 400,
                callback: function() {},
                name: "roomZoom",
                isACamera: true,
                smooth: "ease",
            }
        );
    };

    comp.prototype.unZoomOnRoom = function() {
        var camera = API.e3D.getCamera();
        var camF = API.e3D.getCameraFeatures();

        var src = {
            target: camera.target.clone(),
            alpha: camera.alpha,
            beta: camera.beta,
            radius: camera.radius
        };
        var dst = this.previousCameraState;


        camF.computeAnimation(
            camera,
            src,
            dst, {
                duration: 400,
                callback: function() {},
                name: "roomZoom",
                isACamera: true,
                smooth: "ease",
            }
        );
    };

    return comp;

})();
