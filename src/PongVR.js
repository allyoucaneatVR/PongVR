/*jslint browser: true*/
/*global Ayce, Stats, io*/

/////////////////////////////////////////
//    _____             _____ _____    //
//   |  _  |___ ___ ___|  |  | __  |   //
//   |   __| . |   | . |  |  |    -|   //
//   |__|  |___|_|_|_  |\___/|__|__|   //
//                 |___|               //
/////////////////////////////////////////

//window.onload = function(){
//    load();
//    debug();
//};

function debug(){
//    forceFieldObject.addCollision(0.8, 1.0, 0.2);
//    window.setTimeout(debug, 1000);
}

////////////////////////////////////////////////////////////////////
// Initialise ayce
var stats = new Stats();
var isWebVRReady = Ayce.HMDHandler.isWebVRReady();//todo move to ayce
var canvas, scene,  mobileVR;
var joinID = null;
if(window.location.search.substring(1) != ""){
    joinID = window.location.search.substring(1);
}

function load(webVR, cardboard, distortion){
    showLoadingScreen();
    window.setTimeout(function(){
        initAyce(cardboard, distortion);

        hideLoadingScreen();

        stats.setMode(0);
        stats.domElement.style.position = 'absolute';
        stats.domElement.style.zIndex = '1000';
        stats.domElement.style.right = '0px';
        stats.domElement.style.top = '0px';
        document.body.appendChild(stats.domElement);
        if(scene)scene.resize();
    }, 50);
}
function initAyce(cardboard, distortion) {
    canvas = document.getElementById("canvas");
    scene = new Ayce.Scene(canvas);

    var webVRSuccess = scene.useWebVR();
    if(webVRSuccess){
        scene.getCamera().getManager().modifiers.push(cameraConfig);
    }
    //If no WebVR device is detected use desktop or mobile vr settings
    else{
        switchMode(cardboard, distortion);
    }

    if(webVRSuccess || mobileVR){
        var fullInfo = document.querySelector("#fullscreen-info");
        fullInfo.style.display = "block";
        scene.setFullscreenElement(fullInfo);
    }

    initScene();
    socketGameCom();
    tick();
}
function switchMode(cardboard, distortion){
    if(cardboard){
        mobileVR = true;
        scene.setRendererNull();
        scene.getCamera().getManager().clearModifiers();
        scene.useCardboard(distortion);
        scene.getCamera().getManager().modifiers.push(cameraConfig);

        document.getElementById("input").style.display = 'none';
        document.getElementById("distortion").style.display = 'block';
    }else{
        mobileVR = false;
        motionSensors(false);
        scene.setRendererDesktop();

        document.getElementById("input").style.display = 'block';
        document.getElementById("distortion").style.display = 'none';
    }
}
function motionSensors(useSensor){
    var manager = scene.getCamera().getManager();
    manager.clearModifiers();

    //MotionSensor or KeyboardInput
    if(useSensor){
        scene.useMotionSensor();
    }else {
        manager.modifiers.push(new Ayce.MouseKeyboard(canvas, canvas));
    }

    manager.modifiers.push(cameraConfig);
}

////////////////////////////////////////////////////////////////////
// PongVR scene setup
var bodyO3Ds, start, cursor, skybox,
    icoSystem0, icoSystem1, forceField,
    scoreboard0, scoreboard1, torus, platform1,
    platform2, rdy, waitingForPlayer, sound, winlose,
    balloons, ball, body, pane, paneEmpty;
var path = "assets/";
var aquariumHeight = 10;
var bodyParent = {
    position: new Ayce.Vector3(),
    rotation: new Ayce.Quaternion(),
    getGlobalRotation: function(){return this.rotation;},
    getGlobalPosition: function(){return this.position;}
};
var serverO3Ds = {};
var cameraConfig = new Ayce.CameraModifier();

var numbers = [];
var tslf = 0;
var pillarUniform = {
    nr: 4,
    oldNr: 0,
    timeChange: 0,
    duration: 0
};

var osdPosition = new Ayce.Vector3(0, 10, 15);

