var obj = [];
var colorArray = [];
var ctx;
window.onload = function(){
	socket = io.connect(location.origin);

	socket.on('connect',function(){
		console.log('connect server');
	});

	$('#image_up').change(function(){
		var r = [];
		var g = [];
		var b = [];
		var file = this.files[0];
		var image = new Image();
		var reader = new FileReader();
		var canvas = document.getElementById("canvas");
		ctx = canvas.getContext("2d");
		reader.onload = function(evt){
			image.onload = function(){
				//var canvas = document.getElementById("canvas");
				//ctx = canvas.getContext("2d");
				var count = 0;
				var wcount = 0;
				var imageDate = ctx.drawImage(image,0,0,32,32);
				var imgDate = ctx.getImageData(0,0,32,32);
				for(var i = 0; i < 32; i++){
					for(var j = 0; j < 32; j++){
						r.push(imgDate.data[j*4+i*imgDate.width*4]);
						g.push(imgDate.data[1+j*4+i*imgDate.width*4]);
						b.push(imgDate.data[2+j*4+i*imgDate.width*4]);
					}
				}
				for(var i = 0; i<r.length; i++){
					if((i % 32)==0){
						count++;
						wcount = 0;
					}
					wcount++;
					//ctx.beginPath();
					//ctx.fillStyle = 'rgb('+r[i]+','+g[i]+','+b[i]+')';
					//ctx.arc(10*wcount,10*count,10,0,Math.PI*2,false);
					//ctx.fill();
					var color = {
						r:r[i],
						g:g[i],
						b:b[i]
					}
					colorArray.push(color);
					obj[i] = new colorArc(color,2*wcount,2*count);
					obj[i].init();
				}
				console.log(r.length);
			}
			image.src = evt.target.result;
		}
		reader.readAsDataURL(file);
	});
	
	$("#Button").click(function(){
		animation();
		socket.emit('colorInfo',{Color:colorArray});
	});
	
	
}

function colorArc(color,x,y){
	this.r = color.r;
	this.g = color.g;
	this.b = color.b;
	this.x = x;
	this.y = y;
	this.speed = Math.random()*(5-1)+1;
}

colorArc.prototype.move = function(){
	ctx.beginPath();
	ctx.fillStyle = 'rgb('+this.r+','+this.g+','+this.b+')';
	ctx.arc(this.x,this.y-=this.speed*2,2,0,Math.PI*2,false);
	ctx.fill();
}

colorArc.prototype.init = function(){
	ctx.beginPath();
	ctx.fillStyle = 'rgb('+this.r+','+this.g+','+this.b+')';
	ctx.arc(this.x,this.y,2,0,Math.PI*2,false);
	ctx.fill();
}

function animation(){
	ctx.clearRect(0,0,1280,940);
	for(var i = 0; i < obj.length; i++){
		obj[i].move();
	}
	requestAnimationFrame(animation);
}
