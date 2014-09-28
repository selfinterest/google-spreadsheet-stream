/**
 * Created by twatson on 9/28/14.
 */
var chai = require("chai");
var sinonChai = require("sinon-chai");
global.sinon = require("sinon");
chai.use(sinonChai);
global.expect = chai.expect;
