var loopback = require('loopback');
var heartrate = require(__dirname + '/../../../lib/analysis/heartrate.js');

module.exports = function(model) {
	execute = function(userId, startDate, endDate, interval, cb) {
		var ctx = loopback.getCurrentContext();
		var app = ctx && ctx.get('app');
		app.models.UserHeartRate.find({where: { UserId: userId, RecordTime: {between: [startDate, endDate]}}}, function(err, results){
			//console.log(results);
			var res = heartrate.CalHeartRate(results, interval);
			cb(null,  res);			
		});
	};

	model.current = function(id, start, end, interval, cb) {
		execute(id, start, end, interval, cb);
	};
	model.average = function(id, start, end, interval, cb) {
		execute(id, start, end, interval, cb);
	};
	model.remoteMethod(
        'current', 
        {
        	accepts: [
        		{arg: 'id', type: 'number'},
        		{arg: 'start', type: 'string'},
        		{arg: 'end', type: 'string'}
        	],
        	returns: [
        		{arg: 'data' },
        		{arg: 'avg', type: 'double'}
        	],
        	http: {path: '/current', verb: 'get'},
        	description: "Get the current heart rate per second"
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
        	description: "Get the average heart rate per second"
        }
    );
};
