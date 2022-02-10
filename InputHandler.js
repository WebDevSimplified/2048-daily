const THRESHOLD_DISTANCE = 150
const ALLOWED_GESTURE_TIME = 300

export default class InputHandler {
  #callback
  #boundHandleKeyboardInput
  #boundHandleTouchStart

  constructor(callback) {
    this.#boundHandleKeyboardInput = this.#handleKeyboardInput.bind(this)
    this.#boundHandleTouchStart = this.#handleTouchStart.bind(this)
    this.#callback = callback
    this.#setupInput()
  }

  #setupInput() {
    window.addEventListener("keydown", this.#boundHandleKeyboardInput, {
      once: true,
    })
    window.addEventListener("touchstart", this.#boundHandleTouchStart, {
      once: true,
      passive: false,
    })
  }

  #stopInput() {
    window.removeEventListener("keydown", this.#boundHandleKeyboardInput)
    window.removeEventListener("touchstart", this.#boundHandleTouchStart)
  }

  #handleTouchStart(e) {
    this.#stopInput()
    e.preventDefault()

    const startTouchData = e.changedTouches[0]
    const startTime = new Date()

    window.addEventListener("touchmove", handleTouchMove, { passive: false })
    window.addEventListener(
      "touchend",
      async e => {
        e.preventDefault()
        window.removeEventListener("touchmove", handleTouchMove)

        const endTouchData = e.changedTouches[0]
        if (new Date() - startTime > ALLOWED_GESTURE_TIME) {
          this.#setupInput()
          return
        }
        const distanceX = endTouchData.pageX - startTouchData.pageX
        const distanceY = endTouchData.pageY - startTouchData.pageY

        if (Math.abs(distanceX) >= THRESHOLD_DISTANCE) {
          const result = await this.#callback(
            distanceX > 0 ? "ArrowRight" : "ArrowLeft"
          )
          if (result) this.#setupInput()
        } else if (Math.abs(distanceY) >= THRESHOLD_DISTANCE) {
          const result = await this.#callback(
            distanceY > 0 ? "ArrowDown" : "ArrowUp"
          )
          if (result) this.#setupInput()
        } else {
          this.#setupInput()
        }
      },
      { once: true }
    )
  }

  async #handleKeyboardInput(e) {
    this.#stopInput()
    if (await this.#callback(e.key)) this.#setupInput()
  }
}

function handleTouchMove(e) {
  e.preventDefault()
}
