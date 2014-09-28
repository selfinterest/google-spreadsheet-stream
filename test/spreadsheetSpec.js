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
			this.spreadsheet.getSheetId = sinon.stub().returns(Q());
			this.spreadsheet.setTemplates = sinon.stub();
		});

		it("should initialize, getting sheet ids and setting templates", function(done){
			this.spreadsheet.init().then(function(){
				expect(this.spreadsheet.getSheetId).to.have.been.calledTwice;
				expect(this.spreadsheet.setTemplates).to.have.been.called;
				done();
			}.bind(this)).done();

		});
	});

	describe("getSheetId function", function(){

	});
});