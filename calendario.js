
/* =====================================
   FECHA ACTUAL
===================================== */

let fechaActual = new Date();


/* =====================================
   ELEMENTOS DEL HTML
===================================== */

const mesActual = document.getElementById("mesActual");
const diasCalendario = document.getElementById("diasCalendario");

const botonAnterior = document.getElementById("mesAnterior");
const botonSiguiente = document.getElementById("mesSiguiente");


/* =====================================
   ELEMENTOS DEL MODAL
===================================== */

const modalRiego = document.getElementById("modalRiego");
const cerrarModal = document.getElementById("cerrarModal");
const cancelarRiego = document.getElementById("cancelarRiego");

const fechaSeleccionada = document.getElementById("fechaSeleccionada");
const horaRiego = document.getElementById("horaRiego");
const guardarRiego = document.getElementById("guardarRiego");
const eliminarRiego = document.getElementById("eliminarRiego");

const listaRiegos = document.getElementById("listaRiegos");


/* =====================================
   NOMBRES DE LOS MESES
===================================== */

const nombresMeses = [
    "Enero", "Febrero", "Marzo",
    "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre",
    "Octubre", "Noviembre", "Diciembre"
];


/* =====================================
   DIAS DE LA SEMANA
===================================== */

const nombresDias = [
    "Domingo", "Lunes", "Martes",
    "Miércoles", "Jueves", "Viernes", "Sábado"
];


/* =====================================
   CARGAR RIEGOS GUARDADOS
===================================== */

let riegos = JSON.parse(localStorage.getItem("riegos")) || [];

let fechaEnEdicion = null;


/* =====================================
   NOTIFICACIONES DE RIEGO
===================================== */

// Recuperar notificaciones que ya fueron enviadas.

let notificacionesEnviadas =
    JSON.parse(localStorage.getItem("notificacionesEnviadas")) || [];


/* =====================================
   SOLICITAR PERMISO DE NOTIFICACIONES
===================================== */

function solicitarPermisoNotificaciones() {

    // Comprobar si el navegador permite notificaciones.

    if (!("Notification" in window)) {

        alert("Tu navegador no permite notificaciones.");

        return;
    }

    // Si ya se concedió el permiso, no hacer nada.

    if (Notification.permission === "granted") {
        return;
    }

    // Si el permiso fue bloqueado.

    if (Notification.permission === "denied") {

        alert(
            "Las notificaciones están bloqueadas. " +
            "Debes habilitarlas desde la configuración del navegador."
        );

        return;
    }

    // Solicitar permiso al usuario.

    Notification.requestPermission().then(function(resultado) {

        if (resultado === "granted") {

            alert("¡Notificaciones de riego activadas correctamente!");

        } else {

            alert("No se activaron las notificaciones de riego.");

        }

    });

}


/* =====================================
   COMPROBAR SI HAY UN RIEGO PROGRAMADO
===================================== */

function comprobarNotificaciones() {

    // Si el navegador no permite notificaciones, salir.

    if (!("Notification" in window)) {
        return;
    }

    // Comprobar si el usuario aceptó las notificaciones.

    if (Notification.permission !== "granted") {
        return;
    }

    const ahora = new Date();

    const fechaHoy = crearFecha(
        ahora.getFullYear(),
        ahora.getMonth(),
        ahora.getDate()
    );

    const horaActual =
        String(ahora.getHours()).padStart(2, "0") +
        ":" +
        String(ahora.getMinutes()).padStart(2, "0");


    // Buscar riegos que coincidan con la fecha y hora actuales.

    riegos.forEach(function(riego) {

        if (
            riego.fecha === fechaHoy &&
            riego.hora === horaActual
        ) {

            // Identificador único de la notificación.

            const identificador =
                riego.fecha + "_" + riego.hora;

            // Evitar enviar la misma notificación varias veces.

            if (notificacionesEnviadas.includes(identificador)) {
                return;
            }

            // Registrar que la notificación ya fue enviada.

            notificacionesEnviadas.push(identificador);

            localStorage.setItem(
                "notificacionesEnviadas",
                JSON.stringify(notificacionesEnviadas)
            );


            // MOSTRAR NOTIFICACION

            const notificacion = new Notification(
                "¡Hora de regar tus orquídeas! 🌱",
                {
                    body:
                        "Tienes un riego programado para hoy a las " +
                        riego.hora + ".",

                    icon: ""
                }
            );

            // Al hacer clic en la notificación,
            // volver a la ventana de la aplicación.

            notificacion.onclick = function() {

                window.focus();

                notificacion.close();

            };

        }

    });

}


