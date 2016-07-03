/*jslint browser: true*/

var PongVRSocket = function(io){
    var ip = "http://127.0.0.1:8081";
    //var ip = "https://januskopf.com:8080";
    var scope = this;
    var socket, socketID;

    if(typeof io === 'undefiend'){
        io = null;
    }

    this.onGameID = null;
    this.onPlayerID = null;

    this.onPlayerJoins = null;
    this.onPlayerPosition = null;
    this.onPlayerReadyUp = null;
    this.onPlayerReadyCanceled = null;
    this.onPlayerScores = null;
    this.onPlayerRemove = null;

    this.onO3DCreate = null;
    this.onO3DCollision = null;
    this.onO3DUpdate = null;
    this.onO3DRemove = null;

    this.onPositionUpdate = null;
    this.onCountdownStart = null;

    this.openSocket = function(){
        if(io === undefined || !io){
            //alert("Can't connect to server. Please try again later.");
            document.getElementById("server-status").innerHTML = "Unfortunately the PongVR server is not available at this point. Please try again later."
            return;
        }
        socket = io.connect(ip);
    };
    //Basic socket communication
    this.socketBasicCom = function(){
        if(io === undefined || !io)return;
        socket.on('connect',        function () {
            console.log("Connected to Websocket");
            //document.getElementById("server-status").style.display = "none";  // TODO: use display:none instead
        });
        socket.on('reconnect',      function () {
            console.log("Reconnected to Websocket");
            //document.getElementById("server-status").style.display = "none";
            document.getElementById("server-status").innerHTML = ""
        });
        socket.on('reconnecting',   function () {
            console.log("reconnecting...");
            //document.getElementById("server-status").style.display = "inline";
            document.getElementById("server-status").innerHTML = "Unfortunately the PongVR server is not available at this point. Please try again later."
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
        socket.on('game_id',        scope.onGameID);
    };
    //Game related communication
    this.socketGameCom = function(){
        if(io === undefined || !io)return;

        socket.on('id',             scope.onPlayerID);
        socket.on('new_player',     scope.onPlayerJoins);
        socket.on('add_O3D',        scope.onO3DCreate);             // wird bei 5 bällen 5 mal aufgerufen
        socket.on('remove_O3D',     scope.onO3DRemove);             // wird nie aufgerufen
        socket.on('update_O3D',     scope.onO3DUpdate);             // balls als einzelne objekte im array
        socket.on('change_positon', scope.onPositionUpdate);
        socket.on('player_pos',     scope.onPlayerPosition);
        socket.on('remove_player',  scope.onPlayerRemove);
        socket.on('cancel_ready',   scope.onPlayerReadyCanceled);
        socket.on('collision',      scope.onO3DCollision);
        socket.on('score',          scope.onPlayerScores);
        socket.on('countdown',      scope.onCountdownStart);
        socket.on('ready_up',       scope.onPlayerReadyUp);

        socket.emit('join_game', joinID);
    };
    //Send functions
    this.sendCameraData = function(scene){
        if (!socket)return;
        
        var cc = scene.getCamera().getManager();
        socket.emit('camera_pos', {
            position: cc.getGlobalPosition(), 
            orientation: cc.getGlobalRotation()
        });
    };
    this.sendPlayerReady = function(){
        if(!socket)return;
        
        socket.emit('player_ready', {ready: true});
    };
};