This library is aimed at people who need to work with large (several thousand rows) Google spreadsheets.

To achieve this end, it does three things differently than most comparable libraries:

   1. It uses streams so that at no point must all the spreadsheet rows be loaded into memory.
   2. It lets the consumer of the stream determine just how many rows to return.
   3. It leverages Google's API to allow for querying based on conditions.

Installation
-------------
`npm install google-spreadsheet-stream-reader`

Example
--------
```javascript
var gsStreamFactory = require("google-spreadsheet-stream-reader").factory;

var gsReadStream = gsStreamFactory
	.email('759184919979-tfinm66j1hq49b3690039o8mfn60gfe3@developer.gserviceaccount.com')
	.keyFile("./primary-documents-key-file.pem")
	.spreadsheetName("TestSpreadsheet")
	.worksheetName("Sheet1")
	.https(true)         //use HTTPS
	.limit(10)           //return only 10 rows
	.query('name = Terrence') //only return rows where name is Terrence
;

//Set up express
var express = require("express");
var router = express.Router();
var app = express();

router.get("/", function(req, res){
	res.setHeader("Content-Type", "application/json; charset=UTF-8");
	gsReadStream.createJsonStream().pipe(res);
});

app.use(router);
app.listen(4000);

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
