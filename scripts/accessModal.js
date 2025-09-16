import { getUserEmail } from "../auth/auth.js";
import {
  deletePermission,
  getAccessForRecipe,
  getSubrecipesFor,
  insertRecipePermission,
} from "../supabase/db.js";

const accessList = document.getElementById("access-modal-list");
const accessForm = document.getElementById("access-modal-form");
const closeModalBtn = document.getElementById("access-modal-close-btn");
const accessModal = document.getElementById("access-modal");

const urlParams = new URLSearchParams(window.location.search);
const recipeId = urlParams.get("id") || null;

// Renderizar accesos
async function renderAccess() {
  let access = await getAccessForRecipe(recipeId);

  accessList.innerHTML = "";
  access.forEach((a, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${a.email}</td>
      <td>${a.fecha}</td>
      <td>${a.granted_by}</td>
      <td><button class="delete-access-btn" data-index="${index}">🗑️</button></td>
    `;
    accessList.appendChild(row);
  });


  document.querySelectorAll(".delete-access-btn").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      const idx = e.target.dataset.index;
      deletePermission(access[idx].id);

      const subrecipes = await getSubrecipesFor(recipeId);
      for (const item of subrecipes) {
        const [subrecipeAccess] = await getAccessForRecipe(item.id);

        await deletePermission(subrecipeAccess.id);
      }

      renderAccess();
    });
  });
}

// Evento para dar acceso
accessForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("access-email").value;
  if (!email) return;

  const userEmail = await getUserEmail();

  await insertRecipePermission(recipeId, email, userEmail);

  const subrecipes = await getSubrecipesFor(recipeId);
  for (const item of subrecipes) {
    await insertRecipePermission(item.id, email, userEmail);
  }

  document.getElementById("access-email").value = "";
  renderAccess();
});

// Cerrar modal
closeModalBtn.addEventListener("click", () => {
  accessModal.classList.add("hidden");
});

// Inicial
renderAccess();
