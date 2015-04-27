var loopback = require('loopback');

module.exports = function(model) {

	model.add = function(content, cb) {
		var ctx = loopback.getCurrentContext();
    	var user = ctx && ctx.get('user');
    	model.create({
    		"userId": user.id,
    		"content": content
    	}, function(err, result) {
    		if (err) {
    			cb(err);
    			return;
    		}
    		model.findById(result.id, cb);
    	});
	};
	
	model.remoteMethod(
        'add', 
        {
        	accepts: {arg: 'content', type: 'string'},
        	returns: {arg: 'post', type: 'object'},
        	http: {path: '/add', verb: 'post'}
        }
    );
};
