import { getUserEmail } from "../auth/auth.js";
import { deletePermission, getAccessForRecipe, insertRecipePermission } from "../supabase/db.js";

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

  // Asignar eventos de borrado
  document.querySelectorAll(".delete-access-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const idx = e.target.dataset.index;
      deletePermission(access[idx].id)
      renderAccess();
    });
  });
}

// Evento para dar acceso
accessForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("access-email").value;
  if (!email) return;

  await insertRecipePermission(recipeId, email, await getUserEmail());

  document.getElementById("access-email").value = "";
  renderAccess();
});

// Cerrar modal
closeModalBtn.addEventListener("click", () => {
  accessModal.classList.add("hidden");
});

// Inicial
renderAccess();
