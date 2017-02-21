var starArray = [];
var starObjArray = [];
var renderItem = {};
var rayCasterObj = []
var TargetPoint = null;
var Font;
var perticleSys;
var moving = false;
var cam_move = false;
var login_player = {};
var SolarisSpeed = 0.001;
var UserLists;

window.onload = function(){
  $.ajax({
    type:'get',
    dataType: "json",
    url:'http://localhost:3333/renderJson',
    success:function(List){
      console.log(List);
      UserLists = List.data;
      main();
    },error:function(){
      console.log('error');
  }
  });
}

var main = function(){
  socket = io.connect(location.origin);

  socket.on('connect',function(){
    console.log('connect server');
    socket.emit("getRequest","Please me");
  });

  socket.on('obj',function(data){
    SolarisSpeed = 0.001;
    receiveStarObj(data);
  });

  socket.on('learn_start',function(data){
    SolarisSpeed = 0.05;
  });

  socket.on('Responce',function(data){
    login_player = data;
  });

  socket.on('add_player',function(data){
    login_player[data.id] = data.number;
  });

  socket.on('disconnect_player',function(data){
    console.log(data);
    delete login_player[data];
  });

  var solarisPartsPos = [];
  var scene = new THREE.Scene();
  var width = window.innerWidth;
  var height = window.innerHeight;
  var action = new actionCam();
  action.camera.position.set(0,0,1500);
  var renderer = new THREE.WebGLRenderer();
  renderer.setSize(width,height);
  document.body.appendChild(renderer.domElement);
  renderItem.renderer = renderer;
  renderItem.action = action;
  renderItem.scene = scene;
  var spotlight = new THREE.SpotLight(0xffffff);
  spotlight.position.set(0,0,1500);
  renderItem.scene.add(spotlight);
  renderItem.spotlight = spotlight;
  var directionalLight = new THREE.DirectionalLight(0xfffffff);
  directionalLight.position.set(0,0.7,0.7);
  renderItem.scene.add(directionalLight);

  // main Solaris
  var geometry = new THREE.SphereGeometry(380,50,50);
  var material = new THREE.MeshPhongMaterial({color:0x95bbff,
    transparent:true,
    map:THREE.ImageUtils.loadTexture(
        "../img/solaris.png"
        ),
    opacity:0.7,
  });
  var solaris = new THREE.Mesh(geometry,material);
  solaris.position.set(0,0,0);
  renderItem.scene.add(solaris);

  //background
  var Bgeometry = new THREE.SphereGeometry(10000, 100, 100);
  var texture = new THREE.ImageUtils.loadTexture("../img/Solaris_bg.jpg");
  texture.minFilter = THREE.LinearFilter;
  texture.flipY = false;
  var material = new THREE.MeshBasicMaterial({
    side: THREE.DoubleSide,
    color: 0xFFFFFF, specular: 0xcccccc, shininess:50, ambient: 0xffffff,
    map:texture
  });
  var mesh = new THREE.Mesh(Bgeometry, material);
  mesh.rotation.x += Math.PI; // 球体を回転させ、方向を調整
  renderItem.scene.add(mesh);

  // Solaris stars part1
  var particles = new THREE.Geometry();
  var pMaterial = new THREE.PointsMaterial({color:0xffffff,
    size:16,
    map:THREE.ImageUtils.loadTexture(
        "../img/solarislight.png"
        ),
    blending:THREE.AdditiveBlending,
    transparent:true,
    opacity:0.5,
    depthTest:false});
  for(var i = 0; i < 5000; i++){
    Solaris(Math.random()*360-180,Math.random()*360-180,Math.random()*1000,particles);
  }
  var blueparticleSystem = new THREE.Points(particles,pMaterial);
  renderItem.blue = blueparticleSystem;
  renderItem.scene.add(blueparticleSystem);

  // Solaris stars part2
  var particles = new THREE.Geometry();
  var pMaterial = new THREE.PointsMaterial({color:0xffffff,
    size:16,
    map:THREE.ImageUtils.loadTexture(
        "../img/solarislight2.png"
        ),
    blending:THREE.AdditiveBlending,
    transparent:true,
    opacity:0.5,
    depthTest:false});
  for(var i = 0; i < 2000; i++){
    Solaris(Math.random()*360-180,Math.random()*360-180,Math.random()*1000,particles);
  }
  var perpleparticleSystem = new THREE.Points(particles,pMaterial);
  renderItem.perple = perpleparticleSystem;
  renderItem.scene.add(perpleparticleSystem);

  // othre stars
  var particles = new THREE.Geometry();
  var pMaterial = new THREE.PointsMaterial({color:0xffffff,
    size:16,
    map:THREE.ImageUtils.loadTexture(
        "../img/othreStar.png"
        ),
    blending:THREE.AdditiveBlending,
    transparent:true,
    opacity:0.7,
    depthTest:false});
  for(var i = 0; i < 20000; i++){
    Solaris(Math.random()*4000-2000,Math.random()*4000-2000,Math.random()*40000,particles);
  }
  var othreStarSystem = new THREE.Points(particles,pMaterial);
  renderItem.othreStar = othreStarSystem;
  renderItem.scene.add(othreStarSystem);

  var loader = new THREE.FontLoader();
  console.log("start");
  loader.load('./font/07YasashisaGothic_Regular.js',function(font){
    Font = font;
    var loader = new THREE.TextureLoader();
    for(key in UserLists){
      var textureData = "data:image/jpeg;base64"+UserLists[key].img;
      var textureData = THREE.ImageUtils.loadTexture(textureData);
      starInit(key,loader,UserLists[key].name,textureData);
    }
    animation();
    mouse_controll(renderItem);
  });
  socket.emit('hello',{msg:starArray});
}


