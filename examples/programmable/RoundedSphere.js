wnp.Programmable.RoundedSphere = (function () {

    /**
     * A programmable which creates a sphere
     *
     * @constructor
     * @class RoundedSphere
     */
    var P = function (engine, structure, params) {

        // super call
        wnp.Programmable.call(this, engine, structure, params);

        this.objectName = 'RoundedSphere';
    };

    // inheritance
    for (var i in wnp.Programmable.prototype) {
        P.prototype[i] = wnp.Programmable.prototype[i];
    }

    // return all the params used by the programmable, and their default values
    P.prototype.getDefaultParams = function() {
        var params = {
            size : 10,
            edgy : false
        };
        return params;
    };

    // return the params classified in categories ( advanced or basic )
    // the value of each key is the displayed text in the context menu
    P.prototype.localizeAndSortParams = function() {
        var params = {};

        params.basic = {
            "size" : "the size of the sphere",
        }

        params.advanced = {
            "edgy" : "smooth or not",
        }

        return params;
    }

    // this function helps to define the type of each param
    // this is useful in order to have a nice context menu,
    // a boolean for example is displayed as a toggle button
    P.prototype.getParamType = function( name ){
        switch( name ){

            // the size param is a number
            case "size" :
                return { 
                    type:"number",
                    min:0,
                    max:100
                }

            // the edgy param is a boolean
            case "edgy" :
                return"boolean"
        }

        // super class call
        // will try to determine the type if it is not filtered by the switch condition
        return wnp.Programmable.prototype.getParamType.call( this , name );
    }


    // return a set of labeled materials
    // each material is linked to a specific region 
    // in this example, the sphere only contains one part, named main
    P.prototype.getDefaultMaterials = function(scene) {
        var materials = {};

        materials['main'] = new wnp.WhiteMaterial("sphere", scene, {factor:0.8});


        return materials;
    };

    // build the mesh
    P.prototype.getObject3D = function(scene) {

        // notice : the name of the mesh is main
        var sphere = BABYLON.Mesh.CreateSphere("main", 10 , this.params.size, scene);

        if( this.params.edgy )
            sphere.convertToFlatShadedMesh();

        return sphere;
    };

    return P;
})();
