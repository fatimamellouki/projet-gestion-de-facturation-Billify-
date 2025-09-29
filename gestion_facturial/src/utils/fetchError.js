// src/utils/fetchError.js
export class FetchError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = "FetchError";
    this.status = status;
    this.data = data;
  }
}
