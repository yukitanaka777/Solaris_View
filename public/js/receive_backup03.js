var obj = [];
var starArray = [];
var starArrays = {};
var starObjArray = [];
var renderItem = {};
var TargetPoint = 0;
var controll;

window.onload = function(){
	socket = io.connect(location.origin);

	socket.on('connect',function(){
		console.log('connect server');
	});

	//socket.emit('hello',{msg:'hello'});

	//socket.on('receive',function(data){
	//	init(data.colorData.Color);
	//});

	var scene = new THREE.Scene();
	var width = window.innerWidth;
	var height = window.innerHeight;
	var fov = 60;
	var aspect = width/height;
	var near = 1;
	var far = 10000;
	var camera = new THREE.PerspectiveCamera(fov,aspect,near,far);
	camera.position.set(0,0,1000);
	controll = new THREE.OrbitControls(camera);
	var renderer = new THREE.WebGLRenderer();
	renderer.setSize(width,height);
	document.body.appendChild(renderer.domElement);
	renderItem.renderer = renderer;
	renderItem.camera = camera;
	renderItem.scene = scene;

	var directionalLight = new THREE.DirectionalLight(0xfffffff);
	directionalLight.position.set(0,0.7,0.7);
	renderItem.scene.add(directionalLight);

	//var geometry = new THREE.SphereGeometry(1500,30,30);
	//var material = new THREE.MeshPhongMaterial({color:0x00ffff,wireframe:true});
	//var Solaris = new THREE.Mesh(geometry,material);
	//console.log(Solaris.position);
	//renderItem.scene.add(Solaris);
	star();
	socket.emit('hello',{msg:starArray});
	animation();
}

function animation(){
	renderItem.renderer.render(renderItem.scene,renderItem.camera);
	controll.update();
	requestAnimationFrame(animation);
}

function star(){
	var loader = new THREE.TextureLoader();
	for(var i = 0; i < 1000; i++){
		var img = loader.load("img/main.jpg",function(texture){
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

		humans.position.set(Math.random()*2000-1000,
							Math.random()*2000-1000,
							Math.random()*2000-1000);

        var box = new THREE.Mesh(
            new THREE.BoxGeometry(15, 15, 3),
            new THREE.MeshLambertMaterial({map: img})  // {map: texture}がキモ
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

		var line = new THREE.Line(lineGeometry,new THREE.LineBasicMaterial({color:'rgb('+r+','+g+','+b+')',transparent:true,opacity:0.1}));
		starArrays[i] = [humans,degree,speed,i,line,box];
		starObjArray[i] = new starObj(humans,box,line,degree,speed,i);

		renderItem.scene.add(box);
		renderItem.scene.add(line);
		renderItem.scene.add(humans);
	}
	starMove();
	changeTarget();
	
}

function starMove(){
	requestAnimationFrame(starMove);
	for(var i = 0; i < starArray.length; i++){
		//disX = 0 - starArrays[i][0].position.x;
		//disY = 0 - starArrays[i][0].position.y;
		//disZ = 0 - starArrays[i][0].position.z;
		//Dis = Math.sqrt(Math.pow(disX,2)+Math.pow(disY,2)+Math.pow(disZ,2));
		//starArrays[i][0].rotation.y += starArrays[i][2];
		//var radian = Math.PI/180*starArrays[i][1];
		//var x = 0 + 2*Math.cos(radian);
		//starArrays[i][0].position.y += x;
		//starArrays[i][5].position.y = starArrays[i][0].position.y;
		//starArrays[i][1] += starArrays[i][2];
		//starArrays[i][4].geometry.attributes.position.array[0] = starArrays[i][0].position.x;
		//starArrays[i][4].geometry.attributes.position.array[1] = starArrays[i][0].position.y;
		//starArrays[i][4].geometry.attributes.position.array[2] = starArrays[i][0].position.z;
		//starArrays[i][4].geometry.attributes.position.array[4] = starArrays[TargetPoint][0].position.x;
		//starArrays[i][4].geometry.attributes.position.array[5] = starArrays[TargetPoint][0].position.y;
		//starArrays[i][4].geometry.attributes.position.array[6] = starArrays[TargetPoint][0].position.z;
		//starArrays[i][4].geometry.setDrawRange(0, 2);
		//starArrays[i][4].geometry.attributes.position.needsUpdate = true;
		starObjArray[i].move();
	}
}

function human(id,name){
	this.id = id;
	this.name = name;
}

function changeTarget(){
	TargetPoint = Math.floor(Math.random()*1000);
	setTimeout(function(){
		changeTarget();
	},10000);
}

function starObj(sphere,img,line,degree,speed,id){
	this.id = id;
	this.sphere = sphere;
	this.img = img;
	this.line = line;
	this.degree = degree;
	this.speed = speed;
}

starObj.prototype.move = function(){
	var radian = Math.PI/180*this.degree;
	var x = 2*Math.cos(radian);
	this.sphere.rotation.y += this.speed;
	this.sphere.position.y += x;
	this.img.position.y = this.sphere.position.y;
	this.line.geometry.attributes.position.array[0] = this.sphere.position.x;
	this.line.geometry.attributes.position.array[1] = this.sphere.position.y;
	this.line.geometry.attributes.position.array[2] = this.sphere.position.z;
	this.line.geometry.attributes.position.array[3] = starObjArray[TargetPoint].sphere.position.x;
	this.line.geometry.attributes.position.array[4] = starObjArray[TargetPoint].sphere.position.y;
	this.line.geometry.attributes.position.array[5] = starObjArray[TargetPoint].sphere.position.z;
	this.line.geometry.setDrawRange(0, 2);
	this.line.geometry.attributes.position.needsUpdate = true;
}
