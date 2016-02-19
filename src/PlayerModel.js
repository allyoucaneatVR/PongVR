function getNewBody(useSimple){
    var body = useSimple ? createSimplePlayerModel() : createComplexPlayerModel();
    return body;
}

function createSimplePlayerModel(){
    var bodySimple = new Ayce.OBJLoader(path + "obj/body_simple.obj")[0];
    bodySimple.position.y = -1.9;
    return bodySimple;
}
function createComplexPlayerModel(){
    var o3Ds = {};
    for(var attr in bodyO3Ds){
        if(isNaN(attr)){
            o3Ds[attr] = Ayce.OBJLoader.prototype.copyOBJO3D(bodyO3Ds[attr]);
        }
    }

    var body = o3Ds.Body;
    body.position.y = -0.35;
    body.position.z = 0.15;
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

    body.animationStart = Date.now();
    body.animationStep = 0;
    body.lastPos = new Ayce.Vector3();
    body.isMoving = false;
    body.stopTime = 0;
    body.onUpdate = playerWalkAnimation;

    return body;
}

function playerWalkAnimation(){
    var shoulderL = this.bodyParts.ShoulderL;
    var uArmL = this.bodyParts.UpperArmL;
    var lArmL = this.bodyParts.LowerArmL;

    var shoulderR = this.bodyParts.ShoulderR;
    var uArmR = this.bodyParts.UpperArmR;
    var lArmR = this.bodyParts.LowerArmR;

    var uLegR = this.bodyParts.UpperLegR;
    var lLegR = this.bodyParts.LowerLegR;
    var footR = this.bodyParts.FootR;

    var uLegL = this.bodyParts.UpperLegL;
    var lLegL = this.bodyParts.LowerLegL;
    var footL = this.bodyParts.FootL;

    var duration = Date.now()-this.animationStart;

    var lP = this.lastPos;
    var cP = this.parent.getGlobalPosition();

    if(Ayce.Vector3.prototype.distance(lP, cP) > 0.05){
        if(!this.isMoving){
            this.isMoving = true;
        }
        lP.x = cP.x;
        lP.y = cP.y;
        lP.z = cP.z;
        this.stopTime = 0;
    }
    else{
        if(!this.stopTime)this.stopTime = Date.now();
        if(this.isMoving && Date.now()-this.stopTime >= 120){
            this.isMoving = false;
            this.animationStep = 3;
            rotateBone(uLegR, 0, 0, 0, 250);
            rotateBone(lLegR, 0, 0, 0, 250);
            rotateBone(footR, 0, 0, 0, 250);

            rotateBone(uLegL, 0, 0, 0, 250);
            rotateBone(lLegL, 0, 0, 0, 250);
            rotateBone(footL, 0, 0, 0, 250);
        }
    }

    if(duration > 250 && this.isMoving){
        if(this.animationStep === 0){
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
        else if(this.animationStep === 1){

            rotateBone(uLegR, -48.307, 0, 0, 250);
            rotateBone(lLegR, 47.74, 0, 0, 250);
            rotateBone(footR, 0, 0, 0, 250);

            rotateBone(uLegL, 19.417, 0, 0, 250);
            rotateBone(lLegL, 38.628, 0, 0, 250);
            rotateBone(footL, 31.054, 0, 0, 250);
        }
        else if(this.animationStep === 2){

            rotateBone(uLegR, -0.009, 0, 0, 250);
            rotateBone(lLegR, -0.106, 0, 0, 250);
            rotateBone(footR, 0, 0, 0, 250);

            rotateBone(uLegL, -30.57, 0, 0, 250);
            rotateBone(lLegL, 104.316, 0, 0, 250);
            rotateBone(footL, 8.334, 0, 0, 250);
        }
        else if(this.animationStep === 3){

            rotateBone(uLegR, 14.35, 0, 0, 250);
            rotateBone(lLegR, 4.628, 0, 0, 250);
            rotateBone(footR, 1.265, 0, 0, 250);

            rotateBone(uLegL, -36.939, 0, 0, 250);
            rotateBone(lLegL, 51.693, 0, 0, 250);
            rotateBone(footL, 20.286, 0, 0, 250);
        }
        else if(this.animationStep === 4){

            rotateBone(uLegR, 19.591, 0, 0, 250);
            rotateBone(lLegR, 35.719, 0, 0, 250);
            rotateBone(footR, 16.323, 0, 0, 250);

            rotateBone(uLegL, -32.129, 0, 0, 250);
            rotateBone(lLegL, 0.071, 0, 0, 250);
            rotateBone(footL, 1.182, 0, 0, 250);
        }
        else if(this.animationStep === 5){

            rotateBone(uLegR, 16.179, 0, 0, 250);
            rotateBone(lLegR, 30.931, 0, 0, 250);
            rotateBone(footR, 39.963, 0, 0, 250);

            rotateBone(uLegL, -32.655, 0, 0, 250);
            rotateBone(lLegL, 32.212, 0, 0, 250);
            rotateBone(footL, 1.182, 0, 0, 250);
        }
        else if(this.animationStep === 6){

            rotateBone(uLegR, -26.711, 0, 0, 250);
            rotateBone(lLegR, 98.14, 0, 0, 250);
            rotateBone(footR, 22.045, 0, 0, 250);

            rotateBone(uLegL, -0.231, 0, 0, 250);
            rotateBone(lLegL, 0.247, 0, 0, 250);
            rotateBone(footL, 1.182, 0, 0, 250);
        }
        else if(this.animationStep === 7){

            rotateBone(uLegR, -36.355, 0, 0, 250);
            rotateBone(lLegR, 54.316, 0, 0, 250);
            rotateBone(footR, 22.045, 0, 0, 250);

            rotateBone(uLegL, 18.379, 0, 0, 250);
            rotateBone(lLegL, 0.247, 0, 0, 250);
            rotateBone(footL, 6.156, 0, 0, 250);

            this.animationStep = -1;
        }
        this.animationStep++;

        this.animationStart = Date.now();
    }
}
function boneMovement(){
    if(!this.animationActive)return;

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
function rotateBone(o3D, ax, ay, az, duration){
    var radToDeg = Math.PI/180;
    o3D.rotateTo.fromEulerAngles(-ax*radToDeg, ay*radToDeg, az*radToDeg);
    o3D.duration = duration;
    o3D.animationActive = true;
    o3D.startAnimation = true;
}