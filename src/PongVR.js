/*jslint browser: true*/
/*global Ayce, Stats, io*/

/////////////////////////////////////////
//    _____             _____ _____    //
//   |  _  |___ ___ ___|  |  | __  |   //
//   |   __| . |   | . |  |  |    -|   //
//   |__|  |___|_|_|_  |\___/|__|__|   //
//                 |___|               //
/////////////////////////////////////////

window.addEventListener("load", createSocket);

////////////////////////////////////////////////////////////////////
// Initialise ayce
var stats = new Stats();
var canvas, scene, mobileVR, game, aycL;
var playerPosition = new Ayce.CameraModifier();
var joinID = window.location.search.substring(1) !== "" ? joinID = window.location.search.substring(1) : null;
var socket = null;
var gameId = null;

function createSocket(){
    socket = new PongVRSocket(io);
    socket.onGameID = function (id){
        gameId = id;
        console.log(gameId);
    };
    socket.openSocket();
    socket.socketBasicCom();
}
function initAyce(cardboard, distortion) {
    canvas = document.getElementById("canvas");
    scene = new Ayce.Scene(canvas);

    var webVRSuccess = scene.useWebVR();
    if(webVRSuccess){
        scene.getCamera().getManager().modifiers.push(playerPosition);
    }
    //If no WebVR device is detected use desktop or mobile vr settings
    else{
        switchMode(cardboard, distortion);
    }

    if(webVRSuccess || mobileVR){
        var fullInfo = document.querySelector("#fullscreen-info");
        fullInfo.style.display = "block";

        if(mobileVR){
            var enterFullscreen = document.querySelector("#enter-fullscreen-info");
            enterFullscreen.style.display = "";
            scene.setFullscreenElement(enterFullscreen);
        }
        else if(webVRSuccess){
            var enterHMD = document.querySelector("#enter-hmd-info");
            var exitHMD = document.querySelector("#exit-hmd-info");
            enterHMD.style.display = "";
//            exitHMD.style.display = "";
            if(navigator.getVRDisplays){
                enterHMD.addEventListener("click", function(){
                    enterHMD.style.display = "none";
                });
            }

            scene.setHMDEnterElement(enterHMD);
            scene.setHMDExitElement (exitHMD);

            var manager = scene.getCamera().getManager();
            manager.modifiers.push(new Ayce.MouseKeyboard(canvas, canvas));
        }
    }

    aycL = new Ayce.allyoucanLeap.initLeapMotion(scene, new Ayce.allyoucanLeap.HandModels.Default());
    game = new Game(scene, socket);
    game.initScene();
    game.createO3Ds();
    game.setupGame(socket);
    socket.socketGameCom();

    tick();
}
//helpers
function switchMode(cardboard, distortion){
    if(cardboard){
        mobileVR = true;
        scene.setRendererNull();
        scene.getCamera().getManager().clearModifiers();
        scene.useCardboard(distortion);
        scene.getCamera().getManager().modifiers.push(playerPosition);

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

    manager.modifiers.push(playerPosition);
}

////////////////////////////////////////////////////////////////////
//Main loop
function tick() {
    Ayce.requestAnimFrame(tick);

    stats.begin();
    game.update();
    scene.updateScene();
    scene.drawScene();
    stats.end();
}
