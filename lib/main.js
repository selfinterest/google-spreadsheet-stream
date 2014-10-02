/**
 * Created by twatson on 9/24/14.
 */

"use strict";







var Spreadsheet = require("./spreadsheet");
var path = require("path");

function baseUrl(spreadsheetId, worksheetId){
	return 'https://spreadsheets.google.com/feeds/cells/' + spreadsheetId + '/' + worksheetId + '/private/full';
}


/**
 * Returns a url that can be queried for additional spreadsheet info
 * @param type Either spread or work
 * @param spreadsheetId If work, we also need the spreadsheetId
 */
function queryForSheetInfo(type, spreadsheetId, options){
	var id = type + 'sheetId';
	var display = type.charAt(0).toUpperCase() + type.substr(1) + 'sheet';
	var name = this[type + 'sheetName'];
	var spreadsheetUrlId = type === 'work' ? ('/' + spreadsheetId) : '';

	return Q.Promise(function(resolve, reject, notify){
		request({
			url: "https://spreadsheets.google.com/feeds/" + type + 'sheets' + spreadsheetUrlId + '/private/full',
			jwt: {
				scopes: ["https://spreadsheets.google.com/feeds", "https://docs.google.com/feeds"],
				email: '759184919979-tfinm66j1hq49b3690039o8mfn60gfe3@developer.gserviceaccount.com',
			    keyfile: __dirname + "/../primary-documents-key-file.pem"
			}

		}, function(err, result){
			if(err) {
				reject(err);
			} else {
				var id = null;
				var entries = result.feed.entry || [];
				var raw = {};

				// Force array format for result
				if (!(entries instanceof Array)) {
					entries = [entries];
				}

				//store raw mapped results
				raw[type + 'sheets'] = entries.map(function(e1) {
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
						id = RegExp.$1;

					return e2;
				});

				var m = null;

				//if (!id])
				//	return callback(type + "sheet '" + name + "' not found");*/

				if(id){
					console.log("Tip: Use option '" + type + "sheetId: \"" + id + "\"' for improved performance");
					resolve(id);
				} else {
					resolve(null);
				}

				//callback(null);
			}
		})
	})

}


/*exports.createGsStream = function(options){
	var spreadsheet = new Spreadsheet(options);

	//default to http's' when undefined
	options.useHTTPS = options.useHTTPS === false ? '' : 's';
	spreadsheet.protocol += options.useHTTPS;

	//add to spreadsheet
	_.extend(spreadsheet, _.pick(options,
		'spreadsheetId', 'spreadsheetName',
		'worksheetId', 'worksheetName', 'debug'
	));

	if(!options.email) throw new Error("Email option is required.");
	if(!options.keyfile) throw new Error("keyfile is required");

	spreadsheet.email = options.email;
	spreadsheet.keyfile = options.keyfile;

	spreadsheet.init()

};*/

function GsStreamConstructor(){
	if(this instanceof GsStreamConstructor){
		this.initialized = false;
		this.useHTTPS = "";
	} else {
		return new GsStreamConstructor();
	}
}

GsStreamConstructor.prototype.email = function(email){
	if(typeof email === "undefined"){
		return this._email;
	} else {
		this._email = email;
		return this;
	}

};

GsStreamConstructor.prototype.keyFile = function(keyfile){
	if(typeof keyfile === "undefined"){
		return this._keyFile;
	} else {
		this._keyFile = path.resolve(keyfile);
		return this;
	}

};

GsStreamConstructor.prototype.https = function(useHttps){
	if(typeof useHttps === "undefined") {
		return this.useHTTPS;
	} else {
		this.useHTTPS = useHttps ? 's' : "";
		return this;
	}

};

GsStreamConstructor.prototype.worksheetName = function(worksheetName){
	if(typeof worksheetName === "undefined"){
		return this._worksheetName;
	} else {
		this._worksheetName = worksheetName;
		return this;
	}

};

GsStreamConstructor.prototype.spreadsheetName = function(spreadsheetName) {
	if(typeof spreadsheetName === "undefined"){
		return this._spreadsheetName;
	} else {
		this._spreadsheetName = spreadsheetName;
		return this;
	}
};

GsStreamConstructor.prototype.spreadsheetId = function(spreadsheetId){
	if(typeof spreadsheetId === "undefined") {
		return this._spreadsheetId;
	} else {
		this._spreadsheetId = spreadsheetId;
		return this;
	}

};

GsStreamConstructor.prototype.worksheetId = function(worksheetId){
	if(typeof worksheetId === "undefined") {
		return this._worksheetId;
	} else {
		this._worksheetId = worksheetId;
		return this;
	}
};

GsStreamConstructor.prototype.createStream = function(){

	["spread", "work"].forEach(function(i){
		var property = "_" + i + "sheet";
		if(!this[property+"Name"] && !this[property + "Id"]) {
			throw new Error("Must have at least "+property+"Name or "+property+"Id");
		}
	}.bind(this));

	var spreadsheet = Spreadsheet(this);
		return spreadsheet.init().then(function(stream){

		return stream;
			//stream object should be here
	}, function(e){
		throw e;
	});

};
//Construct one stream to start. Most applications would probably only need one of these
GsStreamConstructor.stream = new GsStreamConstructor();


module.exports = GsStreamConstructor;
