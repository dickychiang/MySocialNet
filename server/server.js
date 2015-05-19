var loopback = require('loopback');
var boot = require('loopback-boot');

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
app.use('/sample', loopback.static(__dirname + '/../client'))
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
	app.io.on('connection', function(socket){
		socket.on('online', function(accessToken){
			this.accessToken = accessToken;
			onlineUserIds[accessToken.userId] = 1;
			app.io.emit('online');
		});
		socket.on('message', function(message) {
			socket.broadcast.emit('message', message);
		});
	    socket.on('chat', function(message) {
			socket.broadcast.emit('chat', message);
		});
		socket.on('call', function(message) {
			socket.broadcast.emit('call', message);
		});
		socket.on('disconnect', function(){
			if (this.accessToken) {
				delete onlineUserIds[this.accessToken.userId];
				app.io.emit('online');
			}
		});
	});
}
