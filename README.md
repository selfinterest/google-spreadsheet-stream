google-spreadsheet-stream
=========================

Google Spreadsheet Stream is aimed at people who need to work with large (several thousand rows) Google spreadsheets.

To achieve this end, it does two things differently than most comparable libraries:

   1. It uses streams so that at no point must all the spreadsheet rows be loaded into memory.
   2. It lets the consumer of the stream determine just how many rows to return.

Example
--------
```javascript
var gsStream = require("google-spreadsheet-stream").stream;

var gsReader = gsStream
	.email('my-gmail-service-account-email@gmail.com')
	.keyFile("./my-key-file.pem")
	.spreadsheetId("1CgmFXfwRL1vuNb4y3JN42mkmWwB3tPQ_GLwJDGujXGc")
	.worksheetId("o2xutm5")
	.https(true)
	.createStream()
	;


gsReader.on("data", function(data){
	console.log(data);
});
```

You don't need to know the spreadsheetId or worksheetId, either. If you're missing these, just specify the name of the spreadsheet/worksheet and google-spreadsheet-stream will first query Google's API to fill in the missing information.
