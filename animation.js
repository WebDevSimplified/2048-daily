export function animateElement(element, animation) {
  if (element.dataset.animation != null) return

  element.dataset.animation = animation
  return waitForAnimation(element).then(() => {
    delete element.dataset.animation
  })
}

export function waitForAnimation(element) {
  return new Promise(resolve => {
    const resetAnimation = () => {
      element.removeEventListener("transitionend", resetAnimation)
      element.removeEventListener("transitioncancel", resetAnimation)
      element.removeEventListener("animationend", resetAnimation)
      element.removeEventListener("animationcancel", resetAnimation)
      resolve()
    }
    element.addEventListener("transitionend", resetAnimation)
    element.addEventListener("transitioncancel", resetAnimation)
    element.addEventListener("animationend", resetAnimation)
    element.addEventListener("animationcancel", resetAnimation)
  })
}
