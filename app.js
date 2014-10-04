/**
 * Created by twatson on 10/1/14.
 */
var gsStreamFactory = require("./lib/main.js").factory, fs = require("fs"), _ = require("highland");

var gsReadStream = gsStreamFactory
	.email('759184919979-tfinm66j1hq49b3690039o8mfn60gfe3@developer.gserviceaccount.com')
	.keyFile("./primary-documents-key-file.pem")
	.spreadsheetName("PrimaryDocumentsTest")
	.worksheetName("Sheet1")
	.https(true)
	.limit(1)         //return only 1 row
	///.offset(2)        //start at the second row
	//.query('name = Terrence')
	.createStream()
	;


gsReadStream.on("rowCount", function(data){
	console.log("This many rows: "+data);
});

gsReadStream.on("colCount", function(data){
	console.log("This many columns: "+data);
});

gsReadStream.on("totalResults", function(data){
	console.log("This many results: "+data);
});

_(gsReadStream).map(function(obj){
	console.log(obj);
	return JSON.stringify(obj);
}).pipe(fs.createWriteStream("./rows.txt"));
