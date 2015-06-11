var loopback = require('loopback');

module.exports = function(model) {

	model.add = function(toUserId, content, cb) {
		var ctx = loopback.getCurrentContext();
		var app = ctx && ctx.get('app');
    	var user = ctx && ctx.get('user');
    	
    	model.create({
    		"ownerId": user.id,
    		"fromUserId": user.id,
    		"toUserId": toUserId,
    		"content": content
    	}, function(err, result) {
    		if (err) {
    			cb(err);
    			return;
    		}
    		
    		if (app && app.io && app.io.emit) {
    			app.io.emit('message', { toUserId: toUserId });
    		}
    		
    		if (toUserId != user.id) {    		
				model.create({
					"ownerId": toUserId,
					"fromUserId": user.id,
					"toUserId": toUserId,
					"content": content
				}, function(err) {
					if (err) {
						cb(err);
						return;
					}
					model.findById(result.id, cb);
				});
			} else {
				model.findById(result.id, cb);
			}
    	});
	};
	
	model.get = function(filter, callback) {
		var ctx = loopback.getCurrentContext();
		var app = ctx && ctx.get('app');
    	var user = ctx && ctx.get('user');

    	if (!filter) {
    		filter = {};
    	}
    	if (!filter.where) {
    		filter.where = {ownerId: user.id};
    	} else {
    		filter.where = {and: [{ownerId: user.id}, filter.where]};
    	}
    	app.models.message.find(filter, function(err, results) {
    		callback(null, results);
    	});
	};
	
	model.remoteMethod(
        'add', 
        {
        	accepts: [
        		{arg: 'toUserId', type: 'number'},
        		{arg: 'content', type: 'string'}
        	],
        	returns: {arg: 'message', type: 'object'},
        	http: {path: '/add', verb: 'post'},
        	description: "Send a message to a particular user"
        }
    );
    
    model.remoteMethod(
        'get', 
        {
        	accepts: {arg: 'filter', type: 'object'},
        	returns: {type: 'array', root: true},
        	http: {path: '/', verb: 'get'},
        	description: "Get messages in a particular user inbox"
        }
    );
};