/* =====================================
   COMPROBAR NOTIFICACIONES CADA 10 SEGUNDOS
===================================== */

setInterval(comprobarNotificaciones, 10000);


/* =====================================
   MOSTRAR CALENDARIO
===================================== */

function mostrarCalendario() {

    const mes = fechaActual.getMonth();
    const año = fechaActual.getFullYear();

    mesActual.textContent =
        nombresMeses[mes] + " " + año;

    const primerDia = new Date(año, mes, 1);
    const ultimoDia = new Date(año, mes + 1, 0);

    let diaInicio = primerDia.getDay();

    diaInicio = diaInicio === 0 ? 6 : diaInicio - 1;

    const cantidadDias = ultimoDia.getDate();

    diasCalendario.innerHTML = "";


    // ESPACIOS VACIOS

    for (let i = 0; i < diaInicio; i++) {

        const espacio = document.createElement("div");

        espacio.classList.add("dia", "vacio");

        diasCalendario.appendChild(espacio);

    }


    // GENERAR LOS DIAS

    for (let dia = 1; dia <= cantidadDias; dia++) {

        const elementoDia = document.createElement("div");

        elementoDia.classList.add("dia");

        elementoDia.textContent = dia;

        const fecha = crearFecha(año, mes, dia);

        const hoy = new Date();


        // IDENTIFICAR EL DIA ACTUAL

        if (
            dia === hoy.getDate() &&
            mes === hoy.getMonth() &&
            año === hoy.getFullYear()
        ) {

            elementoDia.classList.add("hoy");

        }


        // IDENTIFICAR DIAS PROGRAMADOS

        if (riegos.some(r => r.fecha === fecha)) {

            elementoDia.classList.add("programado");

        }


        // ABRIR MODAL

        elementoDia.addEventListener("click", function() {

            abrirModal(fecha);

        });

        diasCalendario.appendChild(elementoDia);

    }

}


/* =====================================
   CREAR FECHA
===================================== */

function crearFecha(año, mes, dia) {

    const mesTexto = String(mes + 1).padStart(2, "0");

    const diaTexto = String(dia).padStart(2, "0");

    return `${año}-${mesTexto}-${diaTexto}`;

}


/* =====================================
   ABRIR MODAL PARA AGREGAR O EDITAR
===================================== */

function abrirModal(fecha) {

    fechaEnEdicion = fecha;

    const [año, mes, dia] = fecha.split("-").map(Number);

    fechaSeleccionada.textContent =
        "Fecha seleccionada: " +
        dia + " de " +
        nombresMeses[mes - 1] + " de " + año;

    const riegoExistente = riegos.find(r => r.fecha === fecha);


    if (riegoExistente) {

        // SI EXISTE, CARGAR SU HORARIO

        horaRiego.value = riegoExistente.hora;

        guardarRiego.textContent = "Actualizar riego";

        eliminarRiego.classList.remove("oculto");

    } else {

        // SI NO EXISTE, PREPARAR NUEVA PROGRAMACION

        horaRiego.value = "";

        guardarRiego.textContent = "Guardar riego";

        eliminarRiego.classList.add("oculto");

    }

    modalRiego.style.display = "flex";

}


/* =====================================
   CERRAR MODAL
===================================== */

function cerrarVentana() {

    modalRiego.style.display = "none";

    fechaEnEdicion = null;

}

cerrarModal.addEventListener("click", cerrarVentana);

cancelarRiego.addEventListener("click", cerrarVentana);


/* =====================================
   GUARDAR O ACTUALIZAR RIEGO
===================================== */