function initScene(){
    //Set Camera Properties
    scene.getCamera().farPlane = 1000;
    scene.getCamera().updateProjectionMatrix();

    createO3Ds();
}
function createO3Ds(){
    //Set Light Properties
    var light = new Ayce.Light();
    light.position.z = -10;
    light.position.y = 20;
    scene.addToScene(light);

    skybox = new Ayce.Skybox(
        "blue_ba.png",
        "blue_f.png",
        "blue_t.png",
        "blue_bo.png",
        "blue_r.png",
        "blue_l.png",
        path + "textures/skybox/",
        bodyParent,
        scene.getCamera().farPlane);
    skybox.shader = path + "shader/skybox";
    skybox.shaderUniforms = [];
    skybox.shaderUniforms.push(["uTime", "uniform1f", timeObject, ["time"]]);
    scene.addToScene(skybox);

    bodyO3Ds = new Ayce.OBJLoader(path + "obj/body.obj");
    body = getNewBody();
    body.position.z = 0.15;
    body.rotation.fromEulerAngles(0, Math.PI, 0);
    body.parent = bodyParent;
    body.parentRotationWeight.x = 0;
    body.parentRotationWeight.z = 0;
    scene.addToScene(body);

    
    platform1 = new Ayce.Geometry.Box(6, 0.5, 3);
    platform1.offset.set(-platform1.a / 2, 0, -platform1.c / 2);
    platform1 = platform1.getO3D();
    platform1.position.set(0, aquariumHeight - 2.50, -17);
//    platform1.shader = path + "shader/platform";
    platform1.transparent = true;
    platform1.renderPriority = 1;

    platform1.colors = [];
    for(var i=0; i < platform1.vertices.length/3; i++){
        platform1.colors.push(0.8, 0.8, 0.8, 0.5);
    }
    scene.addToScene(platform1);

    
    platform2 = new Ayce.Geometry.Box(6, 0.5, 3);
    platform2.offset.set(-platform2.a / 2, 0, -platform2.c / 2);
    platform2 = platform2.getO3D();
    platform2.position.set(0, aquariumHeight - 2.40, 17);
//    platform2.shader = path + "shader/platform";
    platform2.transparent = true;
    platform2.renderPriority = 1;
    platform2.colors = [];
    for(var i=0; i < platform2.vertices.length/3; i++){
        platform2.colors.push(0.8, 0.8, 0.8, 0.5);
    }
    scene.addToScene(platform2);

    ball = new Ayce.OBJLoader(path + "obj/ball.obj")[0];
    ball.scale.x = .2;
    ball.scale.y = .2;
    ball.scale.z = .2;
    ball.shader = path + "shader/ball";
    ball.shaderUniforms = [];
    ball.shaderUniforms.push(["uTime", "uniform1f", timeObject, ["time"]]);
    //ball.logVertexShader = true;
    //ball.logFragmentShader = true;
    ball.transparent = true;
    //ball.normals = null;

    for(i=0;i<ball.colors.length;i+=4){
        ball.colors[i]=0;
        ball.colors[i+1]=0;
        ball.colors[i+2]=0;
        ball.colors[i+3]=1;
    }

    for(i=ball.colors.length/2+3;i<ball.colors.length;i+=4){
        ball.colors[i]=0.4;
    }

    pane = new Ayce.TextureCube(path + "textures/pane3.png");
    pane.textureCoords = [0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
                        1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 0.0, 0.0,
                        0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0,
                        1.0, 1.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0,
                        1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 0.0, 0.0,
                        0.0, 0.0, 1.0, 0.0, 1.0, 1.0,0.0, 1.0];
    pane.scale.set(1.25, 1, 0.1);
    pane.transparent = true;
    pane.twoFaceTransparency = true;
    pane.visible = false;
    scene.addToScene(pane);

    paneEmpty = new Ayce.Object3D();
    paneEmpty.position.z = -4;
    paneEmpty.parent = bodyParent;
    paneEmpty.parentRotationWeight.set(1, 1, 1);

    forceField = new Ayce.OBJLoader(path + "obj/forceField2.obj")[0];
    forceField.colors = null;
    forceField.position.set(0, 10, 0);
    forceField.imageSrc = [path + "obj/textures/square1.png", path + "obj/textures/square3.png"];
    forceField.transparent = true;
//    forceField.twoFaceTransparency = true;
    forceField.shader = path + "shader/forceField";
    forceField.shaderUniforms = [];
    forceField.shaderUniforms.push(
        ["uTime", "uniform1fv", forceFieldObject, ["time"]],
        ["uCenter", "uniform3fv", forceFieldObject, ["center"]],
        ["uZIndicators", "uniform3f", forceFieldObject.ballZ, ["x", "y", "z"]]
    );
    forceField.renderPriority = 2;
    scene.addToScene(forceField);

    torus = new Ayce.OBJLoader(path + "obj/Torus.obj").Torus;
    torus.position.set(0, aquariumHeight, 0);
    var scale = 5;
    torus.scale.set(scale, scale, scale);
    var setupTorusShader = function() {
        torus.shader = path + "shader/torusTube";
        torus.shaderUniforms = [];
        torus.shaderUniforms.push(["uTime", "uniform1f", timeObject, ["time"]]);
        torus.shaderUniforms.push(["uTimeChangeEffect", "uniform1f", pillarUniform, ["timeChange"]]);
        torus.shaderUniforms.push(["uTimeEffectDuration", "uniform1f", pillarUniform, ["duration"]]);
        torus.shaderUniforms.push(["uEffectNr", "uniform1i", pillarUniform, ["nr"]]);
        torus.shaderUniforms.push(["uOldEffectNr", "uniform1i", pillarUniform, ["oldNr"]]);
        var sides = [];
        var poolVec = new Ayce.Vector3();
        var poolNorm = new Ayce.Vector3();
        var radius = 4 * scale;
        var torusCount = 15;
        var torusNormal = torus.rotation.getRotatedPoint(new Ayce.Vector3(0, 0, -1));
        for (var i = 0; i < torus.vertices.length; i += 3) {

            poolNorm.set(torusNormal.x, torusNormal.y, torusNormal.z);

            var x = torus.vertices[i + 0] - torus.position.x;
            var y = torus.vertices[i + 1] - torus.position.y;
            var z = torus.vertices[i + 2] - torus.position.z;
            poolVec.set(x, y, z);

            poolNorm.scaleBy(poolVec.dotProduct(torusNormal));
            poolVec.subtract(poolNorm.x, poolNorm.y, poolNorm.z);
            poolVec.normalize().scaleBy(radius);
            poolVec.subtract(x, y, z);
            poolVec.addVector3(torus.position);
            poolVec.normalize();


            var r = Math.sin(torus.vertices[i + 0] + torus.vertices[i + 1] + torus.vertices[i + 2]);
            r = r * 10000;
            r = r - Math.floor(r);

            var nr = Math.floor((Math.floor(torus.vertices[i + 2]) + torusCount * 2) / 4);
            torus.textureCoords[(i / 3) * 2 + 1] = nr;
            torus.textureCoords[(i / 3) * 2 + 1] += r;//1-(r*2);

            sides.push(poolVec.x, poolVec.y, poolVec.z);
        }
        torus.shaderAttributes = [];
        torus.shaderAttributes.push(["aSide", 3, sides]);
        torus.shaderAttributes.push(["aTextureCoord", 2, torus.textureCoords]);
    };
    setupTorusShader();
    scene.addToScene(torus);

    scoreboard0 = new Ayce.OBJLoader(path + "obj/scoreboard3.obj")[0];
    scoreboard0.imageSrc = path + "obj/textures/scoreboard.png";
    scoreboard0.transparent = true;
    scoreboard0.shader = path + "shader/scoreboard2";
    scoreboard0.shaderUniforms = [];
    scoreboard0.shaderUniforms.push(
        ["uDigits", "uniform1fv", scoreboardObject, ["digits0"]],
        ["uTime", "uniform1f", timeObject, ["time"]]);
    scoreboard0.colors = null;
    scoreboard0.parent = pane;
    scoreboard0.scale.x=0.25;
    scoreboard0.scale.y=0.25;
    scoreboard0.renderPriority = -1;
    scoreboard0.visible = false;
    scoreboard0.rotation.fromEulerAngles(0,Math.PI,0);
    scene.addToScene(scoreboard0);

    scoreboard1 = new Ayce.OBJLoader(path + "obj/scoreboard3.obj")[0];
    scoreboard1.imageSrc = path + "obj/textures/scoreboard.png";
    scoreboard1.transparent = true;
    scoreboard1.shader = path + "shader/scoreboard2";
    scoreboard1.shaderUniforms = [];
    scoreboard1.shaderUniforms.push(
        ["uDigits", "uniform1fv", scoreboardObject, ["digits1"]],
        ["uTime", "uniform1f", timeObject, ["time"]]);
    scoreboard1.colors = null;
    scoreboard1.parent = pane;
    scoreboard1.scale.x=0.25;
    scoreboard1.scale.y=0.25;
    scoreboard1.renderPriority = -1;
    scoreboard1.visible = false;
    scoreboard1.rotation.fromEulerAngles(0,Math.PI,0);
    scene.addToScene(scoreboard1);

    cursor = new Ayce.OBJLoader(path + "obj/cursor.obj")[0];
    cursor.position.z = -2;
    cursor.parent = scene.getCamera();
    cursor.parent = bodyParent;
    cursor.parentPositionWeight.x = 1;
    cursor.parentPositionWeight.y = 1;
    cursor.parentPositionWeight.z = 1;
    cursor.scale = new Ayce.Vector3(0.05,0.05,1.0);
    scene.addToScene(cursor);

    start = new Ayce.OBJLoader(path + "obj/start2.obj")[0];
    start.transparent = true;
    start.position.y = 11.5;
    start.position.z = -7;
    start.scale = new Ayce.Vector3(0.7,0.7,0.7);
    start.colors = null;
    start.shader = path + "shader/start";
    start.shaderUniforms = [];
    start.shaderUniforms.push(["uTime", "uniform1f", timeObject, ["time"]],["uFillTime", "uniform1f", startObject, ["time"]]);
    start.rotation.fromEulerAngles(0, Math.PI, 0);
    scene.addToScene(start);

    numbers = [];
    for(var i = 0; i < 5; i++){
        numbers[i] = new Ayce.OBJLoader(path + "obj/number.obj")[0];
        numbers[i].imageSrc = path + "obj/textures/score_"+ (5 - i) +"_alpha.png";
        numbers[i].position.y = 10;
        numbers[i].position.z = -7;
        numbers[i].rotation.fromEulerAngles(0, Math.PI, 0);
        numbers[i].visible = false;
        numbers[i].transparent = true;
        numbers[i].colors = null;
        numbers[i].shader = path + "shader/countDown";
        numbers[i].shaderUniforms = [];
        numbers[i].shaderUniforms.push(["uFactor", "uniform1f", startObject, ["zFactor"]]);
        scene.addToScene(numbers[i]);
    }

    rdy = new Ayce.OBJLoader(path + "obj/rdy.obj")[0];
    rdy.transparent = true;
    rdy.visible = false;
    rdy.position.y = osdPosition.y;
    rdy.position.z = osdPosition.z;
    rdy.rotation.fromEulerAngles(0,Math.PI,0);
    rdy.scale.x = 2;
    rdy.scale.y = 2;
    rdy.shader = path + "shader/rdy";
    rdy.colors = null;
    rdy.shaderUniforms = [];
    rdy.shaderUniforms.push(["uTime", "uniform1f", timeObject, ["time"]]);
    scene.addToScene(rdy);

    waitingForPlayer = new Ayce.OBJLoader(path + "obj/waitingforplayer.obj")[0];
    waitingForPlayer.imageSrc = path + "obj/textures/waitingforplayer.png";
    waitingForPlayer.position.y = osdPosition.y;
    waitingForPlayer.position.z = osdPosition.z;
    waitingForPlayer.transparent = true;
//        waitingForPlayer.logVertexShader = true;
//        waitingForPlayer.logFragmentShader = true;
    waitingForPlayer.colors = null;
    waitingForPlayer.shader = path + "shader/rdy";
    waitingForPlayer.shaderUniforms = [];
    waitingForPlayer.shaderUniforms.push(["uTime", "uniform1f", timeObject, ["time"]]);
    waitingForPlayer.scale.x = 3;
    waitingForPlayer.scale.y = 3;
    scene.addToScene(waitingForPlayer);

    winlose = new Ayce.OBJLoader(path + "obj/youwinyoulose.obj")[0];
    winlose.rotation.fromEulerAngles(0,Math.PI,0);
    winlose.imageSrc = path + "obj/textures/youwinyoulose.png";
    winlose.shader = path + "shader/winlose";
    winlose.transparent = true;
    winlose.visible = false;
    winlose.position.y = 10;
    winlose.position.z = -7;
    winlose.colors = null;
    winlose.shaderUniforms = [];
    winlose.shaderUniforms.push(["uWin", "uniform1f", gameOverObject, ["win"]]);
    scene.addToScene(winlose);

    initParticles();
    scene.addToScene(icoSystem0);
    scene.addToScene(icoSystem1);

    initBalloons();
    scene.addToScene(balloons);
}
function initParticles(){
    var particles0 = new Ayce.OBJLoader(path + "obj/ico.obj")[0];
    var particles1 = new Ayce.OBJLoader(path + "obj/icorandom2.obj")[0];

    var colors = [
        [244/255,67/255,54/255,1],  // red
        [233/255,30/255,99/255,1],  // pink
        [156/255,39/255,176/255,1], // purple
        [103/255,58/255,183/255,1], // deep purple
        [63/255,81/255,181/255,1],  // indigo
        [33/255,150/255,243/255,1], // blue
        [3/255,169/255,244/255,1],  // light blue
        [0/255,188/255,212/255,1],  // cyan
        [0/255,150/255,136/255,1],  // teal
        [76/255,175/255,80/255,1],  // green
        [139/255,195/255,74/255,1], // light green
        [205/255,220/255,57/255,1], // lime
        [255/255,235/255,59/255,1], // yellow
        [255/255,193/255,7/255,1],  // amber
        [255/255,152/255,0/255,1],  // orange
        [255/255,87/255,34/255,1]   // deep orange
    ];
    var colors2 = [
        [0.2,0.2,0.2,1],
        [1.0,1.0,1.0,1]
    ];
    var outerIcoColors = [];
    for(i=0;i<colors2.length;i++){
        outerIcoColors[i] = [];
        for(var j=0;j<particles1.colors.length/4;j++){
            outerIcoColors[i] = outerIcoColors[i].concat(colors2[i]);
        }
    }
    var innerIcoColors = [];
    for(i=0;i<colors.length;i++){
        innerIcoColors[i] = [];
        for(j=0;j<particles0.colors.length/4;j++){
            innerIcoColors[i] = innerIcoColors[i].concat(colors[i]);
        }
    }

    var x, y, z, scale;
    icoSystem0 = new Ayce.ParticleSystem(scene, particles1, 200, 300000);
    icoSystem1 = new Ayce.ParticleSystem(scene, particles0, 200, 300000);
    for(var i=0; i<icoSystem0.particles.length; i++){

        x = (Math.pow(Math.random(),3)-Math.pow(Math.random(),3))*500;
        z = (Math.pow(Math.random(),3)-Math.pow(Math.random(),3))*500;
        var torusRadius = 5+10;
        var torusLength = 60+10;
        if(x<0){
            x-=torusRadius;
        }else{
            x+=torusRadius;
        }
        if(z<0){
            z-=torusLength;
        }else{
            z+=torusLength;
        }
        icoSystem0.particles[i].position = new Ayce.Vector3(x, -50, z);
        icoSystem1.particles[i].position = new Ayce.Vector3(x, -50, z);

        y = (Math.random())*0.0015;
        icoSystem0.particles[i].velocity = new Ayce.Vector3(0, y, 0);
        icoSystem1.particles[i].velocity = new Ayce.Vector3(0, y, 0);

        scale = 5+Math.random()*5;
        icoSystem0.particles[i].scale = new Ayce.Vector3(scale, scale, scale);
        icoSystem1.particles[i].scale = new Ayce.Vector3(scale-2, scale-2, scale-2);

        var lifetime = 300000+Math.random()*100000;
        icoSystem0.particles[i].lifetime = lifetime;
        icoSystem1.particles[i].lifetime = lifetime;

        icoSystem0.particles[i].rotationAngle = new Ayce.Vector3(
            Math.random()*0.0001,
            Math.random()*0.0001,
            Math.random()*0.0001);
        icoSystem1.particles[i].rotationAngle = new Ayce.Vector3(
            Math.random()*0.0003,
            Math.random()*0.0003,
            Math.random()*0.0003);

        icoSystem0.particles[i].colors = outerIcoColors[Math.round(Math.random()*outerIcoColors.length-1)];
        icoSystem1.particles[i].colors = innerIcoColors[Math.round(Math.random()*innerIcoColors.length-1)];
    }
    icoSystem0.initParticleArrays();
    icoSystem0.useFragmentLighting = false;
    icoSystem1.initParticleArrays();
    icoSystem1.useFragmentLighting = false;
}
function initBalloons(){
    var balloon = new Ayce.OBJLoader(path + "obj/balloon.obj")[0];

    var colors = [
        [244/255,67/255,54/255,1],  // red
        [233/255,30/255,99/255,1],  // pink
        [156/255,39/255,176/255,1], // purple
        [103/255,58/255,183/255,1], // deep purple
        [63/255,81/255,181/255,1],  // indigo
        [33/255,150/255,243/255,1], // blue
        [3/255,169/255,244/255,1],  // light blue
        [0/255,188/255,212/255,1],  // cyan
        [0/255,150/255,136/255,1],  // teal
        [76/255,175/255,80/255,1],  // green
        [139/255,195/255,74/255,1], // light green
        [205/255,220/255,57/255,1], // lime
        [255/255,235/255,59/255,1], // yellow
        [255/255,193/255,7/255,1],  // amber
        [255/255,152/255,0/255,1],  // orange
        [255/255,87/255,34/255,1]   // deep orange
    ];

    var balloonColors = [];
    for(i=0;i<colors.length;i++){
        balloonColors[i] = [];
        for(var j=0;j<balloon.colors.length/4;j++){
            balloonColors[i] = balloonColors[i].concat(colors[i]);
        }
    }

    balloons = new Ayce.ParticleSystem(scene, balloon, 30, 0);
    for(var i=0; i<balloons.particles.length; i++){
        balloons.particles[i].position = new Ayce.Vector3(
            (Math.random()*2-1)*6,
            5-Math.random()*5,
            (Math.random()*2-1)*6);
        balloons.particles[i].gravity = 0.00000000001;
        balloons.particles[i].gravityExponent = 2;
        balloons.particles[i].scale = new Ayce.Vector3(.3,.3,.3);
        balloons.particles[i].lifetime = 10000+Math.random()*5000;
        balloons.particles[i].rotationAngle.y = Math.random()*0.001;
        balloons.particles[i].colors = balloonColors[Math.round(Math.random()*balloonColors.length-1)];
    }
    balloons.initParticleArrays();
    balloons.useFragmentLighting = false;
    balloons.visible = false;
}
function getNewBody(){
    if(mobileVR){
        var bodySimple = new Ayce.OBJLoader(path + "obj/body_simple.obj")[0];
        bodySimple.position.y = -1.9;
        return bodySimple;
    }
    var o3Ds = {};
    for(var attr in bodyO3Ds){
        if(isNaN(attr)){
            o3Ds[attr] = Ayce.OBJLoader.prototype.copyOBJO3D(bodyO3Ds[attr]);
        }
    }

    var body = o3Ds.Body;
    body.bodyParts = {};

    //Arms
    o3Ds.ShoulderL.parent = body;
    o3Ds.ShoulderL.position.set(0.18607, 0.11481, 0);
    body.bodyParts.ShoulderL = o3Ds.ShoulderL;
    o3Ds.ShoulderR.parent = body;
    o3Ds.ShoulderR.position.set(-0.18607, 0.11481, 0);
    body.bodyParts.ShoulderR = o3Ds.ShoulderR;

    o3Ds.UpperArmL.parent = o3Ds.ShoulderL;
    o3Ds.UpperArmL.position.set(0.07292, 0, 0);
    body.bodyParts.UpperArmL = o3Ds.UpperArmL;
    o3Ds.UpperArmR.parent = o3Ds.ShoulderR;
    o3Ds.UpperArmR.position.set(-0.07292, 0, 0);
    body.bodyParts.UpperArmR = o3Ds.UpperArmR;
    o3Ds.LowerArmL.parent = o3Ds.UpperArmL;
    o3Ds.LowerArmL.position.set(0.33208, 0, 0);
    body.bodyParts.LowerArmL = o3Ds.LowerArmL;
    o3Ds.LowerArmR.parent = o3Ds.UpperArmR;
    o3Ds.LowerArmR.position.set(-0.33208, 0, 0);
    body.bodyParts.LowerArmR = o3Ds.LowerArmR;

    //Legs
    o3Ds.UpperLegL.parent = body;
    o3Ds.UpperLegL.position.set(0.09408, -0.16747, 0);
    body.bodyParts.UpperLegL = o3Ds.UpperLegL;
    o3Ds.UpperLegR.parent = body;
    o3Ds.UpperLegR.position.set(-0.09408, -0.16747, 0);
    body.bodyParts.UpperLegR = o3Ds.UpperLegR;

    o3Ds.LowerLegL.parent = o3Ds.UpperLegL;
    o3Ds.LowerLegL.position.set(0, -0.65581, 0);
    body.bodyParts.LowerLegL = o3Ds.LowerLegL;
    o3Ds.LowerLegR.parent = o3Ds.UpperLegR;
    o3Ds.LowerLegR.position.set(0, -0.65581, 0);
    body.bodyParts.LowerLegR = o3Ds.LowerLegR;

    o3Ds.FootL.parent = o3Ds.LowerLegL;
    o3Ds.FootL.position.set(0, -0.65981, 0);
    body.bodyParts.FootL = o3Ds.FootL;
    o3Ds.FootR.parent = o3Ds.LowerLegR;
    o3Ds.FootR.position.set(0, -0.65981, 0);
    body.bodyParts.FootR = o3Ds.FootR;

    var boneMovement = function(){
        if(this.animationActive){
            //start
            if(this.rotateFrom === null || this.startAnimation){
                this.rotateFrom = this.rotation.copy();
                this.rotationStart = Date.now();
                this.startAnimation = false;
            }
            var dur = Date.now()-this.rotationStart;
            var p = dur/this.duration;

            this.rotation.slerp(this.rotateFrom, this.rotateTo, p);

            //end
            if(p >= 1){
                Ayce.Quaternion.prototype.copyToQuaternion(this.rotateTo, this.rotation);
                this.rotateFrom = null;
                this.animationActive = false;
            }
        }
    };

    for(var bodyPart in body.bodyParts){
        var bone = body.bodyParts[bodyPart];
        bone.rotateTo = new Ayce.Quaternion();
        bone.duration = 0;
        bone.rotateFrom = null;
        bone.startAnimation = false;
        bone.rotationStart = 0;
        bone.onUpdate = boneMovement;
        scene.addToScene(bone);
    }

    function rotateBone(o3D, ax, ay, az, duration){
        var radToDeg = Math.PI/180;
        o3D.rotateTo.fromEulerAngles(-ax*radToDeg, ay*radToDeg, az*radToDeg);
        o3D.duration = duration;
        o3D.animationActive = true;
        o3D.startAnimation = true;
    }


    var shoulderL = o3Ds.ShoulderL;
    var uArmL = o3Ds.UpperArmL;
    var lArmL = o3Ds.LowerArmL;

    var shoulderR = o3Ds.ShoulderR;
    var uArmR = o3Ds.UpperArmR;
    var lArmR = o3Ds.LowerArmR;

    var uLegR = o3Ds.UpperLegR;
    var lLegR = o3Ds.LowerLegR;
    var footR = o3Ds.FootR;

    var uLegL = o3Ds.UpperLegL;
    var lLegL = o3Ds.LowerLegL;
    var footL = o3Ds.FootL;

    body.animationStart = Date.now();
    body.animationStep = 0;
    body.lastPos = new Ayce.Vector3();
    body.isMoving = false;
    body.stopTime = 0;
    body.onUpdate = function(){
        var duration = Date.now()-body.animationStart;

        var lP = body.lastPos;
        var cP = body.parent.getGlobalPosition();//body.getGlobalPosition();

        if(Ayce.Vector3.prototype.distance(lP, cP) > 0){
            if(!body.isMoving){
                body.isMoving = true;
            }
            lP.x = cP.x;
            lP.y = cP.y;
            lP.z = cP.z;
            body.stopTime = 0;
        }
        else{
            if(!body.stopTime)body.stopTime = Date.now();
            if(body.isMoving && Date.now()-body.stopTime >= 120){
                body.isMoving = false;
                body.animationStep = 3;
                rotateBone(uLegR, 0, 0, 0, 250);
                rotateBone(lLegR, 0, 0, 0, 250);
                rotateBone(footR, 0, 0, 0, 250);

                rotateBone(uLegL, 0, 0, 0, 250);
                rotateBone(lLegL, 0, 0, 0, 250);
                rotateBone(footL, 0, 0, 0, 250);
            }
        }

        if(duration > 250 && body.isMoving){
            if(body.animationStep === 0){
                rotateBone(shoulderL, 0, 0, 0, 250);
                rotateBone(uArmL, -23.281, 180, 90, 250);
//                rotateBone(uArmL, -23.281, 0, 90, 250);
//                rotateBone(uArmL, -90, 66.719, -90, 250);
                rotateBone(lArmL, 0, -16.908, 0, 250);

                rotateBone(shoulderR, 0, 0, 0, 250);
                rotateBone(uArmR, 90-81.238, 180, -90, 250);
//                rotateBone(uArmR, 180, 61.238-90, 0, 250);//-61.238
//                rotateBone(uArmR, 90, -61.238, -90, 250);//-61.238
                rotateBone(lArmR, 0, 12.034, 0, 250);

                rotateBone(uLegR, -31.479, 0, 0, 250);
                rotateBone(lLegR, 1.7, 0, 0, 250);
                rotateBone(footR, 0, 0, 0, 250);

                rotateBone(uLegL, 24.77, 0, 0, 250);
                rotateBone(lLegL, 19.981, 0, 0, 250);
                rotateBone(footL, -17.34, 0, 0, 250);
            }
            else if(body.animationStep === 1){

                rotateBone(uLegR, -48.307, 0, 0, 250);
                rotateBone(lLegR, 47.74, 0, 0, 250);
                rotateBone(footR, 0, 0, 0, 250);

                rotateBone(uLegL, 19.417, 0, 0, 250);
                rotateBone(lLegL, 38.628, 0, 0, 250);
                rotateBone(footL, 31.054, 0, 0, 250);
            }
            else if(body.animationStep === 2){

                rotateBone(uLegR, -0.009, 0, 0, 250);
                rotateBone(lLegR, -0.106, 0, 0, 250);
                rotateBone(footR, 0, 0, 0, 250);

                rotateBone(uLegL, -30.57, 0, 0, 250);
                rotateBone(lLegL, 104.316, 0, 0, 250);
                rotateBone(footL, 8.334, 0, 0, 250);
            }
            else if(body.animationStep === 3){

                rotateBone(uLegR, 14.35, 0, 0, 250);
                rotateBone(lLegR, 4.628, 0, 0, 250);
                rotateBone(footR, 1.265, 0, 0, 250);

                rotateBone(uLegL, -36.939, 0, 0, 250);
                rotateBone(lLegL, 51.693, 0, 0, 250);
                rotateBone(footL, 20.286, 0, 0, 250);
            }
            else if(body.animationStep === 4){

                rotateBone(uLegR, 19.591, 0, 0, 250);
                rotateBone(lLegR, 35.719, 0, 0, 250);
                rotateBone(footR, 16.323, 0, 0, 250);

                rotateBone(uLegL, -32.129, 0, 0, 250);
                rotateBone(lLegL, 0.071, 0, 0, 250);
                rotateBone(footL, 1.182, 0, 0, 250);
            }
            else if(body.animationStep === 5){

                rotateBone(uLegR, 16.179, 0, 0, 250);
                rotateBone(lLegR, 30.931, 0, 0, 250);
                rotateBone(footR, 39.963, 0, 0, 250);

                rotateBone(uLegL, -32.655, 0, 0, 250);
                rotateBone(lLegL, 32.212, 0, 0, 250);
                rotateBone(footL, 1.182, 0, 0, 250);
            }
            else if(body.animationStep === 6){

                rotateBone(uLegR, -26.711, 0, 0, 250);
                rotateBone(lLegR, 98.14, 0, 0, 250);
                rotateBone(footR, 22.045, 0, 0, 250);

                rotateBone(uLegL, -0.231, 0, 0, 250);
                rotateBone(lLegL, 0.247, 0, 0, 250);
                rotateBone(footL, 1.182, 0, 0, 250);
            }
            else if(body.animationStep === 7){

                rotateBone(uLegR, -36.355, 0, 0, 250);
                rotateBone(lLegR, 54.316, 0, 0, 250);
                rotateBone(footR, 22.045, 0, 0, 250);

                rotateBone(uLegL, 18.379, 0, 0, 250);
                rotateBone(lLegL, 0.247, 0, 0, 250);
                rotateBone(footL, 6.156, 0, 0, 250);

                body.animationStep = -1;
            }
            body.animationStep++;

            body.animationStart = Date.now();
        }
    };
    body.position.y = -0.35;
    body.position.z = 0.15;

    return body;
}
function negateObjectDirection(){
    for(var i=0;i<numbers.length;i++){
        numbers[i].position.z = 7;
        numbers[i].rotation.fromEulerAngles(0, 0, 0);
        numbers[i].update();
    }
    start.position.z = 7;
    start.rotation.fromEulerAngles(0, 0, 0);
    rdy.position.z = -17;
    rdy.rotation.fromEulerAngles(0,0,0);
    waitingForPlayer.position.z = -osdPosition.z;
    waitingForPlayer.rotation.fromEulerAngles(0,Math.PI,0);
    scoreboard0.rotation.fromEulerAngles(0,0,0);
    scoreboard1.rotation.fromEulerAngles(0,0,0);
    winlose.position.z = 7;
    winlose.rotation.fromEulerAngles(0,0,0);
    //if(pane.position.z<0.0){    //TODO: move to init (how to get player z?)
    //    scoreboard0.rotation.fromEulerAngles(0, Math.PI, 0);
    //    scoreboard1.rotation.fromEulerAngles(0, Math.PI, 0);
    //}else{
    //    scoreboard0.rotation.fromEulerAngles(0, 0, 0);
    //    scoreboard1.rotation.fromEulerAngles(0, 0, 0);
    //}
}

