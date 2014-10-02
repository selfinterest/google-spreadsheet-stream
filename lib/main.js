/**
 * Created by twatson on 9/24/14.
 */

"use strict";

var Spreadsheet = require("./spreadsheet");
var GoogleSpreadsheetStream = require("./google-spreadsheet-stream");
var path = require("path");

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

GsStreamConstructor.prototype.createStream = function(streamOptions){

	streamOptions = streamOptions || {};

	["spread", "work"].forEach(function(i){
		var property = "_" + i + "sheet";
		if(!this[property+"Name"] && !this[property + "Id"]) {
			throw new Error("Must have at least "+property+"Name or "+property+"Id");
		}
	}.bind(this));



	var googleSpreadsheetStream = new GoogleSpreadsheetStream(this, Spreadsheet(this).init(), streamOptions);

	/*Spreadsheet(this).init().then(function(spreadsheet){
		spreadsheet.getRequest().pipe(googleSpreadsheetStream);
	}).done();*/

	return googleSpreadsheetStream;


/*		return spreadsheet.init().then(function(stream){

		return stream;
			//stream object should be here
	}, function(e){
		throw e;
	});*/

};
//Construct one stream to start. Most applications would probably only need one of these
GsStreamConstructor.stream = new GsStreamConstructor();


module.exports = GsStreamConstructor;
