import { getPublicUrl, uploadToStorage } from '../supabase/storage.js';
import { insertCategory } from '../supabase/db.js';

export async function saveCategory(categoryName, categoryImage) {
    if (!categoryImage) return alert("Debes seleccionar una imagen");

    const filePath = `categorias/${crypto.randomUUID()}-${categoryImage.name}`;
    const uploaded = await uploadToStorage(filePath, categoryImage);
    if (!uploaded) return;

    const image_url = await getPublicUrl("imagenes", filePath);

    const insertResult = await insertCategory(categoryName, image_url, parentId || null);

    if (insertResult) {
        hideModal();
        loadCategories();
    }
}




