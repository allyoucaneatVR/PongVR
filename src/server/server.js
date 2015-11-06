var express = require('express'),   
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server),
    conf = require('./config.json'),
    VROne = require('VROne.min.js');


var i;
var connectedClients = 0;
var clients = [];
var sendO3Ds = [];

var idCount = 0;
var o3Ds = [];
var panePlayer1 = {
    active: false,
    clientID: undefined,
    player: 1,
    pane: new VROne.CubeTexture3D_3(), 
    empty: new VROne.Object3D()
};
var panePlayer2 = {
    active: false,
    clientID: undefined,
    player: 2,
    pane: new VROne.CubeTexture3D_3(), 
    empty: new VROne.Object3D()
};
var score1 = 0;
var score2 = 0;
var player1;
var player2;

var aquariumHeight = 10;

var frontWall = new VROne.Geometry.Box(6, 5, 0.5);
frontWall.offset.set(-frontWall.a/2.0, -frontWall.b/2.0, -frontWall.c);
frontWall = frontWall.getO3D();

var backWall = new VROne.Geometry.Box(6, 5, 0.5);
backWall.offset.set(-backWall.a/2.0, -backWall.b/2.0, 0);
backWall = backWall.getO3D();

var topWall = new VROne.Geometry.Box(6, 0.5, 40);
topWall.offset.set(-topWall.a/2.0, 0, -topWall.c/2.0);
topWall = topWall.getO3D();

var bottomWall = new VROne.Geometry.Box(6, 0.5, 40);
bottomWall.offset.set(-bottomWall.a/2.0, -bottomWall.b, -bottomWall.c/2.0);
bottomWall = bottomWall.getO3D();

var leftWall = new VROne.Geometry.Box(0.5, 5, 40);
leftWall.offset.set(-leftWall.a, -leftWall.b/2.0, -leftWall.c/2.0);
leftWall = leftWall.getO3D();

var rightWall = new VROne.Geometry.Box(0.5, 5, 40);
rightWall.offset.set(0, -rightWall.b/2.0, -rightWall.c/2.0);
rightWall = rightWall.getO3D();

var ball = new VROne.Geometry.Sphere(0.2).getO3D();
var ballCollision = [frontWall, backWall, topWall, bottomWall, leftWall, rightWall];

////////////////////////////////////////////////////////////////////
//Init
var speedOnScoreFactor = 1.1;
var lastBallMiss = 0;
function init(){
    console.log("Init...");

    frontWall.position.set(0, aquariumHeight, -20);
    backWall.position.set(0, aquariumHeight, 20);
    topWall.position.set(0, 2.5+aquariumHeight, 0);
    bottomWall.position.set(0, -2.5+aquariumHeight, 0);
    leftWall.position.set(-3, aquariumHeight, 0);
    rightWall.position.set(3, aquariumHeight, 0);
    
    var paneScale = new VROne.Vector3(1.25, 1, 0.1);
    
    panePlayer1.empty.position = new VROne.Vector3(0, 0, -4);
    panePlayer1.pane.scale = paneScale;
    panePlayer1.pane.calcBoundingBox();
    panePlayer1.pane.calcBoundingSphere();
    
    panePlayer2.empty.position = new VROne.Vector3(0, 0, -4);
    panePlayer2.pane.scale = paneScale;
    panePlayer2.pane.calcBoundingBox();
    panePlayer2.pane.calcBoundingSphere();
    
    ballCollision.push(panePlayer1.pane, panePlayer2.pane);
    o3Ds.push(panePlayer1.pane, panePlayer2.pane);
    
    ball.position.set(0, aquariumHeight, 0);
    ball.velocity.set(0, 0, 0);
    ball.collision = true;
    ball.collideWith = ballCollision;
    ball.onCollision = function(collisionData){
        var sendData = {};
        sendData.id = "ball";
        sendData.position = ball.position;
        io.sockets.emit('collision', sendData);
        
        if(collisionData.collisionWith === frontWall){
            ball.position.set(0, aquariumHeight, 0);
            ball.velocity.z *= speedOnScoreFactor;
            addScore(0);
            lastBallMiss = Date.now();
        }
        else if(collisionData.collisionWith === backWall){
            ball.position.set(0, aquariumHeight, 0);
            ball.velocity.z *= speedOnScoreFactor;
            addScore(1);
            lastBallMiss = Date.now();
        }
        
        var normal = collisionData.collisionVector.normal.copy();
        normal.scaleBy(-2*normal.dotProduct(ball.velocity));
        ball.velocity = ball.velocity.addVector3(normal);
    };
    //Ball
    var o3DArgs = {};
    o3DArgs.position = ball.position;
    o3DArgs.velocity = ball.velocity;
    sendO3D_Client("sphere", "ball", o3DArgs, true);
    //Pane Player1
    o3DArgs = {};
    o3DArgs.position = panePlayer1.position;
    sendO3D_Client("pane", "paneP1", o3DArgs, true);
    //Pane Player2
    o3DArgs = {};
    o3DArgs.position = panePlayer2.position;
    sendO3D_Client("pane", "paneP2", o3DArgs, true);

    addO3D(frontWall, backWall, leftWall, rightWall, bottomWall, leftWall, topWall, ball);
}

