
/* =====================================
   DATOS DE EJEMPLO
===================================== */

const registros = [
    {
        temperatura: 30,
        humedad: 30,
        hora: "09:00"
    },
    {
        temperatura: 20,
        humedad: 78,
        hora: "10:00"
    },
    {
        temperatura: 15,
        humedad: 100,
        hora: "11:00"
    },
    {
        temperatura: 22,
        humedad: 80,
        hora: "12:00"
    },
    {
        temperatura: 24,
        humedad: 85,
        hora: "13:00"
    },
    {
        temperatura: 19,
        humedad: 76,
        hora: "14:00"
    }
];


/* =====================================
   EVALUAR ESTADO DE TEMPERATURA
===================================== */

function obtenerEstadoTemperatura(temperatura) {

    if (temperatura > 24) {
        return {
            texto: "Calor",
            clase: "calor"
        };
    }

    if (temperatura < 18) {
        return {
            texto: "Frío",
            clase: "frio"
        };
    }

    return {
        texto: "En rango",
        clase: "en-rango"
    };
}


/* =====================================
   EVALUAR ESTADO DE HUMEDAD
===================================== */

// Rango visual provisional: 75% a 85%.

function obtenerEstadoHumedad(humedad) {

    if (humedad < 75) {
        return {
            texto: "Baja",
            clase: "frio"
        };
    }

    if (humedad > 85) {
        return {
            texto: "Alta",
            clase: "calor"
        };
    }

    return {
        texto: "En rango",
        clase: "en-rango"
    };
}


/* =====================================
   MOSTRAR ALERTAS AMBIENTALES
===================================== */

function mostrarAlertas() {

    // OBTENER LA ULTIMA MEDICION

    const ultimoRegistro = registros[registros.length - 1];

    if (!ultimoRegistro) {
        return;
    }

    const estadoTemperatura =
        obtenerEstadoTemperatura(ultimoRegistro.temperatura);

    const estadoHumedad =
        obtenerEstadoHumedad(ultimoRegistro.humedad);


    // OBTENER ELEMENTOS HTML

    const estadoGeneral = document.getElementById("estadoGeneral");

    const alertaHumedad = document.getElementById("alertaHumedad");

    const alertaTemperatura =
        document.getElementById("alertaTemperatura");

    const valorHumedad = document.getElementById("valorHumedad");

    const valorTemperatura =
        document.getElementById("valorTemperatura");


    // MOSTRAR VALORES

    valorHumedad.textContent = ultimoRegistro.humedad + " %";

    valorTemperatura.textContent =
        ultimoRegistro.temperatura + " °C";


    // ACTUALIZAR ALERTA DE HUMEDAD

    alertaHumedad.textContent = estadoHumedad.texto;

    alertaHumedad.className =
        "estado-alerta " + estadoHumedad.clase;


    // ACTUALIZAR ALERTA DE TEMPERATURA

    alertaTemperatura.textContent = estadoTemperatura.texto;

    alertaTemperatura.className =
        "estado-alerta " + estadoTemperatura.clase;


    // EVALUAR CONDICIONES GENERALES

    const humedadAdecuada =
        estadoHumedad.clase === "en-rango";

    const temperaturaAdecuada =
        estadoTemperatura.clase === "en-rango";


    // MOSTRAR RESULTADO GENERAL

    if (humedadAdecuada && temperaturaAdecuada) {

        estadoGeneral.textContent =
            "✓ Las condiciones ambientales son adecuadas para las orquídeas.";

        estadoGeneral.className =
            "estado-general adecuado";

    } else {

        let mensaje = "⚠ Atención: ";

        if (!humedadAdecuada && !temperaturaAdecuada) {

            mensaje +=
                "la humedad y la temperatura están fuera del rango recomendado.";

        } else if (!humedadAdecuada) {

            mensaje +=
                "la humedad ambiental está fuera del rango recomendado.";

        } else {

            mensaje +=
                "la temperatura ambiental está fuera del rango recomendado.";

        }

        estadoGeneral.textContent = mensaje;

        estadoGeneral.className =
            "estado-general advertencia";

    }

}


/* =====================================
   CARGAR TABLA DE REGISTROS
===================================== */

function cargarTabla() {

    const tabla = document.getElementById("tablaRegistros");

    tabla.innerHTML = "";

    registros.forEach(registro => {

        const estadoTemperatura =
            obtenerEstadoTemperatura(registro.temperatura);

        const estadoHumedad =
            obtenerEstadoHumedad(registro.humedad);

        const fila = document.createElement("tr");

        fila.innerHTML = `
            <td>${registro.temperatura} °C</td>

            <td>${registro.humedad}%</td>

            <td>${registro.hora}</td>

            <td>
                <span class="estado ${estadoHumedad.clase}">
                    ${estadoHumedad.texto}
                </span>
            </td>

            <td>
                <span class="estado ${estadoTemperatura.clase}">
                    ${estadoTemperatura.texto}
                </span>
            </td>
        `;

        tabla.appendChild(fila);

    });

}


/* =====================================
   GRAFICO DE HUMEDAD
===================================== */

function crearGraficoHumedad() {

    const contexto = document
        .getElementById("graficoHumedad")
        .getContext("2d");

    new Chart(contexto, {

        type: "bar",

        data: {

            labels: registros.map(registro => registro.hora),

            datasets: [{

                label: "Humedad (%)",

                data: registros.map(registro => registro.humedad),

                backgroundColor: "#83b894",

                borderColor: "#397b59",

                borderWidth: 1,

                borderRadius: 6

            }]

        },

        options: {

            responsive: true,

            maintainAspectRatio: false,

            scales: {

                y: {
                    beginAtZero: true,
                    max: 100,
                    title: {
                        display: true,
                        text: "Humedad (%)"
                    }
                }

            },

            plugins: {

                legend: {
                    display: true
                }

            }

        }

    });

}


/* =====================================
   GRAFICO DE TEMPERATURA
===================================== */

function crearGraficoTemperatura() {

    const contexto = document
        .getElementById("graficoTemperatura")
        .getContext("2d");

    new Chart(contexto, {

        type: "line",

        data: {

            labels: registros.map(registro => registro.hora),

            datasets: [{

                label: "Temperatura (°C)",

                data: registros.map(registro => registro.temperatura),

                borderColor: "#397b59",

                backgroundColor: "rgba(57, 123, 89, 0.15)",

                borderWidth: 3,

                pointBackgroundColor: "#397b59",

                pointRadius: 5,

                tension: 0.3,

                fill: true

            }]

        },

        options: {

            responsive: true,

            maintainAspectRatio: false,

            scales: {

                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: "Temperatura (°C)"
                    }
                }

            },

            plugins: {

                legend: {
                    display: true
                }

            }

        }

    });

}


/* =====================================
   INICIAR PANTALLA DATOS
===================================== */

document.addEventListener("DOMContentLoaded", function() {

    mostrarAlertas();

    cargarTabla();

    crearGraficoHumedad();

    crearGraficoTemperatura();

});
