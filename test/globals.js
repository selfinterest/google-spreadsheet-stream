/**
 * Created by twatson on 9/28/14.
 */
var chai = require("chai");
var sinonChai = require("sinon-chai");
var chaiAsPromised = require("chai-as-promised");
global.sinon = require("sinon");
chai.use(sinonChai);
chai.use(chaiAsPromised);
global.expect = chai.expect;
