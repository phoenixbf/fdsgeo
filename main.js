/*
	Main js entry for template ATON web-app

===============================================*/
let APP = ATON.App.realize();

APP.mats = [];

// APP.setup() is required for web-app initialization
// You can place here UI setup (HTML), events handling, etc.
APP.setup = ()=>{
    APP.contentPath = APP.basePath+"content/";

    ATON.FE.realize(); // Realize the base front-end

	ATON.FE.addBasicLoaderEvents(); // Add basic events handling

    APP.gMain = ATON.createSceneNode("main");
    APP.gMain.attachToRoot();

    APP.gMain.setPosition(-0.5,0.0,0.1);
    //APP.gMain.setScale(0.1,0.1,0.1);

    APP.gTerrain = ATON.createSceneNode("terrain").load(APP.contentPath+"terreno-limitrofo-bucato.gltf", ()=>{ APP.setupNode(APP.gTerrain) });
	APP.gTerrain.attachTo(APP.gMain);

    APP.gTerrainLarge = ATON.createSceneNode("terrainlarge").load(APP.contentPath+"terreno-ampio.gltf", ()=>{ APP.setupNode(APP.gTerrainLarge) });
	APP.gTerrainLarge.attachTo(APP.gMain);
    APP.gTerrainLarge.position.y = 0.2;

    APP.gCont = ATON.createSceneNode("vasca").load(APP.contentPath+"vasca-flip.gltf", ()=>{ APP.setupNode(APP.gCont) });
	APP.gCont.attachTo(APP.gMain);
    //APP.gCont.setScale(1,0.075,1);

    APP.gBlobs = ATON.createSceneNode("blobs").load(APP.contentPath+"blob.gltf", ()=>{ APP.setupNode(APP.gBlobs) });
	APP.gBlobs.attachTo(APP.gMain);
    //APP.gBlobs.setScale(1,0.075,1);

    ATON.setBackgroundColor( new THREE.Color(0.5,0.5,0.5) );
    //ATON.setMainLightDirection( new THREE.Vector3(-0.3, -0.5, 0.3) );
    //ATON.toggleShadows(true);
    //ATON.FX.togglePass(ATON.FX.PASS_AO, true);

    // Sections
/*
    APP.clipPlanes = [
        new THREE.Plane( new THREE.Vector3( 0, -1, 0 ), 0.5 )
    ];

    ATON._renderer.localClippingEnabled = true;
*/
    // UI
    ATON.FE.uiAddButtonHome("idBottomToolbar");
	ATON.FE.uiAddButtonVR("idBottomToolbar");
    //ATON.FE.uiAddButtonAR("idBottomToolbar");

    $("#rangeo").on("input", ()=>{
        let v = parseFloat( $("#rangeo").val() );

        v -= 5.0;

        APP.setSectionH(v);

        let cm = parseInt( v * 100.0);
        $("#iddepth").text(cm + " cm");
    });

    ATON.Nav.setAndRequestHomePOV(
        new ATON.POV()
            .setPosition(-20,10,20)
            .setTarget(0,0,-1)
            .setFOV(70.0)
    );
};

APP.setupNode = (N)=>{

    N.traverse( c => {
        if ( c.isMesh ){
            c.castShadow    = true;
            c.receiveShadow = true;
        }

        if ( c.material ){
/*
            c.material.clippingPlanes   = APP.clipPlanes;
            c.material.clipIntersection = true;
            //c.material.clipShadows = true;
*/
            let M = new CustomShaderMaterial({
                baseMaterial: c.material,
        
                uniforms: {
                    h: { type:'float', value: 0.1 }
                },

                vertexShader:`
                    varying vec3 vPositionW;
                    varying vec2 sUV;
                    
                    //varying vec3 vNormalW;
                    //varying vec3 vNormalV;
        
                    void main(){
                        sUV = uv;
        
                        vPositionW = ( vec4( position, 1.0 ) * modelMatrix).xyz;
                        //vNormalV   = normalize( vec3( normalMatrix * normal ));
                        //vNormalW   = (modelMatrix * vec4(normal, 0.0)).xyz;
        
                        gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
                    }
                `,
        
                fragmentShader:`
                    varying vec3 vPositionW;
                    varying vec2 sUV;

                    //varying vec3 vNormalW;
                    //varying vec3 vNormalV;

                    uniform float h;

                    void main(){

                        float dh = h - vPositionW.y;
                        dh *= 4.0;
                        dh = clamp(dh, 0.2,1.0);

                        csm_DiffuseColor.a = dh;

                        csm_DiffuseColor.rgb = mix(vec3(csm_DiffuseColor.g), csm_DiffuseColor.rgb, dh);

                        //if (vPositionW.y > h) discard;

                    }`
            });

            c.material = M;
            c.material.transparent = true;
            //c.material.depthWrite = false;

            APP.mats.push(M);
        }
    });
};

APP.setSectionH = (h)=>{
/*
    for (let p in APP.clipPlanes){
        APP.clipPlanes[p].constant = h;
    }
*/
    for (let i in APP.mats){
        APP.mats[i].uniforms.h.value = h;
    }

    //console.log(h);
};

/* APP.update() if you plan to use an update routine (executed continuously)
APP.update = ()=>{

};
*/

// Run the App
window.onload = ()=>{
	APP.run();
};