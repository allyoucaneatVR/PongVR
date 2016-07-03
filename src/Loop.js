var Loop = function(){
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
                if (playerType == "player2") forwardVector.z *= -1;
                forwardVector.negate();
                if (forwardVector.z < 0) {
                    var scaledFV = forwardVector.scaleBy((Math.abs(scene.getCamera().getManager().getGlobalPosition().z) - Math.abs(start.position.z)) / Math.abs(forwardVector.z));
                    var cameraPositionY = scene.getCamera().getManager().getGlobalPosition().y;
                    //                console.log(scaledFV.z);
                    if (scaledFV.x < start.scale.x * (startWidth / 2) &&
                        scaledFV.x > start.scale.x * -(startWidth / 2) &&
                        scaledFV.y < start.scale.y * (startHeight / 2) + cameraPositionY - start.position.y &&
                        scaledFV.y > start.scale.y * -(startHeight / 2) + cameraPositionY - start.position.y) {
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
            } else if (!this.startDone) {
                start.visible = false;
                O3Ds.cursor.visible = false;
                this.startDone = true;
                socket.sendPlayerReady();
            }
            if (this.playersReady > 1) {
                this.startCountdown();
            }
        },
        startCountdown: function() {
            if (this.cdStartTime == 0) {
                pane.visible = true;
                this.cdStartTime = timeObject.time;
            }
            if (!this.cdDone && this.cdTime < 5001) {
                this.cdTime = timeObject.time - this.cdStartTime;
                var i = Math.floor(this.cdTime / 1000);
                if (i < 5) {
                    numbers[i].visible = true;
                    this.zFactor = this.cdTime / 1000 - i;
                    if (playerType == "player1") {
                        numbers[i].position.z -= this.zFactor * 0.4;
                    } else {
                        numbers[i].position.z += this.zFactor * 0.4;
                    }
                }
                if (i > 0) numbers[i - 1].visible = false;
            } else {
                if (!this.cdDone) setDonutAnimation(1, 0);
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
                    this.startTime = timeObject.time;
                }
                if (!this.done && this.time <= 15000) {
                    this.time = timeObject.time - this.startTime;
                    this.zFactor = this.time / 200000;
                    if (playerType == "player1") {
                        winlose.position.z -= this.zFactor;
                        if (this.win == 1) {
                            balloons.visible = true;
                            balloons.position.z = -17;
                        } else {
                            balloons.visible = true;
                            balloons.position.z = 17;
                        }
                    } else {
                        winlose.position.z += this.zFactor;
                        if (this.win == 1) {
                            balloons.visible = true;
                            balloons.position.z = 17;
                        } else {
                            balloons.visible = true;
                            balloons.position.z = -17;
                        }
                    }
                } else {
                    this.cdDone = true;
                }
            }
        }
    };
    this.timeObject = {
        time: 0,
        startTime: Date.now()
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
                    forceFieldObject.startTime[i] = Date.now();
                    forceFieldObject.time[i] = 0;
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
};
Loop.prototype = {
    multiply: function(qa, qb){
        var w1 = qa.w;
        var x1 = qa.x;
        var y1 = qa.y;
        var z1 = qa.z;
        var w2 = qb.w;
        var x2 = qb.x;
        var y2 = qb.y;
        var z2 = qb.z;
        this.w = w1 * w2 - x1 * x2 - y1 * y2 - z1 * z2;
        this.x = w1 * x2 + x1 * w2 + y1 * z2 - z1 * y2;
        this.y = w1 * y2 - x1 * z2 + y1 * w2 + z1 * x2;
        this.z = w1 * z2 + x1 * y2 - y1 * x2 + z1 * w2;
        return this;
    }
};