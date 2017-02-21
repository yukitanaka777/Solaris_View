var obj = [];
var PersonArray = [];
var renderItem = {};
var TargetPoint = [];

window.onload = function(){
	socket = io.connect(location.origin);

	socket.on('connect',function(){
		console.log('connect server');
	});

	socket.emit('hello',{msg:'hello'});

	socket.on('receive',function(data){
		init(data.colorData.Color);
	});

	var scene = new THREE.Scene();
	var width = window.innerWidth;
	var height = window.innerHeight;
	var fov = 60;
	var aspect = width/height;
	var near = 1;
	var far = 1000;
	var camera = new THREE.PerspectiveCamera(fov,aspect,near,far);
	camera.position.set(0,0,500);
	var renderer = new THREE.WebGLRenderer();
	renderer.setSize(width,height);
	document.body.appendChild(renderer.domElement);
	renderItem.renderer = renderer;
	renderItem.camera = camera;
	renderItem.scene = scene;

	var directionalLight = new THREE.DirectionalLight(0xfffffff);
	directionalLight.position.set(0,0.7,0.7);
	renderItem.scene.add(directionalLight);

	var geometry = new THREE.SphereGeometry(30,30,30);
	var material = new THREE.MeshPhongMaterial({color:0x00ffff,wireframe:true});
	var Solaris = new THREE.Mesh(geometry,material);
	renderItem.scene.add(Solaris);
}

function colorArc(color,x,y,stop_height){
	this.r = color.r;
	this.g = color.g;
	this.b = color.b;
	this.PersonNumber = PersonArray.length;
	this.x = Math.random()*(500-1)+1;
	this.y = Math.random()*(500-1)+1;
	this.z = 600;
	this.targetX = x;
	this.targetY = stop_height;
	this.targetZ = 0;
	this.speed = Math.random()*(5-1)+1;
	this.height = stop_height;
	var geometry = new THREE.SphereGeometry(1,1,1);
	var material = new THREE.MeshPhongMaterial({color:'rgb('+this.r+','+this.g+','+this.b+')',wireframe:false});
	this.Person = new THREE.Mesh(geometry,material);
}

colorArc.prototype.move = function(){
	if(!TargetPoint[this.PersonNumber].returnImg){
		var htopx = TargetPoint[this.PersonNumber].x - this.Person.position.x;
		var htopy = TargetPoint[this.PersonNumber].y - this.Person.position.y;
		var htopz = this.targetZ - this.Person.position.z;
	}else{
		var htopx = this.targetX - this.Person.position.x;
		var htopy = this.targetY - this.Person.position.y;
		var htopz = this.targetZ - this.Person.position.z;
	}
	var htopDis = Math.sqrt(Math.pow(htopx,2)+Math.pow(htopy,2)+Math.pow(htopz,2))
	this.Person.position.x += htopx/htopDis;
	this.Person.position.y += htopy/htopDis;
	this.Person.position.z += htopz/htopDis;
}

colorArc.prototype.personInit = function(){
	this.Person.position.x = this.x;
	this.Person.position.y = this.y;
	this.Person.position.z = this.z;
	renderItem.scene.add(this.Person);
}

function animation(){
	for(var i = 0; i < obj.length; i++){
		obj[i].move();
	}
	renderItem.renderer.render(renderItem.scene,renderItem.camera);
	requestAnimationFrame(animation);
}

function init(key_color){
	var hcount = 0;
	var wcount = 0;
	TargetPoint.push({x:0,y:0,returnImg:0});
	for(var i = 0; i < key_color.length; i++){
		if((i % 32)==0){
			hcount++;
			wcount=0;
		}
		wcount++;
		obj.push(new colorArc(key_color[i],wcount+35,hcount+900,hcount));
		obj[obj.length - 1].personInit();
	}
	//for(var i = 0; i < key_color.length; i++){
	//	if((i % 32)==0){
	//		hcount++;
	//		wcount=0;
	//	}
	//	wcount++;
	//	obj[i] = new colorArc(key_color[i],wcount+35,hcount+900,hcount);
	//	obj[i].personInit();
	//}
	PersonArray.push(obj);
	animation();
	setTimeout(function(){
		TargetChange();
	},6000);
}

function TargetChange(){
	for(var i = 0; i < TargetPoint.length; i++){
		TargetPoint[i].x = Math.random()*400-200;
		TargetPoint[i].y = Math.random()*400-200;
		TargetPoint[i].returnImg = Math.floor(Math.random()*2);
	}
	setTimeout(function(){
		TargetChange();
	},6000);
}
