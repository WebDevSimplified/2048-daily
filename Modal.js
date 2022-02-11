const focusableElementsSelector =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'

export default class Modal {
  constructor(modalContainer, { onClose = () => {}, onOpen = () => {} } = {}) {
    this.modalContainer = modalContainer
    this.onClose = onClose
    this.onOpen = onOpen
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
        const focusableElements = modalContainer.querySelectorAll(
          focusableElementsSelector
        )
        const firstFocusableElement = focusableElements[0]
        const lastFocusableElement =
          focusableElements[focusableElements.length - 1]
        if (e.shiftKey) {
          if (document.activeElement === firstFocusableElement) {
            lastFocusableElement.focus()
            e.preventDefault()
          }
        } else {
          if (document.activeElement === lastFocusableElement) {
            firstFocusableElement.focus()
            e.preventDefault()
          }
        }
      }
      if (e.key === "Escape") this.hide()
    })
  }

  get isOpen() {
    return this.modalContainer.classList.contains("show")
  }

  show() {
    this.modalContainer.classList.add("show")
    this.previousFocus = document.activeElement
    this.closeBtn.focus()
    this.onOpen()
  }

  hide() {
    this.modalContainer.classList.remove("show")
    ;(this.previousFocus ?? document.body).focus()
    this.onClose()
  }
}
