var loopback = require('loopback');
var walk = require(__dirname + '/../../../lib/analysis/walking.js');

module.exports = function(model) {
	execute_walk_avg = function(userId, startDate, endDate, interval, cb) {
		var ctx = loopback.getCurrentContext();
		var app = ctx && ctx.get('app');
		app.models.Walking.find({where: { UserID: userId, StartTime: {between: [startDate, endDate]}}, order: "StartTime ASC"}, function(err, results){
			//console.log(results);
			var res = {};
			if(results.length > 0) res = walk.CalSteps_average(results, startDate, endDate, interval);
			cb(null,  res);			
		});
	};
	
	execute_walk_current = function(userId, cb) {
		var ctx = loopback.getCurrentContext();
		var app = ctx && ctx.get('app');
		app.models.Walking.find({where: {UserID: userId}, order: 'EndTime DESC', limit: '1'}, function(err, results){
			//console.log(results);
			var res = {};
			if(results.length > 0) {
				res.date = results[0].EndTime;
				res.value = results[0].Steps;
			}
			cb(null,  res);			
		});		
	};
	
	execute_walk_total = function(userId, startDate, endDate, interval, cb) {
		var ctx = loopback.getCurrentContext();
		var app = ctx && ctx.get('app');
		app.models.Walking.find({where: { UserID: userId, StartTime: {between: [startDate, endDate]}}}, function(err, results){
			//console.log(results);
			var res = {};
			if(results.length > 0) res = walk.CalSteps_total(results, startDate, endDate, interval);
			cb(null,  res);			
		});
	};

	model.current = function(id, cb) {
		execute_walk_current(id, cb);
	};
	model.average = function(id, start, end, interval, cb) {
		execute_walk_avg(id, start, end, interval, cb);
	};
	model.total = function(id, start, end, interval, cb) {
		execute_walk_total(id, start, end, interval, cb);
	};
	
	model.remoteMethod(
        'current', 
        {
        	accepts: [
        		{arg: 'id', type: 'number'}
        	],
        	returns: [
        		{arg: 'data' },
        		{arg: 'value', type: 'double'}
        	],
        	http: {path: '/current', verb: 'get'},
        	description: "return user's newest value and date"
        }
    );
    model.remoteMethod(
        'average', 
        {
        	accepts: [
        		{arg: 'id', type: 'number'},
        		{arg: 'start', type: 'string'},
        		{arg: 'end', type: 'string'},
				{arg: 'interval', type: 'number'}
        	],
        	returns: [
        		{arg: 'data' },
        		{arg: 'avg', type: 'double'}
        	],
        	http: {path: '/average', verb: 'get'},
        	description: "return user's average with date in a particular period of time"
        }
    );
    model.remoteMethod(
        'total', 
        {
        	accepts: [
        		{arg: 'id', type: 'number'},
        		{arg: 'start', type: 'string'},
        		{arg: 'end', type: 'string'},
				{arg: 'interval', type: 'number'}
        	],
        	returns: [
        		{arg: 'data' },
        		{arg: 'total', type: 'double'}
        	],
        	http: {path: '/total', verb: 'get'},
        	description: "return user's total steps with date in a particular period of time"
        }
    );
};
