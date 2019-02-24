@fappurbate/channel-bot
=======================

Bot side of the library that allows easy communication among Chaturbate apps & bots and Fappurbate extensions.

### Documentation

#### Class: Channel

Represents a channel between a Chaturbate bot (app) and a Fappurbate extension. Allows communication with events and requests.

##### `new Channel(options)`

- `options.name` `string` Name of the channel. Must not clash with channel names of others instances (including other apps & bots in the same chat).

##### `onEvent.addListener(subject, callback): this`

- `subject` `string` Name of the event to listen to.
- `callback` `any => void` Callback will be called on a given event with attached data as the first argument.

Add a listener for a given event subject.

##### `onEvent.removeListener(subject, callback): this`

- `subject` `string` Name of the event.
- `callback` `any => void` The same callback that was passed to `onEvent.addListener`.

Remove an event listener.

##### `onRequest.addHandler(subject, handler): this`

- `subject` `string` Name of the request.
- `handler` `any => void|any|Promise` Handler will be called on a given request.

Add a handler for a given request subject. It will be called with the data attached as the first argument. If the handler returns a non-undefined value, no subsequently added handlers will be called. If throws an error, it is sent back to the extension as an error response. May also return a Promise.

##### `onRequest.removeHandler(subject, handler): this`

- `subject` `string` Name of the request.
- `handler` `any => void|any|Promise` The same handler that was passed to `onRequest.addHandler`.

Remove a request handler.

##### `close(): void`

Unregister all event listeners. After this the channel is usable no more. Do it before you try to open a new channel with the same name.

##### `name`

- `string`

The name of the channel. Read-only.

##### `emit(subject, data): void`

- `subject` `string` Name of the event.
- `data` `any?` Data to send with the event. Must be serializable.

Send an event to the extension.

##### `request(subject, data): Promise`

- `subject` `string` Name of the request.
- `data` `any?` Data to send with the request. Must be serializable.

Send a request to the extension. If an error response is received, returns a promise that rejects with a `Failure` that contains attached data. It is to distinguish an error response from other errors like network errors, timeout, etc.

#### Class: Failure

A subclass of `Error` that represents an error response from [`request(subject, data)`](#requestsubject-data-promise).

##### `new Failure(data)`

- `data` `any?` `default: {}` Data to attach.

##### `name`

- `string` `=== 'Failure'`

##### `type`

- `string` `=== 'ERR_FAILURE'`
