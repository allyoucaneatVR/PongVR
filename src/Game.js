var Game = function(scene, socket) {
    ////////////////////////////////////////////////////////////////////
    // PongVR scene setup
    //TODO move to O3Ds:
    var bodyO3Ds, start,
        forceField,
        scoreboard0, scoreboard1,
        rdy, waitingForPlayer,
        body, pane, paneEmpty, spheres;
    var serverO3Ds = {};
    var path = "assets/";
    var aquariumHeight = 10;
    var socketID;
    var bodyParent = {
        position: new Ayce.Vector3(),
        rotation: new Ayce.Quaternion(),
        getGlobalRotation: function() {
            return this.rotation;
        },
        getGlobalPosition: function() {
            return this.position;
        }
    };

    var tslf = 0;

    var osdPosition = new Ayce.Vector3(0, 2.5, 15);

    this.initScene = function() {
        //Set Camera Properties
        scene.getCamera().farPlane = 1000;
        scene.getCamera().updateProjectionMatrix();

        //Set Light Properties
        var intensity = 0.3;
        var light1 = new Ayce.Light();
        light1.color.red = intensity;
        light1.color.green = intensity;
        light1.color.blue = intensity;
        light1.position.y = 0;
        light1.position.z = -50;
        scene.addToScene(light1);

        var light2 = new Ayce.Light();
        light2.color.red = intensity;
        light2.color.green = intensity;
        light2.color.blue = intensity;
        light2.position.y = 0;
        light2.position.z = 50;
        scene.addToScene(light2);
    };

    this.createO3Ds = function() {

        var arena = new Game.Arena(scene, timeObject);

        bodyO3Ds = new Ayce.OBJLoader(path + "obj/body.obj");
        body = getNewBody(bodyO3Ds, mobileVR);
        body.position.z = 0.15;
        body.rotation.fromEulerAngles(0, Math.PI, 0);
        body.parent = bodyParent;
        body.parentRotationWeight.x = 0;
        body.parentRotationWeight.z = 0;
        scene.addToScene(body);

        var createSphere = function(){
            var tempSphere = new Ayce.OBJLoader(path + "obj/ball.obj")[0];
            tempSphere.scale.x = 0.2;
            tempSphere.scale.y = 0.2;
            tempSphere.scale.z = 0.2;
            tempSphere.shader = path + "shader/ball";
            tempSphere.shaderUniforms = [];
            tempSphere.shaderUniforms.push(["uTime", "uniform1f", timeObject, ["time"]]);
            //tempSphere.logVertexShader = true;
            //tempSphere.logFragmentShader = true;
            tempSphere.transparent = true;
            //tempSphere.normals = null;
            tempSphere.collideWith = [forceField, loop.pane];
            tempSphere.onCollision = function(collisionData) {
                var normal = collisionData.collisionVector.normal.copy();
                normal.scaleBy(-2 * normal.dotProduct(tempSphere.velocity));
                tempSphere.velocity = tempSphere.velocity.addVector3(normal);
            };
            for (i = 0; i < tempSphere.colors.length; i += 4) {
                tempSphere.colors[i] = 0;
                tempSphere.colors[i + 1] = 0;
                tempSphere.colors[i + 2] = 0;
                tempSphere.colors[i + 3] = 1;
            }

            for (i = tempSphere.colors.length / 2 + 3; i < tempSphere.colors.length; i += 4) {
                tempSphere.colors[i] = 0.4;
            }
            return tempSphere;
        };

        spheres = [
            createSphere(),
            createSphere(),
            createSphere(),
            createSphere(),
            createSphere()
        ];

        paneEmpty = new Ayce.Object3D();
        paneEmpty.position.z = -4;
        paneEmpty.parent = bodyParent;
        paneEmpty.parentRotationWeight.set(1, 1, 1);

        var playfield = new Ayce.OBJLoader(path + "obj/forceFieldNew.obj");
        forceField = playfield[1];
        forceField.colors = null;
        forceField.position.set(0, 0, 0);
        forceField.imageSrc = path + "obj/textures/square1.png"; //[path + "obj/textures/square1.png", path + "obj/textures/square3.png"];
        forceField.transparent = true;
        //forceField.twoFaceTransparency = true;
        forceField.shader = path + "shader/forceField";
        forceField.shaderUniforms = [];
        forceField.shaderUniforms.push(
            // ["uTime", "uniform1f", timeObject, ["time"]],
            ["uTimeStart", "uniform1fv", forceFieldObject, ["time"]], ["uCenter", "uniform3fv", forceFieldObject, ["center"]], ["uZIndicators", "uniform3f", forceFieldObject.ballZ, ["x", "y", "z"]]
        );
        forceField.renderPriority = 2;
        //scene.addToScene(forceField);

        scoreboard0 = new Ayce.OBJLoader(path + "obj/scoreboard3.obj")[0];
        scoreboard0.imageSrc = path + "obj/textures/scoreboard.png";
        scoreboard0.transparent = true;
        scoreboard0.shader = path + "shader/scoreboard2";
        scoreboard0.shaderUniforms = [];
        scoreboard0.shaderUniforms.push(
            ["uDigits", "uniform1fv", scoreboardObject, ["digits0"]], ["uTime", "uniform1f", timeObject, ["time"]]);
        scoreboard0.colors = null;
        scoreboard0.parent = loop.pane;
        scoreboard0.scale.x = 0.25;
        scoreboard0.scale.y = 0.25;
        scoreboard0.renderPriority = -1;
        scoreboard0.visible = false;
        scoreboard0.rotation.fromEulerAngles(0, Math.PI, 0);
        scene.addToScene(scoreboard0);

        scoreboard1 = new Ayce.OBJLoader(path + "obj/scoreboard3.obj")[0];
        scoreboard1.imageSrc = path + "obj/textures/scoreboard.png";
        scoreboard1.transparent = true;
        scoreboard1.shader = path + "shader/scoreboard2";
        scoreboard1.shaderUniforms = [];
        scoreboard1.shaderUniforms.push(
            ["uDigits", "uniform1fv", scoreboardObject, ["digits1"]], ["uTime", "uniform1f", timeObject, ["time"]]);
        scoreboard1.colors = null;
        scoreboard1.parent = loop.pane;
        scoreboard1.scale.x = 0.25;
        scoreboard1.scale.y = 0.25;
        scoreboard1.renderPriority = -1;
        scoreboard1.visible = false;
        scoreboard1.rotation.fromEulerAngles(0, Math.PI, 0);
        scene.addToScene(scoreboard1);

        var cursor = loop.O3Ds.cursor = new Ayce.OBJLoader(path + "obj/cursor.obj")[0];
        cursor.position.z = -2;
        cursor.parent = scene.getCamera();
        cursor.parent = bodyParent;
        cursor.parentPositionWeight.x = 1;
        cursor.parentPositionWeight.y = 1;
        cursor.parentPositionWeight.z = 1;
        cursor.scale = new Ayce.Vector3(0.05, 0.05, 1.0);
        scene.addToScene(cursor);

        rdy = new Ayce.OBJLoader(path + "obj/rdy.obj")[0];
        rdy.transparent = true;
        rdy.visible = false;
        rdy.position.y = osdPosition.y;
        rdy.position.z = osdPosition.z;
        rdy.rotation.fromEulerAngles(0, Math.PI, 0);
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
        waitingForPlayer.colors = null;
        waitingForPlayer.shader = path + "shader/rdy";
        waitingForPlayer.shaderUniforms = [];
        waitingForPlayer.shaderUniforms.push(["uTime", "uniform1f", timeObject, ["time"]]);
        waitingForPlayer.scale.x = 3;
        waitingForPlayer.scale.y = 3;
        scene.addToScene(waitingForPlayer);

        var skybox = new Ayce.Skybox(
            "CloudyLightRaysFront2048.png",
            "CloudyLightRaysBack2048.png",
            "CloudyLightRaysUp2048.png",
            "CloudyLightRaysDown2048.png",
            "CloudyLightRaysLeft2048.png",
            "CloudyLightRaysRight2048.png",
            path + "textures/skybox/",
            bodyParent,
            scene.getCamera().farPlane
        );
        scene.addToScene(skybox);
    };

    function getLeapArmFunction(data, leftArm, rightArm) {
        var arm = data.handModel.armModel.arm;
        var armZ = data.handModel.armModel.getLength().z;

        var lArmLength = new Ayce.Vector3(0, 0, armZ);

        var v = new Ayce.Quaternion();
        var r = new Ayce.Quaternion();

        return function() {
            var isLeft = data.handData.isLeft();
            var shoulder = isLeft ? body.bodyParts.ShoulderL : body.bodyParts.ShoulderR;
            var upperArm = isLeft ? leftArm : rightArm;
            lArmLength.set(0, 0, armZ);

            var armPos = arm.getGlobalPosition();
            var armRot = arm.getGlobalRotation();
            armRot.getConjugate(v);
            var elbowPos = armPos.addVector3(v.rotatePoint(lArmLength));

            var shoulderPos = shoulder.getGlobalPosition();

            upperArm.position = elbowPos;
            upperArm.rotation.lookAt(elbowPos, shoulderPos);
        };
    }

    function negateObjectDirection() {
        for (var i = 0; i < loop.numbers.length; i++) {
            loop.numbers[i].position.z = 7;
            loop.numbers[i].rotation.fromEulerAngles(0, 0, 0);
            loop.numbers[i].update();
        }
        loop.start.position.z = 7;
        loop.start.rotation.fromEulerAngles(0, 0, 0);
        rdy.position.z = -17;
        rdy.rotation.fromEulerAngles(0, 0, 0);
        waitingForPlayer.position.z = -osdPosition.z;
        waitingForPlayer.rotation.fromEulerAngles(0, Math.PI, 0);
        scoreboard0.rotation.fromEulerAngles(0, 0, 0);
        scoreboard1.rotation.fromEulerAngles(0, 0, 0);
        loop.winlose.position.z = 7;
        loop.winlose.rotation.fromEulerAngles(0, 0, 0);
    }

    ////////////////////////////////////////////////////////////////////
    //Main loop

    var loop = new Loop(scene, path);

    loop.playerType = null;
    var playerBodies = [];
    var ballRot = 0;


    var startObject = loop.startObject;
    var gameOverObject = loop.gameOverObject;
    var timeObject = loop.timeObject;
    var forceFieldObject = loop.forceFieldObject;
    var scoreboardObject = loop.scoreboardObject;


    this.setupGame = function(socket) {
        //Player functions
        socket.onPlayerID = function(data) {
            socketID = data.id;
            loop.playerType = data.type;
            if (loop.playerType == "player2") negateObjectDirection();
        };
        socket.onPlayerJoins = function(data) {
            //TODO other player data
        };
        socket.onPlayerPosition = function(data) {
            for (var l = 0; l < data.length; l++) {
                if (data[l].id === socketID) {
                    continue;
                }

                if (!Boolean(playerBodies[data[l].id])) {
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
        socket.onPlayerReadyUp = function(data) {
            startObject.playersReady++;
            if (data.type != loop.playerType) {
                rdy.visible = true;
                waitingForPlayer.visible = false;
            }
            console.log(data.type + " ready.");
        };
        socket.onPlayerReadyCanceled = function(data) {
            startObject.playersReady--;
            if (data.type != loop.playerType) {
                rdy.visible = false;
                waitingForPlayer.visible = true;
            }
        };
        socket.onPlayerScores = function(data) {
            scoreboardObject.updateScore(data.score1, data.score2);
            scoreboardObject.updateScore(data.score1, data.score2);

            scoreboardObject.isDown = false;
            scoreboardObject.slidingDown = false;
            scoreboardObject.isUp = false;
            scoreboardObject.slidingUp = true;

            if (data.score1 >= 5) {
                console.log("player 1 win");
                loop.winlose.visible = true;
                if (loop.playerType == "player2") {
                    gameOverObject.win = 1;
                }
                gameOverObject.runAnimation = true;
                //setDonutAnimation(2);
            }
            if (data.score2 >= 5) {
                console.log("player 2 win");
                loop.winlose.visible = true;
                if (loop.playerType == "player1") {
                    gameOverObject.win = 1;
                }
                gameOverObject.runAnimation = true;
                //setDonutAnimation(2);
            }
        };
        socket.onPlayerRemove = function(data) {
            var p = playerBodies[data.id];

            console.log("removing player with id " + data.id);

            for (var part in p.body.bodyParts) {
                scene.removeFromScene(p.body.bodyParts[part]);
            }

            scene.removeFromScene(p.head);
            scene.removeFromScene(p.body);

            playerBodies[data.id] = null;
        };
        //O3D Functions
        socket.onO3DCreate = function(data) {
            if (serverO3Ds[data.id]) return;

            var o3D = null;

            if (data.type == "sphere") {
                o3D = spheres[data.args.index];     // TODO: move index out of args

            } else if (data.type == "pane") {
                if (
                    (data.id != "paneP1" || loop.playerType != "player1") &&
                    (data.id != "paneP2" || loop.playerType != "player2")
                ) {
                    o3D = new Ayce.TextureCube(path + "textures/pane3.png");
                    o3D.textureCoords = [0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
                        1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 0.0, 0.0,
                        0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0,
                        1.0, 1.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0,
                        1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 0.0, 0.0,
                        0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0
                    ];
                    o3D.transparent = true;
                    o3D.twoFaceTransparency = true;
                    o3D.scale = loop.pane.scale;
                    o3D.imageSrc = loop.pane.imageSrc;
                }
            }

            if (o3D && data.args) {
                setO3DAttributes(data.args, o3D);
            }
            if (o3D) {
                serverO3Ds[data.id] = o3D;
                scene.addToScene(o3D);
            }
        };
        socket.onO3DUpdate = function(data) {
            for (var i = 0; i < data.length; i++) {
                var d = data[i];
                var o3D = serverO3Ds[d.id];
                if (o3D) {
                    setO3DAttributes(d, o3D);
                }
            }
        };
        socket.onO3DCollision = function(data) {
            if (data.id == "ball") {
                var pos = data.position;
                var x = (pos.x + 3) / 6;
                var y = ((pos.y + 2.5 - 10) / 5);
                var z = (pos.z + 20) / 40;

                var max = Math.max(x, y);
                var min = Math.min(x, y);

                if (max > 0.9) {
                    if (x === max) x = 1.0;
                    if (y === max) y = 1.0;
                } else if (min < 0.1) {
                    if (x === min) x = 0;
                    if (y === min) y = 0;
                }

                forceFieldObject.addCollision(x, y, z);
            }
        };
        socket.onO3DRemove = function(data) {
            var o3D = serverO3Ds[data.id];
            if (o3D) {
                scene.removeFromScene(o3D);
                serverO3Ds.delete(data.id);
            }
        };
        //Misc function
        socket.onCountdownStart = function(data) {
            console.log("Server Countdown start.");
            rdy.visible = false;
            //setDonutAnimation(7, 50);
        };
        socket.onPositionUpdate = function(data) {
            var p = data.position;
            var o = data.rotation;
            playerPosition.position.set(p.x, p.y, p.z);
            playerPosition.orientation.set(o.x, o.y, o.z, o.w);
        };
    };
    //helpers
    function createPlayer(id) {
        var headP = new Ayce.TextureCube(path + "textures/head.gif");
        headP.scale = new Ayce.Vector3(0.3, 0.3, 0.3);

        var bodyP = getNewBody(bodyO3Ds, mobileVR);
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

    function setO3DAttributes(from, to) {

        if (from.position) {
            to.position.x = from.position.x;
            to.position.y = from.position.y;
            to.position.z = from.position.z;
        }

        if (from.rotation) {
            to.rotation.x = from.rotation.x;
            to.rotation.y = from.rotation.y;
            to.rotation.z = from.rotation.z;
            to.rotation.w = from.rotation.w;
        }

        if (from.scale) {
            to.scale.x = from.scale.x;
            to.scale.y = from.scale.y;
            to.scale.z = from.scale.z;
        }

        if (from.velocity) {
            to.velocity.x = from.velocity.x;
            to.velocity.y = from.velocity.y;
            to.velocity.z = from.velocity.z;
        }
        if (from.visible!=undefined) {
            to.visible = from.visible;
        }
    }


    this.update = function() {

        if (gameOverObject.time > 15000) {
            resetGame();
        }

        //Update TimeObject
        timeObject.time = Date.now() - timeObject.startTime;

        if (serverO3Ds.ball0) {
            forceFieldObject.ballZ.x = (serverO3Ds.ball0.position.z + 20) / 40;
        }
        if (loop.pane) {
            forceFieldObject.ballZ.y = (loop.pane.position.z + 20) / 40;
        }

        tslf = timeObject.time - tslf;

        ballRot += tslf * 0.001;

        for(var i = 0; i < spheres.length; i++){
            spheres[i].rotation.fromEulerAngles(ballRot, ballRot, ballRot);
        }

        runScoreAnimation();

        forceFieldObject.updateTimes();

        updatePanePositions();

        startObject.startAndCountdown();

        gameOverObject.gameOver();

        socket.sendCameraData(scene);
        tslf = timeObject.time;
    };
    //helpers
    function runScoreAnimation() {
        if (scoreboardObject.slidingUp) {
            scoreboard0.position.y += (tslf / 1000);
            scoreboard1.position.y -= (tslf / 1000);
            if (scoreboard0.position.y > loop.pane.scale.y / 2 + 2 * scoreboard0.scale.y / 2) {
                scoreboard0.position.y = loop.pane.scale.y / 2 + 2 * scoreboard0.scale.y / 2;
                scoreboard1.position.y = -loop.pane.scale.y / 2 - 2 * scoreboard0.scale.y / 2;
                scoreboardObject.slidingUp = false;
                scoreboardObject.isUp = true;
            }
            scoreboard0.update();
            scoreboard1.update();
        }
        if (scoreboardObject.isUp) {
            scoreboardObject.upTime += tslf;
            if (scoreboardObject.upTime > 1000) {
                scoreboardObject.upTime = 0;
                scoreboardObject.isUp = false;
                scoreboardObject.slidingDown = true;
            }
        }
        if (scoreboardObject.slidingDown) {
            scoreboard0.position.y -= tslf / 1000;
            scoreboard1.position.y += tslf / 1000;
            if (scoreboard0.position.y < 0.0) {
                scoreboard0.position.y = 0.0;
                scoreboard1.position.y = 0.0;
                scoreboardObject.slidingDown = false;
                scoreboardObject.isDown = true;
            }
            scoreboard0.update();
            scoreboard1.update();
        }
        if (scoreboardObject.isDown) {
            scoreboard0.visible = false;
            scoreboard1.visible = false;
        } else {
            scoreboard0.visible = true;
            scoreboard1.visible = true;
        }
    }

    function updatePanePositions() {
        var cc = scene.getCamera().getManager();
        bodyParent.position = cc.getGlobalPosition();
        bodyParent.rotation = cc.getGlobalRotation();

        paneEmpty.update();
        paneEmpty.rotation = bodyParent.rotation.getConjugate();
        paneEmpty.rotation.normalize();

        loop.pane.position = paneEmpty.getGlobalPosition();
        loop.pane.rotation = paneEmpty.getGlobalRotation();

        var aqWidth = 3;
        var aqHeight = 2.5;
        if (loop.pane.position.x > aqWidth - (loop.pane.scale.x / 2.0)) loop.pane.position.x = aqWidth - (loop.pane.scale.x / 2.0);
        else if (loop.pane.position.x < -aqWidth + (loop.pane.scale.x / 2.0)) loop.pane.position.x = -aqWidth + (loop.pane.scale.x / 2.0);

        if (loop.pane.position.y > aquariumHeight + aqHeight - (loop.pane.scale.y / 2.0)) loop.pane.position.y = aquariumHeight + aqHeight - (loop.pane.scale.y / 2.0);
        else if (loop.pane.position.y < aquariumHeight - aqHeight + (loop.pane.scale.y / 2.0)) loop.pane.position.y = aquariumHeight - aqHeight + (loop.pane.scale.y / 2.0);

        if (paneEmpty.getGlobalPosition().z < 0) {
            loop.pane.position.z = -17;
            loop.pane.position.z -= scene.getCamera().getForwardVector().z < 0 ? 2.5 : -4;
        } else {
            loop.pane.position.z = 17;
            loop.pane.position.z -= scene.getCamera().getForwardVector().z < 0 ? 4 : -2.5;
        }
    }

    function resetGame() {
        //setDonutAnimation(4, 0);
        gameOverObject.win = 0;
        gameOverObject.runAnimation = false;
        gameOverObject.time = 0;
        gameOverObject.startTime = 0;
        gameOverObject.done = false;
        gameOverObject.zFactor = 0;
        startObject.startTime = 0;
        startObject.time = 0;
        startObject.cdStartTime = 0;
        startObject.cdTime = 0;
        startObject.cursorOnStart = false;
        startObject.startDone = false;
        startObject.playersReady = 0;
        startObject.cdDone = false;
        startObject.zFactor = 0;
        loop.start.visible = true;
        loop.O3Ds.cursor.visible = true;
        loop.pane.visible = false;
        loop.winlose.visible = false;
        loop.balloons.visible = false;
        waitingForPlayer.visible = true;
        for (var i = 0; i < loop.numbers.length; i++) {
            loop.numbers[i].position.y = 10;
            loop.numbers[i].position.z = -7;
        }
        loop.winlose.position.z = -7;
        if (loop.playerType == "player2") {
            for (i = 0; i < loop.numbers.length; i++) {
                loop.numbers[i].position.z = 7;
                loop.numbers[i].update();
            }
            loop.winlose.position.z = 7;
        }
    }
};

Ayce.Quaternion.prototype.lookAt = function(source, destination) {
    //TODO Object Pool
    var forward = new Ayce.Vector3(0, 0, 1);
    var forwardVector = destination.copy().subtract(source.x, source.y, source.z);
    forwardVector.normalize();
    var dot = forward.dotProduct(forwardVector);

    if (Math.abs(dot + 1) < 0.000001) {
        this.set(0, 1, 0, Math.PI);
    } else if (Math.abs(dot - 1) < 0.000001) {
        this.set(0, 0, 0, 1);
    } else {
        var angle = Math.acos(dot);
        var axis = forwardVector.crossProduct(forward);
        axis.normalize();

        this.fromAxisAngle(axis, angle);
        this.normalize();
    }
};
