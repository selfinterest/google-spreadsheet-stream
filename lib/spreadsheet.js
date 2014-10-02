/**
 * Created by twatson on 9/24/14.
 */

var request = require('google-oauth-jwt').requestWithJWT(),
	Q = require("q"),
	_ = require("lodash"),
	winston = require("winston"),
	parser = require("xml2json")
	;

function Spreadsheet(options){
	if(this instanceof Spreadsheet){
		this.options = options || {};
		this.raw = {};
		this.protocol = 'http' + this.options.https();

		this.log = winston.info;

		if(this.options.spreadsheetId){
			this.spreadsheetId = this.options.spreadsheetId();
		}

		if(this.options.worksheetId){
			this.worksheetId = this.options.worksheetId();
		}

		if(this.options.worksheetName){
			this.worksheetName = this.options.worksheetName();
		}

		if(this.options.spreadsheetName){
			this.spreadsheetName = this.options.spreadsheetName()
		}

		if(this.options.keyFile){
			this.keyFile = this.options.keyFile();
		}

		if(this.options.email){
			this.email = this.options.email();
		}

		if(this.options.limit){
			this.limit = this.options.limit();
		}

		if(this.options.offset){
			this.offset = this.options.offset();
		}


		this.reset();
	} else {
		return new Spreadsheet(options);
	}




}

Spreadsheet.prototype.reset = function() {
	//map { r: { c: CELLX, c: CELLY }}
	this.entries = {};
	//map { name: CELL }
	this.names = {};
};

Spreadsheet.prototype.init = function() {
	var promise1 = null, promise2 = null;

	if(!this.spreadsheetId){
		promise1 = this.getSheetId('spread');
	} else {
		promise1 = Q(this.spreadsheetId);
	}

	if(!this.worksheetId){
		promise2 = promise1.then(function(){
			return this.getSheetId('work');
		}.bind(this));
	} else {
		promise2 = promise1.then(function(){
			return this.worksheetId;
		}.bind(this));
	}


	return promise2.then(function(){
		return this;
	}.bind(this));

	/*return promise2.then(function(){
		return this;
	}.bind(this));*/

	/*if(!this.spreadsheetId){
		promise1 = this.getSheetId('spread');
	}

	if(!this.worksheetId){
		promise2 = Q(promise1).then(function(){
			return this.getSheetId("work");
		}.bind(this));
	}

	return Q(promise2).then(function(){
		return ;
	}.bind(this));*/

};

Spreadsheet.prototype.getSheetId = function(type) {
	return Q.Promise(function(resolve, reject, notify) {
		var id = type + 'sheetId';
		if (this[id]) resolve(this[id]); //if we already have that kind of id.
		var display = type.charAt(0).toUpperCase() + type.substr(1) + 'sheet';

		//Important: we expect either this.worksheetName or this.spreadsheetName to be defined at this point.
		var name = this[type + 'sheetName'];
		var spreadsheetUrlId = type === 'work' ? ('/' + this.spreadsheetId) : '';
		this.log(("Searching for " + display + " '" + name + "'..."));
		return this.request(
			this.protocol + '://spreadsheets.google.com/feeds/' +
				     type + 'sheets' + spreadsheetUrlId + '/private/full'
		).then(function (result) {
			var entries = result.feed.entry || [];

			// Force array format for result
			if (!(entries instanceof Array)) {
				entries = [entries];
			}

			this.raw[type + 'sheets'] = this.processEntries(entries, name, id);

			//store raw mapped results
			var m = null;
			if (!this[id]) {
				reject(type + "sheet '" + name + "' not found");
			} else {
				this.log("Tip: Use option '" + type + "sheetId: \"" + this[id] + "\"' for improved performance");
				resolve(this[id]);
			}



		}.bind(this));
	}.bind(this));

};

/**
 *
 * @param [entries]
 * @param name Either the name of the spreadsheet or the name of the worksheet. We're finding the id based on it.
 * @param id Either "spreadsheetId" or "worksheetId": the property of the spreadsheet object to fill.
 * @returns {*}
 */
Spreadsheet.prototype.processEntries = function(entries, name, id){
	return entries.map(function (e1) {
		var e2 = {};
		for (var prop in e1) {
			var val = e1[prop];
			//remove silly $t object
			if (typeof val === 'object') {
				if(val.$t) {
					val = val.$t;
				}
				/*var keys = Object.keys(val);
				if (keys.length > 1 && keys[0] === "$t")
					val = val.$t;*/
			}
			//remove silly gs$
			if (/^g[a-z]\$(\w+)/.test(prop))
				e2[RegExp.$1] = val;
			else
				e2[prop] = val;
		}
		//search for 'name', extract only end portion of URL!

		if (e2.title === name && e2.id && /([^\/]+)$/.test(e2.id)){

			this[id] = RegExp.$1;
		}


		return e2;
	}.bind(this));
};

Spreadsheet.prototype.baseUrl = function() {
	var url = this.protocol + '://spreadsheets.google.com/feeds/list/' + this.spreadsheetId + '/' + this.worksheetId + '/private/full';

	if(!this.offset && !this.limit) {
		return url;
	} else {
		url += "?";
		var query = "";

		if(this.limit){
			query += "max-results=" + this.limit;
		}

		if(this.offset){
			if(query) {
				query += "&";
			}
			query += "start-index=" + this.offset;
		}


		//query = encodeURIComponent(query);
		url += query;
		console.log(url);
		return url;
	}
};


Spreadsheet.prototype.request = function(url){

	if(!this.email || !this.keyFile) throw new Error("email and keyfile are required.");

	return Q.Promise(function(resolve, reject, notify){
		if(!url) url = this.baseUrl();
		request({
			url: url,
			jwt: {
				scopes: ["https://spreadsheets.google.com/feeds", "https://docs.google.com/feeds"],
				email: this.email,
				keyFile: this.keyFile
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
								result = parser.toJson(body, {object: true, sanitize: false});
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
};

Spreadsheet.prototype.getRequest = function(){
	return request({
		url: this.baseUrl(),
		jwt: {
			scopes: ["https://spreadsheets.google.com/feeds", "https://docs.google.com/feeds"],
			email: this.email,
			keyFile: this.keyFile
		}
	});
};

module.exports = Spreadsheet;