////////////////////////////////////////////////////////////////////
//Scene Management
var clientO3Ds = [];
function addO3D(){
    for(var o3D in arguments){
        arguments[o3D].calcBoundingBox();
        arguments[o3D].calcBoundingSphere();
        o3Ds.push(arguments[o3D]);
    }
}
function removeO3D(o3D){
    for(var i=0; i < o3Ds.length; i++){
        if(o3Ds[i] === o3D){
            o3Ds.splice(i, 1);
        }
    }
}
function sendO3D_Client(type, id, args, pushToContainer, socket){
    var o = {
        type: type,
        id: id,
        args: args
    };
    if(pushToContainer){
        clientO3Ds.push(o);
    }
    if(socket){
        socket.emit('add_O3D', o);
    }
    else{
        io.sockets.emit('add_O3D', o);
    }
}
function removeO3D_Client(id){
    var r;
    for(var i=0; i < clientO3Ds.length; i++){
        if(clientO3Ds[i].id == id){
            r = i;
        }
    }
    if(r !== undefined){
        clientO3Ds.splice(r, 1);
        var data = {};
        data.id = id;
        io.sockets.emit('remove_O3D', data);
    }
}

function getPlayersPacket(){
    var packet = [];
    for(i = 0; i < clients.length; i++) {
        if (clients[i] && clients[i].position && clients[i].rotation) {
            packet.push({
                id: i,
                position: clients[i].position,
                rotation: clients[i].rotation
            });
        }
    }
    return packet;
}
function resetScore(){
    score1 = 0;
    score2 = 0;
    io.sockets.emit('score', {score1:score1, score2:score2});
}
function addScore(player){
    if(player === 0)score1 = (score1+1)%100;
    else if(player === 1)score2 = (score2+1)%100;
    io.sockets.emit('score', {score1:score1, score2:score2});
}

////////////////////////////////////////////////////////////////////
//Loop
var playersConnected = false;
var roundActive = false;

function update(){
    setTimeout(update, 16);
    
    if(panePlayer1.active)updatePane(panePlayer1);
    if(panePlayer2.active)updatePane(panePlayer2);
    
    if(player1 !== undefined && player2 !== undefined){
        if(!playersConnected){
            onPlayersConnected();
            playersConnected = true;
        }
    }
    else if(playersConnected){
        onPlayerDisconnected();
        if(roundActive){
            onRoundAbort();
            roundActive = false;
        }
        playersConnected = false;
    }
    
    if(playersConnected){
        var c1 = clients[player1];
        var c2 = clients[player2];
        
        if(c1.ready && c2.ready){
            if(!roundActive){
                onPlayersReady();
            }
            else{
                onRoundRun();
            }
        }
    }
    
    for(i=0; i<o3Ds.length; i++){
        o3Ds[i].update();
    }
}

