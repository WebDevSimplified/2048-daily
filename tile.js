export default class Tile {
  #value
  #tileElem
  #x
  #y

  constructor(tileContainer, value = Math.random() > 0.5 ? 2 : 4) {
    this.#tileElem = document.createElement("div")
    this.#tileElem.classList.add("tile")
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

  waitForTransition(animation = false) {
    return new Promise(resolve => {
      this.#tileElem.addEventListener(
        animation ? "animationend" : "transitionend",
        resolve
      )
    })
  }
}
