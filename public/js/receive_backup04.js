var starArray = [];
var starObjArray = [];
var renderItem = {};
var TargetPoint = 0;
var Font;

window.onload = function(){
	socket = io.connect(location.origin);

	socket.on('connect',function(){
		console.log('connect server');
	});

	var solarisPartsPos = [];
	var scene = new THREE.Scene();
	var width = window.innerWidth;
	var height = window.innerHeight;
	var action = new actionCam();
	action.camera.position.set(0,0,1000);
	var renderer = new THREE.WebGLRenderer();
	renderer.setSize(width,height);
	document.body.appendChild(renderer.domElement);
	renderItem.renderer = renderer;
	renderItem.action = action;
	renderItem.scene = scene;

	var directionalLight = new THREE.DirectionalLight(0xfffffff);
	directionalLight.position.set(0,0.7,0.7);
	renderItem.scene.add(directionalLight);

	var geometry = new THREE.SphereGeometry(180,50,50);
	var material = new THREE.MeshPhongMaterial({color:0x95bbff,
												transparent:true,
												map:THREE.ImageUtils.loadTexture(
													"../img/solaris2.png"
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
		Solaris(Math.random()*360-180,Math.random()*360-180,Math.random()*200,particles);
	}
	var perpleparticleSystem = new THREE.Points(particles,pMaterial);
    renderItem.perple = perpleparticleSystem;
	renderItem.scene.add(perpleparticleSystem);
	//SolarisLine(solarisPartsPos);
	var loader = new THREE.FontLoader();
	console.log("start");
	loader.load('./font/07YasashisaGothic_Regular.js',function(font){
		console.log(font);
		Font = font;
		starInit();
	});
	socket.emit('hello',{msg:starArray});
}


function starInit(){
	var loader = new THREE.TextureLoader();
	for(var i = 0; i < 100; i++){
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
		random.x = Math.random()*2000-100;
		random.y = Math.random()*2000-100;
		random.z = Math.random()*2000-100;

		humans.position.set(random.x,
							random.y,
							random.z);

        var box = new THREE.Mesh(
            new THREE.BoxGeometry(15, 15, 3),
            new THREE.MeshLambertMaterial({map: img}) 
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
		array[3] = 0;
		array[4] = 0;
		array[5] = 0;

		lineGeometry.addGroup(0, 2, 0);

		//var line = new THREE.Line(lineGeometry,new THREE.LineBasicMaterial({color:'rgb('+r+','+g+','+b+')',transparent:true,opacity:0.5}));
		var line = new THREE.Line(lineGeometry,new THREE.LineBasicMaterial({color:0x44bbff,transparent:true,opacity:0.3}));

		var geoText = new THREE.TextGeometry("Kuchu",{font:Font,
														size:10,
														height:5});
		var textMat = new THREE.MeshLambertMaterial({color:0xffffff});
		//var textMat = new THREE.MeshLambertMaterial({color:'rgb('+r+','+b+','+g+')'});
		var Text = new THREE.Mesh(geoText,textMat);
		Text.position.set(humans.position.x,humans.position.y,humans.position.z);
		starObjArray[i] = new starObj(humans,box,line,degree,speed,i,random,Text);

		renderItem.scene.add(box);
		renderItem.scene.add(line);
		renderItem.scene.add(humans);
		renderItem.scene.add(Text);
	}
	animation();
	changeTarget();
	
}

function animation(){
	requestAnimationFrame(animation);
	for(var i = 0; i < starObjArray.length; i++){
		starObjArray[i].move();
		starObjArray[i].imgAnim();
		starObjArray[i].lineAnim();
		starObjArray[i].textAnim();
	}
	renderItem.action.move();
	renderItem.renderer.render(renderItem.scene,renderItem.action.camera);
}

function changeTarget(){
	TargetPoint = Math.floor(Math.random()*starObjArray.length);
	for(var i = 0; i < starObjArray.length; i++){
		starObjArray[i].similarPoint = Math.floor(Math.random()*10+1);
		starObjArray[i].sphere.position.set(starObjArray[i].defaultPos.x,
											starObjArray[i].defaultPos.y,
											starObjArray[i].defaultPos.z)
	}
	setTimeout(function(){
		changeTarget();
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

function starObj(sphere,img,line,degree,speed,id,defaultPos,text){
	this.id = id;
	this.sphere = sphere;
	this.img = img;
	this.text = text;
	this.line = line;
	this.degree = degree;
	this.speed = speed;
	this.name;
	this.similarPoint = 0;
	this.defaultPos = defaultPos;
}

function actionCam(){
	this.width = window.innerWidth;
	this.height = window.innerHeight;
	this.fov = 60;
	this.aspect = this.width/this.height;
	this.near = 1;
	this.far = 10000;
	this.speed = 10;
	this.vx;
	this.vy;
	this.vz;
	this.cvz;
	this.camera = new THREE.PerspectiveCamera(this.fov,this.aspect,this.near,this.far);
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
	}else{
		this.sphere.rotation.y += this.speed;
	}
}

starObj.prototype.imgAnim = function(){
	this.img.position.x = this.sphere.position.x;
	this.img.position.y = this.sphere.position.y;
	this.img.position.z = this.sphere.position.z;
}

starObj.prototype.lineAnim = function(){
	this.line.geometry.attributes.position.array[0] = this.sphere.position.x;
	this.line.geometry.attributes.position.array[1] = this.sphere.position.y;
	this.line.geometry.attributes.position.array[2] = this.sphere.position.z;
	this.line.geometry.attributes.position.array[3] = starObjArray[TargetPoint].sphere.position.x;
	this.line.geometry.attributes.position.array[4] = starObjArray[TargetPoint].sphere.position.y;
	this.line.geometry.attributes.position.array[5] = starObjArray[TargetPoint].sphere.position.z;
	this.line.geometry.setDrawRange(0, 2);
	this.line.geometry.attributes.position.needsUpdate = true;
}

starObj.prototype.textAnim = function(){
	this.text.position.x = this.sphere.position.x;
	this.text.position.y = this.sphere.position.y;
	this.text.position.z = this.sphere.position.z;
}

actionCam.prototype.move = function(){
	var DisX = starObjArray[TargetPoint].sphere.position.x - this.camera.position.x;
	var DisY = starObjArray[TargetPoint].sphere.position.y - this.camera.position.y;
	var DisZ = starObjArray[TargetPoint].sphere.position.z+100 - this.camera.position.z;
	var cDisZ = starObjArray[TargetPoint].sphere.position.z - this.camera.position.z;
	var Dis = Math.sqrt(Math.pow(DisX,2)+Math.pow(DisY,2)+Math.pow(DisZ,2));
	var cDis = Math.sqrt(Math.pow(DisX,2)+Math.pow(DisY,2)+Math.pow(cDisZ,2));
	this.vx = DisX/Dis;
	this.vy = DisY/Dis;
	this.vz = DisZ/Dis;
	this.cvz = DisZ/cDis;

	if(Dis >= this.speed){
		var r = Dis/this.speed;
	}
	if(Dis > 10){
		this.camera.position.x += this.vx*r;
		this.camera.position.y += this.vy*r;
		this.camera.position.z += this.vz*r;
	}
}
