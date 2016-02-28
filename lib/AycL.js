Ayce.allyoucanLeap = {};


Ayce.allyoucanLeap.initLeapMotion = function(scene, handModel, maxHandCount){
    var scope = this;
    
    maxHandCount = maxHandCount || 2;
    var handModelOffset = new Ayce.Vector3(0, 0.04, -0.08);
    var controller = new Leap.Controller({optimizeHMD: true}).connect();
    var handIDs = [];
    var hands = this.handModels = [];
    var handDataContainer = [];
    var unusedHandData = [];
    for(var i=0; i < maxHandCount; i++){
        handDataContainer[i] = unusedHandData[i] = new this.HandData();
        hands[i] = new handModel.HandModel(handModelOffset, scene);
    }
    
    this.onNewHand = null;

    function leapMotionLoop(frame){
        var i;
        //Remove old Hands
        for(i=0; i<handIDs.length; i++){
            var found = false;
            var id = handIDs[i];
            for(var j=0; j<frame.hands.length; j++){
                if(id === frame.hands[j].id){
                    found = true;
                    break;
                }
            }
            if(!found){
                for(var j=0; j < handDataContainer.length; j++){
                    if(id === handDataContainer[j].id){
                        if(unusedHandData.indexOf(handDataContainer[j]) < 0){
                            unusedHandData.push(handDataContainer[j]);
                        }
                        if(handDataContainer[j].onLeave)handDataContainer[j].onLeave();
                    }
                }
                handIDs.splice(handIDs.indexOf(id), 1);
            }
        }
        //Check for new Hands
        for(i=0; i<maxHandCount; i++){
            if(!frame.hands[i])continue;

            var id = frame.hands[i].id;
            if(handIDs.indexOf(frame.hands[i].id) < 0){
                var hdc = unusedHandData.pop();
                if(!hdc)continue;

                handIDs.push(id);
                hdc.id = id;
                var handModel = setNewHand(hdc);
                if(scope.onNewHand)scope.onNewHand({
                    handData: hdc,
                    handModel: handModel
                });
            }
        }
        //Update current Hands
        for(i=0; i<frame.hands.length; i++){
            var id = frame.hands[i].id;
            for(var j=0; j < handDataContainer.length; j++){
                if(id === handDataContainer[j].id){
                    handDataContainer[j].update(frame.hands[i]);
                }
            }
        }
        //Update Models
        for(i=0; i < hands.length; i++){
            hands[i].update();
        }
    }
    function setNewHand(data){
        var useHand = NaN;
        if(!hands[0].isVisible()){useHand = 0;}
        else if(!hands[1].isVisible()){useHand = 1;}

        if(!Number.isNaN(useHand)){
            data.onLeave = function(){
                hands[useHand].setVisibility(false);
            };
            hands[useHand].setVisibility(true);
            hands[useHand].setHandData(data);
            return hands[useHand];
        }
    }
    
    controller.loop(leapMotionLoop);
};
Ayce.allyoucanLeap.initLeapMotion.prototype = {
    PalmData: function(){
        var palmQ = this.palmQ = new Ayce.Quaternion();
        var palmQC = this.palmQC = new Ayce.Quaternion();

        this.update = function(hand){
            palmQ.fromEulerAngles(-hand.pitch(), hand.yaw(), -hand.roll());
            palmQ.getConjugate(palmQC);
        };
    },
    ArmData: function(){
        var m = new Leap.glMatrix.mat3.create();
        var q = new Leap.glMatrix.quat.create();

        var rotation = this.rotation = new Ayce.Quaternion();

        this.update = function(palm, arm){
            Leap.glMatrix.mat3.fromMat4(m, arm.matrix());
            Leap.glMatrix.quat.fromMat3(q, m);
            rotation.set(q[0], q[1], q[2], q[3]);
            rotation.multiply(rotation, palm.palmQC);
        };
    },
    FingerData: function(){
        var m = new Leap.glMatrix.mat3.create();
        var q = new Leap.glMatrix.quat.create();

        var fBQ = this.fBQ = new Ayce.Quaternion();
        var fBQC = new Ayce.Quaternion();

        var fMQ = this.fMQ = new Ayce.Quaternion();
        var fMQC = new Ayce.Quaternion();

        var fTQ = this.fTQ = new Ayce.Quaternion();
    //                var fTQC = new Ayce.Quaternion();

        this.update = function(palm, finger){
            Leap.glMatrix.mat3.fromMat4(m, finger.proximal.matrix());
            Leap.glMatrix.quat.fromMat3(q, m);
            fBQ.set(q[0], q[1], q[2], q[3]);
            fBQ.getConjugate(fBQC);
            fBQ.multiply(fBQ, palm.palmQC);

            Leap.glMatrix.mat3.fromMat4(m, finger.medial.matrix());
            Leap.glMatrix.quat.fromMat3(q, m);
            fMQ.set(q[0], q[1], q[2], q[3]);
            fMQ.getConjugate(fMQC);
            fMQ.multiply(fMQ, fBQC);

            Leap.glMatrix.mat3.fromMat4(m, finger.distal.matrix());
            Leap.glMatrix.quat.fromMat3(q, m);
            fTQ.set(q[0], q[1], q[2], q[3]);
    //                    fTQ.getConjugate(fTQC);
            fTQ.multiply(fTQ, fMQC);
        };
    },
    HandData: function(){
        var scope = this;
        var left = false;
        this.id = NaN;
        this.onLeave = null;
        this.leapHand = null;
        this.position = new Ayce.Vector3();
        
        this.palm   = new Ayce.allyoucanLeap.initLeapMotion.prototype.PalmData();
        this.arm    = new Ayce.allyoucanLeap.initLeapMotion.prototype.ArmData();
        this.thumb  = new Ayce.allyoucanLeap.initLeapMotion.prototype.FingerData();
        this.index  = new Ayce.allyoucanLeap.initLeapMotion.prototype.FingerData();
        this.middle = new Ayce.allyoucanLeap.initLeapMotion.prototype.FingerData();
        this.ring   = new Ayce.allyoucanLeap.initLeapMotion.prototype.FingerData();
        this.pinky  = new Ayce.allyoucanLeap.initLeapMotion.prototype.FingerData();

        this.update = function(hand){
            scope.leapHand = hand;
            left = (hand.type == "left");
            var pPos = hand.palmPosition;
            scope.position.set(pPos[0]/1000.0, pPos[1]/1000.0, pPos[2]/1000.0);
            
            scope.palm.update(hand);
            scope.arm.update(scope.palm, hand.arm);

            scope.thumb.update(scope.palm, hand.thumb);
            scope.index.update(scope.palm, hand.indexFinger);
            scope.middle.update(scope.palm, hand.middleFinger);
            scope.ring.update(scope.palm, hand.ringFinger);
            scope.pinky.update(scope.palm, hand.pinky);
        };
        this.isLeft = function(){
            return left;
        };
    }
};