//function starInit(i,loader,text,textureData){
function starInit(i,loader,text,textureData){
  //var img = loader.load("img/MainVisual.jpg",function(texture){
  //	return texture;
  //});
  var r = Math.floor(Math.random()*255-0);
  var g = Math.floor(Math.random()*255-0);
  var b = Math.floor(Math.random()*255-0);
  var geometry = new THREE.SphereGeometry(15,5,5);
  var material = new THREE.MeshPhongMaterial({color:'rgb('+r+','+g+','+b+')',transparent:true,opacity:0.5,wireframe:true});
  var humans = new THREE.Mesh(geometry,material);
  var degree = 0;
  var speed = Math.random()*0.5;
  var random = {x:0,y:0,z:0};
  random.x = Math.random()*2000-1000;
  random.y = Math.random()*2000-1000;
  random.z = Math.random()*2000-1000;

  humans.position.set(random.x,
    random.y,
    random.z);

  var DisX = 0 - random.x;
  var DisY = 0 - random.y;
  var DisZ = 0 - random.z;
  var degree = Math.sqrt(Math.pow(DisX,2)+Math.pow(DisY,2)+Math.pow(DisZ,2));
  var earth_dis = Math.sqrt(Math.pow(DisX,2)+Math.pow(DisY,2)+Math.pow(DisZ,2));
  var box = new THREE.Mesh(
    new THREE.BoxGeometry(15, 15, 3),
    //new THREE.MeshLambertMaterial({map: img}) 
    new THREE.MeshLambertMaterial({map: textureData}) 
    );
  box.name = text;
  box.info = "info";
  rayCasterObj.push(box);
  box.position.set(humans.position.x,humans.position.y,humans.position.z);


  starArray[i] = {x:humans.position.x,y:humans.position.y,z:humans.position.z};


  var geoText = new THREE.TextGeometry(text,{font:Font,
    size:10,
    height:5});
  var textMat = new THREE.MeshLambertMaterial({color:'rgb('+r+','+b+','+g+')'});
  var Text = new THREE.Mesh(geoText,textMat);
  Text.position.set(humans.position.x,humans.position.y,humans.position.z);
  starObjArray[i] = new starObj(humans,box,degree,speed,i,random,Text,earth_dis);

  renderItem.scene.add(box);
  renderItem.scene.add(humans);
  renderItem.scene.add(Text);
}

