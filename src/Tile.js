import { animateElement, waitForAnimation } from "./animation"
import seededRandom from "./seededRandom"

export default class Tile {
  #value
  #tileElem
  #x
  #y

  constructor(tileContainer, value = seededRandom() > 0.5 ? 2 : 4) {
    this.#tileElem = document.createElement("div")
    this.#tileElem.classList.add("tile")
    animateElement(this.#tileElem, "show")
    tileContainer.appendChild(this.#tileElem)
    this.value = value
  }

  get value() {
    return this.#value
  }

  set value(v) {
    this.#value = v
    this.#tileElem.textContent = v
    const power = Math.log2(v)
    const backgroundLightness = 100 - power * 9
    this.#tileElem.style.setProperty(
      "--background-lightness",
      `${backgroundLightness}%`
    )
    this.#tileElem.style.setProperty(
      "--text-lightness",
      `${backgroundLightness <= 50 ? 90 : 10}%`
    )
  }

  get x() {
    return this.#x
  }

  set x(value) {
    this.#tileElem.style.setProperty("--x", value)
    this.#x = value
  }

  get y() {
    return this.#y
  }

  set y(value) {
    this.#tileElem.style.setProperty("--y", value)
    this.#y = value
  }

  remove() {
    this.#tileElem.remove()
  }

  waitForTransition() {
    return waitForAnimation(this.#tileElem)
  }

  pop({ slow = false, uniform = false } = {}) {
    this.#tileElem.style.setProperty("--pop-duration", `${slow ? 200 : 100}ms`)
    this.#tileElem.style.setProperty(
      "--pop-magnitude",
      uniform ? 5 : Math.log2(this.value)
    )
    return animateElement(this.#tileElem, "pop")
  }
}
