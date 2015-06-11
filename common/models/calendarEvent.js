var loopback = require('loopback');
var async = require('async');
var nlib = require(__dirname + '/../../lib/nlib');

module.exports = function (model) {
	var hours = {
		'daily': 24,
		'weekly': 24 * 7,
	};
	var hoursInMilliseoncs = 60*60*1000;

	model.get = function(userId, start, end, callback) {
		var ctx = loopback.getCurrentContext();
		var app = ctx && ctx.get('app');
		var user = ctx && ctx.get('user');
		
		start = nlib.date.parse(start, 'yyyy-mm-dd');
		var localStart = nlib.date.toLocal(start);
		
		end = nlib.date.parse(end, 'yyyy-mm-dd');
		end = nlib.date.stringify(end, 'yyyy-mm-dd');
		end += 'T23:59:59.999Z';
		end = nlib.date.parse(end, 'yyyy-mm-ddthh:mm:ss.fff');
		var localEnd = nlib.date.toLocal(end);
		
		var filter = {
			"where": {
				"and": [
					{
						"userId": userId
					},
					{
						"time": {
							"lte": nlib.date.stringify(end, 'yyyy-mm-ddthh:mm:ss.fffz')
						}
					},
					{
						"or": [
							{
								"end": null
							},
							{
								"end": {
									"gte": nlib.date.stringify(start, 'yyyy-mm-ddthh:mm:ss.fffz')
								}
							}
						]
					}
				]
			}
		};

		app.models.calendarEvent.find(filter, function(err, results){
			if (err) {
				callback(err);
				return;
			}

			var events = [];
			nlib.forEach(results, function(calendarEvent) {
				switch (calendarEvent.repeat) {
				case 'daily':
				case 'weekly':
					while ((!calendarEvent.end || calendarEvent.time <= calendarEvent.end) && 
					calendarEvent.time <= localEnd) {
						if (calendarEvent.time >= localStart) {
							events.push(calendarEvent);
						}
						
						calendarEvent.time = calendarEvent.time.getTime();
						if (calendarEvent.end) {
							calendarEvent.end = calendarEvent.end.getTime();
						}
						
						var ce = JSON.parse(JSON.stringify(calendarEvent));
						
						calendarEvent.time = new Date(calendarEvent.time);
						if (calendarEvent.end) {
							calendarEvent.end = new Date(calendarEvent.end);
						}
						ce.time = new Date(calendarEvent.time);
						if (ce.end) {
							ce.end = new Date(ce.end);
						}

						ce.time.setHours(
							ce.time.getHours() +
							hours[calendarEvent.repeat]
						);
						calendarEvent = ce;
					}
					break;
				case 'none':
				default:
					if (calendarEvent.time >= start) {
						events.push(calendarEvent);
					}
					break;
				}
			});
			callback(null, events);
		});
	};
	
	model.delete = function(id, time, option, callback) {
		var ctx = loopback.getCurrentContext();
		var app = ctx && ctx.get('app');
		
		app.models.calendarEvent.findById(id, function(err, calendarEvent) {
			if (err) {
				callback(err);
				return;
			}
			if (calendarEvent) {
				switch (calendarEvent.repeat) {
				case 'daily':
				case 'weekly':
					if (!time) {
						time = calendarEvent.time;
					}
					switch (option) {
					case 'one':
					case 'future':
						var span = (time.getTime() - calendarEvent.time.getTime()) / hoursInMilliseoncs;
						var repeats = parseInt(span / hours[calendarEvent.repeat]);
						var endTime = new Date(calendarEvent.time.getTime() + repeats * hours[calendarEvent.repeat] * hoursInMilliseoncs);
						if (repeats <= 0 || (calendarEvent.end && calendarEvent.end <= endTime)) {
							app.models.calendarEvent.destroyById(id, callback);
						} else {
							calendarEvent = JSON.parse(JSON.stringify(calendarEvent));
							calendarEvent.time = new Date(calendarEvent.time);
							if (calendarEvent.end) {
								calendarEvent.end = new Date(calendarEvent.end);
							}
							
							var end = calendarEvent.end;
							calendarEvent.end = endTime.setHours(endTime.getHours() - hours[calendarEvent.repeat]);
							
							app.models.calendarEvent.upsert(calendarEvent, function(err) {
								if (option == 'one') {
									delete calendarEvent.id;
									calendarEvent.time = endTime.setHours(endTime.getHours() + hours[calendarEvent.repeat]);
									calendarEvent.end = end;
									app.models.calendarEvent.create(calendarEvent, callback);
								} else {
									callback(null);
								}
							});
						}
						break;
					case 'all':
					default:
						app.models.calendarEvent.destroyById(id, callback);
						break;
					}
					break;
				case 'none':
				default:
					app.models.calendarEvent.destroyById(id, callback);
					break;
				}
			} else {
				callback(null);
			}
		});
	};
	
	model.remoteMethod(
        'get', 
        {
        	accepts: [
        		{arg: 'userId', type: 'number'},
        		{arg: 'start', type: 'string'},
        		{arg: 'end', type: 'string'}
        	],
        	returns: { type: 'array', root: true },
        	http: {path: '/get', verb: 'get'}
        }
    );
    
    model.remoteMethod(
        'delete', 
        {
        	accepts: [
        		{arg: 'id', type: 'number'},
        		{arg: 'time', type: 'date'},
        		{arg: 'option', type: 'string'}
        	],
        	http: {path: '/delete', verb: 'get'}
        }
    );

};