////////////////////////////////////////////////////////////////////
// WebSocket Server communication

function createPlayer(id){
    var headP = new Ayce.TextureCube(path + "textures/head.gif");
    headP.scale = new Ayce.Vector3(0.3, 0.3, 0.3);

    var bodyP = getNewBody();
    bodyP.rotation.fromEulerAngles(0, Math.PI, 0);
    bodyP.parent = headP;
    bodyP.parentRotationWeight.x = 0;
    bodyP.parentRotationWeight.z = 0;
    bodyP.useSpecularLighting = false;

    scene.addToScene(headP);
    scene.addToScene(bodyP);

    playerBodies[id] = {
        head: headP,
        body: bodyP
    };
}
function setO3DAttributes(from, to){
    if(from.position){
        to.position.x = from.position.x;
        to.position.y = from.position.y;
        to.position.z = from.position.z;
    }

    if(from.rotation){
        to.rotation.x = from.rotation.x;
        to.rotation.y = from.rotation.y;
        to.rotation.z = from.rotation.z;
        to.rotation.w = from.rotation.w;
    }

    if(from.scale){
        to.scale.x = from.scale.x;
        to.scale.y = from.scale.y;
        to.scale.z = from.scale.z;
    }

    if(from.velocity){
        to.velocity.x = from.velocity.x;
        to.velocity.y = from.velocity.y;
        to.velocity.z = from.velocity.z;
    }
}
function sendPlayerIsReady(){
    if (socket)socket.emit('player_ready', {ready: true});
}

