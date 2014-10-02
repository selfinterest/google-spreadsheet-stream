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

//We use a vanilla request object here to make use of its streaming capabilities.
var request = require("request");

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
	/*return Q.nfcall(tokens.get, {
		email: email,
		keyFile: keyFile,
		scopes: ["https://spreadsheets.google.com/feeds", "https://docs.google.com/feeds"]
	})*/
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
		streamOptions.encoding = "utf8";
		Transform.call(this, streamOptions);

		var tokenPromise = getToken(optionsObject.email(), optionsObject.keyFile());

		Q.all([spreadsheetPromise, tokenPromise]).spread(function(spreadsheet, token){
			var stream = request({
				url: spreadsheet.baseUrl(),
				headers: {
				         authorization: "Bearer "+token
				}
			});
			stream.pipe(this).on("error", function(error){
				throw new Error(error);
			});
		}.bind(this)).done();

	} else {
		return new GoogleSpreadsheetStream(optionsObject, spreadsheetPromise, streamOptions);
	}
}

GoogleSpreadsheetStream.prototype._transform = function(chunk, encoding, done){
	//console.log(chunk.toString());

	this.push(chunk);
	done();
};

module.exports = GoogleSpreadsheetStream;