Game.Arena = function(scene, timeObject){

  var path = "assets/";

  arenaO3Ds = new Ayce.OBJLoader(path + "obj/arena/arena.obj");
  var screens = arenaO3Ds["screens"];
  screens.shader = path + "obj/arena/arena_screens";
  screens.addShaderUniform("uTime", "uniform1f", timeObject, ["time"]);

  for (var i = 0; i < arenaO3Ds.length; i++) {
      var obj = arenaO3Ds[i];
      scene.addToScene(obj);
  }

};