function onPlayersConnected(){
    console.log("Players connected.");
}
var firstReady = true;
var readyTime;
var readyCount = 0;
var countIn = 5;
var maxPoints = 5;

function onPlayersReady(){
    if(firstReady){
        console.log("Players are ready.");
        readyCount = 0;
        readyTime = Date.now();
        firstReady = false;
        io.sockets.emit('countdown', {time: readyTime});
    }
    var duration = Date.now() - readyTime;
    
    if(duration/1000.0 > readyCount){
        console.log(countIn-readyCount);
        readyCount++;
        if(readyCount > countIn){
            onRoundStart();
            roundActive = true;
            firstReady = true;
        }
    }
}
function onPlayerDisconnected(){
    console.log("Player disconnected.");
    firstReady = true;
}
function onRoundStart(){
    console.log("Round start.");
    resetScore();
    ball.position.set(0, aquariumHeight, 0);
    ball.velocity.set(1 + 0.5*Math.random(), -2 + 4*Math.random(), 5);
    lastBallMiss = Date.now();
}
function onRoundRun(){
    if(score1 >= maxPoints || score2 >= maxPoints){
        console.log("Max points.");
        onRoundAbort();
        clients[player1].ready = false;
        clients[player2].ready = false;
    }
}
function onRoundAbort(){
    console.log("Round end.");
    roundActive = false;
    ball.position.set(0, aquariumHeight, 0);
    ball.velocity.set(0, 0, 0);
}

var poolVec = new VROne.Vector3();
function updatePane(paneObj){
//    console.log(paneObj.player, paneObj.clientID);
    poolVec.set(0, 0, -1);
    
    var empty = paneObj.empty;
    empty.update();
    empty.rotation = empty.parent.rotation.getConjugate();
    empty.rotation.normalize();
    empty.rotation.rotatePoint(poolVec);

    var pane = paneObj.pane;
    pane.position = empty.getGlobalPosition();
    pane.rotation = empty.getGlobalRotation();
    
    var aqWidth = 3;
    var aqHeight = 2.5;
    if(pane.position.x > aqWidth-(pane.scale.x/2.0))pane.position.x = aqWidth-(pane.scale.x/2.0);
    else if(pane.position.x < -aqWidth+(pane.scale.x/2.0))pane.position.x = -aqWidth+(pane.scale.x/2.0);

    if(pane.position.y > aquariumHeight+aqHeight-(pane.scale.y/2.0))pane.position.y = aquariumHeight+aqHeight-(pane.scale.y/2.0);
    else if(pane.position.y < aquariumHeight-aqHeight+(pane.scale.y/2.0))pane.position.y = aquariumHeight-aqHeight+(pane.scale.y/2.0);
    
    if(empty.getGlobalPosition().z < 0){
        pane.position.z = -17;
        pane.position.z -= poolVec.z < 0 ? 2.5 : -4;
    }
    else{
        pane.position.z =  17;
        pane.position.z -= poolVec.z < 0 ? 4 : -2.5;
    }
}
function send(){
    setTimeout(send, 100);
    
    sendO3Ds.length = 0;
    sendO3Ds.push({ id: 'ball', position: ball.position, rotation: ball.rotation, velocity: ball.velocity});
    sendO3Ds.push({ id: 'paneP1', position: panePlayer1.pane.position, rotation: panePlayer1.pane.rotation});
    sendO3Ds.push({ id: 'paneP2', position: panePlayer2.pane.position, rotation: panePlayer2.pane.rotation});
    
    io.sockets.emit('update_O3D', sendO3Ds);
    io.sockets.emit('player_pos', getPlayersPacket());
}

