var loopback = require('loopback');
var respiratory = require(__dirname + '/../../../lib/analysis/respiratory.js');
var async = require("async");

module.exports = function(model) {
	execute_resp_avg = function(userId, startDate, endDate, interval, cb) {
		var ctx = loopback.getCurrentContext();
		var app = ctx && ctx.get('app');
		async.series([
		function(callback) {
			app.models.UserBasicInfo.find({where: {UserID: userId}}, function(err, results) {
				//console.log(results);
				if(err) {
					callback(err);
					return;
				} else {
					var thresholds = [];
					if(results.length > 0) {										
						thresholds[0] = results[0].BreathingRateMin;
						thresholds[1] = results[0].BreathingRateMax;
						callback(null, thresholds);
					} else {
						thresholds = null;
						callback(null, thresholds);
					}
				}
			});
		},
		function(callback){
			app.models.BreathingRate.find({where: { UserId: userId, RecordTime: {between: [startDate, endDate]}}, order: "RecordTime ASC"}, function(err, results){
				//console.log(results);
				if(err) {
					callback(err);
					return;
				} else {
					var res = {};
					if(results.length > 0) {
						res = respiratory.CalRespiratoryRate(results, startDate, endDate, interval);
						callback(null, res);
					} else {
						res = null;
						callback(null, res);						
					}					
				}		
			});			
		}
		], function(err, res) {
			if(err) {
				var alert = null; //db error
				cb(null,alert);
			} else if(res[0] == null || res[1] == null){
				cb(null,null);				
			}
			else {
				var len = res[1].length;
				for(var i = 0; i < len; i++) {
				if(res[1][i].avg >= res[0][0] && res[1][i].avg <= res[0][1]) {
					res[1][i].status = "OK";
				} else {
					res[1][i].status = "Warning";
				}
			  }
				cb(null,  res[1]);
		  }
			
		});
	};
	
	execute_resp_current = function(userId, cb) {
		var ctx = loopback.getCurrentContext();
		var app = ctx && ctx.get('app');
		async.series([
		function(callback) {
			app.models.UserBasicInfo.find({where: {UserID: userId}}, function(err, results) {
				//console.log(results);
				if(err) {
					callback(err);
					return;
				} else {
					var thresholds = [];		
					if(results.length > 0) {				
						thresholds[0] = results[0].HeartRateMin;
						thresholds[1] = results[0].HeartRateMax;
						callback(null, thresholds);
					} else {
						thresholds = null;
						callback(null,thresholds);
					}
				}
			});	
		},
		function(callback) {
			app.models.BreathingRate.find({where: {UserId: userId}, order: 'RecordTime DESC', limit: '1'}, function(err, results){
				//console.log(results);
				if(err) {
					callback(err);
					return;
				} else { 
					var res =[];
					if(results.length > 0) {						
						res.push({"date": results[0].RecordTime,"value": results[0].Value});
						callback(null, res);
					} else {
						res = null;
						callback(null, res);
					}						
				}			
			});			
		}
		], function(err,res) {
			if(err) {
				var alert = null; //db error
				cb(null,alert);
			}
			else if(res[0] == null || res[1] == null) {
				cb(null,null);
			} 
			else {
				if(res[1][0].value >= res[0][0] && res[1][0].value <= res[0][1]) {
					res[1][0].status = "OK";
				} else {
					res[1][0].status = "Warning";
				}
				cb(null,  res[1]);
			}
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

