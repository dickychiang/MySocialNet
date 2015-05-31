var loopback = require('loopback');
var bmi = require(__dirname + '/../../../lib/analysis/bmi.js');

module.exports = function(model) {
	execute_bmi_avg = function(userId, startDate, endDate, interval, cb) {
		var ctx = loopback.getCurrentContext();
		var app = ctx && ctx.get('app');
		app.models.BasicHealthInfo.find({where: { UserId: userId, RecordTime: {between: [startDate, endDate]}}, order: "RecordTime ASC"}, function(err, results){
			//console.log(results);
			var res = {};
			if(results.length > 0) res = bmi.AverageBodyMessIndes(results, startDate, endDate, interval);
			cb(null,  res);			
		});
	};
	
	execute_bmi_current = function(userId, cb) {
		var ctx = loopback.getCurrentContext();
		var app = ctx && ctx.get('app');
		app.models.BasicHealthInfo.find({where: {UserId: userId}, order: 'RecordTime DESC', limit: '1'}, function(err, results){
			//console.log(results);
			var res = {};
			if(results.length > 0) res = bmi.CurrentBodyMessIndex(results);
			cb(null,  res);			
		});		
	};
	
	execute_bmi_list = function(userId, startDate, endDate, cb) {
		var ctx = loopback.getCurrentContext();
		var app = ctx && ctx.get('app');
		app.models.BasicHealthInfo.find({where: { UserId: userId, RecordTime: {between: [startDate, endDate]}}, order: "RecordTime ASC"}, function(err, results){
			//console.log(results);
			var res = {};
			if(results.length > 0) res = bmi.ListUserBodyMessIndes(results, startDate, endDate);
			cb(null,  res);			
		});		
	};

	model.current = function(id, cb) {
		execute_bmi_current(id, cb);
	};
	model.average = function(id, start, end, interval, cb) {
		execute_bmi_avg(id, start, end, interval, cb);
	};
	model.history = function(id, start, end, cb) {
		execute_bmi_list(id, start, end, cb);
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
        	http: {path: '/bmi/current', verb: 'get'},
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
        	http: {path: '/bmi/average', verb: 'get'},
        	description: "return user's average with date in a period of time"
        }
    );
	model.remoteMethod(
        'history', 
        {
        	accepts: [
        		{arg: 'id', type: 'number'},
        		{arg: 'start', type: 'string'},
        		{arg: 'end', type: 'string'}
        	],
        	returns: [
        		{arg: 'data' },
        		{arg: 'value', type: 'double'}
        	],
        	http: {path: '/bmi/history', verb: 'get'},
        	description: "list histories of the user's bmi"
        }
    );
};

