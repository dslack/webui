/**
 * @author Directrix
 */

function eventToKey(ev) {
	return (
		(ev.shift ? "shift " : "") +
		(ev.control ? "ctrl " : "") +
		(ev.alt ? "alt " : "") +
		(ev.meta ? "meta " : "") +
		ev.key
	);
}

function has(obj, key) {
	return Object.prototype.hasOwnProperty.apply(obj, [key]);
}

function changePort(port) {
	if (window.location.port != port) {
		// window.location.port = port; // Does NOT work on Opera

		function isIPv6(hostname) {
			return (hostname.search(/\[.*?\]/) >= 0);
		}

		var hostname = window.location.hostname;
		if (isIPv6(window.location.host) && !isIPv6(hostname))
			hostname = "[" + hostname + "]"; // Fix for Firefox

		window.location.href = window.location.protocol + "//" + hostname + ":" + port + window.location.pathname + window.location.search;
	}
}

function decodeID(str) {
	return unescape(str.replace(/_/g, '%'));
}

function encodeID(str) {
	return escape(str.replace(/[A-Za-z0-9\*\@\-\_\+\.\/]/g, function(c) { return "_" + c.charCodeAt(0).toString(16); })).replace(/%/g, '_');
}

Array.implement({

	// http://www.leepoint.net/notes-java/algorithms/searching/binarysearch.html
	"binarySearch": function(value, comparator, first, upto) {
		if (typeOf(comparator) != 'function') {
			comparator = function(a, b) {
				if (a === b) return 0;
				if (a < b) return -1;
				return 1;
			};
		}
		first = first || 0;
		upto = upto || this.length;
		while (first < upto) {
			var mid = parseInt((first + upto) / 2);
			var cv = comparator(value, this[mid]);
			if (cv < 0) {
				upto = mid;
			} else if (cv > 0) {
				first = mid + 1;
			} else {
				return mid;
			}
		}
		return -(first + 1);
	},


	"insertAt": function(value, index) {
		this.splice(index, 0, value);
		return this;
	},

	"swap": function(indexA, indexB) {
		var temp = this[indexA];
		this[indexA] = this[indexB];
		this[indexB] = temp;
		return this;
	},

	"remove": function(item) {
		for (var i = this.length; i--;) {
			if (this[i] === item) {
				this.splice(i, 1);
				return i;
			}
		}
		return -1;
	}

});

String.implement({

	"pad": function(len, str, type) {
		var inp = this;
		str = str || " ";
		type = type || "right";
		len -= inp.length;
		if (len < 0) return inp;
		str = (new Array(Math.ceil(len / str.length) + 1)).join(str).substr(0, len);
		return ((type == "left") ? (str + inp) : (inp + str));
	}

});

Number.implement({

	"toFixedNR": function(numdec) {
		var res = this.toFixed(20);
		return res.substring(0, res.length-(20-numdec));
	},

	"toFileSize": function(numdec, unit) {
		var sz = [lang[CONST.SIZE_B], lang[CONST.SIZE_KB], lang[CONST.SIZE_MB], lang[CONST.SIZE_GB], lang[CONST.SIZE_TB], lang[CONST.SIZE_PB], lang[CONST.SIZE_EB]];
		var szmax = sz.length-1;
		var size = this;

		// Force units to be at least kB
		unit = parseInt(unit, 10);
		if (isNaN(unit) || unit < 1) {
			unit = 1;
			size /= 1024;
		}

		while ((size >= 1024) && (unit < szmax)) {
			size /= 1024;
			unit++;
		}
		return (size.toFixedNR(typeOf(numdec) == 'number' ? numdec : 1) + " " + sz[unit]);
	},

	"toTimeString": function() {
		var secs = Number(this);
		if (secs > 63072000) return "\u221E"; // secs > 2 years ~= inf. :)
		var div, y, w, d, h, m, s, output = "";
		y = Math.floor(secs / 31536000);
		div = secs % 31536000;
		w = Math.floor(div / 604800);
		div = div % 604800;
		d = Math.floor(div / 86400);
		div = div % 86400;
		h = Math.floor(div / 3600);
		div = div % 3600;
		m = Math.floor(div / 60);
		s = div % 60;
		if (y > 0) {
			output = lang[CONST.TIME_YEARS_WEEKS].replace(/%d/, y).replace(/%d/, w);
		} else if (w > 0) {
			output = lang[CONST.TIME_WEEKS_DAYS].replace(/%d/, w).replace(/%d/, d);
		} else if (d > 0) {
			output = lang[CONST.TIME_DAYS_HOURS].replace(/%d/, d).replace(/%d/, h);
		} else if (h > 0) {
			output = lang[CONST.TIME_HOURS_MINS].replace(/%d/, h).replace(/%d/, m);
		} else if (m > 0) {
			output = lang[CONST.TIME_MINS_SECS].replace(/%d/, m).replace(/%d/, s);
		} else {
			output = lang[CONST.TIME_SECS].replace(/%d/, s);
		}
		return output;
	}

});

Element.implement({

	show: function(nonblock){
		this.fireEvent("show");
		return this.setStyle("display", nonblock ? "" : "block");
	},

	hide: function(){
		this.fireEvent("hide");
		return this.setStyle("display", "none");
	},

	centre: function(){
		this.show();
		var ws = window.getSize();
		var es = this.getSize();
		return this.setStyles({
			"left": ((ws.x - es.x) / 2).max(0),
			"top": ((ws.y - es.y) / 2).max(0)
		});
	},

	addClasses: function(){
		var l = arguments.length, clear = false, hasChanged = false;
		if (typeOf(arguments[l - 1]) == 'boolean')
			clear = arguments[--l];
		var cls = clear ? "" : this.className;
		while (l--) {
			var className = arguments[l];
			if ((className != "") && !cls.contains(className, " ")) {
				cls += " " + className;
				hasChanged = true;
			}
		}
		if (hasChanged)
			this.className = cls.clean();
		return this;
	}

});

Event.implement({
	"isRightClick": function() {
		return !!(this.rightClick || (this.control && (this.event.button === 0) && Browser.Platform.mac));
	}
});

[Document, Window].invoke("implement", {
	"getZoomSize": function() {
		if (Browser.opera && Browser.version >= 9.6) {
			return {x: document.body.clientWidth, y: document.body.clientHeight};
		}
		return this.getSize();
	}
});

[Element, Window, Document].invoke('implement', {
	"addStopEvent": function(type, fn) {
		return this.addEvent(type, function(ev) {
			var ret;
			if (typeOf(fn) == "function")
				ret = fn.apply(this, arguments);

			if (!ret) {
				ev.stop();
				return false;
			}
		});
	},

	"addStopEvents": function(events) {
		Object.each(events, function(fn, type) {
			this.addStopEvent(type, fn);
		}, this);

		return this;
	}
});

function $chk(obj) {
	return !!(obj || obj === 0);
}

function $clear(timer){
	clearTimeout(timer);
	clearInterval(timer);
	return null;
};

function $each(obj, fn, bind) {
	switch (typeOf(obj)) {
		case 'array':
		case 'collection':
			return Array.each(obj, fn, bind);
		default:
			return Object.each(obj, fn, bind);
	}
}
