export const createElement = (tag, { classList = [], text = "", attrs = {}, children = [] } = {}) => {
    const element = document.createElement(tag);
    if (classList.length) element.classList.add(...classList);
    if (text) element.innerText = text;
    Object.entries(attrs).forEach(([k, v]) => element.setAttribute(k, v));
    if (children.length) element.append(...children);

    return element;
};

export function normalizeFileName(name) {
  return name
    .normalize('NFD')               // descompone los acentos
    .replace(/[\u0300-\u036f]/g, '') // elimina los acentos
    .replace(/\s+/g, '_')           // reemplaza todos los espacios por _
    .replace(/[^a-zA-Z0-9._-]/g, ''); // elimina caracteres no válidos
}