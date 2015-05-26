var loopback = require('loopback');
var heartrate = require(__dirname + '/../../../lib/analysis/heartrate.js');

module.exports = function(model) {
	execute = function(userId, startDate, endDate, values, cb) {
		var ctx = loopback.getCurrentContext();
		var app = ctx && ctx.get('app');
		app.models.UserHeartRate.find({where: { UserId: userId, RecordTime: {between: [startDate+' 00:00:00', endDate+' 23:59:59']}}}, function(err, results){
			console.log(results);
			var avg = heartrate.CalHeartRate(results, values);
			cb(null, results, avg);
			
		});
	};

	model.current = function(id, start, end, cb) {
		execute(id, start, end, 'current', cb);
	};
	model.average = function(id, start, end, cb) {
		execute(id, start, end, 'average', cb);
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
        		{arg: 'end', type: 'string'}
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
