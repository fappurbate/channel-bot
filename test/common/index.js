import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';

chai.use(chaiAsPromised);

import cb from './cb';

global.expect = chai.expect;
global.cb = cb;
