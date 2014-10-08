
google-spreadsheet-stream-reader
==================================
This library is aimed at people who need to work with large (several thousand rows) Google spreadsheets.

To achieve this end, it does two things differently than most comparable libraries:

   1. It uses streams so that at no point must all the spreadsheet rows be loaded into memory.
   2. It lets the consumer of the stream determine just how many rows to return.

Example
--------
```javascript
var gsStreamFactory = require("./lib/main.js").factory, fs = require("fs"), _ = require("highland");

var gsReader = gsStreamFactory
	.email('me@developer.gserviceaccount.com')  //Your developer email address
	.keyFile("key-file.pem")                    //Your key file
	.spreadsheetName("TestSpreadsheet")         //Can also use spreadsheetId, if you know it
	.worksheetName("Sheet1")                    //Can use worksheetId, if you know it
	.https(true)                                //Use https
	.limit("10")                                //return only 10 rows
	.offset("10")                               //start at row 10
	.query("Name = Terrence")                   //Return only the rows where the Name column is equal to Terrence
	.createStream()                             //Once options are set, creates the stream!
	;

// Now do something stream-like with gsReader. In this example, we're passing it to the Highland library to stringify each returned row, then piping to a file stream.

_(gsReader).map(function(obj){
	return JSON.stringify(obj);
}).pipe(fs.createWriteStream("./rows.txt"));

```

TODO
-----
Some kind of writable stream, but that will probably be a separate module. Can you imagine how cool it would be to be able to do this:
```javascript

var gsReader = gsStreamFactory.createReadStream();
var gsWriter = gsStreamFactory.createWriteStream();

_(gsReader).map(function(row){
    row.name = "A different name!";
    return row;
}).pipe(gsWriter);

```
