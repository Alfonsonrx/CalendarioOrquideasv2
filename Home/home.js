
/* =====================================
   RELOJ DIGITAL Y ANALOGICO
===================================== */

function actualizarReloj() {

    const ahora = new Date();

    const horas = ahora.getHours();
    const minutos = ahora.getMinutes();
    const segundos = ahora.getSeconds();

    // RELOJ DIGITAL

    const horaFormateada =
        String(horas).padStart(2, "0") + ":" +
        String(minutos).padStart(2, "0") + ":" +
        String(segundos).padStart(2, "0");

    document.getElementById("horaActual").textContent =
        horaFormateada;

    // MANECILLA DE LA HORA

    const gradosHora = (horas % 12) * 30 + minutos * 0.5;

    document.getElementById("manecillaHora").style.transform =
        `translateX(-50%) rotate(${gradosHora}deg)`;

    // MANECILLA DE LOS MINUTOS

    const gradosMinuto = minutos * 6 + segundos * 0.1;

    document.getElementById("manecillaMinuto").style.transform =
        `translateX(-50%) rotate(${gradosMinuto}deg)`;

    // MANECILLA DE LOS SEGUNDOS

    const gradosSegundo = segundos * 6;

    document.getElementById("manecillaSegundo").style.transform =
        `translateX(-50%) rotate(${gradosSegundo}deg)`;
}

// ACTUALIZAR RELOJ CADA SEGUNDO

actualizarReloj();

setInterval(actualizarReloj, 1000);


/* =====================================
   CALENDARIO DE RIEGO HOME
===================================== */

// RIEGOS ACTIVOS DEL BACKEND (se cargan al iniciar)

let riegosHome = [];

async function cargarRiegosHome() {

    const entradas = await api("/schedules?active_only=true");

    riegosHome = entradas.map(entrada => ({ fecha: entrada.irrigation_date }));

}


// ELEMENTOS DEL CALENDARIO

const calendarioHome = document.getElementById("calendarioHome");

const mesActualHome = document.getElementById("mesActualHome");

const botonMesAnterior = document.getElementById("mesAnteriorHome");

const botonMesSiguiente = document.getElementById("mesSiguienteHome");


// FECHA ACTUAL

const fechaHoy = new Date();

let mesHome = fechaHoy.getMonth();

let anioHome = fechaHoy.getFullYear();


// NOMBRES DE LOS MESES

const nombresMeses = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre"
];


/* =====================================
   MOSTRAR CALENDARIO
===================================== */

function mostrarCalendarioHome() {

    calendarioHome.innerHTML = "";

    // MOSTRAR MES Y AÑO

    mesActualHome.textContent =
        nombresMeses[mesHome] + " " + anioHome;


    // PRIMER DIA DEL MES

    const primerDia = new Date(anioHome, mesHome, 1);

    // CANTIDAD DE DIAS DEL MES

    const cantidadDias = new Date(
        anioHome,
        mesHome + 1,
        0
    ).getDate();


    // AJUSTAR SEMANA PARA COMENZAR EL LUNES

    let diaSemana = primerDia.getDay();

    diaSemana = (diaSemana + 6) % 7;


    // ESPACIOS VACIOS

    for (let i = 0; i < diaSemana; i++) {

        const espacio = document.createElement("div");

        espacio.classList.add("dia-home", "vacio");

        calendarioHome.appendChild(espacio);

    }


    // CREAR LOS DIAS DEL MES

    for (let dia = 1; dia <= cantidadDias; dia++) {

        const elementoDia = document.createElement("div");

        elementoDia.classList.add("dia-home");

        elementoDia.textContent = dia;


        // CREAR FECHA COMPLETA

        const fechaCompleta =
            anioHome + "-" +
            String(mesHome + 1).padStart(2, "0") + "-" +
            String(dia).padStart(2, "0");


        // COMPROBAR SI EXISTE UN RIEGO PROGRAMADO

        if (riegosHome.some(riego => riego.fecha === fechaCompleta)) {

            elementoDia.classList.add("riego");

            elementoDia.title = "Día programado para riego";

        }


        // COMPROBAR SI ES EL DIA ACTUAL

        if (
            dia === fechaHoy.getDate() &&
            mesHome === fechaHoy.getMonth() &&
            anioHome === fechaHoy.getFullYear()
        ) {

            elementoDia.classList.add("hoy");

        }


        calendarioHome.appendChild(elementoDia);

    }

}


/* =====================================
   CAMBIAR MES ANTERIOR
===================================== */

botonMesAnterior.addEventListener("click", function() {

    mesHome--;

    if (mesHome < 0) {

        mesHome = 11;

        anioHome--;

    }

    mostrarCalendarioHome();

});


/* =====================================
   CAMBIAR MES SIGUIENTE
===================================== */

botonMesSiguiente.addEventListener("click", function() {

    mesHome++;

    if (mesHome > 11) {

        mesHome = 0;

        anioHome++;

    }

    mostrarCalendarioHome();

});


/* =====================================
   INICIAR CALENDARIO
===================================== */

mostrarCalendarioHome();

cargarRiegosHome()
    .then(mostrarCalendarioHome)
    .catch(error => console.error("No se pudieron cargar los riegos:", error));
