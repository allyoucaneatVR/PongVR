var Loop = function(scene, path){

    this.timeObject = {
        time: 0,
        startTime: Date.now()
    };
    var scope = this;
    this.O3Ds = {};
    this.playerType = null;
    this.scoreboardObject = {
        digits0: [0.0, 0.0],
        digits1: [0.0, 0.0],
        score: [0, 0],
        slidingUp: false,
        slidingDown: false,
        isDown: true,
        isUp: false,
        upTime: 0,
        updateScore: function(score1, score2) {
            this.score[0] = score1 % 100;
            this.score[1] = score2 % 100;
            this.digits0[0] = Math.floor(this.score[0] / 10);
            this.digits0[1] = this.score[0] % 10;
            this.digits1[0] = Math.floor(this.score[1] / 10);
            this.digits1[1] = this.score[1] % 10;
        }
    };
    this.startObject = {
        startTime: 0,
        time: 0,
        cdStartTime: 0,
        cdTime: 0,
        cursorOnStart: false,
        startDone: false,
        playersReady: 0,
        cdDone: false,
        zFactor: 0,
        startAndCountdown: function() {
            if (this.time < 4000) {
                var forwardVector = scene.getCamera().getForwardVector();
                var startWidth = 8;
                var startHeight = 2;
                if (scope.playerType == "player2") forwardVector.z *= -1;
                forwardVector.negate();
                if (forwardVector.z < 0) {
                    var scaledFV = forwardVector.scaleBy((Math.abs(scene.getCamera().getManager().getGlobalPosition().z) - Math.abs(scope.start.position.z)) / Math.abs(forwardVector.z));
                    var cameraPositionY = scene.getCamera().getManager().getGlobalPosition().y;
                    //                console.log(scaledFV.z);
                    if (scaledFV.x < scope.start.scale.x * (startWidth / 2) &&
                        scaledFV.x > scope.start.scale.x * -(startWidth / 2) &&
                        scaledFV.y < scope.start.scale.y * (startHeight / 2) + cameraPositionY - scope.start.position.y &&
                        scaledFV.y > scope.start.scale.y * -(startHeight / 2) + cameraPositionY - scope.start.position.y) {
                        if (!this.cursorOnStart) {
                            this.cursorOnStart = true;
                            this.startTime = scope.timeObject.time;
                        }
                    } else {
                        this.cursorOnStart = false;
                        this.time = 0;
                    }
                }
                if (this.cursorOnStart) {
                    this.time = scope.timeObject.time - this.startTime;
                }
            } else if (!this.startDone) {
                scope.start.visible = false;
                scope.O3Ds.cursor.visible = false;
                this.startDone = true;
                socket.sendPlayerReady();
            }
            if (this.playersReady > 1) {
                this.startCountdown();
            }
        },
        startCountdown: function() {
            if (this.cdStartTime == 0) {
                scope.pane.visible = true;
                this.cdStartTime = scope.timeObject.time;
            }
            if (!this.cdDone && this.cdTime < 5001) {
                this.cdTime = scope.timeObject.time - this.cdStartTime;
                var i = Math.floor(this.cdTime / 1000);
                if (i < 5) {
                    scope.numbers[i].visible = true;
                    this.zFactor = this.cdTime / 1000 - i;
                    if (scope.playerType == "player1") {
                        scope.numbers[i].position.z -= this.zFactor * 0.4;
                    } else {
                        scope.numbers[i].position.z += this.zFactor * 0.4;
                    }
                }
                if (i > 0) scope.numbers[i - 1].visible = false;
            } else {
                //if (!this.cdDone) setDonutAnimation(1, 0);
                this.cdDone = true;
                //pane.visible = true;
            }
        }
    };
    this.gameOverObject = {
        win: 0,
        runAnimation: false,
        time: 0,
        startTime: 0,
        done: false,
        zFactor: 0,
        gameOver: function() {
            if (this.runAnimation) {
                if (this.startTime == 0) {
                    this.startTime = scope.timeObject.time;
                }
                if (!this.done && this.time <= 15000) {
                    this.time = scope.timeObject.time - this.startTime;
                    this.zFactor = this.time / 200000;
                    if (scope.playerType == "player1") {
                        scope.winlose.position.z -= this.zFactor;
                        if (this.win == 1) {
                            scope.balloons.visible = true;
                            scope.balloons.position.z = -17;
                        } else {
                            scope.balloons.visible = true;
                            scope.balloons.position.z = 17;
                        }
                    } else {
                        scope.winlose.position.z += this.zFactor;
                        if (this.win == 1) {
                            scope.balloons.visible = true;
                            scope.balloons.position.z = 17;
                        } else {
                            scope.balloons.visible = true;
                            scope.balloons.position.z = -17;
                        }
                    }
                } else {
                    this.cdDone = true;
                }
            }
        }
    };
    this.forceFieldObject = {
        ballZ: new Ayce.Vector3(0, 0, 0),
        center: new Float32Array(9), //up to 4 collisions with 3 coords each
        duration: 700,
        time: [
            this.duration + 1, this.duration + 1, this.duration + 1
        ],
        startTime: [
            Date.now(), Date.now(), Date.now()
        ],
        addCollision: function(x, y, z) {
            for (var i = 0; i < this.time.length; i++) {
                if (this.time[i] > this.duration) {
                    this.center[i * 3] = x;
                    this.center[i * 3 + 1] = y;
                    this.center[i * 3 + 2] = z;
                    loop.forceFieldObject.startTime[i] = Date.now();
                    loop.forceFieldObject.time[i] = 0;
                    break;
                }
            }
        },
        updateTimes: function() {
            for (var i = 0; i < this.time.length; i++) {
                this.time[i] = Date.now() - this.startTime[i];
            }
        }
    };

    this.start = new Ayce.OBJLoader(path + "obj/start2.obj")[0];
    this.start.transparent = true;
    this.start.position.y = 3.5;
    this.start.position.z = -7;
    this.start.scale = new Ayce.Vector3(0.7, 0.7, 0.7);
    this.start.colors = null;
    this.start.shader = path + "shader/start";
    this.start.shaderUniforms = [];
    this.start.shaderUniforms.push(["uTime", "uniform1f", this.timeObject, ["time"]], ["uFillTime", "uniform1f", this.startObject, ["time"]]);
    this.start.rotation.fromEulerAngles(0, Math.PI, 0);
    scene.addToScene(this.start);

    this.pane = new Ayce.TextureCube(path + "textures/pane3.png");
    this.pane.textureCoords = [0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
        1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 0.0, 0.0,
        0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0,
        1.0, 1.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0,
        1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 0.0, 0.0,
        0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0
    ];
    this.pane.scale.set(1.25, 1, 0.1);
    this.pane.transparent = true;
    this.pane.twoFaceTransparency = true;
    this.pane.visible = false;
    scene.addToScene(this.pane);

    this.numbers = [];
    for (var i = 0; i < 5; i++) {
        this.numbers[i] = new Ayce.OBJLoader(path + "obj/number.obj")[0];
        this.numbers[i].imageSrc = path + "obj/textures/score_" + (5 - i) + "_alpha.png";
        this.numbers[i].position.y = 10;
        this.numbers[i].position.z = -7;
        this.numbers[i].rotation.fromEulerAngles(0, Math.PI, 0);
        this.numbers[i].visible = false;
        this.numbers[i].transparent = true;
        this.numbers[i].colors = null;
        this.numbers[i].shader = path + "shader/countDown";
        this.numbers[i].shaderUniforms = [];
        this.numbers[i].shaderUniforms.push(["uFactor", "uniform1f", this.startObject, ["zFactor"]]);
        scene.addToScene(this.numbers[i]);
    }

    this.winlose = new Ayce.OBJLoader(path + "obj/youwinyoulose.obj")[0];
    this.winlose.rotation.fromEulerAngles(0, Math.PI, 0);
    this.winlose.imageSrc = path + "obj/textures/youwinyoulose.png";
    this.winlose.shader = path + "shader/winlose";
    this.winlose.transparent = true;
    this.winlose.visible = false;
    this.winlose.position.y = 10;
    this.winlose.position.z = -7;
    this.winlose.colors = null;
    this.winlose.shaderUniforms = [];
    this.winlose.shaderUniforms.push(["uWin", "uniform1f", this.gameOverObject, ["win"]]);
    scene.addToScene(this.winlose);

    function initBalloons() {
        var balloon = new Ayce.OBJLoader(path + "obj/balloon.obj")[0];

        var colors = [
            [244 / 255, 67 / 255, 54 / 255, 1], // red
            [233 / 255, 30 / 255, 99 / 255, 1], // pink
            [156 / 255, 39 / 255, 176 / 255, 1], // purple
            [103 / 255, 58 / 255, 183 / 255, 1], // deep purple
            [63 / 255, 81 / 255, 181 / 255, 1], // indigo
            [33 / 255, 150 / 255, 243 / 255, 1], // blue
            [3 / 255, 169 / 255, 244 / 255, 1], // light blue
            [0 / 255, 188 / 255, 212 / 255, 1], // cyan
            [0 / 255, 150 / 255, 136 / 255, 1], // teal
            [76 / 255, 175 / 255, 80 / 255, 1], // green
            [139 / 255, 195 / 255, 74 / 255, 1], // light green
            [205 / 255, 220 / 255, 57 / 255, 1], // lime
            [255 / 255, 235 / 255, 59 / 255, 1], // yellow
            [255 / 255, 193 / 255, 7 / 255, 1], // amber
            [255 / 255, 152 / 255, 0 / 255, 1], // orange
            [255 / 255, 87 / 255, 34 / 255, 1] // deep orange
        ];

        var balloonColors = [];
        for (i = 0; i < colors.length; i++) {
            balloonColors[i] = [];
            for (var j = 0; j < balloon.colors.length / 4; j++) {
                balloonColors[i] = balloonColors[i].concat(colors[i]);
            }
        }

        scope.balloons = new Ayce.ParticleSystem(scene, balloon, 30, 0);
        for (var i = 0; i < scope.balloons.particles.length; i++) {
            scope.balloons.particles[i].position = new Ayce.Vector3(
                (Math.random() * 2 - 1) * 6,
                5 - Math.random() * 5,
                (Math.random() * 2 - 1) * 6);
            scope.balloons.particles[i].gravity = 0.00000000001;
            scope.balloons.particles[i].gravityExponent = 2;
            scope.balloons.particles[i].scale = new Ayce.Vector3(0.3, 0.3, .3);
            scope.balloons.particles[i].lifetime = 10000 + Math.random() * 5000;
            scope.balloons.particles[i].rotationAngle.y = Math.random() * 0.001;
            scope.balloons.particles[i].colors = balloonColors[Math.round(Math.random() * balloonColors.length - 1)];
        }
        scope.balloons.initParticleArrays();
        scope.balloons.useFragmentLighting = false;
        scope.balloons.visible = false;
    }
    this.balloons = null;
    initBalloons();
    scene.addToScene(this.balloons);
};
Loop.prototype = {};