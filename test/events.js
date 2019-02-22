const Channel = require('../src');

describe('events', function () {
  beforeEach(function () {
    this.channel = new Channel({ name: 'test' });
  });

  afterEach(function () {
    this.channel.close();
  });

  it('sends events', function (done) {
    cb.$events.once('event', (subject, data) => {
      expect(subject).to.equal('test');
      expect(data).to.eql({ boom: 42 });
      done();
    });

    this.channel.emit('test', { boom: 42 });
  });

  it('receives events', function (done) {
    this.channel.onEvent.addListener('test', data => {
      expect(data).to.eql({ boom: 42 });
      done();
    });

    cb.$sendMessage('/fb/channel/["test", "event", "test", { "boom": 42 }]', cb.room_slug);
  });
});
