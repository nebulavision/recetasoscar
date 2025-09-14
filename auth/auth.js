import { supabase } from '../config/supabase.js';

function getCallbackBaseUrl(){
    const { origin, pathname } = window.location;

    return origin + "/auth/callback.html"; return origin
}

export async function signInWithGoogle() {
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: getCallbackBaseUrl(),
            queryParams: {
                prompt: 'select_account'
            }
        }
    });

    if (error) {
        console.error(error.message);
    }
}

export async function signOut(){
    const { error } = await supabase.auth.signOut();

    if (error) {
        console.error("Error cerrando sesión:", error);
        alert("❌ No se pudo cerrar sesión");
    } else {
        window.location.href = "auth/login.html";
    }
}

export async function handleOAuthCallback() {
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error) {
        console.error('Error callback:', error.message);
        return false;
    }
    if (session) {
       return true;
    } else {
        return false;
    }
}

export async function checkSession() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) window.location.href = 'auth/login.html';
}
