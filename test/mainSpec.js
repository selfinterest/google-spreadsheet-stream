/**
 * Created by twatson on 10/1/14.
 */

describe("Main module", function(){
	var modulePath = "../lib/main.js";
	it("should be instantiable with new", function(){
		var GsStream = require(modulePath);
		var gsStream = new GsStream();
		expect(gsStream).to.be.an("object");
		expect(gsStream).to.be.instanceOf(GsStream);
	});

	it("should be instantiable without new", function(){
		var GsStream = require(modulePath);
		var gsStream = GsStream();
		expect(gsStream).to.be.an("object");
		expect(gsStream).to.be.instanceOf(GsStream);
	});

	it("should come with a premade instance", function(){
		var gsStream = require(modulePath).stream;
		expect(gsStream).to.be.an("object");
	});

	it("should have chainable configuration", function(){
		var gsStream = require(modulePath).stream;
		gsStream
			.email("bob@bob.com")
			.keyFile("bob.txt")
			.https(true)
			.worksheetName("Terrence's worksheet")
			.spreadsheetName("Terrence's spreadsheet")
		;
		expect(gsStream._email).to.equal("bob@bob.com");
		expect(gsStream._keyFile).to.equal("bob.txt");
		expect(gsStream.useHTTPS).to.equal("s");
		expect(gsStream.worksheetName()).to.equal("Terrence's worksheet");
	});

	it("should have a createStream method", function(){
		var gsStream = require(modulePath).stream;

		//Good configuration
		var stream = gsStream
			.email("bob@bob.com")
			.keyFile("bob.txt")
			.https(true)
			.worksheetName("Terrence's worksheet")
			.spreadsheetName("Terrence's spreadsheet")
			.createStream();
		;
	});

	it("should have a createStream method that throws errors if required information is missing", function(){
		var gsStreamBad = require(modulePath)();

		//Bad configuration
		var test = function(){
			var stream = gsStreamBad
				.email("bob@bob.com")
				.keyFile("bob.txt")
				.https(true)
				.worksheetName("Terrence's worksheet")
				//.spreadsheetName("Terrence's spreadsheet")
				.createStream();
			;
		};

		expect(test).to.throw(Error);

	});
});