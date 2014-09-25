/**
 * Created by twatson on 9/24/14.
 */

var request = require('google-oauth-jwt').requestWithJWT(),
	Q = require("q"),
	_ = require("lodash")
	;

function Spreadsheet(options){
	this.options = options;
	this.raw = {};
	this.protocol = 'http';
	this.reset();
}

Spreadsheet.prototype.reset = function() {
	//map { r: { c: CELLX, c: CELLY }}
	this.entries = {};
	//map { name: CELL }
	this.names = {};
};

Spreadsheet.prototype.init = function(token, callback) {
	var _this = this;
	this.getSheetId('spread', function(err) {
		if (err) return callback(err, null);
		_this.getSheetId('work', function(err) {
			if (err) return callback(err, null);
			_this.setTemplates();
			callback(null, _this);
		});
	});
};

Spreadsheet.prototype.getSheetId = function(type, callback) {

	var _this = this;
	var id = type + 'sheetId';
	var display = type.charAt(0).toUpperCase() + type.substr(1) + 'sheet';
	var name = this[type + 'sheetName'];
	var spreadsheetUrlId = type === 'work' ? ('/' + this.spreadsheetId) : '';

	//already have id
	if (this[id])
		return callback(null);

	this.log(("Searching for " + display + " '" + name + "'...").grey);

	this.request({
		url: this.protocol + '://spreadsheets.google.com/feeds/' +
			     type + 'sheets' + spreadsheetUrlId + '/private/full'
	}, function(err, result) {
		if (err) return callback(err);

		var entries = result.feed.entry || [];

		// Force array format for result
		if (!(entries instanceof Array)) {
			entries = [entries];
		}

		//store raw mapped results
		_this.raw[type + 'sheets'] = entries.map(function(e1) {
			var e2 = {};
			for (var prop in e1) {
				var val = e1[prop];
				//remove silly $t object
				if (typeof val === 'object') {
					var keys = Object.keys(val);
					if (keys.length === 1 && keys[0] === "$t")
						val = val.$t;
				}
				//remove silly gs$
				if (/^g[a-z]\$(\w+)/.test(prop))
					e2[RegExp.$1] = val;
				else
					e2[prop] = val;
			}
			//search for 'name', extract only end portion of URL!
			if (e2.title === name && e2.id && /([^\/]+)$/.test(e2.id))
				_this[id] = RegExp.$1;

			return e2;
		});

		var m = null;
		if (!_this[id])
			return callback(type + "sheet '" + name + "' not found");

		_this.log(("Tip: Use option '" + type + "sheetId: \"" + _this[id] + "\"' for improved performance").yellow);
		callback(null);

	});
};

Spreadsheet.prototype.baseUrl = function() {
	return this.protocol + '://spreadsheets.google.com/feeds/cells/' + this.spreadsheetId + '/' + this.worksheetId + '/private/full';
};


Spreadsheet.prototype.request = function(url){

	if(!this.email || !this.keyfile) throw new Error("email and keyfile are required.");

	return Q.Promise(function(resolve, reject, notify){
		if(!url) url = this.baseUrl();
		request({
			url: url,
			jwt: {
				scopes: ["https://spreadsheets.google.com/feeds", "https://docs.google.com/feeds"],
				email: this.email,
				keyfile: this.keyfile
			}
		}, function(err, response, body){
			if(err) {
				reject(err);
			} else {
				if(!response) {
					reject("No response");
				} else {
					if(response.statusCode !== 200){
						reject(body);
					} else {
						var result;
						try {
							result = JSON.parse(body);
						} catch (e) {
							try {
								result = JSON.parse(xmlutil.toJson(body));
							} catch (e) {
								reject("Bad response format.");
							}
						}

						resolve(result);
					}
				}
			}
		});
	}.bind(this));
}
module.exports = Spreadsheet;