function animation(){
  requestAnimationFrame(animation);
  renderItem.perple.rotation.y -= SolarisSpeed;
  renderItem.blue.rotation.y += SolarisSpeed;
  renderItem.action.controll.update();
  if(moving){
    for(var i = 0; i < starObjArray.length; i++){
      starObjArray[i].move();
      starObjArray[i].imgAnim();
      starObjArray[i].textAnim();
    }
    renderItem.action.move();
  }else{
    for(var i = 0; i < starObjArray.length; i++){
      starObjArray[i].randomMove();
      starObjArray[i].imgAnim();
      starObjArray[i].textAnim();
    }
    renderItem.action.return_move();
  }
  renderItem.spotlight.position.x = renderItem.action.camera.position.x;
  renderItem.spotlight.position.y = renderItem.action.camera.position.y;
  renderItem.spotlight.position.z = renderItem.action.camera.position.z;
  renderItem.renderer.render(renderItem.scene,renderItem.action.camera);
}

function changeTarget(){
  TargetPoint = starObjArray.length-1;
  for(var i = 0; i < starObjArray.length; i++){
    starObjArray[i].similarPoint = Math.floor(Math.random()*10+1);
    starObjArray[i].reached = true;
    starObjArray[i].target_dis = 150 * starObjArray[i].similarPoint;
    starObjArray[i].sphere.position.set(starObjArray[i].defaultPos.x,
        starObjArray[i].defaultPos.y,
        starObjArray[i].defaultPos.z)
  }
}

function Solaris(lat,longi,radius,particles){
  var phi = lat * Math.PI/180;
  var theta = (longi-180) * Math.PI/180;
  var x = -(radius) * Math.cos(phi) * Math.cos(theta);
  var y = (radius) * Math.sin(phi);
  var z = radius * Math.cos(phi) * Math.sin(theta);
  var particle = new THREE.Vector3(x,y,z);
  particles.vertices.push(particle);
}


function SolarisBlue(lat,longi,radius,posArray){
  var phi = lat * Math.PI/180;
  var theta = (longi-180) * Math.PI/180;
  var x = -(radius) * Math.cos(phi) * Math.cos(theta);
  var y = (radius) * Math.sin(phi);
  var z = radius * Math.cos(phi) * Math.sin(theta);
  var geometry = new THREE.SphereGeometry(1,2,2);
  var material = new THREE.MeshPhongMaterial({color:0x44bbff,transparent:true,opacity:1,wireframe:true});
  var SolarisParts = new THREE.Mesh(geometry,material);
  SolarisParts.position.set(x,y,z);
  posArray.push({x:x,y:y,z:z});
  renderItem.scene.add(SolarisParts);
}

function starObj(sphere,img,degree,speed,id,defaultPos,text,dis){
  this.id = id;
  this.sphere = sphere;
  this.img = img;
  this.text = text;
  this.degree = degree;
  this.speed = speed;
  this.name;
  this.similarPoint = 0;
  this.partner = 0;
  this.beforeTargetPos = defaultPos;
  this.randomTarget = defaultPos;
  this.defaultPos = defaultPos;
  this.dis = dis;
  this.target_dis = 0;
  this.reacehed = false;
  this.center = {x:0,y:0,z:0};
}

