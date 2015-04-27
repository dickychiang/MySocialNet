(function(global) {
	var api = {};
	
	app.socket = api;

	var socket = null;
	var listeners = {};
	
	var forward = function(name, data) {
		fns = listeners[name];
		fns.forEach(function(cb) {
			cb(data);
		});
	};
	
	// ****************************************************
	// PUBLIC: methods
	// ****************************************************
	api.initiate = function() {
		socket = io.connect(app.api_root);
	};
	api.connect = function() {
		var session = app.session.instance();
		socket.emit('online', session);
	};
	api.send = function(name, data) {
		socket.emit(name, data);
	};
	api.listen = function(name, callback) {
		if (!listeners[name]) {
			listeners[name] = [];
			listeners[name].push(callback);
			socket.on(name, function(data) {
				forward(name, data);
			});
		} else {
			listeners[name].push(callback);
		}
	};
}(this));
