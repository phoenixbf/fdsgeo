/*
	Main js entry for template ATON web-app

===============================================*/
let APP = ATON.App.realize();

window.APP = APP;

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

    APP.gBlobs = ATON.createSceneNode("blobs").load(APP.contentPath+"blob.gltf", ()=>{ APP.setupNode(APP.gBlobs, true) });
	APP.gBlobs.attachTo(APP.gMain);
    //APP.gBlobs.setScale(1,0.075,1);

    ATON.setBackgroundColor( new THREE.Color(0.5,0.5,0.5) );
    ATON.setMainPanorama(APP.contentPath+"pano.jpg"); 

    //ATON.setMainLightDirection( new THREE.Vector3(-0.3, -0.5, 0.3) );
    //ATON.toggleShadows(true);
    //ATON.FX.togglePass(ATON.FX.PASS_AO, true);
    //ATON.FX.togglePass(ATON.FX.PASS_BLOOM, true);

    // Sections
/*
    APP.sectCol = new THREE.Color(0,0,0);

    APP.mSect = new THREE.Mesh( 
        new THREE.PlaneGeometry( 1, 1 ),
        new THREE.MeshBasicMaterial({
            color: APP.sectCol,
            side: THREE.DoubleSide,
            transparent: true,
            depthWrite: false,
            opacity: 0.2
        })
    );

    APP.mSect.rotation.set(-1.57079632679,0.0,0.0);
    APP.mSect.scale.set(40,40,40);
    ATON.getRootScene().add( APP.mSect );
*/

/*
    APP.clipPlanes = [
        new THREE.Plane( new THREE.Vector3( 0, -1, 0 ), 0.5 )
    ];

    ATON._renderer.localClippingEnabled = true;
*/
    // UI
    ATON.FE.uiAddButtonHome("idBottomToolbar");
	
    //ATON.FE.uiAddButtonVR("idBottomToolbar");
    //ATON.FE.uiAddButtonAR("idBottomToolbar");

    $("#rangeo").on("input", ()=>{
        let v = parseFloat( $("#rangeo").val() );

        v -= 4.0;

        APP.setSectionH(v);

        APP.setInfoMapFromH(v);

        let cm = parseInt( v * 100.0);
        $("#iddepth").text(cm + " cm");
    });

    $("#infoimg").hide();

    APP.popupWelcome();

    ATON.Nav.setAndRequestHomePOV(
        new ATON.POV()
            .setPosition(-20,20,20)
            .setTarget(0,0,-1)
            .setFOV(70.0)
    );
};

APP.setInfoMapFromH = (h)=>{
    if (h > -0.1){
        $("#infoimg").hide();
        //$("#infoimg").attr("src", "content/ui-map0.jpg");
        return;
    }

    if (h < -2.0){
        $("#infoimg").attr("src", "content/ui-map3.jpg");
        $("#infoimg").show();
        return;
    }

    if (h < -0.5){
        $("#infoimg").attr("src", "content/ui-map2.jpg");
        $("#infoimg").show();
        return;
    }

    $("#infoimg").attr("src", "content/ui-map1.jpg");
    $("#infoimg").show();

};

APP.popupWelcome = ()=>{
    let htmlcontent = "<div class='atonPopupTitle'>Acquisizione Georadar</div>";

    htmlcontent += "<div class='atonPopupDescriptionContainer'>";
    //htmlcontent += "<img src='content/ui-location.jpg' style='float:right'>";
    htmlcontent += "<div style='text-align:center'><b>Campagna di Rilievo 2022, CNR ISPC Lecce</b></div><br>";
    htmlcontent += "In una acquisizione Georadar vengono messe in evidenza le onde elettromagnetiche riflesse da strutture sepolte presenti a varie profondità. Per poterle visualizzare viene utilizzata una tecnica 3D che consente di costruire le <i>depth slices</i> che sono una sorta di scavo virtuale che mettono in correlazione le diverse onde elettromagnetiche riflesse e ne ricostruiscono le loro caratteristiche."
    htmlcontent += "<br><div style='text-align:center'><img src='content/ui-area.jpg'></div>";
    htmlcontent += "</div>";

    htmlcontent += "<div class='atonBTN atonBTN-green' id='btnOK' style='width:90%'>OK</div>";

    if ( !ATON.FE.popupShow(htmlcontent) ) return;

    $("#btnOK").click(()=>{
        ATON.FE.popupClose();
        //ATON.toggleFullScreen();
    });
};

APP.setupNode = (N, bOpaque)=>{

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
                        dh *= 2.0;
                        dh = clamp(dh, 0.2,1.0);

                        csm_DiffuseColor.a = dh;

                        csm_DiffuseColor.rgb = mix(vec3(csm_DiffuseColor.g), csm_DiffuseColor.rgb, dh);

                        //if (vPositionW.y > h) discard;

                    }`
            });

            c.material = M;

            if (!bOpaque){
                c.material.transparent = true;
                //c.material.depthWrite = false;
            }

            APP.mats.push(M);
        }
    });
};

APP.setSectionH = (h)=>{
    //APP.mSect.position.y = h;

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