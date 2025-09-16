import { getRecipe, getSubrecipesFor } from "../supabase/db.js";
import { checkSession, getUserEmail, isAdmin } from "../auth/auth.js";
import { createElement } from "./utils.js";

checkSession();

const recipeId = new URLSearchParams(window.location.search).get("id");
const [recipe] = await getRecipe(recipeId);
const subRecipes = await getSubrecipesFor(recipeId);
const recipeCard = document.getElementById("recipe-card");
const accessModal = document.getElementById("access-modal");

const isAdminFlag = await isAdmin(await getUserEmail());

document.title = recipe.titulo;

async function showModal() {
  if (isAdminFlag) {
    accessModal.classList.remove("hidden");
  }
}

// Imágen
const recipeImage = createElement("img", {
  attrs: { src: recipe.imagen_url, alt: recipe.titulo },
});

// Botón atrás
const backBtn = createElement("a", {
  classList: ["btn", "btn-back"],
  text: "Atrás",
  attrs: { href: `index.html?parent=${recipe.categoria_id}` },
});

// Ingredientes
let ingredientsTitle = null;
let ingredientsList = null;
if (!recipe.is_complex) {
  ingredientsTitle = createElement("h2", { text: "Ingredientes" });
  ingredientsList = createElement("ul", {
    children: recipe.ingredientes.map((i) => createElement("li", { text: i })),
  });
}

function createSubRecipeSection() {
  const subRecipesChildren = subRecipes.map(subrecipe => {
    // Ingredientes
    const subrecipeIngredientsList = createElement("ul", {
      children: subrecipe.ingredientes.map((i) =>
        createElement("li", { text: i })
      ),
    });

    // Preparación
    const subrecipePreparation = createElement("ol", {
      children: subrecipe.pasos.map((i) => createElement("li", { text: i })),
    });

    // Observaciones
    let observationsTitle = null;
    let observationList = null;
    if (subrecipe.observaciones?.length > 0) {
      observationsTitle = createElement("h2", { text: "Observaciones" });
      observationList = createElement("ul", {
        children: subrecipe.observaciones.map((o) =>
          createElement("li", { text: o })
        ),
      });
    }

    const subRecipeContent = createElement("div", {
      children: [
        createElement("h3", { text: "Ingredientes" }),
        subrecipeIngredientsList,
        createElement("h3", { text: "Preparación" }),
        subrecipePreparation,
        observationsTitle,
        observationList,
      ].filter(Boolean),
    });

    const details = createElement("details", {
      children: [
        createElement("summary", { text: subrecipe.titulo }),
        subRecipeContent,
      ],
    });

    return createElement("article", {
      classList: ["sub-recipe"],
      children: [details],
    });
  });

  return createElement("section", {
        attrs: { id: "sub-recipes" },
        children: subRecipesChildren
    });
}

// Sub-recetas
const subRecipesSection = createElement("section", {
  attrs: { id: "sub-recipes-section" },
  children: [
    createElement("h2", { text: "Elaboraciones necesarias" }),
    createSubRecipeSection(),
  ],
});

// Preparación
const preparationList = createElement("ol", {
  children: recipe.pasos.map((i) => createElement("li", { text: i })),
});

// Observaciones
let observationsTitle = null;
let observationList = null;
if (recipe.observaciones?.length > 0) {
  observationsTitle = createElement("h2", { text: "Observaciones" });
  observationList = createElement("ul", {
    children: recipe.observaciones.map((o) => createElement("li", { text: o })),
  });
}

// Acciones recetas
const recipeActions = createElement("div", {
  attrs: { id: "recipe-actions" },
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
  attrs: { id: "share-btn" },
});
shareBtn.addEventListener("click", showModal);
if (isAdminFlag) recipeActions.appendChild(shareBtn);

// Contenido principal
const recipeCardContent = createElement("article", {
  attrs: { id: "recipe-card-content" },
  children: [
    backBtn,
    createElement("h1", { text: recipe.titulo }),
    ingredientsTitle,
    ingredientsList,
    subRecipesSection,
    createElement("h2", { text: "Preparación" }),
    preparationList,
    observationsTitle,
    observationList,
    recipeActions,
  ].filter(Boolean),
});

// Ensamblar tarjeta
recipeCard.append(recipeImage, recipeCardContent);
