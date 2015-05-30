var loopback = require('loopback');
var respiratory = require(__dirname + '/../../../lib/analysis/respiratory.js');

module.exports = function(model) {
	execute_resp_avg = function(userId, startDate, endDate, interval, cb) {
		var ctx = loopback.getCurrentContext();
		var app = ctx && ctx.get('app');
		app.models.BreathingRate.find({where: { UserId: userId, RecordTime: {between: [startDate, endDate]}}, order: "RecordTime ASC"}, function(err, results){
			//console.log(results);
			var res = respiratory.CalRespiratoryRate(results, startDate, endDate, interval);
			cb(null,  res);			
		});
	};
	
	execute_resp_current = function(userId, cb) {
		var ctx = loopback.getCurrentContext();
		var app = ctx && ctx.get('app');
		app.models.BreathingRate.find({where: {UserId: userId}, order: 'RecordTime DESC', limit: '1'}, function(err, results){
			//console.log(results);
			var res = {};
			res.date = results[0].RecordTime;
			res.value = results[0].Value;
			cb(null,  res);			
		});		
	};

	model.current = function(id, cb) {
		execute_resp_current(id, cb);
	};
	model.average = function(id, start, end, interval, cb) {
		execute_resp_avg(id, start, end, interval, cb);
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
        	description: "return user's average with date in a period of time"
        }
    );
};

