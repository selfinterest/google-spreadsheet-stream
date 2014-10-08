/**
 * Created by twatson on 10/1/14.
 */
var gsStreamFactory = require("./lib/main.js").factory, fs = require("fs"), _ = require("highland");

var gsReadStream = gsStreamFactory
	.email('759184919979-tfinm66j1hq49b3690039o8mfn60gfe3@developer.gserviceaccount.com')
	.keyFile("./primary-documents-key-file.pem")
	.spreadsheetId("1CgmFXfwRL1vuNb4y3JN42mkmWwB3tPQ_GLwJDGujXGc")
	.worksheetId('o2xutm5')
	.https(true)
	.limit(10)         //return only 1 row
	//.offset(2)        //start at the second row
	//.query('name = Terrence') //only return rows where name is Terrence
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

gsReadStream.on("end", function(){
	console.log("All done");
});

_(gsReadStream).map(function(obj){
	console.log(obj);
	return JSON.stringify(obj);
}).pipe(fs.createWriteStream("./rows.txt"));
