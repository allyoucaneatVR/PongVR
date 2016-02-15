/*jslint browser: true*/
/*global Ayce, io*/

//var ip = "http://127.0.0.1:8081";
var ip = "https://januskopf.com:8080";

var gameId = null;
var socket, socketID;
var playerBodies = [];
var playerType = null;

if(typeof io === 'undefiend'){
    var io = null;
}

window.addEventListener("load", function(){
    openSocket();
    socketBasicCom();
});

function openSocket(){
    if(io === undefined || !io){
        alert("Can't connect to server. Please try again later.");
        return;
    }
    socket = io.connect(ip);
}
//Basic socket communication
function socketBasicCom(){
    if(io === undefined || !io)return;
    socket.on('connect',        function () {
        console.log("Connected to Websocket");
    });
    socket.on('reconnect',      function () {
        console.log("Reconnected to Websocket");
    });
    socket.on('reconnecting',   function () {
        console.log("reconnecting...");
    });
    socket.on('disconnect',     function (data) {
        console.log("Disconnect: ", data);
//TODO ???
//        for(var i=0; i < playerBodies.length; i++){
//            if(playerBodies[i]){
//                var p = playerBodies[data.id];
//
//                for(var part in p.body.bodyParts){
//                    scene.removeFromScene(p.body.bodyParts[part]);
//                }
//
//                scene.removeFromScene(p.head);
//                scene.removeFromScene(p.body);
//                scene.removeFromScene(p.pane);
//
//                playerBodies[data.id] = null;
//            }
//        }
    });
    socket.on('error',          function (err) {
        console.log("Socket Error: " + err);
    });
    socket.on('game_id',        function (id){
        gameId = id;
        console.log(gameId);
    });
}
//Game related communication
function socketGameCom(){
    if(io === undefined || !io)return;
    socket.on('id',             function(data){
        socketID = data.id;
        playerType = data.type;
        if(playerType=="player2") negateObjectDirection();
    });
    socket.on('new_player',     function(data){
        //TODO other player data
    });
    socket.on('add_O3D',        function(data){
        if(serverO3Ds[data.id])return;

        var o3D = null;

        if(data.type == "sphere"){
//                console.log("Adding Sphere");
            //o3D = new Ayce.Geometry.Sphere(0.2).getO3D();
            o3D = ball;
        }

        if(data.type == "pane"){
            if(
                (data.id != "paneP1" || playerType != "player1") &&
                (data.id != "paneP2" || playerType != "player2")
            ){
//                    console.log("Adding Pane");
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
    });
    socket.on('remove_O3D',     function(data){
        var o3D = serverO3Ds[data.id];
        if(o3D){
            scene.removeFromScene(o3D);
            serverO3Ds.delete(data.id);
        }
    });
    socket.on('update_O3D',     function(data){
        for(var i=0; i < data.length; i++){
            var d = data[i];
            var o3D = serverO3Ds[d.id];
            if(o3D){
                setO3DAttributes(d, o3D);
            }
        }
    });
    socket.on('change_positon', function(data){
        var p = data.position;
        var o = data.rotation;
        cameraConfig.position.set(p.x, p.y, p.z);
        cameraConfig.orientation.set(o.x, o.y, o.z, o.w);
    });
    socket.on('player_pos',     function(data){
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
    });
    socket.on('remove_player',  function(data){
        var p = playerBodies[data.id];

        console.log("removing player with id " + data.id);

        for(var part in p.body.bodyParts){
            scene.removeFromScene(p.body.bodyParts[part]);
        }

        scene.removeFromScene(p.head);
        scene.removeFromScene(p.body);

        playerBodies[data.id] = null;
    });
    socket.on('cancel_ready', function(data){
        onReadyCancled(data.type);
    });
    socket.on('collision',      function(data){
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
    });
    socket.on('score',          function(data){
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
        }
        if(data.score2>=5){
            console.log("player 2 win");
            winlose.visible = true;
            if(playerType=="player1"){
                gameOverObject.win = 1;
            }
            gameOverObject.runAnimation = true;
        }
    });
    socket.on('countdown',      function(data){
        onServerCountdown();
    });
    socket.on('ready_up',       function(data){
        onReadyUp(data.type);
        console.log(data.type + " ready.");
    });
    
    socket.emit('join_game', joinID);
}