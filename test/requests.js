const { Channel, Failure } = require('../src');

describe('requests', function () {
  beforeEach(function () {
    this.channel = new Channel({ name: 'test' });
  });

  afterEach(function () {
    this.channel.close();
  });

  it('sends request & receives successful response', function () {
    return expect(
      this.channel.request('test-success', { myData: 42 })
    ).to.eventually.eql({ boom: { myData: 42 } });
  });

  it('sends request & receives failing response', async function () {
    try {
      await this.channel.request('test-failure', { myData: 42 });
    } catch (error) {
      expect(error).to.be.an.instanceof(Failure);
      expect(error.data).to.eql({ boom: { myData: 42 } });
      return;
    }

    throw new Error('should have failed');
  });

  it('handles request successfully', function (done) {
    this.channel.onRequest.addHandler('test', data => {
      return { boom: data };
    });

    const listeners = {};

    cb.$events.on('success', listeners.success = (requestId, data) => {
      cb.$events.removeListener('success', listeners.success);
      cb.$events.removeListener('failure', listeners.failure);
      expect(data).to.eql({ boom: { myData: 42 } });
      done();
    });

    cb.$events.on('failure', listeners.failure = (requestId, data) => {
      cb.$events.removeListener('success', listeners.success);
      cb.$events.removeListener('failure', listeners.failure);
      done(new Error('should have succeeded'));
    });

    cb.$sendMessage('/fb/channel/["test", "request", 0, "test", { "myData": 42 }]', cb.room_slug);
  });

  it('handles request with an error', function (done) {
    this.channel.onRequest.addHandler('test', data => {
      throw { boom: data };
    });

    const listeners = {};

    cb.$events.on('success', listeners.success = (requestId, data) => {
      cb.$events.removeListener('success', listeners.success);
      cb.$events.removeListener('failure', listeners.failure);
      done(new Error('should have failed'));
    });

    cb.$events.on('failure', listeners.failure = (requestId, data) => {
      cb.$events.removeListener('success', listeners.success);
      cb.$events.removeListener('failure', listeners.failure);
      expect(data).to.eql({ boom: { myData: 42 } });
      done();
    });

    cb.$sendMessage('/fb/channel/["test", "request", 0, "test", { "myData": 42 }]', cb.room_slug);
  });
});
