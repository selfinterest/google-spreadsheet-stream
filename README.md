google-spreadsheet-stream
=========================

Google Spreadsheet Stream is aimed at people who need to work with large (several thousand rows) Google spreadsheets.

To achieve this end, it does two things differently than most comparable libraries:

   1. It uses streams so that at no point must all the spreadsheet rows be loaded into memory.
   2. It lets the consumer of the stream determine just how many rows to return.

Example
--------
```javascript
var gsStream = require("./lib/main.js").stream;

var gsReader = gsStream
	.email('759184919979-tfinm66j1hq49b3690039o8mfn60gfe3@developer.gserviceaccount.com')
	.keyFile("./primary-documents-key-file.pem")
	.spreadsheetId("1CgmFXfwRL1vuNb4y3JN42mkmWwB3tPQ_GLwJDGujXGc")
	.worksheetId("o2xutm5")
	.https(true)
	.createStream()
	;


gsReader.on("data", function(data){
	console.log(data);
});
```
