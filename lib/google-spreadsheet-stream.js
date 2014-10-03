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
		//streamOptions.encoding = "utf8";
		Transform.call(this, streamOptions);

		var tokenPromise = getToken(optionsObject.email(), optionsObject.keyFile());

		Q.all([spreadsheetPromise, tokenPromise]).spread(function(spreadsheet, token){
			this.stream = request({
				url: spreadsheet.baseUrl(),
				headers: {
				         authorization: "Bearer "+token
				}
			});

			this.xml = new XmlStream(this.stream);

			var otherStream = _('endElement entry', this.xml);          //Highland wraps this up in a stream

			this.xml.on("endElement openSearch:totalResults", function(data){
				this.emit("totalResults", data.$text);
			}.bind(this));

			this.xml.on('endElement openSearch:startIndex', function(data){
				this.emit("startIndex", data.$text);
			}.bind(this));

			otherStream.pipe(this);
		}.bind(this)).done();

	} else {
		return new GoogleSpreadsheetStream(optionsObject, spreadsheetPromise, streamOptions);
	}
	this._lastChunk = "";

	this.regexes = {
		openEntry: /<entry.*>/,
		closedEntry: /<\/entry>/,
		both: /<entry.*>.*<\/entry>/,
		bothNoRetrieve: /<entry.*>.*<\/entry>/
	}
}

GoogleSpreadsheetStream.prototype._transform = function(chunk, encoding, done){
	//The object form of the entry needs to be further parsed.

	var obj = {};
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