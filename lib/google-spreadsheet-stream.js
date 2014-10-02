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
			//var infoStream = _('endElement opensearch:totalResults', this.xml); //ditto

			/*infoStream.pipe(through2.obj(function(chunk, encoding, done){


			}));*/

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
	/*if(!this.xml){
		this.xml = new XmlStream(this.stream);
		this.xml.on("data", function(entry){
			console.log(entry);
			this.push(entry);
		}.bind(this));
		this.xml.on("end", function(){
			done();
		});

		this.xml.on("error", function(){
			console.log(arguments);
		})
	}*/


	//Does this chunk contain <entry>?
	//var chunkAsString = chunk.toString();
	/*var chunkAsString = chunk.toString();
	console.log(xml2json.toJson(chunkAsString));
	//console.log(chunkAsString);

	var matches = chunkAsString.match(this.regexes.both);

	//var matches = chunkAsString.match(this.regexes.both);
	if(matches){

		//console.log("HERERE");
		//console.log("\n" + matches[1]);
		console.log(matches[0]);
		this.push(parser.toJson(matches[0], {object: true}));
		done();
	} else {
		if(this.regexes.openEntry.test(chunkAsString)){
			console.log("Open entry");
			this._partEntry = chunkAsString;
			this.openEntry = true;
		}

		if(this.regexes.closedEntry.test(chunkAsString)){
			console.log("Closd entry");
			this._partEntry += chunkAsString;
			this.push(this._partEntry);
			this.openEntry = false;
		}

		done();
	}









	/*console.log(chunk.toString() + "\n");


	this.push(chunk);

	this._lastChunk = chunk;
	done();*/
};

module.exports = GoogleSpreadsheetStream;