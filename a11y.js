export const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;

/**
 * Add an id to an element, if it doesn't have one
 * @param {HTMLElement} element
 */
export function addIdToElement(element) {
  if (element.id) {
    return;
  }

  element.setAttribute("id", crypto.randomUUID());
}

/**
 * Get label of an element, as it would be read by a screen reader
 * @param {HTMLElement} element
 */
export function getA11yLabel(element) {
  if (element.getAttribute("aria-label")) {
    return element.getAttribute("aria-label");
  }

  const labelledById = element.getAttribute("aria-labelledby");
  const labelledByElement = document.getElementById(labelledById);

  if (labelledByElement) {
    return labelledByElement.textContent.trim();
  }

  const clonedElement = element.cloneNode(true);
  clonedElement
    .querySelectorAll("[aria-label], [aria-labelledby]")
    .forEach((el) => (el.textContent = getA11yLabel(el)));
  return clonedElement.textContent.trim();
}

/**
 * Create an accessible button from an element
 * Only use this function if you can't use a button element
 * @param {HTMLElement} element
 * @param {Object} options
 * @param {string} options.role
 */
export function createA11yButton(element, { role = "button" } = {}) {
  if (element.tagName === "BUTTON") {
    return;
  }

  if (!element.getAttribute("role")) element.setAttribute("role", role);
  element.setAttribute("tabindex", "0");

  // Simulate click on Enter or Spacebar
  element.addEventListener("keydown", function (e) {
    const key = e.key !== undefined ? e.key : e.keyCode;

    if (
      key === "Enter" ||
      key === 13 ||
      ["Spacebar", " "].indexOf(key) >= 0 ||
      key === 32
    ) {
      e.preventDefault();

      if (typeof element.click === "function") {
        element.click();
      } else {
        element.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      }
    }
  });
}

/**
 * Set the a11y attributes for the modal
 * @param {HTMLElement} element - The modal element
 */
export function setModalA11yAttributes(element) {
  if (!element.getAttribute("role")) {
    element.setAttribute("role", "dialog");
  }

  element.setAttribute("aria-modal", "true");

  const modalHeadline = getFirstHeadline(element);

  if (
    modalHeadline &&
    !element.getAttribute("aria-label") &&
    !element.getAttribute("aria-labelledby")
  ) {
    element.setAttribute("aria-label", modalHeadline);
    return;
  }

  if (element.getAttribute("aria-labelledby")) {
    replaceAriaLabelledByWithAriaLabel(element);
  }
}

/**
 * Get the first headline label in the container
 * @param {HTMLElement} container - The container element
 */
function getFirstHeadline(container) {
  const headlines = container.querySelectorAll("h1, h2, h3, h4, h5, h6");

  const firstHeadlineWithText = Array.from(headlines).find((headline) =>
    headline.textContent.trim()
  );

  if (firstHeadlineWithText) {
    return firstHeadlineWithText.textContent.trim();
  }

  return null;
}

/**
 * Replace aria-labelledby with aria-label
 * @param {HTMLElement} element - The element
 */
function replaceAriaLabelledByWithAriaLabel(element) {
  const labelledById = element.getAttribute("aria-labelledby");
  const labelledByElement = document.getElementById(labelledById);

  if (!labelledByElement) {
    return;
  }

  element.setAttribute("aria-label", labelledByElement.textContent.trim());
  element.removeAttribute("aria-labelledby");
}