function actionCam(){
  this.width = window.innerWidth;
  this.height = window.innerHeight;
  this.fov = 60;
  this.aspect = this.width/this.height;
  this.near = 1;
  this.far = 1000000;
  this.speed = 20;
  this.vx;
  this.vy;
  this.vz;
  this.cvz;
  this.camera = new THREE.PerspectiveCamera(this.fov,this.aspect,this.near,this.far);
  this.controll = new THREE.OrbitControls(this.camera); 
  //this.controll.autoRotate = true; 
  this.controll.minDistance = 100; 
  this.controll.maxDistance = 5000; 
}

starObj.prototype.move = function(){
  var radian = Math.PI/180*this.degree;
  var x = 2*Math.cos(radian);
  if(!(TargetPoint == this.id)){
    this.degree += 0.1;
    var rad = this.degree * Math.PI / 180;
    var DisX = starObjArray[TargetPoint].sphere.position.x - this.center.x;
    var DisY = starObjArray[TargetPoint].sphere.position.y - this.center.y;
    var DisZ = starObjArray[TargetPoint].sphere.position.z - this.center.z;
    var Dis = Math.sqrt(Math.pow(DisX,2)+Math.pow(DisY,2)+Math.pow(DisZ,2));
    if(Dis > 50*this.similarPoint && this.reached){
      var vecX = DisX/Dis;
      var vecY = DisY/Dis;
      var vecZ = DisZ/Dis;
      this.center.x += vecX*10;
      this.center.y += vecY*10;
      this.center.z += vecZ*10;
      var rot_x = this.center.x - this.target_dis * Math.cos(rad);
      var rot_y = this.center.y - this.target_dis * Math.sin(rad);
      var rot_z = this.center.z - this.target_dis * Math.cos(rad) * Math.sin(rad);
      this.sphere.position.x =rot_x;
      this.sphere.position.y =rot_y;
      this.sphere.position.z =rot_z;
    }else{
      this.reached = false;
      var rot_x = this.center.x - this.target_dis * Math.cos(rad);
      var rot_y = this.center.y - this.target_dis * Math.sin(rad);
      var rot_z = this.center.z - this.target_dis * Math.cos(rad) * Math.sin(rad);
      this.sphere.position.x =rot_x;
      this.sphere.position.y =rot_y;
      this.sphere.position.z =rot_z;
    }
    this.sphere.scale.set(1/this.similarPoint,1/this.similarPoint,1/this.similarPoint);
    this.img.scale.set(1/this.similarPoint,1/this.similarPoint,1/this.similarPoint);
    this.text.scale.set(1/this.similarPoint,1/this.similarPoint,1/this.similarPoint);
  }else{
    this.sphere.rotation.y += this.speed;
  }
  var lat_y = Math.atan2(renderItem.action.camera.position.x-this.img.position.x,renderItem.action.camera.position.z-this.img.position.z);
  var lat_x = Math.atan2(renderItem.action.camera.position.y,renderItem.action.camera.position.z)-Math.atan2(this.img.position.y,this.img.position.z);
  this.img.rotation.y = lat_y;
  this.text.rotation.y = lat_y;
  this.img.rotation.x = lat_x;
}

starObj.prototype.randomMove = function(){
  this.degree += this.speed;
  var rad = this.degree * Math.PI / 180;
  var rot_x = this.center.x - this.dis * Math.cos(rad);
  var rot_y = this.center.y - this.dis * Math.sin(rad);
  var rot_z = this.center.z - this.dis * Math.cos(rad) * Math.sin(rad);
  var DisX = 0 - this.center.x;
  var DisY = 0 - this.center.y;
  var DisZ = 0 - this.center.z;
  var lat_y = Math.atan2(renderItem.action.camera.position.x-this.img.position.x,renderItem.action.camera.position.z-this.img.position.z);
  var lat_x = Math.atan2(renderItem.action.camera.position.y,renderItem.action.camera.position.z)-Math.atan2(this.img.position.y,this.img.position.z);
  var Dis = Math.sqrt(Math.pow(DisX,2)+Math.pow(DisY,2)+Math.pow(DisZ,2));
  var vecX = DisX/Dis;
  var vecY = DisY/Dis;
  var vecZ = DisZ/Dis;
  if(Dis > 10){
    this.center.x += vecX*20;
    this.center.y += vecY*20;
    this.center.y += vecY*20;
    this.sphere.position.x =rot_x;
    this.sphere.position.y =rot_y;
    this.sphere.position.z =rot_z;
  }else if(Dis < 10){
    this.sphere.position.x =rot_x;
    this.sphere.position.y =rot_y;
    this.sphere.position.z =rot_z;
  }
  this.img.rotation.y = lat_y;
  this.text.rotation.y = lat_y;
  this.img.rotation.x = lat_x;

}

