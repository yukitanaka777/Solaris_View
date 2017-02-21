var express = require('express');
var app = express();
var ejs = require('ejs');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var request = require('request');
var player_list = {};
var option = {url:"http://192.168.1.6:9000/getUserList",
				json:true};
var user_data = {};

app.set('views',__dirname + '/views');
app.set('view engine','ejs');
app.use(express.static(__dirname + '/public'));
app.use(bodyParser({limit:'50mb'}));
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({ limit:'50mb',extended: true }));
app.use(cookieParser());

request.get(option, function (error, response, body) {
  if (!error && response.statusCode == 200) {
    user_data = body;
  } else {
    console.log('error: '+ error);
  }
})


var Check = function(req,res,next){
	if(req.session.user){
		next();
	}else{
		res.redirect('/login');
	}
}

app.use('/receive',function(req,res,next){
	res.render('receive');
});

app.get('/views',function(req,res,next){
	console.log(req.query.id);
	res.render('view',{id:req.query.id});
});

app.post('/receive_obj',function(req,res,next){
  console.log(req.body.name);
  user_data[Object.keys(user_data).length] = req.body;
  io.sockets.emit('obj',req.body)
  res.send('received infomation')
});

app.post('/receive_move',function(req,res,next){
  io.sockets.emit('learn_start',req.body);
  res.send('learn start');
});

app.get('/renderJson',function(req,res,next){
	console.log('render');
	res.json(user_data);
});

app.get('/',function(req,res,next){
	res.render('send');
});

app.post("/",function(req,res,next){
	console.log(req.body.obj_name);
	io.sockets.emit("obj",req.body.obj_name);
	res.redirect("/");
});

io.sockets.on('connection',function(socket){

	socket.on('player',function(data){
		player_list[data.id] = data.number;
		socket.broadcast.emit('add_player',{id:data.id,number:data.number});
	});

	socket.on('disconnect',function(data){
		console.log("dis connect:"+socket.id);
		delete player_list[socket.id];
		socket.broadcast.emit('disconnect_player',socket.id);
	});

	socket.on('getRequest',function(){
		socket.emit("Responce",player_list);
	});

});

server.listen(3333,function(){
	console.log('localhost:3333 listening...');
});
