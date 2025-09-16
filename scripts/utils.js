export const createElement = (tag, { classList = [], text = "", attrs = {}, children = [] } = {}) => {
    const element = document.createElement(tag);
    if (classList.length) element.classList.add(...classList);
    if (text) element.innerText = text;
    Object.entries(attrs).forEach(([k, v]) => element.setAttribute(k, v));
    if (children.length) element.append(...children);

    return element;
};