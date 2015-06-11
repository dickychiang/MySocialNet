var loopback = require('loopback');
var async = require('async');
var nlib = require(__dirname + '/../../lib/nlib');

module.exports = function (model) {

	var excludedProperties = [
		'realm',
		'emailVerified',
		'verificationToken',
		'credentials',
		'challenges',
		'lastUpdated',
		'status'
	];

	// Remove the properties from base User model that doesn't have mapped columns
	excludedProperties.forEach(function (p) {
		delete model.definition.rawProperties[p];
		delete model.definition.properties[p];
		delete model.prototype[p];
	});

	model.session = function(callback) {
		var ctx = loopback.getCurrentContext();
    	var accessToken = ctx && ctx.get('accessToken');
    	callback(null, accessToken);
	};
	
	model.friendIds = function(callback) {
		var ctx = loopback.getCurrentContext();
		var app = ctx && ctx.get('app');
		var user = ctx && ctx.get('user');

		var friendIdsDict = {};
		friendIdsDict[user.id] = user.id;
		
		var tasks = [];
		tasks.push(function(callback){
			app.models.relation.find({where: { elderlyUserId: user.id}}, function(err, relations){
				var userIds = [];
				nlib.forEach(relations, function(relation) {
					userIds.push(relation.relatedUserId);
				});
				callback(null, userIds);
			});
		});

		tasks.push(function(callback){
			app.models.relation.find({where: { relatedUserId: user.id}}, function(err, relations){
				var userIds = [];
				nlib.forEach(relations, function(relation) {
					userIds.push(relation.elderlyUserId);
				});
				callback(null, userIds);
			});
		});
		 
		async.parallel(tasks, function(err, results){
			var userIdsDict = {};
			userIdsDict[user.id] = user.id;
		
			nlib.forEach(results, function(userIds){
				nlib.forEach(userIds, function(userId) {
					userIdsDict[userId] = userId;
				});
			});

			var userIds = [];
			nlib.forEach(userIdsDict, function(userId){
				userIds.push(userId);
			});

			callback(null, userIds);
		});
	};
	
	model.friends = function(callback) {
		var ctx = loopback.getCurrentContext();
		var app = ctx && ctx.get('app');
		var user = ctx && ctx.get('user');
		model.friendIds(function(err, userIds) {
			var tasks = [];
			
			nlib.forEach(userIds, function(userId) {
				if (user.id != userId) {
					tasks.push(function(callback){
						app.models.user.findById(userId, callback);
					});
				}
			});
			
			async.parallel(tasks, callback);
		});
	};
	
	model.onlineUserIds = function(callback) {
		var ctx = loopback.getCurrentContext();
		var app = ctx && ctx.get('app');
		
		model.friendIds(function(err, userIds) {
			var onlineUserIdsDict = ctx && ctx.get('onlineUserIds');
			var onlineUserIds = [];
			nlib.forEach(userIds, function(userId) {
				if (onlineUserIdsDict[userId]) {
					onlineUserIds.push(userId);
				}
			});
			callback(null, onlineUserIds);
		});
	};
	
	model.remoteMethod(
        'session', 
        {
        	returns: {arg: 'accessToken', type: 'object'},
        	http: {path: '/session', verb: 'get'}
        }
    );
    
    model.remoteMethod(
        'friends', 
        {
        	returns: {arg: 'users', type: 'object'},
        	http: {path: '/friends', verb: 'get'}
        }
    );
    
    model.remoteMethod(
        'onlineUserIds', 
        {
        	returns: {arg: 'onlineUserIds', type: 'object'},
        	http: {path: '/onlineUserIds', verb: 'get'}
        }
    );
};