////////////////////////////////////////////////////////////////////
// Game loop

//Vars/ Objects
var gKeyPressed = false;
var lastChange = 0;
var changeRate = 10000;
var effectCount = 5;
var ballRot = 0;

var startObject = {
    startTime: 0,
    time: 0,
    cdStartTime: 0,
    cdTime: 0,
    cursorOnStart: false,
    startDone: false,
    playersReady:0,
    cdDone: false,
    zFactor: 0,
    startAndCountdown: function(){
        if(this.time<4000) {
            var forwardVector = scene.getCamera().getForwardVector();
            var startWidth = 8;
            var startHeight = 2;
            if (playerType == "player2")forwardVector.z*=-1;
            forwardVector.negate();
            if (forwardVector.z < 0) {
                var scaledFV = forwardVector.scaleBy((Math.abs(scene.getCamera().getManager().getGlobalPosition().z)-Math.abs(start.position.z)) / Math.abs(forwardVector.z));
                var cameraPositionY = scene.getCamera().getManager().getGlobalPosition().y;
//                console.log(scaledFV.z);
                if (scaledFV.x < start.scale.x * (startWidth / 2) &&
                    scaledFV.x > start.scale.x * -(startWidth / 2) &&
                    scaledFV.y < start.scale.y * (startHeight / 2) + cameraPositionY - start.position.y &&
                    scaledFV.y > start.scale.y * -(startHeight / 2) + cameraPositionY - start.position.y ) {
                    if (!this.cursorOnStart) {
                        this.cursorOnStart = true;
                        this.startTime = timeObject.time;
                    }
                } else {
                    this.cursorOnStart = false;
                    this.time = 0;
                }
            }
            if (this.cursorOnStart) {
                this.time = timeObject.time - this.startTime;
            }
        }else if(!this.startDone){
            start.visible = false;
            cursor.visible = false;
            this.startDone = true;
            sendPlayerIsReady();
        }
        if(this.playersReady>1){
            this.startCountdown();
        }
    },
    startCountdown: function(){
        if(this.cdStartTime==0){
            this.cdStartTime=timeObject.time;
        }
        if(!this.cdDone && this.cdTime<5001) {
            this.cdTime = timeObject.time - this.cdStartTime;
            var i = Math.floor(this.cdTime / 1000);
            if(i<5) {
                numbers[i].visible = true;
                this.zFactor = this.cdTime / 1000 - i;
                if(playerType=="player1"){
                    numbers[i].position.z -= this.zFactor*0.4;
                }else{
                    numbers[i].position.z += this.zFactor*0.4;
                }
            }
            if(i>0) numbers[i-1].visible = false;
        }else{
            this.cdDone = true;
            pane.visible = true;
        }
    }
};
var gameOverObject = {
    win: 0,
    runAnimation: false,
    time: 0,
    startTime: 0,
    done: false,
    zFactor: 0,
    gameOver: function(){
        if(this.runAnimation){
            if(this.startTime==0){
                this.startTime=timeObject.time;
            }
            if(!this.done && this.time<=15000) {
                this.time = timeObject.time - this.startTime;
                this.zFactor = this.time / 200000;
                if(playerType=="player1"){
                    winlose.position.z -= this.zFactor;
                    if(this.win==1){
                        balloons.visible = true;
                        balloons.position.z = -17;
                    }else{
                        balloons.visible = true;
                        balloons.position.z = 17;
                    }
                }else{
                    winlose.position.z += this.zFactor;
                    if(this.win==1){
                        balloons.visible = true;
                        balloons.position.z = 17;
                    }else{
                        balloons.visible = true;
                        balloons.position.z = -17;
                    }
                }
            }else{
                this.cdDone = true;
            }
        }
    }
};
var timeObject = {
    time: 0,
    startTime: Date.now()
};
var forceFieldObject = {
    ballZ: new Ayce.Vector3(0, 0, 0),
    center: new Float32Array(9),   //up to 4 collisions with 3 coords each
    duration: 700,
    time: [
        this.duration+1,this.duration+1,this.duration+1],
    startTime: [
        Date.now(),Date.now(),Date.now()],
    addCollision: function(x, y, z){
        for(var i=0;i<this.time.length;i++){
            if(this.time[i]>this.duration){
                this.center[i*3] = x;
                this.center[i*3+1] = y;
                this.center[i*3+2] = z;
                forceFieldObject.startTime[i] = Date.now();
                forceFieldObject.time[i] = 0;
                break;
            }
        }
    },
    updateTimes: function(){
        for(var i=0;i<this.time.length;i++){
            this.time[i] = Date.now() - this.startTime[i];
        }
    }
};
var scoreboardObject = {
    digits0: [0.0,0.0],
    digits1: [0.0,0.0],
    score: [0,0],
    slidingUp: false,
    slidingDown: false,
    isDown: true,
    isUp: false,
    upTime: 0,
    updateScore: function(score1, score2){
        this.score[0]=score1%100;
        this.score[1]=score2%100;
        this.digits0[0] = Math.floor(this.score[0]/10);
        this.digits0[1] = this.score[0] % 10;
        this.digits1[0] = Math.floor(this.score[1]/10);
        this.digits1[1] = this.score[1] % 10;
    }
};

