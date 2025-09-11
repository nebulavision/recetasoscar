import { supabase } from '../config/supabase.js';

export async function uploadToStorage(filePath, file) {
    const { error } = await supabase.storage.from("imagenes").upload(filePath, file);
    if (error) {
        console.error("Error subiendo imagen:", error);
        alert("❌ No se pudo subir la imagen");
        return false;
    }
    return true;
}

export async function getPublicUrl(bucket, filePath){
    const { data: publicUrlData } = await supabase.storage.from(bucket).getPublicUrl(filePath);
    
    return publicUrlData.publicUrl;
}