import { getRecipe } from "../supabase/db.js";
import { getUserEmail, isAdmin} from '../auth/auth.js';
import { createElement } from "./utils.js";

const recipeId = new URLSearchParams(window.location.search).get("id");
const [recipe] = await getRecipe(recipeId);
const recipeCard = document.getElementById("recipe");
const accessModal = document.getElementById("access-modal");

const isAdminFlag = await isAdmin(await getUserEmail());

document.title = recipe.titulo;

async function showModal() {
  if(isAdminFlag){
    accessModal.classList.remove("hidden");
  }  
}

function hideModal() {
    accessModal.classList.add("hidden");
    categoryForm.reset();
}

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

// Observaciones
let observationsTitle = null;
let observationList = null;
if (recipe.observaciones?.length > 0) {
  observationsTitle = createElement("h2", { text: "Observaciones" });
  observationList = createElement("ul", {
    children: recipe.observaciones.map(o => createElement("li", { text: o }))
  });
}

// Acciones recetas
const recipeActions = createElement("div",{
  attrs: { id: "recipe-actions" }
});

// Botón imprimir
const printBtn = createElement("a", {
  classList: ["btn"],
  text: "💾 Guardar receta",
});
printBtn.addEventListener("click", () => window.print());
recipeActions.appendChild(printBtn);

// Botón compartir
const shareBtn = createElement("a", {
  classList: ["btn"],
  text: "Accesos",
  attrs: { id: "share-btn" }
});
shareBtn.addEventListener("click", showModal);
if(isAdminFlag) recipeActions.appendChild(shareBtn);

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
    observationsTitle,
    observationList,
    recipeActions
  ].filter(Boolean)
});

// Ensamblar tarjeta
recipeCard.append(recipeImage, recipeCardContent);
