var starArray = [];
var starObjArray = [];
var renderItem = {};
var TargetPoint = 0;
var Font;
var perticleSys;
var moving = false;

window.onload = function(){
	socket = io.connect(location.origin);

	socket.on('connect',function(){
		console.log('connect server');
	});

	socket.on('obj',function(data){
		receiveStarObj(data);
	});

	socket.on("getList",function(list){
		console.log(list);
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
	//SolarisLine(solarisPartsPos);
	var loader = new THREE.FontLoader();
	console.log("start");
	loader.load('./font/07YasashisaGothic_Regular.js',function(font){
		Font = font;
		var loader = new THREE.TextureLoader();
		for(var i = 0; i < 100; i++){
			starInit(i,loader,"test");
		}
		animation();
		randomTarget();
	});
	socket.emit('hello',{msg:starArray});
}


//function starInit(i,loader,text,textureData){
function starInit(i,loader,text){
	var img = loader.load("img/MainVisual.jpg",function(texture){
		return texture;
	});
	var r = Math.floor(Math.random()*255-0);
	var g = Math.floor(Math.random()*255-0);
	var b = Math.floor(Math.random()*255-0);
	var geometry = new THREE.SphereGeometry(15,5,5);
	var material = new THREE.MeshPhongMaterial({color:'rgb('+r+','+g+','+b+')',transparent:true,opacity:0.5,wireframe:true});
	var humans = new THREE.Mesh(geometry,material);
	var degree = 0;
	var speed = Math.random()*2;
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
        new THREE.MeshLambertMaterial({map: img}) 
        //new THREE.MeshLambertMaterial({map: textureData}) 
    );
    box.position.set(humans.position.x,humans.position.y,humans.position.z);
	

	starArray[i] = {x:humans.position.x,y:humans.position.y,z:humans.position.z};
	
	var lineGeometry = new THREE.BufferGeometry();
	var positions = new Float32Array(2*3);
	lineGeometry.addAttribute('position', new THREE.BufferAttribute(positions, 3));
	var array = lineGeometry.attributes.position.array;
	array[0] = humans.position.x;
	array[1] = humans.position.y;
	array[2] = humans.position.z;
	array[3] = humans.position.x;
	array[4] = humans.position.y;
	array[5] = humans.position.z;

	lineGeometry.addGroup(0, 2, 0);

	//var line = new THREE.Line(lineGeometry,new THREE.LineBasicMaterial({color:'rgb('+r+','+g+','+b+')',transparent:true,opacity:0.5}));
	var line = new THREE.Line(lineGeometry,new THREE.LineBasicMaterial({color:0x44bbff,transparent:true,opacity:0.3}));

	var geoText = new THREE.TextGeometry(text,{font:Font,
													size:10,
													height:5});
	var textMat = new THREE.MeshLambertMaterial({color:'rgb('+r+','+b+','+g+')'});
	var Text = new THREE.Mesh(geoText,textMat);
	Text.position.set(humans.position.x,humans.position.y,humans.position.z);
	starObjArray[i] = new starObj(humans,box,line,degree,speed,i,random,Text,earth_dis);

	renderItem.scene.add(box);
	renderItem.scene.add(line);
	renderItem.scene.add(humans);
	renderItem.scene.add(Text);
}

function animation(){
	requestAnimationFrame(animation);
	renderItem.perple.rotation.y -= 0.001;
	renderItem.blue.rotation.y += 0.001;
	renderItem.action.controll.update();
	if(moving){
		for(var i = 0; i < starObjArray.length; i++){
			starObjArray[i].move();
			starObjArray[i].imgAnim();
			starObjArray[i].lineAnim();
			starObjArray[i].textAnim();
		}
		renderItem.action.move();
	}else{
		for(var i = 0; i < starObjArray.length; i++){
			starObjArray[i].randomMove();
			starObjArray[i].imgAnim();
			//starObjArray[i].lineAnim();
			starObjArray[i].textAnim();
		}
	}
	renderItem.spotlight.position.x = renderItem.action.camera.position.x;
	renderItem.spotlight.position.y = renderItem.action.camera.position.y;
	renderItem.spotlight.position.z = renderItem.action.camera.position.z;
	renderItem.renderer.render(renderItem.scene,renderItem.action.camera);
}

function changeTarget(){
	//TargetPoint = Math.floor(Math.random()*starObjArray.length);
	TargetPoint = starObjArray.length-1;
	//var DisX = 0 + starObjArray[TargetPoint].sphere.position.x*1.1;
	//var DisY = 0 + starObjArray[TargetPoint].sphere.position.y*1.1;
	//var DisZ = 0 + starObjArray[TargetPoint].sphere.position.z*1.1;
	//var Dis = Math.sqrt(Math.pow(DisX,2)+Math.pow(DisY,2)+Math.pow(DisZ,2));
	//console.log(Dis);
	for(var i = 0; i < starObjArray.length; i++){
		starObjArray[i].similarPoint = Math.floor(Math.random()*10+1);
		starObjArray[i].sphere.position.set(starObjArray[i].defaultPos.x,
											starObjArray[i].defaultPos.y,
											starObjArray[i].defaultPos.z)
	}
	//setTimeout(function(){
	//	changeTarget();
	//},10000);
}

function randomTarget(){
	var nowTime = new Date();
	var nowHour = nowTime.getHours();
	var nowMin = nowTime.getMinutes();
	var nowSec = nowTime.getSeconds();
	var msg = "TIME " + nowHour + "H " + nowMin + "M " + nowSec + "S";
	document.getElementById("clock").innerHTML = msg;
	for(var i = 0; i < starObjArray.length; i++){
		var NoOwnTarget = [];
		for(var j = 0; j<starObjArray.length; j++){
			NoOwnTarget[j] = j;
		}
		NoOwnTarget.splice(i,1);
		starObjArray[i].line.material.color.r = Math.random();
		starObjArray[i].line.material.color.g = Math.random();
		starObjArray[i].line.material.color.b = Math.random();
		starObjArray[i].partner = NoOwnTarget[Math.floor(Math.random()*8)];
		starObjArray[i].beforeTargetPos.x = starObjArray[i].sphere.position.x;
		starObjArray[i].beforeTargetPos.y = starObjArray[i].sphere.position.y;
		starObjArray[i].beforeTargetPos.z = starObjArray[i].sphere.position.z;
		starObjArray[i].randomTarget = {
			x:Math.random()*2000-1000,
			y:Math.random()*2000-1000,
			z:Math.random()*2000-1000
		}
	}
	console.log('change');
	setTimeout(function(){
		randomTarget();
	},10000);
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

function SolarisLine(posArray){
	for(var i = 0; i < 1999; i++){
		var lineGeometry = new THREE.BufferGeometry();
		var positions = new Float32Array(2*3);
		lineGeometry.addAttribute('position', new THREE.BufferAttribute(positions, 3));
		var array = lineGeometry.attributes.position.array;
		array[0] = posArray[i].x;
		array[1] = posArray[i].y;
		array[2] = posArray[i].z;
		array[3] = posArray[i+1].x;
		array[4] = posArray[i+1].y;
		array[5] = posArray[i+1].z;

		lineGeometry.addGroup(0, 2, 0);

		var line = new THREE.Line(lineGeometry,new THREE.LineBasicMaterial({color:0x44bbff}));
		renderItem.scene.add(line);
	}
}

function starObj(sphere,img,line,degree,speed,id,defaultPos,text,dis){
	this.id = id;
	this.sphere = sphere;
	this.img = img;
	this.text = text;
	this.line = line;
	this.degree = degree;
	this.speed = speed;
	this.name;
	this.similarPoint = 0;
	this.partner = 0;
	this.beforeTargetPos = defaultPos;
	this.randomTarget = defaultPos;
	this.defaultPos = defaultPos;
	this.dis = dis;
}

function actionCam(){
	this.width = window.innerWidth;
	this.height = window.innerHeight;
	this.fov = 60;
	this.aspect = this.width/this.height;
	this.near = 1;
	this.far = 10000;
	this.speed = 20;
	this.vx;
	this.vy;
	this.vz;
	this.cvz;
	this.camera = new THREE.PerspectiveCamera(this.fov,this.aspect,this.near,this.far);
	this.controll = new THREE.OrbitControls(this.camera); 
}

starObj.prototype.move = function(){
	var radian = Math.PI/180*this.degree;
	var x = 2*Math.cos(radian);
	if(!(TargetPoint == this.id)){
		var DisX = starObjArray[TargetPoint].sphere.position.x - this.sphere.position.x;
		var DisY = starObjArray[TargetPoint].sphere.position.y - this.sphere.position.y;
		var DisZ = starObjArray[TargetPoint].sphere.position.z - this.sphere.position.z;
		var Dis = Math.sqrt(Math.pow(DisX,2)+Math.pow(DisY,2)+Math.pow(DisZ,2));
		if(Dis > 50*this.similarPoint){
			var vecX = DisX/Dis;
			var vecY = DisY/Dis;
			var vecZ = DisZ/Dis;
			this.sphere.position.x += vecX*10;
			this.sphere.position.y += vecY*10;
			this.sphere.position.z += vecZ*10;
		}
		this.sphere.scale.set(1/this.similarPoint,1/this.similarPoint,1/this.similarPoint);
		this.img.scale.set(1/this.similarPoint,1/this.similarPoint,1/this.similarPoint);
		this.text.scale.set(1/this.similarPoint,1/this.similarPoint,1/this.similarPoint);
	}else{
		this.sphere.rotation.y += this.speed;
	}
	var lat_y = Math.atan2(renderItem.action.camera.position.x-this.img.position.x,renderItem.action.camera.position.z-this.img.position.z);
	//var lat_x = Math.atan2(renderItem.action.camera.position.y-this.img.position.y,renderItem.action.camera.position.z-this.img.position.z);
	var lat_x = Math.atan2(renderItem.action.camera.position.y,renderItem.action.camera.position.z)-Math.atan2(this.img.position.y,this.img.position.z);
	this.img.rotation.y = lat_y;
	this.text.rotation.y = lat_y;
	this.img.rotation.x = lat_x;
}

starObj.prototype.randomMove = function(){
	this.degree += this.speed;
    var rad = this.degree * Math.PI / 180;
	var rot_x = 0 - this.dis * Math.cos(rad);
    var rot_y = 0 - this.dis * Math.sin(rad);
	var rot_z = 0 - rot_x + rot_y /2;
	//var rot_x = this.dis * Math.cos(rad);
    //var rot_y = this.dis * Math.sin(rad);
	var DisX = this.randomTarget.x - this.sphere.position.x;
	var DisY = this.randomTarget.y - this.sphere.position.y;
	var DisZ = this.randomTarget.z - this.sphere.position.z;
	//var lat = Math.atan2(renderItem.action.camera.position.z-this.img.position.z,renderItem.action.camera.position.x-this.img.position.x);
	var lat_y = Math.atan2(renderItem.action.camera.position.x-this.img.position.x,renderItem.action.camera.position.z-this.img.position.z);
	var lat_x = Math.atan2(renderItem.action.camera.position.y,renderItem.action.camera.position.z)-Math.atan2(this.img.position.y,this.img.position.z);
	//var lat_x = Math.atan2(renderItem.action.camera.position.y-this.img.position.y,renderItem.action.camera.position.z-this.img.position.z);
	//console.log(lat*Math.PI/180);
	var Dis = Math.sqrt(Math.pow(DisX,2)+Math.pow(DisY,2)+Math.pow(DisZ,2));
	var vecX = DisX/Dis;
	var vecY = DisY/Dis;
	var vecZ = DisZ/Dis;
	if(Dis > 10){
		//this.sphere.position.x += vecX*20;
		//this.sphere.position.y += vecY*20;
		//this.sphere.position.y += vecY*20;
		//this.sphere.position.x =rot_x;
		//this.sphere.position.y =rot_y;
		//this.sphere.position.z =rot_y;
	//}else if(Dis < 10){
	//	this.sphere.position.x += rot_x;
	//	this.sphere.position.y += rot_y;
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

starObj.prototype.lineAnim = function(){
	if(moving){
		this.line.geometry.attributes.position.array[0] = this.sphere.position.x;
		this.line.geometry.attributes.position.array[1] = this.sphere.position.y;
		this.line.geometry.attributes.position.array[2] = this.sphere.position.z;
		this.line.geometry.attributes.position.array[3] = starObjArray[TargetPoint].sphere.position.x;
		this.line.geometry.attributes.position.array[4] = starObjArray[TargetPoint].sphere.position.y;
		this.line.geometry.attributes.position.array[5] = starObjArray[TargetPoint].sphere.position.z;
	}else{
		if(this.partner == this.id){
		 	var DisX = 0 - this.line.geometry.attributes.position.array[3];
		 	var DisY = 0 - this.line.geometry.attributes.position.array[4];
		 	var DisZ = 0 - this.line.geometry.attributes.position.array[5];
		}else{
			var DisX = starObjArray[this.partner].sphere.position.x - this.line.geometry.attributes.position.array[3];
			var DisY = starObjArray[this.partner].sphere.position.y - this.line.geometry.attributes.position.array[4];
			var DisZ = starObjArray[this.partner].sphere.position.z - this.line.geometry.attributes.position.array[5];
		}
		//var DisX = 0 - this.line.geometry.attributes.position.array[3];
		//var DisY = 0 - this.line.geometry.attributes.position.array[4];
		//var DisZ = 0 - this.line.geometry.attributes.position.array[5];
		var Dis = Math.sqrt(Math.pow(DisX,2)+Math.pow(DisY,2)+Math.pow(DisZ,2));
		this.line.geometry.attributes.position.array[0] = this.sphere.position.x;
		this.line.geometry.attributes.position.array[1] = this.sphere.position.y;
		this.line.geometry.attributes.position.array[2] = this.sphere.position.z;
		if(Dis < 10){
			this.line.geometry.attributes.position.array[3] = this.sphere.position.x;
			this.line.geometry.attributes.position.array[4] = this.sphere.position.y;
			this.line.geometry.attributes.position.array[5] = this.sphere.position.z;
		}
		this.line.geometry.attributes.position.array[3] += (DisX/Dis)*10;
		this.line.geometry.attributes.position.array[4] += (DisY/Dis)*10;
		this.line.geometry.attributes.position.array[5] += (DisZ/Dis)*10;
		//this.line.geometry.attributes.position.array[3] = 0;
		//this.line.geometry.attributes.position.array[4] = 0;
		//this.line.geometry.attributes.position.array[5] = 0;
	}
	this.line.geometry.setDrawRange(0, 2);
	this.line.geometry.attributes.position.needsUpdate = true;
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
	if(Dis > 30){
		this.camera.position.x += this.vx*r;
		this.camera.position.y += this.vy*r;
		this.camera.position.z += this.vz*r;
		//console.log(this.camera.position);
	}
	this.camera.lookAt(new THREE.Vector3(0,0,0));
}

function receiveStarObj(text){
	var loader = new THREE.TextureLoader();
	//var loader = new THREE.Texture();
	starInit(starObjArray.length,loader,text);
	moving = true;
	changeTarget();

}

//function receiveStarObj(user_data){
//	var image_data = "data:image/jpeg;base64"+user_data['img'];
//	var texture = THREE.ImageUtils.loadTexture(image_data);
//	var loader = new THREE.TextureLoader();
	//var loader = new THREE.Texture();
//	starInit(starObjArray.length,loader,user_data['name'],texture);
//	moving = true;
//	changeTarget();
 //   console.log(user_data['img'])

//}
