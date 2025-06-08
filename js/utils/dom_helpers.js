export function getElement(selector) {
    const element = document.querySelector(selector);
    if (!element) {
        throw new Error(`Element with selector "${selector}" not found.`);
    }
    return element;
}

export function getAllElements(selector) {
    return document.querySelectorAll(selector);
}

export function createElement(tag, { id, classes = [], attributes = {}, textContent = '' } = {}) {
    const element = document.createElement(tag);

    if (id) {
        element.id = id;
    }

    if (classes.length > 0) {
        element.classList.add(...classes);
    }

    for (const [key, value] of Object.entries(attributes)) {
        element.setAttribute(key, value);
    }

    if (textContent) {
        element.textContent = textContent;
    }

    return element;
}

export function clearContainer(container) {
    if (typeof container === 'string') {
        container = getElement(container);
    }
    if (container) {
        while (container.firstChild) {
            container.removeChild(container.firstChild);
        }
    }
}

export function addClass(element, className) {
    if (element) {
        element.classList.add(className);
    }
}

export function removeClass(element, className) {
    if (element) {
        element.classList.remove(className);
    }
}

export function toggleClass(element, className) {
    if (element) {
        element.classList.toggle(className);
    }
}

export function setElementVisibility(element, isVisible) {
    if (element) {
        element.style.display = isVisible ? '' : 'none';
    }
}
