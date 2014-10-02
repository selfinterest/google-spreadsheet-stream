/**
 * Created by twatson on 9/28/14.
 */
describe("spreadsheet constructor", function(){

	var Q = require("q");

	beforeEach(function(){
		this.Spreadsheet = require("../lib/spreadsheet.js");
	});

	it("should have some default fields", function(){
		var spreadsheet = new this.Spreadsheet();
		expect(spreadsheet.options).to.not.be.undefined;
		expect(spreadsheet.log).to.be.a("function");
		expect(spreadsheet.entries).to.not.be.undefined;
		expect(spreadsheet.names).to.not.be.undefined;
	});

	describe("init function", function(){
		beforeEach(function(){
			this.spreadsheet = new this.Spreadsheet();
			this.spreadsheet.getSheetId = sinon.stub().returns(Q("test"));
			this.spreadsheet.setTemplates = sinon.stub();
		});

		it("should initialize, getting sheet ids and setting templates", function(done){
			this.spreadsheet.init().then(function(){
				expect(this.spreadsheet.getSheetId).to.have.been.calledTwice;
				expect(this.spreadsheet.setTemplates).to.have.been.called;

				expect(this.spreadsheet.spreadsheetId).to.equal("test");
				done();
			}.bind(this)).done();

		});
	});

	describe("getSheetId function", function(){
		beforeEach(function(){
			this.spreadsheet = new this.Spreadsheet({
				spreadsheetName: function(){
					return "Terrence"
				}
			});
			this.spreadsheet.request = sinon.stub().returns(Q({
				feed: {
				      entry: [
					      {

					      }
				      ]
				}
			}));

			this.spreadsheet.processEntries = function(){
				this.spreadsheetId = "Terrence";
			};

			sinon.spy(this.spreadsheet, "processEntries");


		});
		it("should be able to get the spreadsheet id", function(done){
			this.spreadsheet.getSheetId("spread").then(function(){
				expect(this.spreadsheet.spreadsheetId).to.equal("Terrence");
				expect(this.spreadsheet.processEntries).to.have.been.calledWith([{}], "Terrence", "spreadsheetId");
				done();
			}.bind(this), function(err){
				throw new Error(err);
			}).done();
		});
	});

	describe("processEntries function", function(){
		beforeEach(function(){
				this.spreadsheet = new this.Spreadsheet();// {			spreadsheetName: "Terrence"
				this.spreadsheet.spreadsheetName = "someSpreadSheetName";
		});

		it("should be able to process entries", function(){
			this.spreadsheet.processEntries(
				[
					{
						title: "someSpreadSheetName",
						id: "/blah"
					}
				],
				"someSpreadSheetName",
				"spreadsheetId"
			);

			expect(this.spreadsheet.spreadsheetId).to.not.be.undefined;

			var result = this.spreadsheet.processEntries(
				[
					{
						title: "someWorksheetName",
						id: "/blah"
					}
				],
				"someWorksheetName",
				"worksheetId"
			);

			expect(this.spreadsheet.worksheetId).to.not.be.undefined;
			expect(this.spreadsheet.worksheetId).to.equal("blah");
			expect(result).to.be.an("array");
			expect(result[0].id).to.equal("/blah");
		});
	});
});