var obj = [];
var colorArray = [];
var ctx;
window.onload = function(){
	socket = io.connect(location.origin);

	socket.on('connect',function(){
		console.log('connect server');
	});

	socket.emit('hello',{msg:'hello'});

	socket.on('receive',function(data){
		init(data.colorData.Color);
	});

	var canvas = document.getElementById("canvas");
	ctx = canvas.getContext("2d");
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
	ctx.beginPath();
	ctx.fillStyle = 'rgb('+this.r+','+this.g+','+this.b+')';
	if(this.y < this.height){
		ctx.arc(this.x,this.y,2,0,Math.PI*2,false);
	}else{
		ctx.arc(this.x,this.y-=this.speed*2,2,0,Math.PI*2,false);
	}
	ctx.fill();
}

colorArc.prototype.init = function(){
	//ctx.beginPath();
	ctx.fillStyle = 'rgb('+this.r+','+this.g+','+this.b+')';
	ctx.arc(this.x,this.y,5,0,Math.PI*2,false);
	//ctx.fill();
}

function animation(){
	console.log(ctx);
	ctx.clearRect(0,0,1280,940);
	for(var i = 0; i < obj.length; i++){
		obj[i].move();
	}
	requestAnimationFrame(animation);
}

function init(key_color){
	var hcount = 0;
	var wcount = 0;
	ctx.beginPath();
	for(var i = 0; i < key_color.length; i++){
		if((i % 32)==0){
			hcount++;
			wcount=0;
		}
		wcount++;
		console.log(''+key_color[i].r+','+key_color[i].g+','+key_color[i].b+'');
		//obj[i] = new colorArc(key_color[i].r,key_color[i].g,key_color[i].b,10*wcount,10*hcount);
		obj[i] = new colorArc(key_color[i],2*wcount,2*hcount+900,2*hcount);
		obj[i].init();
	}
	ctx.fill();
	animation();
}
