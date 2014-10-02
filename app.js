/**
 * Created by twatson on 10/1/14.
 */
var gsStream = require("./lib/main.js").stream, fs = require("fs"), through2 = require("through2"), _ = require("highland");

var gsReader = gsStream
	.email('759184919979-tfinm66j1hq49b3690039o8mfn60gfe3@developer.gserviceaccount.com')
	.keyFile("./primary-documents-key-file.pem")
	.spreadsheetName("TestSpreadsheet")
	.worksheetName("Sheet1")
	.https(true)
	.createStream()
	;

gsReader.on("row", function(data){
	console.log(data.name);
});

gsReader.on("totalResults", function(total){

});



_(gsReader).map(function(obj){
	return JSON.stringify(obj);
}).pipe(fs.createWriteStream("./rows.txt"));
