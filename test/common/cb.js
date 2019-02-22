const EventEmitter = require('events');

const extensionEvents = new EventEmitter;
const testBedEvents = new EventEmitter;

module.exports.events = testBedEvents;

function sendMessage(message, username) {
  extensionEvents.emit('message', { m: message, user: username });
}
module.exports.sendMessage = sendMessage;

module.exports = {
  $events: testBedEvents,
  $sendMessage: sendMessage,
  room_slug: 'Basie',
  sendNotice: (message, receiver) => {
    if (receiver !== module.exports.room_slug) { return; }

    if (message.startsWith('/fb/channel/')) {
      const rest = JSON.parse(message.substr('/fb/channel/'.length));
      const [channelName, type] = rest;

      if (type === 'event') {
        const [,, subject, data] = rest;
        testBedEvents.emit('event', subject, data);
      } else if (type === 'request') {
        const [,, requestId, subject, data] = rest;
        testBedEvents.emit('request', requestId, subject, data);

        if (subject === 'test-success') {
          sendMessage(`/fb/channel/${JSON.stringify(
            [channelName, 'success', requestId, { boom: data }]
          )}`, module.exports.room_slug);
        } else if (subject === 'test-failure') {
          sendMessage(`/fb/channel/${JSON.stringify(
            [channelName, 'failure', requestId, { boom: data }]
          )}`, module.exports.room_slug);
        }
      } else if (type === 'success') {
        const [,, requestId, data] = rest;
        testBedEvents.emit('success', requestId, data);
      } else if (type === 'failure') {
        const [,, requestId, data] = rest;
        testBedEvents.emit('failure', requestId, data);
      }
    }
  },
  onMessage: handler => {
    extensionEvents.on('message', async message => {
      const result = await handler(message);
      testBedEvents.emit('handler', result);
    });
  }
};
