import { checkSession, isAdmin, signOut } from '../auth/auth.js';
import { getCurrentCategoriesFor, getCurrentCategory, getRecipes, queryRecipe } from '../supabase/db.js';
import { saveCategory } from './newCategoryModal.js';
import { showRecipeModal } from './newRecipeModal.js';

const grid = document.getElementById("grid-category");
const breadcrumbs = document.getElementById("breadcrumbs");

const searchInput = document.getElementById("search-input");
const searchBtn = document.getElementById("search-btn");
const categoryModal = document.getElementById("category-modal");
const categoryForm = document.getElementById("category-form");
const categoryCancelBtn = document.getElementById("category-cancel-btn");
const logoutBtn = document.getElementById("logout-btn");
const noRecipesContainer = document.getElementById("no-recipes");
const noRecipesBackBtn = document.getElementById("btn-back");

const urlParams = new URLSearchParams(window.location.search);
const parentId = urlParams.get("parent") || null;

async function init() {
  grid.innerHTML = "";

  if (await isAdmin()) {
    createAddCategoryCard();
    if (parentId) createAddRecipeCard();
  }

  loadCategories();

  if (parentId) {
    loadRecipes();
  }
}


// ------------ NEW CATEGORY MODAL ------------------
function showCategoryModal() {
  categoryModal.classList.remove("hidden");
}

function hideCategoryModal() {
  categoryModal.classList.add("hidden");
  categoryForm.reset();
}

categoryForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const categoryName = document.getElementById("category-name").value;
  const imageFile = document.getElementById("category-image").files[0];

  let insertResult = saveCategory(categoryName, imageFile, parentId);

  if (insertResult) {
        hideCategoryModal();
        grid.innerHTML = "";
        loadCategories();
    }
});

categoryCancelBtn.addEventListener("click", hideCategoryModal);


// ------------------- BUSQUEDA ---------------------
async function search() {
  const searchInputValue = searchInput.value;

  if (!searchInputValue) window.location = "index.html";

  const recipes = await queryRecipe(searchInputValue);

  grid.innerHTML = "";
  noRecipesContainer.classList.remove("hidden");
  if (recipes.length == 0) {
    noRecipesBackBtn.addEventListener("click", () => {
      location.reload();
    });
  } else {
    loadRecipes(recipes);
  }

  searchInput.value = "";
}

searchBtn.addEventListener("click", search);

// ------------------- CATEGORÍAS -------------------
function createAddCategoryCard() {
  const addCard = document.createElement("div");
  addCard.className = "card add-card";
  addCard.innerHTML = `
        <div class="card-content add-content">
            <h2>➕ Nueva categoría</h2>
            <a href="#" class="btn">Crear</a>
        </div>
    `;
  addCard.querySelector("a").addEventListener("click", showCategoryModal);
  grid.appendChild(addCard);
}

function createCategoryCard(category) {
  const card = document.createElement("div");
  card.className = "card";
  card.innerHTML = `
        <img src="${category.image_url || "https://antojoentucocina.com/wp-content/uploads/2025/04/masitas-de-maicena-400x300.jpg"}" alt="${category.nombre}">
        <div class="card-content">
            <h2>${category.nombre}</h2>
            <a href="index.html?parent=${category.id}" class="btn">Explorar</a>
        </div>
    `;
  grid.appendChild(card);
}

async function loadCategories() {
  const categories = await getCurrentCategoriesFor(parentId);

  if (categories.length) {
    categories.forEach(createCategoryCard);
  }
}

// ------------------- RECETAS -------------------
function createAddRecipeCard() {
  const addCard = document.createElement("div");
  addCard.className = "card add-card";
  addCard.innerHTML = `
        <div class="card-content add-content">
            <h2>➕ Nueva receta</h2>
            <a href="#" class="btn">Crear</a>
        </div>
    `;
  addCard.querySelector("a").addEventListener("click", showRecipeModal);
  grid.appendChild(addCard);
}

function createRecipeCard(recipe) {
  const card = document.createElement("div");
  card.className = "card";
  const redirectTo = recipe.is_complex
    ? `complexRecipe.html?id=${recipe.id}`
    : `recipe.html?id=${recipe.id}`;

  card.innerHTML = `
        <img src="${recipe.imagen_url || "https://source.unsplash.com/400x300/?food"
    }" alt="${recipe.titulo}">
        <div class="card-content">
            <h2>${recipe.titulo}</h2>
            <a href="${redirectTo}" class="btn">Ver receta</a>
        </div>
    `;

  grid.appendChild(card);
}

async function loadRecipes(recipesList) {
  let recipes;

  if (recipesList && recipesList.length > 0) {
    recipes = recipesList;
  } else {
    recipes = await getRecipes(parentId);
  }

  recipes.forEach(createRecipeCard);
}

// ------------------- BREADCRUMBS -------------------
async function loadBreadcrumbs(flag) {
  let trail = await getCurrentCategory(parentId);

  if (flag) {
    breadcrumbs.innerHTML = `<a href="index.html">Recetas</a>`;
  } else {
    breadcrumbs.innerHTML = trail.reduce((html, cat, i) => {
      if (i === 0) html = `<a href="index.html">Recetas</a>`;
      html += `<span>/</span>${i === trail.length - 1 ? `<span class="current">${cat.nombre}</span>` : `<a href="index.html?parent=${cat.id}">${cat.nombre}</a>`}`;
      return html;
    }, '');
  }
}

logoutBtn.addEventListener("click", signOut);

// ------------------- INICIALIZACIÓN -------------------
checkSession();
init();
loadBreadcrumbs();
