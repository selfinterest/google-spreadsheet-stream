/**
 * Created by twatson on 10/1/14.
 */
var gsStreamFactory = require("./lib/main.js").factory;


var express = require("express");
var router = express.Router();
var app = express();

router.get("/", function(req, res){
	res.setHeader("Content-Type", "application/json; charset=UTF-8");
	gsReadStream.createJsonStream().pipe(res);

});

app.use(router);
app.listen(4000);

var gsReadStream = gsStreamFactory
	.email('759184919979-tfinm66j1hq49b3690039o8mfn60gfe3@developer.gserviceaccount.com')
	.keyFile("./primary-documents-key-file.pem")
	.spreadsheetName("TestSpreadsheet")
	.worksheetName("Sheet1")
	.https(true)
	.limit(1)         //return only 1 row
	.query('food = Lamb') //only return rows where name is Terrence
;
