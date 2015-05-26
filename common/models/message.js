var loopback = require('loopback');

module.exports = function(model) {

	model.add = function(toUserId, content, cb) {
		var ctx = loopback.getCurrentContext();
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
};
