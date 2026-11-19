/* =====================================
   AVISOS DEL BACKEND (spec 103)
===================================== */

// Se carga después de api.js en cada página con sesión. Pone la campana
// antes del ícono de perfil y consulta los no leídos cada 30 s; el backend
// crea los avisos, aquí solo se muestran (perfil, regla 2).

const perfilAvisos = document.querySelector(".perfil");

let noLeidos = 0;


// La campana y el perfil van juntos a la derecha del encabezado.

const grupoAvisos = document.createElement("div");
grupoAvisos.className = "encabezado-acciones";

const contenedorAvisos = document.createElement("div");
contenedorAvisos.className = "avisos";

const campana = document.createElement("button");
campana.type = "button";
campana.className = "campana";
campana.textContent = "🔔";

const numeroAvisos = document.createElement("span");
numeroAvisos.className = "campana-numero";
numeroAvisos.hidden = true;
campana.append(numeroAvisos);

// El panel con la lista se abre bajo la campana (spec 103 D5).

const panelAvisos = document.createElement("div");
panelAvisos.id = "panelAvisos";
panelAvisos.className = "panel-avisos";
panelAvisos.hidden = true;
panelAvisos.innerHTML = `
    <h2>Notificaciones</h2>
    <div class="permiso-avisos"></div>
    <p class="mensaje-avisos" role="alert" hidden></p>
    <ul class="lista-avisos"></ul>`;

const zonaPermiso = panelAvisos.querySelector(".permiso-avisos");
const mensajeAvisos = panelAvisos.querySelector(".mensaje-avisos");
const listaAvisos = panelAvisos.querySelector(".lista-avisos");

campana.setAttribute("aria-controls", "panelAvisos");
campana.setAttribute("aria-expanded", "false");

contenedorAvisos.append(campana, panelAvisos);
grupoAvisos.append(contenedorAvisos);

if (perfilAvisos) {
    perfilAvisos.before(grupoAvisos);
    grupoAvisos.append(perfilAvisos);
}


/* =====================================
   CONTADOR DE NO LEIDOS
===================================== */

function mostrarContador(cantidad) {

    noLeidos = Math.max(cantidad, 0);

    numeroAvisos.textContent = noLeidos;
    numeroAvisos.hidden = noLeidos === 0;

    campana.setAttribute("aria-label",
        noLeidos === 0 ? "Avisos: ninguno sin leer"
        : noLeidos === 1 ? "1 aviso sin leer"
        : noLeidos + " avisos sin leer");
}


// Errores en silencio (plan D3): con el backend caído, el contador
// conserva el último número y no aparece una ventana cada 30 s.

async function leerNoLeidos() {

    try {
        const avisos = await api("/notifications?unread_only=true");
        mostrarContador(avisos.length);
        notificarNuevos(avisos);
    } catch (error) {
        console.error(error);
    }
}


/* =====================================
   LISTA DE AVISOS
===================================== */

const TIPOS_AVISO = {
    irrigation_reminder: "Recordatorio de riego",
    reading_alert: "Alerta de sensor"
};

function formatearFechaAviso(iso) {

    return new Date(iso).toLocaleString("es-CL", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23"
    });
}

function mostrarMensajeAvisos(texto) {
    mensajeAvisos.textContent = texto;
    mensajeAvisos.hidden = !texto;
}


// Un aviso no leído es un botón: pulsarlo lo marca leído (FR-3.a).

function crearAviso(aviso) {

    const item = document.createElement("li");
    item.className = aviso.is_read ? "aviso" : "aviso no-leido";

    const contenido = document.createElement(aviso.is_read ? "div" : "button");
    contenido.className = "aviso-contenido";

    if (!aviso.is_read) {
        contenido.type = "button";
        contenido.title = "Marcar como leído";
        contenido.addEventListener("click", () => marcarLeido(aviso, item));
    }

    const cabecera = document.createElement("span");
    cabecera.className = "aviso-cabecera";

    const tipo = document.createElement("strong");
    tipo.textContent = TIPOS_AVISO[aviso.type] || aviso.type;

    const estado = document.createElement("span");
    estado.className = "aviso-estado";
    estado.textContent = aviso.is_read ? "Leído" : "Sin leer";

    cabecera.append(tipo, estado);

    const mensaje = document.createElement("span");
    mensaje.className = "aviso-mensaje";
    mensaje.textContent = aviso.message;

    const fecha = document.createElement("small");
    fecha.textContent = formatearFechaAviso(aviso.created_at);

    contenido.append(cabecera, mensaje, fecha);
    item.append(contenido);

    return item;
}

