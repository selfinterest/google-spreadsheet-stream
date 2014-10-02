google-spreadsheet-stream
=========================

Google Spreadsheet Stream is aimed at people who need to work with large (several thousand rows) Google spreadsheets.

To achieve this end, it does two things differently than most comparable libraries:

   1. It uses streams so that at no point must all the spreadsheet rows be loaded into memory.
   2. It lets the consumer of the stream determine just how many rows to return.