Ayce.allyoucanLeap.HandModels = {};
Ayce.allyoucanLeap.HandModels.Default = function(){
    var scope = this;
    this.PalmModel = function(position, scene){
        position = position || new Ayce.Vector3();
        var palm = new Ayce.Geometry.Box(1, 0.2, 1);
        palm.offset.set(-palm.a / 2.0, -palm.b / 2.0, 0);
        palm = this.palm = palm.getO3D();
        palm.scale.set(0.1, 0.1, 0.1);


        var anchor = this.anchor = new Ayce.Object3D();
        anchor.position = position;
        anchor.rotation.fromEulerAngles(-Math.PI/2, 0, Math.PI);
        anchor.update();
        palm.parent = anchor;

        scene.addToScene(palm);    
    };
    this.ArmModel = function(palmModel, scene, options){
        options = options || {
            length: new Ayce.Vector3(0.015, 0.015, 0.04)
        };
        var length = options.length;

        var arm = new Ayce.Geometry.Box(length.x, length.y, length.z);
        arm.offset.set(-arm.a / 2.0, -arm.b / 2.0, 0);
        arm = this.arm = arm.getO3D();
        arm.parent = palmModel.palm;
        scene.addToScene(arm);

        this.setFingerData = function(armData){
            arm.rotation = armData.rotation;
        };
        
        this.getLength = function(){
            return length;
        };
    };
    this.FingerModel = function(palmModel, scene, options){
        options = options || {
            pLength: new Ayce.Vector3(0.015, 0.015, 0.04),
            mLength: new Ayce.Vector3(0.015, 0.015, 0.034),
            dLength: new Ayce.Vector3(0.015, 0.015, 0.028)
        };

        var pLength = options.pLength;
        var mLength = options.mLength;
        var dLength = options.dLength;

        var proximal = new Ayce.Geometry.Box(pLength.x, pLength.y, pLength.z);
        proximal.offset.set(-proximal.a / 2.0, -proximal.b / 2.0, -proximal.c);
        proximal = this.proximal = proximal.getO3D();
        proximal.parent = palmModel.palm;
        scene.addToScene(proximal);

        var medial = new Ayce.Geometry.Box(mLength.x, mLength.y, mLength.z);
        medial.offset.set(-medial.a / 2.0, -medial.b / 2.0, -medial.c);
        medial = this.medial = medial.getO3D();
        medial.parent = proximal;
        medial.position.z = -pLength.z;
        scene.addToScene(medial);

        var distal = new Ayce.Geometry.Box(dLength.x, dLength.y, dLength.z);
        distal.offset.set(-distal.a / 2.0, -distal.b / 2.0, -distal.c);
        distal = this.distal = distal.getO3D();
        distal.parent = medial;
        distal.position.z = -mLength.z;
        scene.addToScene(distal);

        this.setFingerData = function(fingerData){
            proximal.rotation = fingerData.fBQ;
            medial.rotation   = fingerData.fMQ;
            distal.rotation   = fingerData.fTQ;
        };
        this.getProximalLength = function(){
            return pLength;
        };
        this.getMedialLength = function(){
            return mLength;
        };
        this.getDistalLength = function(){
            return dLength;
        };
    };
    this.HandModel = function(position, scene){
        var currentHandData = null;
        var isLeft = false;
        var palmModel   = this.palmModel   = new scope.PalmModel(position, scene);
        var armModel  = this.armModel  = new scope.ArmModel(palmModel, scene, {
            length: new Ayce.Vector3(0.06, 0.03, 0.3)
        });
        var thumbModel  = this.thumbModel  = new scope.FingerModel(palmModel, scene, {
            pLength: new Ayce.Vector3(0.015, 0.015, 0.02),
            mLength: new Ayce.Vector3(0.015, 0.015, 0.041),
            dLength: new Ayce.Vector3(0.015, 0.015, 0.03)
        });
        var indexModel  = this.indexModel  = new scope.FingerModel(palmModel, scene, {
            pLength: new Ayce.Vector3(0.015, 0.015, 0.04),
            mLength: new Ayce.Vector3(0.015, 0.015, 0.034),
            dLength: new Ayce.Vector3(0.015, 0.015, 0.028)
        });
        var middleModel = this.middleModel = new scope.FingerModel(palmModel, scene, {
            pLength: new Ayce.Vector3(0.015, 0.015, 0.04),
            mLength: new Ayce.Vector3(0.015, 0.015, 0.038),
            dLength: new Ayce.Vector3(0.015, 0.015, 0.029)
        });
        var ringModel   = this.ringModel   = new scope.FingerModel(palmModel, scene, {
            pLength: new Ayce.Vector3(0.015, 0.015, 0.04),
            mLength: new Ayce.Vector3(0.015, 0.015, 0.034),
            dLength: new Ayce.Vector3(0.015, 0.015, 0.028)
        });
        var pinkyModel  = this.pinkyModel  = new scope.FingerModel(palmModel, scene, {
            pLength: new Ayce.Vector3(0.015, 0.015, 0.025),
            mLength: new Ayce.Vector3(0.015, 0.015, 0.025),
            dLength: new Ayce.Vector3(0.015, 0.015, 0.025)
        });

        palmModel.anchor.parent = scene.getCamera().getManager();

        this.setHandData =function(handData){
            currentHandData = handData;
            isLeft = handData.isLeft();
            var l = handData.isLeft() ? -1 : 1;

            armModel.arm.position.set(0, 0, 0.1);
            thumbModel.proximal.position.set(-0.05*l, 0, 0.05);
            indexModel.proximal.position.set(-0.04*l, 0, 0);
            middleModel.proximal.position.set(-0.0125*l, 0, 0);
            ringModel.proximal.position.set(0.0125*l, 0, 0);
            pinkyModel.proximal.position.set(0.04*l, 0, 0);

            palmModel.palm.position = handData.position;
            palmModel.palm.rotation = handData.palm.palmQ;

            armModel.setFingerData(handData.arm);
            thumbModel.setFingerData(handData.thumb);
            indexModel.setFingerData(handData.index);
            middleModel.setFingerData(handData.middle);
            ringModel.setFingerData(handData.ring);
            pinkyModel.setFingerData(handData.pinky);
        };
        this.setVisibility = function(v){
            palmModel.palm.visible = v;
            armModel.arm.visible = v;
            
            thumbModel.proximal.visible = v;
            thumbModel.medial.visible = v;
            thumbModel.distal.visible = v;

            indexModel.proximal.visible = v;
            indexModel.medial.visible = v;
            indexModel.distal.visible = v;

            middleModel.proximal.visible = v;
            middleModel.medial.visible = v;
            middleModel.distal.visible = v;

            ringModel.proximal.visible = v;
            ringModel.medial.visible = v;
            ringModel.distal.visible = v;

            pinkyModel.proximal.visible = v;
            pinkyModel.medial.visible = v;
            pinkyModel.distal.visible = v;
        };
        this.update = function(){
            if(!this.isVisible())return;

            if(currentHandData.isLeft() !== isLeft){
                this.setHandData(currentHandData);
            }

            palmModel.anchor.update();
        };
        this.isVisible = function(){
            return palmModel.palm.visible;
        };
        this.setVisibility(false);
        this.getHandData = function(){
            return currentHandData;
        };
    };
};