async function abrirLista() {

    panelAvisos.hidden = false;
    campana.setAttribute("aria-expanded", "true");
    mostrarPermiso();
    mostrarMensajeAvisos("");

    try {
        const avisos = await api("/notifications");

        if (avisos.length === 0) {
            const vacio = document.createElement("li");
            vacio.className = "sin-avisos";
            vacio.textContent = "No tienes notificaciones.";
            listaAvisos.replaceChildren(vacio);
        } else {
            listaAvisos.replaceChildren(...avisos.map(crearAviso));
        }
    } catch (error) {
        mostrarMensajeAvisos(error.message);
    }
}

function cerrarLista() {
    panelAvisos.hidden = true;
    campana.setAttribute("aria-expanded", "false");
}

campana.addEventListener("click", () => {
    panelAvisos.hidden ? abrirLista() : cerrarLista();
});

document.addEventListener("keydown", evento => {
    if (evento.key === "Escape" && !panelAvisos.hidden) {
        cerrarLista();
        campana.focus();
    }
});


/* =====================================
   MARCAR COMO LEIDO
===================================== */

async function marcarLeido(aviso, item) {

    const boton = item.querySelector("button");
    boton.disabled = true;
    mostrarMensajeAvisos("");

    try {
        await api(`/notifications/${aviso.id}/read`, { method: "PATCH" });
    } catch (error) {
        boton.disabled = false;
        mostrarMensajeAvisos(error.message);
        return;
    }

    aviso.is_read = true;
    item.replaceWith(crearAviso(aviso));
    mostrarContador(noLeidos - 1);
}


/* =====================================
   NOTIFICACIONES DEL NAVEGADOR
===================================== */

// Mostrar una notificación no marca el aviso leído (spec 103 D2).
// Los ids ya mostrados se guardan en el navegador (perfil, regla 1) y se
// releen en cada consulta: otra pestaña pudo mostrarlos (FR-4.c).

function notificarNuevos(avisos) {

    if (!("Notification" in window) || Notification.permission !== "granted") {
        return;
    }

    let enviados;

    try {
        enviados = JSON.parse(localStorage.getItem("notificacionesEnviadas")) || [];
    } catch {
        enviados = [];
    }

    const nuevos = avisos.filter(aviso => !enviados.includes(aviso.id));

    if (nuevos.length === 0) {
        return;
    }

    // ponytail: la lista de ids crece sin límite (unos bytes por aviso); recortarla si llega a pesar.
    localStorage.setItem("notificacionesEnviadas",
        JSON.stringify(enviados.concat(nuevos.map(aviso => aviso.id))));

    for (const aviso of nuevos) {

        const titulo = aviso.type === "irrigation_reminder"
            ? "¡Hora de regar tus orquídeas! 🌱"
            : "Alerta del invernadero ⚠";

        // El tag evita duplicados si dos pestañas consultan a la vez.
        const notificacion = new Notification(titulo, { body: aviso.message, tag: "aviso-" + aviso.id });

        notificacion.onclick = () => {
            window.focus();
            abrirLista();
            notificacion.close();
        };
    }
}


// El permiso se pide desde la lista, cuando la persona decide (spec 103 D3).

function mostrarPermiso() {

    const texto = document.createElement("p");

    if (!("Notification" in window)) {
        texto.textContent = "Este navegador no muestra avisos fuera de la página.";
        zonaPermiso.replaceChildren(texto);

    } else if (Notification.permission === "default") {
        const boton = document.createElement("button");
        boton.type = "button";
        boton.className = "boton-permiso";
        boton.textContent = "Activar avisos del navegador";
        boton.addEventListener("click", async () => {
            await Notification.requestPermission();
            mostrarPermiso();
            leerNoLeidos();
        });
        zonaPermiso.replaceChildren(boton);

    } else if (Notification.permission === "denied") {
        texto.textContent = "Los avisos del navegador están bloqueados; actívalos en la configuración del navegador.";
        zonaPermiso.replaceChildren(texto);

    } else {
        zonaPermiso.replaceChildren();
    }
}


mostrarContador(0);

if (perfilAvisos && obtenerToken()) {
    leerNoLeidos();
    setInterval(leerNoLeidos, 30000);
}
