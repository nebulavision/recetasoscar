import { getRecipe } from "../supabase/db.js";

const recipeId = new URLSearchParams(window.location.search).get("id");
const [recipe] = await getRecipe(recipeId);
const recipeCard = document.getElementById("recipe");

const createElement = (tag, { classList = [], text = "", attrs = {}, children = [] } = {}) => {
    const element = document.createElement(tag);
    if (classList.length) element.classList.add(...classList);
    if (text) element.innerText = text;
    Object.entries(attrs).forEach(([k, v]) => element.setAttribute(k, v));
    if (children.length) element.append(...children);

    return element;
};

// Imágen
const recipeImage = createElement("img", {
    attrs: { src: recipe.imagen_url, alt: recipe.titulo }
});

// Botón atrás
const backBtn = createElement("a", {
  classList: ["btn", "btn-back"],
  text: "Atrás",
  attrs: { href: `index.html?parent=${recipe.categoria_id}` }
});

// Ingredientes
const ingredientsList = createElement("ul", {
  children: recipe.ingredientes.map(i => createElement("li", { text: i }))
});

// Preparación
const preparationList = createElement("ol", {
  children: recipe.pasos.map(i => createElement("li", { text: i }))
});

// Botón imprimir
const printBtn = createElement("a", {
  classList: ["btn"],
  text: "💾 Guardar receta",
});
printBtn.addEventListener("click", () => window.print());

// Contenido principal
const recipeCardContent = createElement("div", {
  classList: ["card-content"],
  children: [
    backBtn,
    createElement("h1", { text: recipe.titulo }),
    createElement("h2", { text: "Ingredientes" }),
    ingredientsList,
    createElement("h2", { text: "Preparación" }),
    preparationList,
    printBtn
  ]
});

// Ensamblar tarjeta
recipeCard.append(recipeImage, recipeCardContent);