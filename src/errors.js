export class Failure extends Error {
  constructor(data = {}) {
    super(data.message || '');
    Error.captureStackTrace(this, Failure);

    this.name = 'Failure';
    this.type = 'ERR_FAILURE';
    this.data = data;
  }
}