//Main loop
function tick() {
    Ayce.requestAnimFrame(tick);
    stats.begin();
    update();
    scene.updateScene();
    scene.drawScene();
    stats.end();
}
function update(){

    if(gameOverObject.time>15000){
        resetGame();
    }

    //Update TimeObject
    timeObject.time = Date.now() - timeObject.startTime;

    if(serverO3Ds.ball){
        forceFieldObject.ballZ.x = (serverO3Ds.ball.position.z+20)/40;
    }
    if(pane){
        forceFieldObject.ballZ.y = (pane.position.z+20)/40;
    }

    pillarAnimationChange();

    tslf = timeObject.time - tslf;

    ballRot+=tslf*0.001;

    ball.rotation.fromEulerAngles(ballRot, ballRot, ballRot);

    runScoreAnimation();

    forceFieldObject.updateTimes();

    updatePanePositions();

    startObject.startAndCountdown();

    gameOverObject.gameOver();

    var cc = scene.getCamera().getManager();
    if (socket)socket.emit('camera_pos', {position: cc.getGlobalPosition(), orientation: cc.getGlobalRotation()});
    tslf = timeObject.time;
}
//helper functions
function runScoreAnimation(){
    if(Ayce.KeyboardHandler.isKeyDown("G")){   // TODO: remove
        if(!gKeyPressed) {
            //score1++;
            //score2++;
            //console.log("score!");
            //scoreboardObject.updateScore(score1, score2);
            gKeyPressed = true;

            //forceFieldObject.addCollision( 0.0, 0.5, 0.5 );   //right
            if(sound.isPlaying) {
                sound.pause();
            }else{
                sound.play();
            }
            //scoreboardObject.isDown=scoreboardObject.slidingDown=scoreboardObject.isUp=false;
            //scoreboardObject.slidingUp=true;
        }
    }else{
        gKeyPressed = false;
    }
    if(scoreboardObject.slidingUp){
        scoreboard0.position.y+=(tslf/1000);
        scoreboard1.position.y-=(tslf/1000);
        if(scoreboard0.position.y>pane.scale.y/2+2*scoreboard0.scale.y/2){
            scoreboard0.position.y=pane.scale.y/2+2*scoreboard0.scale.y/2;
            scoreboard1.position.y=-pane.scale.y/2-2*scoreboard0.scale.y/2;
            scoreboardObject.slidingUp=false;
            scoreboardObject.isUp=true;
        }
        scoreboard0.update();
        scoreboard1.update();
    }
    if(scoreboardObject.isUp){
        scoreboardObject.upTime+=tslf;
        if(scoreboardObject.upTime>1000){
            scoreboardObject.upTime = 0;
            scoreboardObject.isUp=false;
            scoreboardObject.slidingDown=true;
        }
    }
    if(scoreboardObject.slidingDown){
        scoreboard0.position.y-=tslf/1000;
        scoreboard1.position.y+=tslf/1000;
        if(scoreboard0.position.y<0.0){
            scoreboard0.position.y=0.0;
            scoreboard1.position.y=0.0;
            scoreboardObject.slidingDown=false;
            scoreboardObject.isDown=true;
        }
        scoreboard0.update();
        scoreboard1.update();
    }
    if(scoreboardObject.isDown){
        scoreboard0.visible = false;
        scoreboard1.visible = false;
    }else{
        scoreboard0.visible = true;
        scoreboard1.visible = true;
    }
}
function pillarAnimationChange(){

    if(lastChange+changeRate <= timeObject.time){
        pillarUniform.timeChange = timeObject.time;
        pillarUniform.oldNr = pillarUniform.nr;
        pillarUniform.nr = pillarUniform.nr < effectCount-1 ? pillarUniform.nr+1 : 0;
        pillarUniform.duration = 1000;
        //pillarUniform.duration = 200;

        lastChange = timeObject.time;
    }

}
function updatePanePositions(){
    var cc = scene.getCamera().getManager();
    bodyParent.position = cc.getGlobalPosition();
    bodyParent.rotation = cc.getGlobalRotation();

    paneEmpty.update();
    paneEmpty.rotation = bodyParent.rotation.getConjugate();
    paneEmpty.rotation.normalize();

    pane.position = paneEmpty.getGlobalPosition();
    pane.rotation = paneEmpty.getGlobalRotation();

    var aqWidth = 3;
    var aqHeight = 2.5;
    if(pane.position.x > aqWidth-(pane.scale.x/2.0))pane.position.x = aqWidth-(pane.scale.x/2.0);
    else if(pane.position.x < -aqWidth+(pane.scale.x/2.0))pane.position.x = -aqWidth+(pane.scale.x/2.0);

    if(pane.position.y > aquariumHeight+aqHeight-(pane.scale.y/2.0))pane.position.y = aquariumHeight+aqHeight-(pane.scale.y/2.0);
    else if(pane.position.y < aquariumHeight-aqHeight+(pane.scale.y/2.0))pane.position.y = aquariumHeight-aqHeight+(pane.scale.y/2.0);

    if(paneEmpty.getGlobalPosition().z < 0){
        pane.position.z = -17;
        pane.position.z -= scene.getCamera().getForwardVector().z < 0 ? 2.5 : -4;
    }
    else{
        pane.position.z =  17;
        pane.position.z -= scene.getCamera().getForwardVector().z < 0 ? 4 : -2.5;
    }
}
function onServerCountdown(){
    console.log("Server Countdown start.");
    rdy.visible = false;
}
function onReadyUp(type){
//    console.log("Ready: " + type);
    startObject.playersReady++;
    if(type!=playerType){
        rdy.visible = true;
        waitingForPlayer.visible = false;
    }
    //startObject.playersReady=2;     //TODO: remove
}
function onReadyCancled(type){
    startObject.playersReady--;
    if(type!=playerType){
        rdy.visible = false;
        waitingForPlayer.visible = true;
    }
}
function resetGame(){
    gameOverObject.win = 0;
    gameOverObject.runAnimation = false;
    gameOverObject.time = 0;
    gameOverObject.startTime = 0;
    gameOverObject.done = false;
    gameOverObject.zFactor = 0;
    startObject.startTime=0;
    startObject.time=0;
    startObject.cdStartTime=0;
    startObject.cdTime=0;
    startObject.cursorOnStart=false;
    startObject.startDone=false;
    startObject.playersReady=0;
    startObject.cdDone=false;
    startObject.zFactor=0;
    start.visible = true;
    cursor.visible = true;
    pane.visible = false;
    winlose.visible = false;
    balloons.visible = false;
    waitingForPlayer.visible = true;
    for(var i=0;i<numbers.length;i++){
        numbers[i].position.y = 10;
        numbers[i].position.z = -7;
    }
    winlose.position.z = -7;
    if(playerType=="player2") {
        for (i = 0; i < numbers.length; i++) {
            numbers[i].position.z = 7;
            numbers[i].update();
        }
        winlose.position.z = 7;
    }
}