const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);

const cb = require('./cb');

global.expect = chai.expect;
global.cb = cb;