////////////////////////////////////////////////////////////////////
// Websocket
server.listen(conf.port, conf.ip);

io.sockets.on('connection', function (socket) {
    connectedClients++;
    var id = idCount++;
    clients[id] = {
        position: new VROne.Vector3(),
        rotation: new VROne.Quaternion(),
        ready: false,
        playerType: null,
        getGlobalRotation: function(){return this.rotation;},
        getGlobalPosition: function(){return this.position;}
    };
    
	var con = socket.request.connection;
	socket.on('disconnect', function (data) {
        connectedClients--;
        clients[id] = null;
        io.sockets.emit('remove_player', { id: id});
        onPlayerExit(id);
		console.log(con.remoteAddress+":"+con.remotePort + " disconnected. ID: " + id);
	});
	socket.on('error', function (err) {
		console.log("Error " + con.remoteAddress+":"+con.remotePort + ": " + err);
	});
    
    ///////////////////////////////////////////////////
    
    onPlayerNew(id, socket);
    
    ///////////////////////////////////////////////////
	
	socket.on('camera_pos', function (data) {
        clients[id].position.x = data.position.x;
        clients[id].position.y = data.position.y;
        clients[id].position.z = data.position.z;
        
        clients[id].rotation.x = data.orientation.x;
        clients[id].rotation.y = data.orientation.y;
        clients[id].rotation.z = data.orientation.z;
        clients[id].rotation.w = data.orientation.w;
	});
    socket.on('player_ready', function (data) {
        if(!clients[id].ready){
            console.log("ID: " + id + " ready.");
            clients[id].ready = data.ready;
            io.sockets.emit('ready_up', {id: id, type: clients[id].playerType});
        }
    });
    
    if(clients[player1] && clients[player1].ready){
        socket.emit('ready_up', {id: player1, type: clients[player1].playerType});
    }
    if(clients[player2] && clients[player2].ready){
        socket.emit('ready_up', {id: player2, type: clients[player2].playerType});
    }
    
    
	console.log(con.remoteAddress+":"+con.remotePort + " connected. ID: " + id);
});

function onPlayerNew(id, socket){
    var initPos = {
        position: new VROne.Vector3(0, aquariumHeight, 0),
        rotation: new VROne.Quaternion()
    };
    
    var playerType = "";
    if(isNaN(player1)){
        console.log("ID " + id + ": Player 1.");
        player1 = id;
        initPos.position.z = -17;
        initPos.rotation.fromEulerAngles(0, Math.PI, 0);
        panePlayer1.empty.parent = clients[id];
        panePlayer1.clientID = id;
        panePlayer1.active = true;
        playerType = "player1";
    }
    else if(isNaN(player2)){
        console.log("ID " + id + ": Player 2.");
        player2 = id;
        initPos.position.z = 17;
        panePlayer2.empty.parent = clients[id];
        panePlayer2.clientID = id;
        panePlayer2.active = true;
        playerType = "player2";
    }
    else{
        console.log("ID " + id + ": Spectator.");
        initPos.position.x = 15;
        initPos.rotation.fromEulerAngles(0, -Math.PI/2.0, 0);
        playerType = "spectator";
    }
    clients[id].playerType = playerType;
    
    socket.emit('change_positon', initPos);
    socket.emit('id', {id: id, type: playerType});
    io.sockets.emit('new_player', {id: id, type: playerType});
    
    for(var i=0; i < clientO3Ds.length; i++){
        var o = clientO3Ds[i];
        sendO3D_Client(o.type, o.id, o.args, false, socket);
    }
}
function onPlayerExit(id){
    if(id === player1){
        player1 = undefined;
        panePlayer1.active = false;
    }
    else if(id === player2){
        player2 = undefined;
        panePlayer2.active = false;
    }
}

init();
console.log("Starting loop.");
update();
send();
console.log('Der Server läuft nun unter http://'+conf.ip+':' + conf.port + '/');
