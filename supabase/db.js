import { supabase } from '../config/supabase.js';

// -------------------- CATEGORIES -------------------------
export async function getCurrentCategoriesFor(parentId) {
    try {
        const query = supabase.from("categorias").select("id, nombre, parent_id, image_url");
        const { data: categorias, error } = parentId
            ? await query.eq("parent_id", parentId)
            : await query.is("parent_id", null);

        if (error) throw error;

        return categorias;
    } catch (err) {
        console.error("Error cargando categorías:", err);
    }
}

export async function getCurrentCategory(parentId) {
    try {
        let trail = [];
        let currentId = parentId;

        while (currentId) {
            const { data, error } = await supabase
                .from("categorias")
                .select("id, nombre, parent_id")
                .eq("id", currentId)
                .single();

            if (error) break;

            trail.unshift(data);
            currentId = data.parent_id;
        }

        return trail;
    } catch (err) {
        console.error("Error cargando breadcrumbs:", err);
    }
}

export async function insertCategory(nombre, image_url, parent_id) {
    const { error } = await supabase.from("categorias").insert([{ nombre, image_url, parent_id }]);

    if (error) {
        console.error("Error creando categoría:", error);
        alert("❌ No se pudo crear la categoría");
        return false;
    } else {
        return true;
    }
}

// ------------------ RECIPES ----------------------------
export async function getRecipes(parentId) {
    try {
        const { data: recipes, error } = await supabase
            .from("recetas")
            .select("*")
            .eq("categoria_id", parentId);

        if (error) throw error;

        return recipes;
    } catch (err) {
        console.error("Error cargando recetas:", err);
    }
}

export async function getRecipe(recipeId) {
    try {
        const { data: recipe, error } = await supabase
            .from("recetas")
            .select("*")
            .eq("id", recipeId);

        if (error) throw error;

        return recipe;
    } catch (err) {
        console.error("Error cargando receta:", err);
    }
}

export async function queryRecipe(query) {
    try {
        const { data: recipes, error } = await supabase
            .from("recetas")
            .select("*")
            .ilike("titulo", `%${query}%`);

        if (error) throw error;

        return recipes;
    } catch (err) {
        console.error("Error cargando recetas:", err);
    }
}

// ------------------ PERMISOS RECETAS ----------------------------
export async function getAccessForRecipe(recipeId) {
    try {
        const { data: access, error } = await supabase
            .from("receta_permisos")
            .select("*")
            .eq("receta_id", recipeId);

        if (error) throw error;

        return access;
    } catch (err) {
        console.error("Error cargando permisos:", err);
    }
}

export async function insertRecipePermission(recipeId, email, grantedBy){
    const { error } = await supabase.from("receta_permisos").insert([
        { 
            receta_id: recipeId,
            email: email,
            granted_by: grantedBy 
        }
    ]);

    if (error) {
        console.error("Error dando acceso:", error);
        alert("❌ No se pudo permitir el acceso");
        return false;
    } else {
        return true;
    }
}

export async function deletePermission(permissionId){
    const { error } = await supabase.from("receta_permisos")
        .delete()
        .eq('id', permissionId);

    if (error) {
        console.error("Error eliminando acceso:", error);
        alert("❌ No se pudo eliminar el acceso");
        return false;
    } else {
        return true;
    }
}

// --------------- SUBRECETAS ----------------------
export async function getSubrecipesFor(recipeId) {
    try {
        const { data: recipes, error } = await supabase
            .from("subrecetas")
            .select("subreceta:subreceta_id(*)")
            .eq("receta_id", recipeId);

        if (error) throw error;

        return recipes.map(item => item.subreceta);
    } catch (err) {
        console.error("Error cargando subrecetas:", err);
    }
}