starObj.prototype.imgAnim = function(){
	this.img.position.x = this.sphere.position.x;
	this.img.position.y = this.sphere.position.y;
	this.img.position.z = this.sphere.position.z;
}

starObj.prototype.textAnim = function(){
	this.text.position.x = this.sphere.position.x;
	this.text.position.y = this.sphere.position.y;
	this.text.position.z = this.sphere.position.z;
}

actionCam.prototype.move = function(){
  var DisX = starObjArray[TargetPoint].sphere.position.x*1.1 - this.camera.position.x;
  var DisY = starObjArray[TargetPoint].sphere.position.y*1.1 - this.camera.position.y;
  var DisZ = starObjArray[TargetPoint].sphere.position.z*1.1 - this.camera.position.z;
  var Dis = Math.sqrt(Math.pow(DisX,2)+Math.pow(DisY,2)+Math.pow(DisZ,2));
  this.vx = DisX/Dis;
  this.vy = DisY/Dis;
  this.vz = DisZ/Dis;

  if(Dis >= this.speed){
    var r = Dis/this.speed;
  }
  if(Dis > 30 && cam_move){
    this.camera.position.x += this.vx*r;
    this.camera.position.y += this.vy*r;
    this.camera.position.z += this.vz*r;
    this.camera.lookAt(new THREE.Vector3(0,0,0));
  }else{
    cam_move = false;
  }
  this.camera.lookAt(new THREE.Vector3(starObjArray[TargetPoint].sphere.position.x,starObjArray[TargetPoint].sphere.position.y,starObjArray[TargetPoint].sphere.position.z));
}


actionCam.prototype.return_move = function(){
  var DisX = 0 - this.camera.position.x;
  var DisY = 0 - this.camera.position.y;
  var DisZ = 1500 - this.camera.position.z;
  var Dis = Math.sqrt(Math.pow(DisX,2)+Math.pow(DisY,2)+Math.pow(DisZ,2));
  this.vx = DisX/Dis;
  this.vy = DisY/Dis;
  this.vz = DisZ/Dis;

  if(Dis >= this.speed){
    var r = Dis/this.speed;
  }
  if(Dis > 30 && cam_move){
    this.camera.position.x += this.vx*r;
    this.camera.position.y += this.vy*r;
    this.camera.position.z += this.vz*r;
    this.camera.lookAt(new THREE.Vector3(0,0,0));
  }else{
    cam_move = false;
  }
}

//function receiveStarObj(text){
//	var loader = new THREE.TextureLoader();
//	starInit(starObjArray.length,loader,text);
//	moving = true;
//	cam_move = true;
//	changeTarget();
//    setTimeout(function(){
//		moving = false;
//		cam_move = true;
//	},20000);
//}

function receiveStarObj(user_data){
  var image_data = "data:image/jpeg;base64"+user_data['img'];
  var texture = THREE.ImageUtils.loadTexture(image_data);
  var loader = new THREE.TextureLoader();
  var loader = new THREE.Texture();
  starInit(starObjArray.length,loader,user_data['name'],texture);
  moving = true;
  cam_move = true;
  changeTarget();
  setTimeout(function(){
    moving = false;
    cam_move = true;
  },20000);
}
