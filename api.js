/* =====================================
   CONEXION CON EL BACKEND (RiegoBackend)
===================================== */

const API_URL = "http://localhost:8000";

// login.html vive junto a este archivo, sin importar la carpeta de la página.
const LOGIN_URL = new URL("login.html", document.currentScript.src).href;


function obtenerToken() {
    return localStorage.getItem("token");
}

function cerrarSesion() {
    localStorage.removeItem("token");
    location.href = LOGIN_URL;
}


// Sin sesión, toda página (menos el login) manda al login.

if (!obtenerToken() && !location.pathname.endsWith("/login.html")) {
    cerrarSesion();
}


// El ícono de perfil del encabezado cierra la sesión.

const iconoPerfil = document.querySelector(".perfil");

if (iconoPerfil) {
    iconoPerfil.title = "Cerrar sesión";
    iconoPerfil.style.cursor = "pointer";
    iconoPerfil.addEventListener("click", cerrarSesion);
}


/* =====================================
   LLAMAR A LA API
===================================== */

// api("/schedules")                                  → GET
// api("/schedules", { method: "POST", body: {...} }) → JSON
// api("/auth/login", { method: "POST", form: {...} }) → formulario

async function api(ruta, { method = "GET", body, form } = {}) {

    const headers = {};

    if (obtenerToken()) {
        headers.Authorization = "Bearer " + obtenerToken();
    }

    let contenido;

    if (form) {
        contenido = new URLSearchParams(form);
    } else if (body !== undefined) {
        headers["Content-Type"] = "application/json";
        contenido = JSON.stringify(body);
    }

    let respuesta;

    try {
        respuesta = await fetch(API_URL + ruta, { method, headers, body: contenido });
    } catch {
        throw new Error("No se pudo conectar con el servidor.");
    }

    // Token vencido o inválido: volver a iniciar sesión.
    // (En el login un 401 es "contraseña incorrecta", no sesión vencida.)

    if (respuesta.status === 401 && !form) {
        cerrarSesion();
    }

    const datos = await respuesta.json().catch(() => null);

    if (!respuesta.ok) {
        throw new Error(mensajeDeError(datos));
    }

    return datos;
}


// FastAPI responde { detail: "texto" } o { detail: [{ msg: "..." }, ...] }.

function mensajeDeError(datos) {

    const detalle = datos && datos.detail;

    if (typeof detalle === "string") {
        return detalle;
    }

    if (Array.isArray(detalle)) {
        return detalle.map(error => error.msg).join(". ");
    }

    return "Ocurrió un error inesperado.";
}
