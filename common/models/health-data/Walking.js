var loopback = require('loopback');
var walk = require(__dirname + '/../../../lib/analysis/walking.js');
var async = require('async');

module.exports = function(model) {
	execute_walk_avg = function(userId, startDate, endDate, interval, cb) {
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
						callback(null, thresholds);
					}
				}
			});
		},
		function(callback) {
			app.models.Walking.find({where: { UserID: userId, StartTime: {between: [startDate, endDate]}}, order: "StartTime ASC"}, function(err, results){
				//console.log(results);
				if(err) {
					callback(err);
					return;
				} else {
					var res;
					if(results.length > 0) {
						 res = walk.CalSteps_average(results, startDate, endDate, interval);
						 callback(null, res);
					} else {
						res = null;
						callback(null, null);
					}
				}			
			});
		}], function(err, res) {
			if(err) {
				var alert = null; //db error
				cb(null,alert);
			} else if(res[0] == null || res[1] == null){
				cb(null,null);				
			}
			else {
				if(interval >= 1440) {
					var len = res[1].length;
					for(var i = 0; i < len; i++) {
					if(res[1][i].avg >= res[0][0] && res[1][i].avg < res[0][1]) {
						res[1][i].status = "OK";
					} else if (res[1][i].avg >= res[0][1]) {
						res[1][i].status = "Greate";
					}
					else {
						res[1][i].status = "Warning";
					}
				  }
			  }
				cb(null,  res[1]);
		    }	
		});
	};
	
	execute_walk_current = function(userId, cb) {
		var ctx = loopback.getCurrentContext();
		var app = ctx && ctx.get('app');
		async.series([
		function(callback) {
			app.models.UserBasicInfo.find({where: {UserID: userId}}, function(err, results) {
				console.log(results);
				if(err) {
					callback(err);
					return;
				} else {
					var thresholds = [];		
					if(results.length > 0) {				
						thresholds[0] = results[0].StepsMin;
						thresholds[1] = results[0].StepsMax;
						callback(null, thresholds);
					} else {
						thresholds = null;
						callback(null,thresholds);
					}
				}
			});
		},
		function(callback) {
			app.models.Walking.find({where: {UserID: userId}, order: 'EndTime DESC', limit: '1'}, function(err, results){
				console.log(results);
				if(err) {
					callback(err);
					return;
				} else {
					var res = [];
					if(results.length > 0) {
						res.push({"date": results[0].EndTime,"value": results[0].Steps});
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
			}
			else if(res[0] == null || res[1] == null) {
				cb(null,null);
			} 
			else {
				if(res[1][0].value >= res[0][0] && res[1][0].value < res[0][1]) {
					res[1][0].status = "OK";
				} else if(res[1][0].value > res[0][1]) {
					res[1][0].status = "Great";
				}
				else {
					res[1][0].status = "Warning";
				}
				cb(null,  res[1]);
			}
		});
	};
	
	execute_walk_total = function(userId, startDate, endDate, interval, cb) {
		var ctx = loopback.getCurrentContext();
		var app = ctx && ctx.get('app');
		async.series([
		function(callback) {
			app.models.UserBasicInfo.find({where: {UserID: userId}}, function(err, results) {
				console.log(results);
				if(err) {
					callback(err);
					return;
				} else {
					var thresholds = [];		
					if(results.length > 0) {				
						thresholds[0] = results[0].StepsMin;
						thresholds[1] = results[0].StepsMax;
						callback(null, thresholds);
					} else {
						thresholds = null;
						callback(null,thresholds);
					}
				}
			});			
		},
		function(callback) {
			app.models.Walking.find({where: { UserID: userId, StartTime: {between: [startDate, endDate]}}}, function(err, results){
				//console.log(results);
				if(err) {
					callback(err);
					return;
				} else {
					var res;
					if(results.length > 0)  {
						res = walk.CalSteps_total(results, startDate, endDate, interval);
						callback(null, res);
					} else {
						res = null;
						callback(null, res);
					}
				}		
			});
		}], function(err, res){
			if(err) {
				var alert = null; //db error
				cb(null,alert);
			} else if(res[0] == null || res[1] == null){
				cb(null,null);				
			}
			else {
				if(interval >= 1440) {
					var len = res[1].length;
					for(var i = 0; i < len; i++) {
					if(res[1][i].total >= res[0][0] && res[1][i].total < res[0][1]) {
						res[1][i].status = "OK";
					} else if (res[1][i].total >= res[0][1]) {
						res[1][i].status = "Greate";
					}
					else {
						res[1][i].status = "Warning";
					}
				  }
			  }
				cb(null,  res[1]);
		    }
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
