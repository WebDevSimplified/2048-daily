const THRESHOLD_DISTANCE = 75
const ALLOWED_GESTURE_TIME = 500

export default class InputHandler {
  #callback
  #boundHandleKeyboardInput
  #boundHandleTouchStart
  #gameBoardElem

  constructor(callback, gameBoardElem) {
    this.#gameBoardElem = gameBoardElem
    this.#boundHandleKeyboardInput = this.#handleKeyboardInput.bind(this)
    this.#boundHandleTouchStart = this.#handleTouchStart.bind(this)
    this.#callback = callback
  }

  setupInput() {
    window.addEventListener("keydown", this.#boundHandleKeyboardInput, {
      once: true,
    })
    this.#gameBoardElem.addEventListener(
      "touchstart",
      this.#boundHandleTouchStart,
      {
        once: true,
        passive: false,
      }
    )
  }

  stopInput() {
    window.removeEventListener("keydown", this.#boundHandleKeyboardInput)
    this.#gameBoardElem.removeEventListener(
      "touchstart",
      this.#boundHandleTouchStart
    )
  }

  #handleTouchStart(e) {
    this.stopInput()
    e.preventDefault()

    const startTouchData = e.changedTouches[0]
    const startTime = new Date()

    this.#gameBoardElem.addEventListener("touchmove", handleTouchMove, {
      passive: false,
    })
    this.#gameBoardElem.addEventListener(
      "touchend",
      async e => {
        e.preventDefault()
        this.#gameBoardElem.removeEventListener("touchmove", handleTouchMove)

        const endTouchData = e.changedTouches[0]
        if (new Date() - startTime > ALLOWED_GESTURE_TIME) {
          this.setupInput()
          return
        }
        const distanceX = endTouchData.pageX - startTouchData.pageX
        const distanceY = endTouchData.pageY - startTouchData.pageY

        if (Math.abs(distanceX) >= THRESHOLD_DISTANCE) {
          await this.#callback(distanceX > 0 ? "ArrowRight" : "ArrowLeft")
        } else if (Math.abs(distanceY) >= THRESHOLD_DISTANCE) {
          await this.#callback(distanceY > 0 ? "ArrowDown" : "ArrowUp")
        }
        this.setupInput()
      },
      { once: true }
    )
  }

  async #handleKeyboardInput(e) {
    this.stopInput()
    await this.#callback(e.key)
    this.setupInput()
  }
}

function handleTouchMove(e) {
  e.preventDefault()
}
