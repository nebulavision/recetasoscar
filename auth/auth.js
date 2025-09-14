import { supabase } from '../config/supabase.js';

function getCallbackBaseUrl() {
    const { origin, pathname, hostname } = window.location;
    const isGitHubPages = hostname.includes("github.io"); // detecta si estás en GitHub Pages

    if (isGitHubPages) {
        // Añade el nombre del repositorio antes del callback
        return origin + "/recetasoscar/auth/callback.html";
    } else {
        // Localhost o cualquier otro entorno
        return origin + "/auth/callback.html";
    }
}


export async function signInWithGoogle() {
    console.log(getCallbackBaseUrl);

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

export async function getUserEmail() {
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error) {
        console.error('Error al obtener usuario:', error)
        return
    }

    if (user) {
        return user.email
    } else {
        console.log('No hay usuario logueado')
    }
}

export async function signOut() {
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

export async function isAdmin(email) {
    const { data, error } = await supabase
        .rpc('isAdmin', { p_email: email });

    if (error) {
        console.error('Error:', error);
    } else {
        return data;
    }
}

export async function checkSession() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) window.location.href = 'auth/login.html';
}
