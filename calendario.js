
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

const riegosDelDia = document.getElementById("riegosDelDia");


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
   RIEGOS PROGRAMADOS (DESDE EL BACKEND)
===================================== */

// Cada riego: { id, fecha: "AAAA-MM-DD", hora: "HH:MM" }.
// Un día puede tener varios riegos.

let riegos = [];

let fechaEnEdicion = null;

let riegoEnEdicion = null; // id del riego que se edita; null = riego nuevo


async function cargarRiegos() {

    const entradas = await api("/schedules?active_only=true");

    riegos = entradas.map(entrada => ({
        id: entrada.id,
        fecha: entrada.irrigation_date,
        hora: entrada.irrigation_time.slice(0, 5) // "14:30:00" → "14:30"
    }));

}


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

    seleccionarRiego(null);

    modalRiego.style.display = "flex";

}


/* =====================================
   SELECCIONAR RIEGO DEL DIA
===================================== */

// null prepara un riego nuevo; un id carga ese riego para editarlo.

function seleccionarRiego(id) {

    riegoEnEdicion = id;

    const riegoExistente = riegos.find(r => r.id === id);

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

    mostrarRiegosDelDia();

}


/* =====================================
   MOSTRAR RIEGOS DEL DIA EN EL MODAL
===================================== */

function mostrarRiegosDelDia() {

    riegosDelDia.innerHTML = "";

    riegos
        .filter(r => r.fecha === fechaEnEdicion)
        .forEach(riego => {

            const elemento = document.createElement("div");

            elemento.classList.add("riego-item");

            if (riego.id === riegoEnEdicion) {
                elemento.classList.add("seleccionado");
            }

            elemento.textContent = "Hora: " + riego.hora + " (clic para editar)";

            elemento.addEventListener("click", function() {

                // Un segundo clic vuelve a "riego nuevo".

                seleccionarRiego(riego.id === riegoEnEdicion ? null : riego.id);

            });

            riegosDelDia.appendChild(elemento);

        });

}


/* =====================================
   CERRAR MODAL
===================================== */

function cerrarVentana() {

    modalRiego.style.display = "none";

    fechaEnEdicion = null;

    riegoEnEdicion = null;

}

cerrarModal.addEventListener("click", cerrarVentana);

cancelarRiego.addEventListener("click", cerrarVentana);


/* =====================================
   GUARDAR O ACTUALIZAR RIEGO
===================================== */

// El backend valida que la fecha y hora sean futuras (hora del invernadero).

guardarRiego.addEventListener("click", async function() {

    const hora = horaRiego.value;


    // VALIDAR QUE EXISTA UNA HORA

    if (!hora) {

        alert("Por favor, selecciona una hora de riego.");

        return;

    }


    try {

        if (riegoEnEdicion !== null) {

            // ACTUALIZAR RIEGO EXISTENTE

            await api("/schedules/" + riegoEnEdicion, {
                method: "PATCH",
                body: { irrigation_time: hora }
            });

            alert("El horario del riego fue actualizado correctamente.");

        } else {

            // AGREGAR NUEVO RIEGO

            await api("/schedules", {
                method: "POST",
                body: { irrigation_date: fechaEnEdicion, irrigation_time: hora }
            });

            alert("El riego fue programado correctamente.");

        }

    } catch (error) {

        alert(error.message);

        return;

    }

    cerrarVentana();

    await actualizarPantalla();

});


/* =====================================
   ELIMINAR RIEGO
===================================== */

// El backend no borra riegos: los desactiva y dejan de mostrarse.

eliminarRiego.addEventListener("click", async function() {

    const confirmar = confirm(
        "¿Estás seguro de que deseas eliminar este riego?"
    );

    if (!confirmar) {
        return;
    }

    try {

        await api("/schedules/" + riegoEnEdicion, {
            method: "PATCH",
            body: { is_active: false }
        });

    } catch (error) {

        alert(error.message);

        return;

    }

    cerrarVentana();

    await actualizarPantalla();

    alert("El riego fue eliminado correctamente.");

});


/* =====================================
   MOSTRAR PROXIMOS RIEGOS
===================================== */

function mostrarProximosRiegos() {

    listaRiegos.innerHTML = "";

    const ahora = new Date();

    const hoy = crearFecha(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());

    const proximos = riegos.filter(r => r.fecha >= hoy);


    if (proximos.length === 0) {

        listaRiegos.innerHTML =
            "<p>No hay riegos programados.</p>";

        return;

    }


    proximos.forEach(riego => {

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

async function actualizarPantalla() {

    try {

        await cargarRiegos();

    } catch (error) {

        alert("No se pudieron cargar los riegos: " + error.message);

    }

    mostrarCalendario();

    mostrarProximosRiegos();

}

actualizarPantalla();

