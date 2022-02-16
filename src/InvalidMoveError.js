export default class InvalidMoveError extends Error {
  constructor(...params) {
    super(...params)

    this.name = "InvalidMoveError"
  }
}
