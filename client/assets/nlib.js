(function(global) {
	var api = {};
	var Buffer = null;
	
	// node.js
	if (typeof module !== 'undefined' && module.exports) {
		module.exports = api;
		Buffer = require('buffer').Buffer;
	}
		
    // included directly via <script> tag
	else {
        global.nlib = api;
    }
	
	// ****************************************************
	// string
	// ****************************************************	
	api.string = function(value) {
		if (typeof value === 'object') {
			if (api.isArray(value)) {
				var sb = [];
				value.forEach(function(item) {
					sb.push(item);
				});
				return sb.join(',');
			}
		}
		if (typeof value === 'string') {
			return value;
		}
		return value + '';
	};
	api.string.isDigits = function(str) {
		return /^[0-9]\d*$/.test(str);
	};
	api.string.id = function(str) {
		if (typeof str === 'string') {
			if (str.length > 0) {
				if (api.string.isDigits(str)) {
					return parseInt(str);
				} else {
					return str;
				}
			}
			return null;
		}
		return str;
	};
	api.string.endsWith = function(str, suffix) {
		return str.indexOf(suffix, str.length - suffix.length) !== -1;
	};
	api.string.escapeJS = function(str) {
		if (!str) return str;
		var sb = [];
		for (var i = 0, l = str.length; i < l; ++i) {
			var c = str.charCodeAt(i);
			switch (c) {
			case 0x09:
				sb.push('\\t');
			case 0x0A:
				sb.push('\\n');
			case 0x0D:
				sb.push('\\r');
				break;
			case 0x22:
				sb.push('\\"');
				break;
			case 0x27:
				sb.push('\\\'');
				break;
			case 0x5C:
				sb.push('\\\\');
				break;
			default:
				if (c > 0xFFF) {
					sb.push('\\u');
					sb.push(c.toString(16));
				} else if (c > 0xFF) {
					sb.push('\\u0');
					sb.push(c.toString(16));
				} else if (c > 0x7F) {
					sb.push('\\x');
					sb.push(c.toString(16));
				} else {
					sb.push(String.fromCharCode(c));
				}
				break;
			}
		}
		return sb.join('');
	};
	api.string.escapeHTML = function(str) {
		if (!str) return str;
		var sb = [];
		for (var i = 0, l = str.length; i < l; ++i) {
			var c = str.charCodeAt(i);
			switch (c) {
			case 0x22:
				sb.push('&#34;');
				break;
			case 0x24:
				sb.push('&#36;');
				break;
			case 0x26:
				sb.push('&#38;');
				break;
			case 0x27:
				sb.push('&#39;');
				break;
			case 0x3C:
				sb.push('&lt;');
				break;
			case 0x3E:
				sb.push('&gt;');
				break;
			default:
				sb.push(String.fromCharCode(c));
				break;
			}
		}
		return sb.join('');
	};

	// ****************************************************
	// Date
	// ****************************************************	
	api.date = {};
	api.date.parse = function(text, format) {
		if (format) {
			format = format.toLowerCase();
			var yyyy = 0;
			var MM = 0;
			var dd = 1;
			var hh = 0;
			var mm = 0;
			var ss = 0;
			var fff = 0;
			while (1) {
				switch (format) {
					// miliseconds
					case 'yyyy-mm-ddthh:mm:ss.fff':
					case 'yyyy-mm-dd hh:mm:ss.fff':
					case 'mm/dd/yyyy hh:mm:ss.fff':
					case 'dd/mm/yyyy hh:mm:ss.fff':
						if (text.length < 23) return null;
						fff = parseInt(text.substring(20, 23), 10);
						if (isNaN(fff) || fff < 0) return null;
						format = format.substring(0, 19);
						break;
					case 'yyyymmddhhmmssfff':
						if (text.length < 17) return null;
						fff = parseInt(text.substring(14, 17), 10);
						if (isNaN(fff) || fff < 0) return null;
						format = format.substring(0, 14);
						break;
					// seconds
					case 'yyyy-mm-ddthh:mm:ss':
					case 'yyyy-mm-dd hh:mm:ss':
					case 'mm/dd/yyyy hh:mm:ss':
					case 'dd/mm/yyyy hh:mm:ss':
						if (text.length < 19) return null;
						ss = parseInt(text.substring(17, 19), 10);
						if (isNaN(ss) || ss < 0 || ss > 59) return null;
						format = format.substring(0, 16);
						break;
					case 'yyyymmddhhmmss':
						if (text.length < 14) return null;
						ss = parseInt(text.substring(12, 14), 10);
						if (isNaN(ss) || ss < 0 || ss > 59) return null;
						format = format.substring(0, 12);
						break;
					// minutes
					case 'yyyy-mm-ddthh:mm':
					case 'yyyy-mm-dd hh:mm':
					case 'mm/dd/yyyy hh:mm':
					case 'dd/mm/yyyy hh:mm':
						if (text.length < 16) return null;
						mm = parseInt(text.substring(14, 16), 10);
						if (isNaN(mm) || mm < 0 || mm > 59) return null;
						format = format.substring(0, 13);
						break;
					case 'yyyymmddhhmm':
						if (text.length < 12) return null;
						mm = parseInt(text.substring(10, 12), 10);
						if (isNaN(mm) || mm < 0 || mm > 59) return null;
						format = format.substring(0, 10);
						break;
					// hours
					case 'yyyy-mm-ddthh':
					case 'yyyy-mm-dd hh':
					case 'mm/dd/yyyy hh':
					case 'dd/mm/yyyy hh':
						if (text.length < 13) return null;
						hh = parseInt(text.substring(11, 13), 10);
						if (isNaN(hh) || hh < 0 || hh > 59) return null;
						format = format.substring(0, 10);
						break;
					case 'yyyymmddhh':
						if (text.length < 10) return null;
						mm = parseInt(text.substring(8, 10), 10);
						if (isNaN(mm) || mm < 0 || mm > 59) return null;
						format = format.substring(0, 8);
						break;
					// day
					case 'yyyy-mm-dd':
						if (text.length < 10) return null;
						dd = parseInt(text.substring(8, 10), 10);
						if (isNaN(dd) || dd < 1 || dd > 31) return null;
						format = format.substring(0, 7);
						break;
					case 'yyyymmdd':
						if (text.length < 8) return null;
						dd = parseInt(text.substring(6, 8), 10);
						if (isNaN(dd) || dd < 1 || dd > 31) return null;
						format = format.substring(0, 6);
						break;
					// month
					case 'yyyy-mm':
						if (text.length < 7) return null;
						MM = parseInt(text.substring(5, 7), 10);
						if (isNaN(MM) || MM < 1 || MM > 12) return null;
						MM = MM - 1;
						format = format.substring(0, 4);
						break;
					case 'yyyymm':
						if (text.length < 6) return null;
						MM = parseInt(text.substring(4, 6), 10);
						if (isNaN(MM) || MM < 1 || MM > 12) return null;
						MM = MM - 1;
						format = format.substring(0, 4);
						break;
					// year
					case 'yyyy':
						if (text.length < 4) return null;
						yyyy = parseInt(text, 10);
						if (isNaN(yyyy) || yyyy < 0 ) return null;
						return new Date(yyyy, MM, dd, hh, mm, ss, fff);
					//other
					case 'mm/dd/yyyy':
						if (text.length < 10) return null;
						dd = parseInt(text.substring(3, 5), 10);
						if (isNaN(dd) || dd < 1 || dd > 31) return null;
						MM = parseInt(text.substring(0, 2), 10);
						if (isNaN(MM) || MM < 1 || MM > 12) return null;
						MM = MM - 1;
						yyyy = parseInt(text.substring(6, 10), 10);
						if (isNaN(yyyy) || yyyy < 0 ) return null;
						return new Date(yyyy, MM, dd, hh, mm, ss, fff);
					case 'dd/mm/yyyy':
						if (text.length < 10) return null;
						dd = parseInt(text.substring(0, 2), 10);
						if (isNaN(dd) || dd < 1 || dd > 31) return null;
						MM = parseInt(text.substring(3, 5), 10);
						if (isNaN(MM) || MM < 1 || MM > 12) return null;
						MM = MM - 1;
						yyyy = parseInt(text.substring(6, 10), 10);
						if (isNaN(yyyy) || yyyy < 0 ) return null;
						return new Date(yyyy, MM, dd, hh, mm, ss, fff);
					default:
						return null;
				}
			}
		}
        return null;
    };
    api.date.stringify = function(date, format) {
		if (format) {
			var yyyy = date.getFullYear() + '';
			var MM = date.getMonth() + 1;
			MM = ((MM < 10) ? '0' : '') + MM;
			var dd = date.getDate();
			dd = ((dd < 10) ? '0' : '') + dd;
			var hh = date.getHours();
			hh = ((hh < 10) ? '0' : '') + hh;
			var mm = date.getMinutes();
			mm = ((mm < 10) ? '0' : '') + mm;
			var ss = date.getSeconds();
			ss = ((ss < 10) ? '0' : '') + ss;
			var fff = date.getMilliseconds();
			fff = ((fff < 10) ? '00' : ((fff < 100) ? '0' : '')) + fff;
			
			format = format.toLowerCase();
			while (1) {
				switch (format) {
					case 'yyyymmddhhmm':
						return yyyy+MM+dd+hh+mm;
					case 'yyyymmdd':
						return yyyy+MM+dd;
					case 'yyyy-mm-ddthh:mm:ss.fff':
						return yyyy+'-'+MM+'-'+dd+'T'+hh+':'+mm+':'+ss+'.'+fff;
					case 'yyyy-mm-dd hh:mm:ss.fff':
						return yyyy+'-'+MM+'-'+dd+' '+hh+':'+mm+':'+ss+'.'+fff;
					case 'mm/dd/yyyy hh:mm:ss.fff':
						return MM+'/'+dd+'/'+yyyy+' '+hh+':'+mm+':'+ss+'.'+fff;
					case 'yyyy-mm-ddthh:mm:ss':
						return yyyy+'-'+MM+'-'+dd+'T'+hh+':'+mm+':'+ss;
					case 'yyyy-mm-dd hh:mm:ss':
						return yyyy+'-'+MM+'-'+dd+' '+hh+':'+mm+':'+ss;
					case 'mm/dd/yyyy hh:mm:ss':
						return MM+'/'+dd+'/'+yyyy+' '+hh+':'+mm+':'+ss;
					case 'yyyy-mm-ddthh:mm':
						return yyyy+'-'+MM+'-'+dd+'T'+hh+':'+mm;
					case 'yyyy-mm-dd hh:mm':
						return yyyy+'-'+MM+'-'+dd+' '+hh+':'+mm;
					case 'mm/dd/yyyy hh:mm':
						return MM+'/'+dd+'/'+yyyy+' '+hh+':'+mm;
					case 'yyyy-mm-dd':
						return yyyy+'-'+MM+'-'+dd;
					case 'mm/dd/yyyy':
						return MM+'/'+dd+'/'+yyyy;
					default:
						return undefined;
				}
			}
		}
        return date.toString();
    };
    api.date.timezone = function() {
		return (new Date()).getTimezoneOffset();
	};
    api.date.timeoffset = function() {
		var now = new Date();
		var date1 = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
		var date2 = new Date(now.getFullYear(), 6, 1, 0, 0, 0, 0);
		var tmp = date1.toUTCString();
		var date3 = new Date(tmp.substring(0, tmp.lastIndexOf(' ') - 1));
		tmp = date2.toUTCString();
		var date4 = new Date(tmp.substring(0, tmp.lastIndexOf(' ') - 1));
		var minutesDiffStdTime = (date1 - date3) / (1000 * 60);
		var minutesDiffDaylightTime = (date2 - date4) / (1000 * 60);
		var gmt = minutesDiffStdTime > minutesDiffDaylightTime ? minutesDiffDaylightTime : minutesDiffStdTime;
		return gmt;
	};
	api.date.datepart = function(date) {
		date = new Date(date.getTime());
		date.setHours(0,0,0,0);
		return date;
	};
	api.date.toLocal = function(date) {
		return new Date(date.getTime() + api.date.timeoffset() *  60 * 1000);
	};
	api.date.toUTC = function(date) {
		return new Date(date.getTime() - api.date.timeoffset() *  60 * 1000);
	};
	api.date.nowUTC = function() {
		return api.date.toUTC(new Date());
	};
	api.date.age = function(dob) {
		var today = new Date();
		var age = today.getFullYear() - dob.getFullYear();
		var m = today.getMonth() - dob.getMonth();
		if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
			age--;
		}
		return age;
	};

	// ****************************************************
	// localStorage
	// ****************************************************	
	api.localStorage = {};
	api.localStorage.value = function(key, value) {
		try
		{
		if (value === undefined) {
			var text = localStorage[key];
			return (text && text !== 'undefined') ? JSON.parse(text) : null;
		} else {
			localStorage[key] = JSON.stringify(value);
		}
		} catch(e) {}
	};

	// ****************************************************
	// GET, POST XMLHttpRequest
	// ****************************************************
	api.get = function(url, callback) {
		var req = new XMLHttpRequest();
		req.open('GET', url);
		req.onreadystatechange = function() {
			if (req.readyState == 4) {
				callback(req.status, req.responseText);
			}
		};
		req.send(null);
	};
	api.post = function(url, data, callback) {
		var req = new XMLHttpRequest();
		req.open('POST', url);
		req.onreadystatechange = function() {
			if (req.readyState == 4) {
				if (callback) callback(req.status, req.responseText);
			}
		};
		if (typeof data === 'string') {
			req.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
			req.send(data);
		} else  {
			req.setRequestHeader('Content-type', 'application/json; charset=utf-8');
			req.send(JSON.stringify(data));
		}
	};

	// ****************************************************
	// Checksum
	// ****************************************************
	var crc32 = null;
	var crc32table = function() {
		if (!crc32) {
			var c;
			var crcTable = [];
			for (var n = 0; n < 256; ++n){
				c = n;
				for(var k =0; k < 8; k++){
					c = ((c&1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));
				}
				crcTable[n] = c;
			}
			crc32 = crcTable;
		}
		return crc32;
	};
	api.crc32 = function(data, previous) {
		if (crc !== undefined) crc = -1;
		var i;
		var l;

		var table = crc32table();
		if (typeof data === 'string') {
			var str = data;
			var c;
			for (i = 0, l = str.length; i < l; ++i) {
				c = str.charCodeAt(i);
				if (c < 0x80) {
					crc = (crc >>> 8) ^ table[(crc ^ c) & 0xFF];
				} else if(c < 0x800) {
					crc = (crc >>> 8) ^ table[(crc ^ (192|((c>>6)&31))) & 0xFF];
					crc = (crc >>> 8) ^ table[(crc ^ (128|(c&63))) & 0xFF];
				} else if (c >= 0xD800 && c < 0xE000) {
					c = (c&1023)+64; d = str.charCodeAt(i++) & 1023;
					crc = (crc >>> 8) ^ table[(crc ^ (240|((c>>8)&7))) & 0xFF];
					crc = (crc >>> 8) ^ table[(crc ^ (128|((c>>2)&63))) & 0xFF];
					crc = (crc >>> 8) ^ table[(crc ^ (128|((d>>6)&15)|(c&3))) & 0xFF];
					crc = (crc >>> 8) ^ table[(crc ^ (128|(d&63))) & 0xFF];
				} else {
					crc = (crc >>> 8) ^ table[(crc ^ (224|((c>>12)&15))) & 0xFF];
					crc = (crc >>> 8) ^ table[(crc ^ (128|((c>>6)&63))) & 0xFF];
					crc = (crc >>> 8) ^ table[(crc ^ (128|(c&63))) & 0xFF];
				}
			}
			crc = crc ^ -1;
		} else if (Buffer) {
			var buf = Buffer.isBuffer(data) ? data : Buffer(data);
			if (Buffer.isBuffer(crc)) {
				crc = crc.readUInt32BE(0);
			}
			crc = ~~crc ^ -1;
			for (i = 0, l = str.length; i < l; ++i) {
				crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xff];
			}
			crc = crc ^ -1;
		}
		return crc;
	};
	
	// ****************************************************
	// Common object
	// ****************************************************
	/*
	Build a compare function based on the input param
	param: (prop | xprop | multi)
	prop: string
	xprop: { 'property': prop, 'caseInsensitive': (true|false) }
	mprop: [ (prop | xprop), ... ]
	*/
	api.comparator = function(param) {
		return function(a, b) {
			var ax;
			var bx;
			var af;
			var bf;
		
			// prop: sorted by one property, default: case sensitive
			if (typeof param === 'string') {
				ax = a[param];
				bx = b[param];
				
				if (ax != bx) {
				
					// if they are number?
					af = parseFloat(ax);
					bf = parseFloat(bx);
					if (af !== Number.NaN && bf !== Number.NaN) {
						return af < bf ? -1 : 1;
					}
					
					return ax < bx ? -1 : 1;
				}
				
			// xprop: sorted by one property, explicitly stating if case insensitive
			} else if (!api.isArray(param)) {
				ax = a[param.property];
				bx = b[param.property];
				
				if (param.caseInsensitive 
				&& (typeof ax === 'string')
				&& (typeof bx === 'string')) {
					ax = ax.toLowerCase();
					bx = bx.toLowerCase();
				}
				
				if (ax != bx) {
					return ax < bx ? -1 : 1;
				}
			
			// mprop: sorted by multiple properties
			} else {
				var length = param.length;
				for (var i = 0; i < length; ++i) {
					var item = param[i];
					
					// prop
					if (typeof item === 'string') {
						ax = a[item];
						bx = b[item];
						
						// if they are number?
						af = parseFloat(ax);
						bf = parseFloat(bx);
						if (af !== Number.NaN && bf !== Number.NaN) {
							return af < bf ? -1 : 1;
						}
						
						if (ax != bx) {
							return ax < bx ? -1 : 1;
						}
					
					// xprop
					} else {
						ax = a[item.property];
						bx = b[item.property];
						
						if (item.caseInsensitive 
						&& (typeof ax === 'string')
						&& (typeof bx === 'string')) {
							ax = ax.toLowerCase();
							bx = bx.toLowerCase();
						}
						
						if (ax != bx) {
							return ax < bx ? -1 : 1;
						}
					}
				}
			}
			
			return 0;
		};
	};
	
	/*
	Detect where the object is an array
	*/
	api.isArray = function(object) {
		return object.constructor == Array;
	};
	
	api.forEach = function(elements, callback) {
		if (api.isArray(elements)) {
			elements.forEach(callback);
		} else {
			for (var key in elements) {
				if (!elements.hasOwnProperty(key)) continue;
				callback(elements[key], key);
			}
		}
	};
	
	api.every = function(elements, callback) {
		if (api.isArray(elements)) {
			return elements.every(callback);
		} else {
			for (var key in elements) {
				if (!elements.hasOwnProperty(key)) continue;
				if (!callback(elements[key], key)) {
					return false;
				}
			}
			return true;
		}
	};
	
	/*
	Upate existing element with new additional property
	*/
	api.update = function(element, update) {
		if (!element) return update;
		
		// check if update is partial properties
		var partial = false;
		for (var i in element) {
			if (update[i] === undefined) {
				partial = true;
				break;
			}
		}

		// if partial then reuse properties that are note provided by update
		if (partial) {
			element = api.clone(element);
			for (i in update) {
				element[i] = update[i];
			}
			return element;
		} else {
			return update;
		}
	};

	/*
	Build an array of elements, sorted by the comparator from the optional input param
	elements: ([] | {})
	param: as api.comparator
	*/
	api.array = function(elements, param) {
		var array = [];
		for (var i in elements) {
			if (!elements.hasOwnProperty(i)) continue;
			array.push(elements[i]);
		}
		if (param) {
			array.sort(api.comparator(param));
		}
		return array;
	};
	
	/*
	Build an object with elements as properties a.k.a dictionary, with the param
	specifying which properties of element should be used for indexing.
	param: similar to api.comparator
	*/
	api.dictionary = function(elements, param, dict) {
		if (!dict) dict = { };
		for (var i in elements) {
			if (!elements.hasOwnProperty(i)) continue;
			
			var element = elements[i];
			var array;
			var key;
			
			// prop: indexed by one property, default: case sensitive
			if (typeof param === 'string') {
				key = element[param];
				dict[key] = element;

			// xprop: indexed by one property, explicitly stating if case insensitive
			} else if (!api.isArray(param)) {
				key = element[param.property];
				
				if (param.caseInsensitive 
				&& (typeof key === 'string')) {
					key = key.toLowerCase();
				}
				
				if (param.appends) {
					array = dict[key];
					if (!array) {
						dict[key] = array = [];
					}
					array.push(element);
				} else {
					dict[key] = element;
				}
			
			
			// mprop: indexed by multiple properties
			} else {
				var keys = [];
				
				var length = param.length;
				for (var j = 0; j < length; ++j) {
					var item = param[j];
					
					// prop
					if (typeof item === 'string') {
						key = element[item];

					// xprop
					} else {
						key = element[item.property];
				
						if (item.caseInsensitive 
						&& (typeof key === 'string')) {
							key = key.toLowerCase();
						}
					}
					
					keys.push(key);
				}
				key = keys.join(',');
				
				if (param.appends) {
					array = dict[key];
					if (!array) {
						dict[key] = array = [];
					}
					array.push(element);
				} else {
					dict[key] = element;
				}
			}
		}
		return dict;
	};

	/*
	Build a tuple of elements based on the input param
	param: { 'as': as, 'array': aparam, 'dictionary': dparam }
	as: (undefined | string) -> the input elements should be a property of tuple, i.e. tuple[as] = elements
	aparam: (undefined | comparator(param)) -> build an array of elements sorted by comparator(param)
	dparam: (undefined | dictionary(param)) -> build multiple entry to elements

	tuple {
	   as: elements,
	   'array': [ element, ... ],
	   'by_' + entry: { entry: element, ... }
	}
	*/
	api.tuple = function(elements, param, tuple) {
		if (!tuple) tuple = { };

		if (param.array) {
			tuple.array = api.array(elements, param.array);
		}
		
		var entry = function(label) {
			// prop: indexed by one property
			if (typeof label === 'string') {
				return 'by_' + label;

			// xprop: indexed by one property, explicitly stating if case insensitive
			} else if (!api.isArray(label)) {
				return 'by_' + label.property;

			// multi: indexed by multiple properties
			} else {
				var keys = [];
			
				var length = label.length;
				for (var j = 0; j < length; ++j) {
					var item = label[j];
					keys.push((typeof item === 'string') ? item : item.property);
				}
			
				return 'by_' + keys.join(',');
			}
		};
		
		if (param.dictionary) {
			tuple[entry(param.dictionary)] = api.dictionary(elements, param.dictionary);
		}
		if (param.dictionaries) {
			for (var i in param.dictionaries) {
				if (!param.dictionaries.hasOwnProperty(i)) continue;
				var dparam = param.dictionaries[i];
				tuple[entry(dparam)] = api.dictionary(elements, dparam);
			}
		}
		
		return tuple;
	};
	
	/* get property value */
	api.prop = function(element, name) {
		if (api.isArray(name)) {
			var values = [ ];
			for (var i in name) {
				if (!name.hasOwnProperty(i)) continue;
				var key = name[i];
				var value = element[key];
				values.push(value);
			}
			return values.join(',');
		} else {
			return element[name];
		}
	};
	
	// Convert property of element from JSON text to object
	// fromto: (prop | multi)
	// prop: { from, to }
	// multi: [ prop, ... ]
	api.dejson = function(element, fromto) {
		if (element) {
			var array = api.isArray(fromto) ? fromto : [fromto];
			array.forEach(function(fromto) {
				var value = element[fromto.from];
				if (typeof value === 'string') {
					element[fromto.to] = JSON.parse(value);
				}
			});
		}
		return element;
	};
	
	// Clone an object, the option deep parameter specifies if it is a deep clone.
	api.clone = function(element, deep) {
		if (typeof element === 'object') {
			var clone = api.isArray(element) ? [] : {};
			for (var i in element) {
				if (!element.hasOwnProperty(i)) continue;
				clone[i] = (deep) ?
					api.clone(element[i], true) :
					element[i];
			}
			return clone;
		} else {
			return element;
		}
	};

	api.extract = function(element, property) {
		if (typeof element === 'object') {
			var results = [];
			var elements = api.isArray(element)? element: [element];
			elements.forEach(function(element) {
				var result =  {};
				var array = api.isArray(property) ? property : [property];
				array.forEach(function(property) {
					if (element.hasOwnProperty(property)) {
						result[property] = element[property];
					} else {
						throw 'The element does not have the property ' + property;
					}
				});
				results.push(result);
			});
			return api.isArray(element) ? results : results[0];
		} else {
			return element;
		}
	};
	
	api.clean = function(element, property) {
		if (typeof element === 'object') {
			var results = [];
			var elements = api.isArray(element)? element: [element];
			elements.forEach(function(element) {
				var result =  api.clone(element);
				var array = api.isArray(property) ? property : [property];
				array.forEach(function(property) {
					delete result[property];
				});
				results.push(result);
			});
			return api.isArray(element) ? results : results[0];
		} else {
			return element;
		}
	};
	
	api.log = function(msg) {
		var t = new Date();
		var h = t.getHours();
		var m = t.getMinutes();
		var s = t.getSeconds();
		var ms = t.getMilliseconds();

		h =  (h / 100).toFixed(2).toString().slice(2);
		m =  (m / 100).toFixed(2).toString().slice(2);
		s =  (s / 100).toFixed(2).toString().slice(2);
		ms = (ms / 1000).toFixed(3).toString().slice(2);

		var output = '[' + h + ':' + m + ':' + s + ' ' + ms + '] ' + msg;

		if (typeof window !== 'undefined') {
			if (window.console && window.console.log) {
				window.console.log(output);
			}
			if (document && document.getElementById) {
				var e = document.getElementById('__debug_log');
				if (e) {
					e.innerHTML += '<br/>' + output;
				}
			}
		} else if (typeof console !== 'undefined') {
			console.log(output);
		}
	};	

	// ****************************************************
	// Browser
	// ****************************************************
	if (typeof window !== 'undefined') {
		var isTouchDevice = undefined;
		api.isTouchDevice = function() {
			if (isTouchDevice === undefined) {
				isTouchDevice = !!('ontouchstart' in window) ? true : false;
			}
			return isTouchDevice;
		};
	
		api.webapp = { };
		api.webapp.checkUpdates = function() {
			if (window && window.applicationCache) {
				// Checking for an update. Always the first event fired in the sequence.
				window.applicationCache.addEventListener('checking', function(e) {
					api.log('AppUpdate: checking');
				}, false);
	
				// Fired after the first download of the manifest.
				window.applicationCache.addEventListener('noupdate', function(e) {
					api.log('AppUpdate: noupdate');
				}, false);

				// An update was found. The browser is fetching resources.
				window.applicationCache.addEventListener('downloading', function(e) {
					api.log('AppUpdate: downloading');
				}, false);
	
				// Download progress.
				window.applicationCache.addEventListener('progress', function(e) {
					api.log('AppUpdate: progress - Loaded ' + e.loaded + ' of ' + e.total + ' files.');
				}, false);
	
				// Cached. (First time?)
				window.applicationCache.addEventListener('cached', function(e) {
					api.log('AppUpdate: cached');
				}, false);
	
				// Fired when the manifest resources have been newly redownloaded.
				window.applicationCache.addEventListener('updateready', function(e) {
					api.log('AppUpdate: updateready');
					document.location.reload();
				}, false);
	
				// Fired when the manifest cannot be found.
				window.applicationCache.addEventListener('obsolete', function(e) {
					api.log('AppUpdate: obsolete');
				}, false);
	
				// Fired when the manifest cannot be found.
				window.applicationCache.addEventListener('error', function(e) {
					api.log('AppUpdate: error');
				}, false);
			}
		};
	}
}(this));
