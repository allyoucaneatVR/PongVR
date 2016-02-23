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
var donutUniforms = {
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

    //Set Light Properties
    var light = new Ayce.Light();
    light.position.z = -10;
    light.position.y = 20;
    scene.addToScene(light);
}
function createO3Ds(){
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
    body = getNewBody(mobileVR);
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
        torus.shaderUniforms.push(["uTimeChangeEffect", "uniform1f", donutUniforms, ["timeChange"]]);
        torus.shaderUniforms.push(["uTimeEffectDuration", "uniform1f", donutUniforms, ["duration"]]);
        torus.shaderUniforms.push(["uEffectNr", "uniform1i", donutUniforms, ["nr"]]);
        torus.shaderUniforms.push(["uOldEffectNr", "uniform1i", donutUniforms, ["oldNr"]]);
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
//Main loop

var playerType = null;
var playerBodies = [];
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
            socket.sendPlayerReady();
        }
        if(this.playersReady>1){
            this.startCountdown();
        }
    },
    startCountdown: function(){
        if(this.cdStartTime==0){
            pane.visible = true;
            this.cdStartTime=timeObject.time;
        }
        if(!this.cdDone && this.cdTime<5001) {
            this.cdTime = timeObject.time - this.cdStartTime;
            var i = Math.floor(this.cdTime / 1000);
            if(i < 5) {
                numbers[i].visible = true;
                this.zFactor = this.cdTime / 1000 - i;
                if(playerType=="player1"){
                    numbers[i].position.z -= this.zFactor*0.4;
                }else{
                    numbers[i].position.z += this.zFactor*0.4;
                }
            }
            if(i>0) numbers[i-1].visible = false;
        }
        else{
            this.cdDone = true;
            //pane.visible = true;
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


function setupGame(socket){
    //Player functions
    socket.onPlayerID = function(data){
        socketID = data.id;
        playerType = data.type;
        if(playerType=="player2") negateObjectDirection();
    };
    socket.onPlayerJoins = function(data){
        //TODO other player data
    };
    socket.onPlayerPosition = function(data){
        for(var l=0; l < data.length; l++){
            if(data[l].id === socketID){
                continue;
            }

            if(!Boolean(playerBodies[data[l].id])){
                createPlayer(data[l].id);
                console.log("creating player " + data[l].id);
            }

            var head = playerBodies[data[l].id].head;

            head.position.x = data[l].position.x;
            head.position.y = data[l].position.y;
            head.position.z = data[l].position.z;

            head.rotation.x = data[l].rotation.x;
            head.rotation.y = data[l].rotation.y;
            head.rotation.z = data[l].rotation.z;
            head.rotation.w = data[l].rotation.w;
        }
    };
    socket.onPlayerReadyUp = function(data){
        startObject.playersReady++;
        if(data.type!=playerType){
            rdy.visible = true;
            waitingForPlayer.visible = false;
        }
        console.log(data.type + " ready.");
    };
    socket.onPlayerReadyCanceled = function(data){
        startObject.playersReady--;
        if(data.type!=playerType){
            rdy.visible = false;
            waitingForPlayer.visible = true;
        }
    };
    socket.onPlayerScores = function(data){
        scoreboardObject.updateScore(data.score1, data.score2);
        scoreboardObject.updateScore(data.score1, data.score2);

        scoreboardObject.isDown=false;
        scoreboardObject.slidingDown=false;
        scoreboardObject.isUp=false;
        scoreboardObject.slidingUp=true;

        if(data.score1>=5){
            console.log("player 1 win");
            winlose.visible = true;
            if(playerType=="player2"){
                gameOverObject.win = 1;
            }
            gameOverObject.runAnimation = true;
            setDonutAnimation(2);
        }
        if(data.score2>=5){
            console.log("player 2 win");
            winlose.visible = true;
            if(playerType=="player1"){
                gameOverObject.win = 1;
            }
            gameOverObject.runAnimation = true;
            setDonutAnimation(2);
        }
    };
    socket.onPlayerRemove = function(data){
        var p = playerBodies[data.id];

        console.log("removing player with id " + data.id);

        for(var part in p.body.bodyParts){
            scene.removeFromScene(p.body.bodyParts[part]);
        }

        scene.removeFromScene(p.head);
        scene.removeFromScene(p.body);

        playerBodies[data.id] = null;
    };
    //O3D Functions
    socket.onO3DCreate = function(data){
        if(serverO3Ds[data.id])return;

        var o3D = null;

        if(data.type == "sphere"){
            o3D = ball;
        }
        else if(data.type == "pane"){
            if(
                (data.id != "paneP1" || playerType != "player1") &&
                (data.id != "paneP2" || playerType != "player2")
            ){
                o3D = new Ayce.TextureCube(path + "textures/pane3.png");
                o3D.textureCoords = [0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
                                    1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 0.0, 0.0,
                                    0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0,
                                    1.0, 1.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0,
                                    1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 0.0, 0.0,
                                    0.0, 0.0, 1.0, 0.0, 1.0, 1.0,0.0, 1.0];
                o3D.transparent = true;
                o3D.twoFaceTransparency = true;
                o3D.scale = pane.scale;
                o3D.imageSrc = pane.imageSrc;
            }
        }
        
        if(o3D && data.args){
            setO3DAttributes(data.args, o3D);
        }
        if(o3D){
            serverO3Ds[data.id] = o3D;
            scene.addToScene(o3D);
        }
    };
    socket.onO3DUpdate = function(data){
        for(var i=0; i < data.length; i++){
            var d = data[i];
            var o3D = serverO3Ds[d.id];
            if(o3D){
                setO3DAttributes(d, o3D);
            }
        }
    };
    socket.onO3DCollision = function(data){
        if(data.id == "ball"){
            var pos = data.position;
            var x = (pos.x+3)/6;
            var y = ((pos.y+2.5-10)/5);
            var z = (pos.z+20)/40;

            var max = Math.max(x, y);
            var min = Math.min(x, y);

            if(max > 0.9){
                if(x === max)x = 1.0;
                if(y === max)y = 1.0;
            }else if(min < 0.1){
                if(x === min)x = 0;
                if(y === min)y = 0;
            }

            forceFieldObject.addCollision(x, y, z);
        }
    };
    socket.onO3DRemove = function(data){
        var o3D = serverO3Ds[data.id];
        if(o3D){
            scene.removeFromScene(o3D);
            serverO3Ds.delete(data.id);
        }
    };
    //Misc function
    socket.onCountdownStart = function(data){
        console.log("Server Countdown start.");
        rdy.visible = false;
        setDonutAnimation(7);
    };
    socket.onPositionUpdate = function(data){
        var p = data.position;
        var o = data.rotation;
        cameraConfig.position.set(p.x, p.y, p.z);
        cameraConfig.orientation.set(o.x, o.y, o.z, o.w);
    };
}
//helpers
function createPlayer(id){
    var headP = new Ayce.TextureCube(path + "textures/head.gif");
    headP.scale = new Ayce.Vector3(0.3, 0.3, 0.3);

    var bodyP = getNewBody(mobileVR);
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

//    donutAutoAnimation();

    tslf = timeObject.time - tslf;

    ballRot+=tslf*0.001;

    ball.rotation.fromEulerAngles(ballRot, ballRot, ballRot);

    runScoreAnimation();

    forceFieldObject.updateTimes();

    updatePanePositions();

    startObject.startAndCountdown();

    gameOverObject.gameOver();
    
    socket.sendCameraData(scene);
    tslf = timeObject.time;
}
//helpers
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
    }
    else{
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
    }
    else{
        scoreboard0.visible = true;
        scoreboard1.visible = true;
    }
}
function donutAutoAnimation(){
    if(lastChange+changeRate > timeObject.time)return;
    setDonutAnimation(donutUniforms.nr < effectCount-1 ? donutUniforms.nr+1 : 0);
    lastChange = timeObject.time;
}
function setDonutAnimation(effectNr, changeDuration){
    changeDuration = changeDuration || 1000;
    
    donutUniforms.timeChange = timeObject.time;
    donutUniforms.oldNr = donutUniforms.nr;
    donutUniforms.nr = effectNr;
    donutUniforms.duration = changeDuration;
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
function resetGame(){
    setDonutAnimation(4);
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