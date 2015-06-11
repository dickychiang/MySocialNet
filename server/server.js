var loopback = require('loopback');
var boot = require('loopback-boot');
var fs = require('fs');

var app = module.exports = loopback();
var onlineUserIds = {};

app.use(loopback.context());
app.use(loopback.token());
app.use(function setCurrentUser(req, res, next) {
	if (!req.accessToken) {
		return next();
	}
	app.models.user.findById(req.accessToken.userId, function(err, user) {
		if (err) {
			return next(err);
		}
		if (!user) {
			return next(new Error('No user with this access token was found.'));
		}
		var loopbackContext = loopback.getCurrentContext();
		if (loopbackContext) {
			loopbackContext.set('app', app);
			loopbackContext.set('accessToken', req.accessToken);
			loopbackContext.set('user', user);
			loopbackContext.set('onlineUserIds', onlineUserIds);
		}
		next();
	});
});

app.use(loopback.favicon());
app.use(loopback.compress());

boot(app, __dirname);
app.post('/avatar', function(req, res, next){
	req.form.complete(function(err, fields, files){
		if (err || !req.accessToken || !req.files.avatar) {
			next(err);
		} else {
			var ctx = loopback.getCurrentContext();
			var user = ctx && ctx.get('user');
			fs.readFile(req.files.avatar.path, function (err, data) {
			  var newPath = __dirname + '/avatar/' + user.id +  + '.png';
				fs.writeFile(newPath, data, function (err) {
					res.redirect("back");
				});
			});
		}
	});
});


app.use('/avatar', loopback.static(__dirname + '/avatar'));
app.use('/', loopback.static(__dirname + '/../client'));
app.use(loopback.urlNotFound());
app.use(loopback.errorHandler());

app.start = function() {
  // start the web server
  return app.listen(function() {
    app.emit('started');
    console.log('Web server listening at: %s', app.get('url'));
  });
};

// start the server if `$ node server.js`
if (require.main === module) {
	app.io = require('socket.io')(app.start());
	app.io.sockets.on('connection', function(socket){
		socket.on('online', function(accessToken){
			this.accessToken = accessToken;
			onlineUserIds[accessToken.userId] = 1;
			app.io.emit('online');
			socket.join('all');
		});
		
		socket.on('message', function(message) {
			socket.broadcast.emit('message', message);
		});
		
		socket.on('chat', function(message) {
			socket.broadcast.emit('chat', message);
		});
		
		socket.on('create or join', function(room) {
			console.log(app.io.sockets);
			var numClients = app.io.sockets.clients(room).length;
			if (numClients === 0) {
				socket.join(room);
				socket.emit('created', room);
			} else if (numClients == 1) {
				app.io.sockets. in (room).emit('join', room);
				socket.join(room);
				socket.emit('joined', room);
			} else {
				socket.emit('full', room);
			}
			socket.emit('emit(): client ' + socket.id + ' joined room ' + room);
			socket.broadcast.emit('broadcast(): client ' + socket.id + ' joined room ' + room);
		});

		socket.on('call', function(offer) {
			// from: userId
			// to: userId
			if (this.accessToken && this.accessToken.userId == offer.from) {
				for (var key in app.io.connected) {
					var conn = app.io.connected[key];
					if (conn.accessToken && offer.to == conn.accessToken.userId) {
						console.log(conn);
						break;
					}
				}
			}
		});

		socket.on('disconnect', function(){
			if (this.accessToken) {
				delete onlineUserIds[this.accessToken.userId];
				app.io.emit('online');
			}
		});
	});
}
