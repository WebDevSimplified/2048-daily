import { waitForAnimation } from "./animation"

const focusableElementsSelector =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'

export default class Modal {
  constructor(
    modalContainerTemplate,
    { onClose = () => {}, onOpen = () => {} } = {}
  ) {
    this.modalContainer = document.createElement("div")
    this.modalContainer.classList.add("modal-overlay")
    this.modalContainer.append(modalContainerTemplate.content.cloneNode(true))
    this.onClose = onClose
    this.onOpen = onOpen
    this.modalContainer.addEventListener("click", e => {
      if (e.target === this.modalContainer) this.hide()
    })
    this.closeBtn = this.modalContainer.querySelector("[data-modal-close]")
    this.closeBtn.addEventListener("click", () => {
      this.hide()
    })
    document.addEventListener("keydown", e => {
      if (!this.isOpen) return
      if (e.key === "Tab") {
        const focusableElements = this.modalContainer.querySelectorAll(
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
    document.body.append(this.modalContainer)
    setTimeout(() => {
      this.modalContainer.classList.add("show")
    })
    this.previousFocus = document.activeElement
    this.closeBtn.focus()
    this.onOpen(this.modalContainer)
  }

  hide() {
    this.modalContainer.classList.remove("show")
    waitForAnimation(this.modalContainer).then(() => {
      this.modalContainer.remove()
    })
    ;(this.previousFocus ?? document.body).focus()
    this.onClose()
  }
}
