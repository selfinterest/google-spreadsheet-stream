/**
 * Created by twatson on 10/1/14.
 */
var gsStream = require("./lib/main.js").stream, fs = require("fs"), _ = require("highland");

var gsReader = gsStream
	.email('759184919979-tfinm66j1hq49b3690039o8mfn60gfe3@developer.gserviceaccount.com')
	.keyFile("./primary-documents-key-file.pem")
	.spreadsheetName("TestSpreadsheet")
	.worksheetName("Sheet1")
	.https(true)
	.limit("1")         //return only 1 row
	.offset("2")        //start at the second row
	
	.createStream()
	;





_(gsReader).map(function(obj){
	console.log(obj);
	return JSON.stringify(obj);
}).pipe(fs.createWriteStream("./rows.txt"));
