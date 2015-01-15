/* global API */
/* global console */


/*
 * @module Wanaplan
 * @submodule Component
 */

var ApiNewButtonComponent = (function() {

    /*
     * ApiNewButtonComponent.
     *
     * @class ApiNewButtonComponent
     * @constructor
     * @extends BaseComponent3D
     */
    var comp = function(core) {
        BaseComponent3D.call(this, core, 'ApiNewButtonComponent');
        this.buttonDOM;
        return this;
    };

    comp.prototype = new BaseComponent3D();

    comp.prototype.initialize = function() {
    };

    comp.prototype.startListening = function() {
        if (!this.buttonDOM) this.createButton();
    };

    comp.prototype.stopListening = function() {
    };

    // Experimental, UI API
    var Button = function() {
        this.enabled = false;
    };

    var CreateButton = function() {
        var button = new Button();
        button.dayMaterial = API.e3D.getSkySphere().material;
        button.nightMaterial = new BABYLON.StandardMaterial('nightSky', API.e3D.getScene());
        button.nightMaterial.diffuseColor.copyFromFloats(0, 0, 0);
        var ground = API.e3D.getGround();
        var plane = new BABYLON.Plane(0, 1, 0, -175);
        var lightPos = new BABYLON.Vector3();
        var light = new BABYLON.PointLight('Point1', lightPos, API.e3D.getScene());
        var pos;
        //light.intensity = 0.5;

        var updatePointLightPos = function(event) {
            plane.d = -175 - API.getCurrentFloor().elevation;
            pos = API.e3D.projectOnPlane(plane);
            if (pos)
                lightPos.copyFrom(pos);
        };

        var night = function() {
            API.e3D.getSkySphere().material = button.nightMaterial;
            ground.material.ambientColor = new BABYLON.Color3(0.1, 0.1, 0.1);
            ground.material.diffuseColor = new BABYLON.Color3(1, 1, 1);
            ground.material.specularColor = new BABYLON.Color3(0.40, 0.40, 0.40);

            //light.enabled = true;
            document.addEventListener('mousemove', updatePointLightPos, false);
        };
        var day = function() {
            API.e3D.getSkySphere().material = button.dayMaterial;
            ground.material.ambientColor = new BABYLON.Color3(0.9, 0.9, 0.9);
            ground.material.diffuseColor = new BABYLON.Color3(1, 1, 1);
            ground.material.specularColor = new BABYLON.Color3(0.01, 0.01, 0.01);

            //light.enabled = false;
            document.removeEventListener('mousemove', updatePointLightPos, false);
        };

        var onClick = function() {
            this.enabled = !this.enabled;
            if (this.enabled) {
                console.log('Hello');
                night();
            } else {
                console.log('Bye');
                day();
                listMaterials();
            }
        };

        button.onClick = onClick.bind(button);

        return button;
    };

    comp.prototype.createButton = function() {
        var container = API.ui.getWidgetContainer();

        this.buttonDOM = document.createElement('div');
        this.buttonDOM.setAttribute('style', 'top: ' + 350 + 'px;left: ' + 20 + 'px; position:absolute;');
        container.appendChild(this.buttonDOM);

        var image = document.createElement('img');
        this.buttonDOM.appendChild(image);
        image.setAttribute('src', 'images/icon-transparency.png');

        var button = CreateButton();
        this.buttonDOM.addEventListener('click', function(event) {
            button.onClick();
        });
    };

    var listMaterials = function() {
        var rooms = API.getRooms();
        var objects = API.getObjects();
        var panes = null;

        console.log('rooms');
        for (var i = 0, il = rooms.length; i < il; i++) {
            panes = rooms[i].getWallPanes();
            console.log(rooms[i]);
            console.log(rooms[i].materials);
            for (var j = 0, jl = panes.length; j < jl; j++) {
                console.log(panes[j]);
            }
        }

        console.log('objects');
        for (i = 0, il = objects.length; i < il; i++) {
            console.log(objects[i].programmableInstance.materials);
        }
    };

    return comp;

})();
