import { checkSession, signOut } from '../auth/auth.js';
import { getCurrentCategoriesFor, getCurrentCategory, getRecipes, insertCategory, queryRecipe } from '../supabase/db.js';
import { getPublicUrl, uploadToStorage } from '../supabase/storage.js';

const grid = document.getElementById("categorias-grid");
const breadcrumbs = document.getElementById("breadcrumbs");
const modal = document.getElementById("modal-categoria");
const categoryForm = document.getElementById("form-categoria");
const searchInput = document.getElementById("search-input");
const searchBtn = document.getElementById("search-btn");
const cancelBtn = document.getElementById("cancelar-btn");
const logoutBtn = document.getElementById("logout-btn");

const urlParams = new URLSearchParams(window.location.search);
const parentId = urlParams.get("parent") || null;

// ------------------- MODAL -------------------
function mostrarModal() {
    modal.classList.remove("hidden");
}

function hideModal() {
    modal.classList.add("hidden");
    categoryForm.reset();
}

searchBtn.addEventListener("click", search);
cancelBtn.addEventListener("click", hideModal);
logoutBtn.addEventListener("click", signOut);

// ------------------- BUSQUEDA ---------------------
async function search() {
    const searchInputValue = searchInput.value;

    if (!searchInputValue) window.location = "index.html"; 

    const recipes = await queryRecipe(searchInputValue);

    console.log(recipes);
    grid.innerHTML = "";
    loadRecipes(recipes);
    searchInput.value = "";
}

// ------------------- CATEGORÍAS -------------------
async function loadCategories() {
    const categories = await getCurrentCategoriesFor(parentId);

    createAddCategoryCard();

    if (categories.length) {
        grid.innerHTML = "";
        categories.forEach(createCategoryCard);
    } else if (parentId) {
        grid.innerHTML = "";
        createAddRecipeCard();
        loadRecipes();
    }
}

function createAddCategoryCard() {
    const addCard = document.createElement("div");
    addCard.className = "card add-card";
    addCard.innerHTML = `
        <div class="card-content add-content">
            <h2>➕ Nueva categoría</h2>
            <a href="#" class="btn">Crear</a>
        </div>
    `;
    addCard.querySelector("a").addEventListener("click", mostrarModal);
    grid.appendChild(addCard);
}

function createAddRecipeCard() {
    const addCard = document.createElement("div");
    addCard.className = "card add-card";
    addCard.innerHTML = `
        <div class="card-content add-content">
            <h2>➕ Nueva receta</h2>
            <a href="#" class="btn">Crear</a>
        </div>
    `;
    addCard.querySelector("a").addEventListener("click", () => alert("TODO"));
    grid.appendChild(addCard);
}

function createCategoryCard(cat) {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
        <img src="${cat.image_url || "https://antojoentucocina.com/wp-content/uploads/2025/04/masitas-de-maicena-400x300.jpg"}" alt="${cat.nombre}">
        <div class="card-content">
            <h2>${cat.nombre}</h2>
            <a href="index.html?parent=${cat.id}" class="btn">Explorar</a>
        </div>
    `;
    grid.appendChild(card);
}

// ------------------- RECETAS -------------------
async function loadRecipes(recipesList) {
    let recipes;

    if (recipesList && recipesList.length > 0) {
        recipes = recipesList;
    } else {
        recipes = await getRecipes(parentId);
    }

    recipes.forEach(rec => {
        const card = document.createElement("div");
        card.className = "card";
        card.innerHTML = `
                <img src="${rec.imagen_url || "https://source.unsplash.com/400x300/?food"}" alt="${rec.titulo}">
                <div class="card-content">
                    <h2>${rec.titulo}</h2>
                    <a href="recipe.html?id=${rec.id}" class="btn">Ver receta</a>
                </div>
            `;
        grid.appendChild(card);
    });

    //loadBreadcrumbs(true);
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


// ------------------- FORMULARIO -------------------
categoryForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nombre = document.getElementById("categoria-nombre").value;
    const file = document.getElementById("categoria-imagen").files[0];

    if (!file) return alert("Debes seleccionar una imagen");

    const filePath = `categorias/${crypto.randomUUID()}-${file.name}`;
    const uploaded = await uploadToStorage(filePath, file);
    if (!uploaded) return;

    const image_url = await getPublicUrl("imagenes", filePath);

    const insertResult = await insertCategory(nombre, image_url, parentId || null);

    if (insertResult) {
        hideModal();
        loadCategories();
    }
});

// ------------------- INICIALIZACIÓN -------------------
checkSession();
loadCategories();
loadBreadcrumbs();
