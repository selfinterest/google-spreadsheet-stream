/**
 * Created by twatson on 9/24/14.
 */

"use strict";

var Spreadsheet = require("./spreadsheet");
var GoogleSpreadsheetStream = require("./google-spreadsheet-stream");
var GoogleJsonSpreadsheetStream = require("./google-json-spreadsheet-stream");
var path = require("path");

function GsStreamFactory(){
	if(this instanceof GsStreamFactory){
		this.initialized = false;
		this.useHTTPS = "";
		this._offset = null;
		this._limit = null;
		this._query = null;
	} else {
		return new GsStreamFactory();
	}
}

GsStreamFactory.prototype.email = function(email){
	if(typeof email === "undefined"){
		return this._email;
	} else {
		this._email = email;
		return this;
	}

};

GsStreamFactory.prototype.keyFile = function(keyfile){
	if(typeof keyfile === "undefined"){
		return this._keyFile;
	} else {
		this._keyFile = path.resolve(keyfile);
		return this;
	}

};

GsStreamFactory.prototype.https = function(useHttps){
	if(typeof useHttps === "undefined") {
		return this.useHTTPS;
	} else {
		this.useHTTPS = useHttps ? 's' : "";
		return this;
	}

};

GsStreamFactory.prototype.worksheetName = function(worksheetName){
	if(typeof worksheetName === "undefined"){
		return this._worksheetName;
	} else {
		this._worksheetName = worksheetName;
		return this;
	}

};

GsStreamFactory.prototype.spreadsheetName = function(spreadsheetName) {
	if(typeof spreadsheetName === "undefined"){
		return this._spreadsheetName;
	} else {
		this._spreadsheetName = spreadsheetName;
		return this;
	}
};

GsStreamFactory.prototype.spreadsheetId = function(spreadsheetId){
	if(typeof spreadsheetId === "undefined") {
		return this._spreadsheetId;
	} else {
		this._spreadsheetId = spreadsheetId;
		return this;
	}

};

GsStreamFactory.prototype.worksheetId = function(worksheetId){
	if(typeof worksheetId === "undefined") {
		return this._worksheetId;
	} else {
		this._worksheetId = worksheetId;
		return this;
	}
};

GsStreamFactory.prototype.offset = function(offset){
	if(typeof offset === "undefined"){
		return this._offset;
	} else {
		this._offset = offset;
		return this;
	}
};

GsStreamFactory.prototype.limit = function(limit){
	if(typeof limit === "undefined"){
		return this._limit;
	} else {
		this._limit = limit;
		return this;
	}
};

GsStreamFactory.prototype.query = function(query){
	if(typeof query === "undefined"){
		return this._query;
	} else {
		this._query = query;
		return this;
	}
};

GsStreamFactory.prototype.createStream = function(streamOptions){

	streamOptions = streamOptions || {};

	["spread", "work"].forEach(function(i){
		var property = "_" + i + "sheet";
		if(!this[property+"Name"] && !this[property + "Id"]) {
			throw new Error("Must have at least "+property+"Name or "+property+"Id");
		}
	}.bind(this));



	return new GoogleSpreadsheetStream(this, Spreadsheet(this).init(), streamOptions);


};


GsStreamFactory.prototype.createJsonStream = function(streamOptions){
	streamOptions = streamOptions || {};

	["spread", "work"].forEach(function(i){
		var property = "_" + i + "sheet";
		if(!this[property+"Name"] && !this[property + "Id"]) {
			throw new Error("Must have at least "+property+"Name or "+property+"Id");
		}
	}.bind(this));

	return new GoogleJsonSpreadsheetStream(this, Spreadsheet(this).init(), streamOptions);
};
//Construct one factory to start. Most applications would probably only need one of these
GsStreamFactory.factory = new GsStreamFactory();


module.exports = GsStreamFactory;
