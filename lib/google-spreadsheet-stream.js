/**
 * Created by twatson on 10/1/14.
 */

var util = require('util');
var Transform = require('stream').Transform;
util.inherits(GoogleSpreadsheetStream, Transform);
var _ = require("highland");
var Q = require("q");
var TokenCache = require('google-oauth-jwt').TokenCache,
	tokens = new TokenCache();

var XmlStream = require("xml-stream");
//We use a vanilla request object here to make use of its streaming capabilities.
var request = require("request");
var through2 = require('through2');

function getToken(email, keyFile){
	return Q.Promise(function(resolve, reject, notify){
		tokens.get({
			email: email,
			keyFile: keyFile,
			scopes: ["https://spreadsheets.google.com/feeds", "https://docs.google.com/feeds"]
		}, function(err, token){
			if(err) {
				reject(err);
			} else {
				resolve(token);
			}

		});
	});
}

function getSpreadsheetMetaDataStream(spreadsheet, token){

		return request({
			url: spreadsheet.metaUrl(),
			headers: {
				authorization: "Bearer " + token
			}
		});
}
/**
 *
 * @param optionsObject Options set by the main module
 * @param spreadsheetPromise This promise is fulfilled when spreadsheetId and worksheetId have been found (or immediately if they were supplied.)
 * @param streamOptions These options are passed right through to stream.Transform
 * @constructor
 */
function GoogleSpreadsheetStream(optionsObject, spreadsheetPromise, streamOptions) {
	if (this instanceof GoogleSpreadsheetStream) {
		streamOptions.objectMode = streamOptions.objectMode || true;        //object mode by default

		Transform.call(this, streamOptions);

		var tokenPromise = getToken(optionsObject.email(), optionsObject.keyFile());

		Q.all([spreadsheetPromise, tokenPromise]).spread(function(spreadsheet, token){
			this.stream = request({
				url: spreadsheet.baseUrl(),
				headers: {
				         authorization: "Bearer "+token
				}
			});


			//The XML stream for meta data
			this.metaXml = new XmlStream(getSpreadsheetMetaDataStream(spreadsheet, token));

			this.metaXml.on("endElement gs:rowCount", function(data){
				this.emit("rowCount", data.$text);
			}.bind(this));

			this.metaXml.on("endElement gs:colCount", function(data){
				this.emit("colCount", data.$text);
			}.bind(this));

			//The main XML stream
			this.xml = new XmlStream(this.stream);

			var otherStream = _('endElement entry', this.xml);          //Highland wraps this up in a stream. Only entry tags will be sent along to the main stream

			this.xml.on("endElement openSearch:totalResults", function(data){
				this.totalResults = data.$text;
				this.emit("totalResults", data.$text);
			}.bind(this));

			this.xml.on('endElement openSearch:startIndex', function(data){
				this.emit("startIndex", data.$text);
			}.bind(this));

			this.xml.on("end", function(){
				this.emit("end");
			}.bind(this));



			otherStream.pipe(this);
		}.bind(this)).done();

	} else {
		return new GoogleSpreadsheetStream(optionsObject, spreadsheetPromise, streamOptions);
	}


}

GoogleSpreadsheetStream.prototype._transform = function(chunk, encoding, done){
	//The object form of the entry needs to be further parsed.

	var obj = {};
	obj._id = chunk.id;
	for(var key in chunk){
		var matches = key.match(/^gsx:(.*)/);
		if(matches){
			obj[matches[1]] = chunk[key];
		}
	}

	this.emit("row", obj);
	this.push(obj);
	done();

};


module.exports = GoogleSpreadsheetStream;