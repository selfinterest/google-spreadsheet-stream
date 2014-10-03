google-spreadsheet-stream
=========================

Google Spreadsheet Stream is aimed at people who need to work with large (several thousand rows) Google spreadsheets.

To achieve this end, it does two things differently than most comparable libraries:

   1. It uses streams so that at no point must all the spreadsheet rows be loaded into memory.
   2. It lets the consumer of the stream determine just how many rows to return.

Example
--------
```javascript
var gsStream = require("./lib/main.js").stream, fs = require("fs"), _ = require("highland");

var gsReader = gsStream
	.email('me@developer.gserviceaccount.com')
	.keyFile("key-file.pem")
	.spreadsheetName("TestSpreadsheet")
	.worksheetName("Sheet1")
	.https(true)
	.limit("1")         //return only 1 row
	.offset("2")        //start at the second row
	.createStream()
	;

_(gsReader).map(function(obj){
	return JSON.stringify(obj);
}).pipe(fs.createWriteStream("./rows.txt"));

```

You don't need to know the spreadsheetId or worksheetId, either. If you're missing these, just specify the name of the spreadsheet/worksheet and google-spreadsheet-stream will first query Google's API to fill in the missing information.
