const EventEmitter = require('events');
const RequestTarget = require('@kothique/request-target');

const { Failure } = require('./errors');

const events = new EventEmitter;

cb.onMessage(msg => {
  const username = msg.user;
  const content = msg.m;

  if (username !== cb.room_slug) { return msg; }
  if (!content.startsWith('/fb/channel/')) { return msg; }

  msg['X-Spam'] = true;

  const rest = JSON.parse(content.substr('/fb/channel/'.length));
  const [channelName, type] = rest;

  if (type === 'event') {
    const [,, subject, data] = rest;
    events.emit('event', channelName, subject, data);
  } else if (type === 'request') {
    const [,, requestId, subject, data] = rest;
    events.emit('request', channelName, requestId, subject, data);
  } else if (type === 'success') {
    const [,, requestId, data] = rest;
    events.emit('success', channelName, requestId, data);
  } else if (type === 'failure') {
    const [,, requestId, data] = rest;
    events.emit('failure', channelName, requestId, data);
  }

  return msg;
});

class Channel {
  /**
   * @param {object} options
   * @param {string} options.name - Must not clash with channel names of other bots.
   *   Also, you should not create two channels with the same name. First close()
   *  the current channel, then create another one.
   */
  constructor(options) {
    this._name = options.name;
    this._nextRequestId = 0;
    this._requests = {};

    this._eventHandlers = new EventEmitter;
    this._requestHandlers = new RequestTarget;

    this.onEvent = {
      addListener: (subject, callback) => this._eventHandlers.on(subject, callback),
      removeListener: (subject, callback) => this._eventHandlers.removeListener(subject, callback)
    };

    this.onRequest = {
      addHandler: (subject, handler) => this._requestHandlers.on(subject, handler),
      removeHandler: (subject, handler) => this._requestHandlers.off(subject, handler)
    };

    this._listeners = {};

    events.on('event', this._listeners.event = (channelName, subject, data) => {
      if (channelName !== this._name) { return; }

      this._eventHandlers.emit(subject, data);
    });

    events.on('request', this._listeners.request = (channelName, requestId, subject, data) => {
      if (channelName !== this._name) { return; }

      this._requestHandlers.request(subject, data).then(
        result => cb.sendNotice(this._createSuccessfulResponse(requestId, result), cb.room_slug),
        error => cb.sendNotice(this._createFailingResponse(requestId, error), cb.room_slug)
      );
    });

    events.on('success', this._listeners.success = (channelName, requestId, data) => {
      if (channelName !== this._name) { return; }

      this._requests[requestId].resolve(data);
    });

    events.on('failure', this._listeners.failure = (channelName, requestId, data) => {
      if (channelName != this._name) { return; }

      this._requests[requestId].reject(data);
    });
  }

  /**
   * Removes all event listeners. After this the channel is not usable anymore.
   */
  close() {
    events.removeListener('failure', this._listeners.failure);
    events.removeListener('success', this._listeners.success);
    events.removeListener('request', this._listeners.request);
    events.removeListener('event', this._listeners.event);
  }

  get name() { return this._name; }

  /**
   * @param {string} subject
   * @param {any?}   data    - Must be serializable.
   */
  emit(subject, data) {
    cb.sendNotice(this._createEvent(subject, data), cb.room_slug);
  }

  /**
   * @param {string} subject
   * @param {any?}   data
   * @return {Promise}
   * @throws {Failure}
   */
  request(subject, data) {
    const requestId = this._nextRequestId++;

    const promise = new Promise((resolve, reject) => {
      this._requests[requestId] = {
        resolve: data => {
          resolve(data);
          delete this._requests[requestId];
        },
        reject: data => {
          reject(new Failure(data));
          delete this._requests[requestId];
        }
      };
    });

    cb.sendNotice(this._createRequest(requestId, subject, data), cb.room_slug);

    return promise;
  }

  /**
   * @param {string} subject
   * @param {any?}   data
   * @return {string}
   * @private
   */
  _createEvent(subject, data) {
    return '/fb/channel/' + JSON.stringify(
      [this._name, 'event', subject, data]
    );
  }

  /**
   * @param {string} requestId
   * @param {string} subject
   * @param {any?}   data
   * @return {string}
   * @private
   */
  _createRequest(requestId, subject, data) {
    return '/fb/channel/' + JSON.stringify(
      [this._name, 'request', requestId, subject, data]
    );
  }

  /**
   * @param {number} requestId
   * @param {any?}   data
   * @return {string}
   * @private
   */
  _createSuccessfulResponse(requestId, data) {
    return '/fb/channel/' + JSON.stringify(
      [this._name, 'success', requestId, data]
    );
  }

  /**
   * @param {number} requestId
   * @param {string} message
   * @param {any?}   data
   * @return {string}
   */
  _createFailingResponse(requestId, data) {
    return '/fb/channel/' + JSON.stringify(
      [this._name, 'failure', requestId, data]
    );
  }
}

Channel.Channel = Channel;
Channel.Failure = Failure;

module.exports = Channel;
