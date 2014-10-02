/**
 * Created by twatson on 10/1/14.
 */
var gsStream = require("./lib/main.js").stream;
var parser = require("xml2json");

//spreadsheetId: "1CgmFXfwRL1vuNb4y3JN42mkmWwB3tPQ_GLwJDGujXGc",
//	worksheetId: 'o2xutm5'

var gsReader = gsStream
	.email('759184919979-tfinm66j1hq49b3690039o8mfn60gfe3@developer.gserviceaccount.com')
	.keyFile("./primary-documents-key-file.pem")
	.spreadsheetId("1CgmFXfwRL1vuNb4y3JN42mkmWwB3tPQ_GLwJDGujXGc")
	.worksheetId("o2xutm5")
	.https(true)
	.createStream()
	;

gsReader.on("row", function(data){
	console.log(data);
});

gsReader.on("error", function(){
	console.log(arguments);
});

gsReader.on("end", function(data){
	console.log("END");
	var json = parser.toJson(allData, {object: true, sanitize: false});
	//console.log(json.feed);
});