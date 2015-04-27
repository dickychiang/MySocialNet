(function(global) {
	var api = {};
	
	app.session = api;
    
	// ****************************************************
	// PRIVATE: properties
	// ****************************************************
	/*
	session: {
	  "id": string(hash),
	  "ttl": int,
	  "created": "string",
	  "userId": int
	}
	*/
	var session = null;
	var users = null;
	var messages = [];

	// ****************************************************
	// PUBLIC: methods
	// ****************************************************
	api.initiate = function() {
		app.socket.listen('online', function() { users = null; });
		app.socket.listen('message', function(message){
			if (message && session && (message.from == session.userId || message.to == session.userId)) {
				message.sent = (message.from == session.userId) ? true : false;
				messages.push(message);
			}
		});
	
		session = nlib.localStorage.value('session');
		
		// validate session
		if (session) {
			nlib.get(app.api_path+'/users/session?access_token=' + session.id, function(status, data) {
				if (status == 200) {
					var response = JSON.parse(data);	
					if (response && response.accessToken && session.id == response.accessToken.id) {
						session = response.accessToken;
						app.socket.connect();
					} else {
						session = null;
					}
				} else {
					session = null;
				}
				nlib.localStorage.value('session', session); 
			});
		}
		else {
			session = null;
			nlib.localStorage.value('session', session); 
		}
	};
	api.login = function(username, password, callback) {
		nlib.post(app.api_path+'/users/login', {username: username, password: password}, function(status, data) {
			if (status == 200) {
				var response = JSON.parse(data);
				if (response.error) {
					if (callback) callback(response.error, response.error.message);
					return;
				}
				
				session = response;
				nlib.localStorage.value('session', session);
				app.socket.connect();
				
				if (callback) callback(null);
			}
			
			// cannot connect to the server
			else {
				if (callback) callback(1, 'Unable to connect to server for authentication.');
			}
		});
	};
	api.logout = function() {
		if (session) {
			nlib.get(app.api+'/users/logout?access_token=' + session.id, function(status, data) {
				if (status == 200) {				
					session = null;
					users = null;
					nlib.localStorage.value('session', session);
					if (callback) callback(null);
				}
			
				// cannot connect to the server
				else {
					if (callback) callback(1, 'Unable to connect to server for authentication.');
				}
			});
		
			session = null;
			users = null;
			nlib.localStorage.value('session', session);
		}
	};
	api.instance = function() {
		return session;
	};
	api.getUsers = function(callback) {
		if (session && !users) {
			var tasks = [];
			tasks.push(function(callback){
				nlib.get(app.api_path + '/users/friends?access_token=' + session.id, function(status, data) {
					if (status == 200) {
						var response = JSON.parse(data);
						var users = {};
						if (response.users) {
							nlib.forEach(response.users, function(user) {
								users[user.id] = user;
							});
						}
						callback(null, users);
					} else {
						callback(1);
					}
				});
			});
			tasks.push(function(callback){
				nlib.get(app.api_path + '/users/onlineUserIds?access_token=' + app.session.instance().id, function(status, data) {
					if (status == 200) {
						var response = JSON.parse(data);
						if (response.onlineUserIds) {
							callback(null, response.onlineUserIds);
						}
					} else {
						callback(1);
					}
				});		
			});
			async.series(tasks, function(err, results) {
				if (err) {
					callback(1);
				} else {
					users = results[0];
					nlib.forEach(results[1], function(onlineUserId){
						users[onlineUserId].online = true;
					});
					callback(null, users);
				}
			});
		} else {
			callback(null, users);
		}
	};
	api.getMessages = function(userId, callback) {
		var msgs = [];
		nlib.forEach(messages, function(msg) {
			if (msg.from == userId || msg.to == userId) {
				msgs.push(msg);
			}
		});
		callback(null, msgs);
	};
}(this));
