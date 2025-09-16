import { getCurrentCategory, insertRecipe, insertSubrecipe, queryRecipe } from "../supabase/db.js";
import { getPublicUrl, uploadToStorage } from "../supabase/storage.js";
import { createElement, normalizeFileName } from "./utils.js";

const isComplexRecipeChb = document.getElementById("new-recipe-is-complex");
const recipeModal = document.getElementById("recipe-modal");
const subrecipeModal = document.getElementById("subrecipe-modal");
const recipeCancelBtn = document.getElementById("new-recipe-cancel-btn");
const recipeForm = document.getElementById("new-recipe-form");
const subrecipesSection = document.getElementById("subrecipes-content");
const subrecipeListSection = document.getElementById("subrecipes-list");

const addSubrecipeBtn = document.getElementById("add-subrecipe-btn");
const subrecipesList = document.getElementById("subrecipe-results");
const subrecipeCancelBtn = document.getElementById("subrecipe-modal-cancel-btn");
const subrecipeSerachInput = document.getElementById("subrecipe-search");

const urlParams = new URLSearchParams(window.location.search);
const parentId = urlParams.get("parent") || null;

export function showRecipeModal() {
    recipeModal.classList.remove("hidden");
}

export function hideRecipeModal() {
    recipeModal.classList.add("hidden");
    recipeForm.reset();
}

function showSubrecipeModal() {
    subrecipeModal.classList.remove("hidden");
}

function hideSubrecipeModal() {
    subrecipeModal.classList.add("hidden");
}

recipeForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const recipeTitle = document.getElementById("new-recipe-title").value;
    const recipeIngredients = extratDataFromTextAreaAsArray(document.getElementById("new-recipe-ingredients"));
    const recipePreparation = extratDataFromTextAreaAsArray(document.getElementById("new-recipe-preparation"));
    const imageFile = document.getElementById("new-recipe-image").files[0];
    const recipeObservations = extratDataFromTextAreaAsArray(document.getElementById("new-recipe-observations"));
    const isComplexRecipe = isComplexRecipeChb.checked;
    const isRecipeForComplex = document.getElementById("new-recipe-elaboration-for").checked;
    const subrecipesIds = extractSubrecipedIds();

    let imagePath = "";
    if (imageFile !== undefined) {
        imagePath = `categorias/${normalizeFileName(imageFile.name)}`;
        await uploadToStorage(imagePath, imageFile);
    }

    let generatedRecipeId = await insertRecipe({
        titulo: recipeTitle,
        ingredientes: recipeIngredients.length === 0 ? null : recipeIngredients,
        pasos: recipePreparation,
        imagen_url: imageFile === undefined ? null : await getPublicUrl("imagenes", imagePath),
        categoria_id: parentId,
        observaciones: recipeObservations.length === 0 ? null : recipeObservations,
        is_complex: isComplexRecipe,
        is_for_complex_recipe: isRecipeForComplex
    });

    if (isComplexRecipe) {
        //insertar en subrecetas
        for (const id of subrecipesIds) {
            await insertSubrecipe(generatedRecipeId, id);
        }
    };

    recipeForm.reset();
    hideRecipeModal();
    window.location.reload();

});

recipeCancelBtn.addEventListener("click", hideRecipeModal);
isComplexRecipeChb.addEventListener("change", (e) => {
    if (e.target.checked) {
        subrecipesSection.classList.remove("hidden");
    } else {
        subrecipesSection.classList.add("hidden");
    }
});

function onSearchResultClick(recipe) {
    let subrecipe = createElement("li", {
        attrs: { id: recipe.id },
        text: recipe.titulo
    });

    subrecipeListSection.appendChild(subrecipe);
    subrecipesList.innerHTML = "";
    subrecipeSerachInput.value = "";
    hideSubrecipeModal();
}

subrecipeSerachInput.addEventListener("input", async (e) => {
    if (e.target.value.length >= 3) {
        const recipesSearched = await queryRecipe(e.target.value, true);

        subrecipesList.innerHTML = "";
        recipesSearched.forEach(recipe => {
            const recipeLi = createElement("li", {
                attrs: { id: recipe.id },
                text: recipe.titulo,
            });

            recipeLi.addEventListener("click", e => {
                onSearchResultClick(recipe);
            });

            subrecipesList.appendChild(recipeLi);
        });
    }

});

addSubrecipeBtn.addEventListener("click", showSubrecipeModal);
subrecipeCancelBtn.addEventListener("click", hideSubrecipeModal);

function extratDataFromTextAreaAsArray(textarea) {
    return textarea.value
        .split(/\r?\n/)   // detecta tanto \n como \r\n
        .map(linea => linea.trim()) // quitar espacios al inicio y fin
        .filter(linea => linea.length > 0); // eliminar líneas vacías
}

function extractSubrecipedIds() {
    // Convertimos los <li> a un array y extraemos su id
    const recipeIds = Array.from(subrecipeListSection.querySelectorAll('li'))
        .map(li => li.id);

    return recipeIds;
}