guardarRiego.addEventListener("click", function() {

    const hora = horaRiego.value;


    // VALIDAR QUE EXISTA UNA HORA

    if (!hora) {

        alert("Por favor, selecciona una hora de riego.");

        return;

    }


    // OBTENER FECHA ACTUAL

    const ahora = new Date();

    const hoy = crearFecha(
        ahora.getFullYear(),
        ahora.getMonth(),
        ahora.getDate()
    );


    // VALIDAR QUE NO SEA UNA FECHA PASADA

    if (fechaEnEdicion < hoy) {

        alert("No puedes programar un riego en una fecha pasada.");

        return;

    }


    // VALIDAR QUE LA HORA NO HAYA PASADO SI ES HOY

    if (fechaEnEdicion === hoy) {

        const horaActual =
            String(ahora.getHours()).padStart(2, "0") +
            ":" +
            String(ahora.getMinutes()).padStart(2, "0");

        if (hora <= horaActual) {

            alert("Selecciona una hora posterior a la hora actual.");

            return;

        }

    }


    // SOLICITAR PERMISO PARA NOTIFICACIONES

    solicitarPermisoNotificaciones();


    // BUSCAR SI YA EXISTE UN RIEGO EN ESA FECHA

    const indice = riegos.findIndex(
        r => r.fecha === fechaEnEdicion
    );


    const nuevoRiego = {
        fecha: fechaEnEdicion,
        hora: hora
    };


    if (indice !== -1) {

        // ACTUALIZAR RIEGO EXISTENTE

        riegos[indice] = nuevoRiego;

        alert("El horario del riego fue actualizado correctamente.");

    } else {

        // AGREGAR NUEVO RIEGO

        riegos.push(nuevoRiego);

        alert("El riego fue programado correctamente.");

    }


    // ORDENAR PROGRAMACIONES

    riegos.sort((a, b) =>
        (a.fecha + a.hora).localeCompare(b.fecha + b.hora)
    );


    guardarDatos();

    cerrarVentana();

    mostrarCalendario();

    mostrarProximosRiegos();

});


/* =====================================
   ELIMINAR RIEGO
===================================== */

eliminarRiego.addEventListener("click", function() {

    const confirmar = confirm(
        "¿Estás seguro de que deseas eliminar este riego?"
    );

    if (!confirmar) {
        return;
    }


    riegos = riegos.filter(
        r => r.fecha !== fechaEnEdicion
    );


    guardarDatos();

    cerrarVentana();

    mostrarCalendario();

    mostrarProximosRiegos();


    alert("El riego fue eliminado correctamente.");

});


/* =====================================
   GUARDAR DATOS EN LOCALSTORAGE
===================================== */

function guardarDatos() {

    localStorage.setItem(
        "riegos",
        JSON.stringify(riegos)
    );

}


/* =====================================
   MOSTRAR PROXIMOS RIEGOS
===================================== */

function mostrarProximosRiegos() {

    listaRiegos.innerHTML = "";


    if (riegos.length === 0) {

        listaRiegos.innerHTML =
            "<p>No hay riegos programados.</p>";

        return;

    }


    riegos.forEach(riego => {

        const [año, mes, dia] =
            riego.fecha.split("-").map(Number);

        const fecha = new Date(año, mes - 1, dia);

        const elemento = document.createElement("div");

        elemento.classList.add("riego-item");


        const titulo = document.createElement("strong");

        titulo.textContent =
            nombresDias[fecha.getDay()] +
            " " + dia + " de " +
            nombresMeses[mes - 1];


        const hora = document.createElement("span");

        hora.textContent = "Hora: " + riego.hora;


        elemento.appendChild(titulo);

        elemento.appendChild(hora);

        listaRiegos.appendChild(elemento);

    });

}


/* =====================================
   CAMBIAR MES ANTERIOR
===================================== */

botonAnterior.addEventListener("click", function() {

    fechaActual.setDate(1);

    fechaActual.setMonth(fechaActual.getMonth() - 1);

    mostrarCalendario();

});


/* =====================================
   CAMBIAR MES SIGUIENTE
===================================== */

botonSiguiente.addEventListener("click", function() {

    fechaActual.setDate(1);

    fechaActual.setMonth(fechaActual.getMonth() + 1);

    mostrarCalendario();

});


/* =====================================
   INICIAR APLICACION
===================================== */

mostrarCalendario();

mostrarProximosRiegos();

comprobarNotificaciones();
