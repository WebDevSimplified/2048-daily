export default class Modal {
  constructor(modalContainer, onClose) {
    this.modalContainer = modalContainer
    this.onClose = onClose
    this.modalContainer.addEventListener("click", e => {
      if (e.target === this.modalContainer) this.hide()
    })
    this.closeBtn = modalContainer.querySelector("[data-modal-close]")
    this.closeBtn.addEventListener("click", () => {
      this.hide()
    })
    document.addEventListener("keydown", e => {
      if (!this.isOpen) return
      if (e.key === "Tab") {
        this.closeBtn.focus()
        e.preventDefault()
      }
      if (e.key === "Escape") this.hide()
    })
  }

  get isOpen() {
    return this.modalContainer.classList.contains("show")
  }

  show() {
    this.toggle(true)
    this.previousFocus = document.activeElement
    this.closeBtn.focus()
  }

  hide() {
    this.toggle(false)
    ;(this.previousFocus ?? document.body).focus()
    this.onClose()
  }

  toggle(show) {
    if (show) {
      this.modalContainer.classList.toggle("show", show)
    } else {
      this.modalContainer.classList.toggle("show")
    }
  }
}
