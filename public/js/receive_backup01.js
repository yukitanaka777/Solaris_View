var obj = [];
var colorArray = [];
var PersonNum = [];
//var ctx;
var renderItem = {};
window.onload = function(){
	socket = io.connect(location.origin);

	socket.on('connect',function(){
		console.log('connect server');
	});

	socket.emit('hello',{msg:'hello'});

	socket.on('receive',function(data){
		init(data.colorData.Color);
	});

	//var canvas = document.getElementById("canvas");
	//ctx = canvas.getContext("2d");
	var scene = new THREE.Scene();
	var width = window.innerWidth;
	var height = window.innerHeight;
	var fov = 60;
	var aspect = width/height;
	var near = 1;
	var far = 1000;
	var camera = new THREE.PerspectiveCamera(fov,aspect,near,far);
	camera.position.set(0,0,70);
	//camera.position.set(0,70,0);
	//camera.rotation = "XYZ";
	//camera.rotation.x = -0.9;

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
	this.x = x;
	this.y = y;
	this.speed = Math.random()*(5-1)+1;
	this.height = stop_height;
}

colorArc.prototype.move = function(){
	//ctx.beginPath();
	//ctx.fillStyle = 'rgb('+this.r+','+this.g+','+this.b+')';
	//if(this.y < this.height){
	//	ctx.arc(this.x,this.y,2,0,Math.PI*2,false);
	//}else{
	//	ctx.arc(this.x,this.y-=this.speed*2,2,0,Math.PI*2,false);
	//}
	//ctx.fill();
}

colorArc.prototype.init = function(){
	//ctx.beginPath();
	//ctx.fillStyle = 'rgb('+this.r+','+this.g+','+this.b+')';
	//ctx.arc(this.x,this.y,5,0,Math.PI*2,false);
	//ctx.fill();
}

colorArc.prototype.personInit = function(){
	var geometry = new THREE.SphereGeometry(1,1,1);
	var material = new THREE.MeshPhongMaterial({color:'rgb('+this.r+','+this.g+','+this.b+')',wireframe:false});
	var Solaris = new THREE.Mesh(geometry,material);
	Solaris.position.x = this.x;
	Solaris.position.y = this.height;
	renderItem.scene.add(Solaris);
}

function animation(){
	//ctx.clearRect(0,0,1280,940);
	//for(var i = 0; i < obj.length; i++){
	//	obj[i].move();
	//}
	renderItem.renderer.render(renderItem.scene,renderItem.camera);
	requestAnimationFrame(animation);
}

function init(key_color){
	var hcount = 0;
	var wcount = 0;
	//ctx.beginPath();
	for(var i = 0; i < key_color.length; i++){
		if((i % 32)==0){
			hcount++;
			wcount=0;
		}
		wcount++;
		//obj[i] = new colorArc(key_color[i].r,key_color[i].g,key_color[i].b,10*wcount,10*hcount);
		obj[i] = new colorArc(key_color[i],wcount,hcount+900,hcount);
		//obj[i].init();
		obj[i].personInit();
	}
	//ctx.fill();
	animation();
}
