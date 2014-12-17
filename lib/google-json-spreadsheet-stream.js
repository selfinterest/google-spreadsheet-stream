/**
 * Created by twatson on 10/25/14.
 */

var util = require('util');
var Transform = require('stream').Transform;
var Q = require("q");
var TokenCache = require('google-oauth-jwt').TokenCache,
	tokens = new TokenCache();
var request = require("request");
var XmlStream = require("xml-stream");
var _ = require("highland");

util.inherits(GoogleJsonSpreadsheetStream, Transform);

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
    console.log("Getting metadata");
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
function GoogleJsonSpreadsheetStream(optionsObject, spreadsheetPromise, streamOptions) {
	if (this instanceof GoogleJsonSpreadsheetStream) {
		streamOptions.objectMode = streamOptions.objectMode || true;        //object mode by default
		Transform.call(this, streamOptions);

		this.processedFirstRow = false;


		var tokenPromise = getToken(optionsObject.email(), optionsObject.keyFile());

		Q.all([spreadsheetPromise, tokenPromise]).spread(function(spreadsheet, token) {
			this.requestStream = request({
				url: spreadsheet.baseUrl(),
				headers: {
					authorization: "Bearer " + token
				}
			});

			this.xml = new XmlStream(this.requestStream);
      this.xml.on("end", function(){
         console.log("Stream ended!");
         this.emit("finish");
      }.bind(this));

      //We create a third stream -- basically a filtered stream of xml entries, and we pipe those and only those to the main stream
			var otherStream = _('endElement entry', this.xml);
			otherStream.pipe(this);


		}.bind(this)).done();

	} else {
		return new GoogleJsonSpreadsheetStream(optionsObject, spreadsheetPromise, streamOptions);
	}

}

GoogleJsonSpreadsheetStream.prototype._transform = function(chunk, encoding, done){
	if(!this.processedFirstRow){
		this.processedFirstRow = true;
		this.push("[")
	} else {
      this.push(",");
  }
  console.log(chunk);
	var obj = {};
	obj._id = chunk.id;
	for(var key in chunk){
		var matches = key.match(/^gsx:(.*)/);
		if(matches){
			obj[matches[1]] = chunk[key];
		}
	}

	this.push(JSON.stringify(obj));
	done();

};

GoogleJsonSpreadsheetStream.prototype._flush = function(done){
	if(!this.processedFirstRow){
		this.processedFirstRow = true;
		this.push("[");
	}

	console.log("Flushing");
	this.push("]");
	done();

};

module.exports = GoogleJsonSpreadsheetStream;