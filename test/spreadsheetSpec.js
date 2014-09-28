/**
 * Created by twatson on 9/28/14.
 */
describe("spreadsheet constructor", function(){
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


});