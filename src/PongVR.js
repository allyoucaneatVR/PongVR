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
//    window.setTimeout(function(){
//        resetGame();
//        startObject.playersReady = 2;
//        setDonutAnimation(7, 1);
//    }, 2000);
//};


////////////////////////////////////////////////////////////////////
// Initialise ayce
var stats = new Stats();
var canvas, scene,  mobileVR;
var joinID = window.location.search.substring(1) !== "" ? joinID = window.location.search.substring(1) : null;
var socket = null;
var gameId = null;
window.addEventListener("load", function(){
    socket = new PongVRSocket(io);
    socket.onGameID = function (id){
        gameId = id;
        console.log(gameId);
    };
    socket.openSocket();
    socket.socketBasicCom();
});

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
    createO3Ds();
    setupGame(socket);
    socket.socketGameCom();
    
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
//Main loop
function tick() {
    Ayce.requestAnimFrame(tick);
    
    stats.begin();
    update();
    scene.updateScene();
    scene.drawScene();
    stats.end();
}