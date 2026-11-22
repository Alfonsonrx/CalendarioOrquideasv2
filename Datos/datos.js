/* =====================================
   PANTALLA DATOS (spec 101)
   Los datos vienen del backend: condiciones actuales e historial.
===================================== */


// estadoLectura() vive en api.js: Home también la usa (spec 105 plan D4).


/* =====================================
   AYUDAS DE PANTALLA
===================================== */

// Los nombres de sensores los escribe la persona: siempre textContent,
// nunca innerHTML.

function crearElemento(etiqueta, texto, clase) {

    const elemento = document.createElement(etiqueta);

    elemento.textContent = texto;

    if (clase) {
        elemento.className = clase;
    }

    return elemento;
}

function formatearFechaHora(iso) {

    return new Date(iso).toLocaleString("es-CL", {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hourCycle: "h23"
    });
}

const avisoDatos = document.getElementById("avisoDatos");

function mostrarAviso(texto) {

    avisoDatos.textContent = texto;

    avisoDatos.hidden = !texto;
}


/* =====================================
   CONDICIONES ACTUALES (FR-1)
===================================== */

// Una entrada por sensor activo: nombre, tipo, unidad, límites,
// último valor y su fecha (value y recorded_at son null sin lecturas).

let condiciones = [];

async function cargarCondiciones() {

    condiciones = await api("/conditions");
}

const tarjetasSensores = document.getElementById("tarjetasSensores");

function mostrarTarjetas() {

    tarjetasSensores.replaceChildren(...condiciones.map(function(sensor) {

        const tarjeta = crearElemento("div", "", "indicador-alerta");

        tarjeta.appendChild(crearElemento("h3", sensor.name));

        if (sensor.value === null) {

            tarjeta.appendChild(crearElemento("p", "Sin lecturas", "estado-alerta"));

            tarjeta.appendChild(crearElemento("span", "--"));

            return tarjeta;
        }

        const estado = estadoLectura(sensor.value, sensor);

        tarjeta.appendChild(crearElemento("p", estado.texto, "estado-alerta " + estado.clase));

        tarjeta.appendChild(crearElemento("span", formatearNumero(sensor.value) + " " + sensor.unit));

        tarjeta.appendChild(crearElemento("small", formatearFechaHora(sensor.recorded_at)));

        return tarjeta;
    }));
}


/* =====================================
   ESTADO GENERAL (FR-2)
===================================== */

const estadoGeneral = document.getElementById("estadoGeneral");

function mostrarEstadoGeneral() {

    const conLectura = condiciones.filter(sensor => sensor.value !== null);

    const fueraDeRango = conLectura.filter(
        sensor => estadoLectura(sensor.value, sensor).clase !== "en-rango"
    );

    let texto = "✓ Las condiciones ambientales son adecuadas para las orquídeas.";

    let clase = "adecuado";

    if (condiciones.length === 0) {

        texto = "No hay sensores activos. Regístralos en Configuración.";

        clase = "advertencia";

    } else if (conLectura.length === 0) {

        texto = "Aún no hay lecturas de tus sensores.";

        clase = "advertencia";

    } else if (fueraDeRango.length > 0) {

        texto = "⚠ Atención: fuera de rango " +
            fueraDeRango.map(sensor => sensor.name).join(", ");

        clase = "advertencia";
    }

    estadoGeneral.textContent = texto;

    estadoGeneral.className = "estado-general " + clase;
}


/* =====================================
   HISTORIAL DEL PERIODO (FR-4)
===================================== */

// El backend entrega a lo más 1000 lecturas por sensor y consulta,
// de la más reciente a la más antigua (backend 103).

const LIMITE_LECTURAS = 1000;

const periodo = document.getElementById("periodo");

let lecturas = [];        // { value, recorded_at, sensor } del periodo, más reciente primero

let sensoresTopados = []; // nombres de sensores que llegaron al tope

async function cargarHistorial() {

    const horas = Number(periodo.value);

    const inicio = new Date(Date.now() - horas * 3600 * 1000).toISOString();

    const porSensor = await Promise.all(condiciones.map(sensor => api(
        "/sensors/" + sensor.sensor_id + "/readings" +
        "?start=" + encodeURIComponent(inicio) + "&limit=" + LIMITE_LECTURAS
    )));

    lecturas = porSensor
        .flatMap((lista, i) => lista.map(lectura => ({ ...lectura, sensor: condiciones[i] })))
        .sort((a, b) => Date.parse(b.recorded_at) - Date.parse(a.recorded_at));

    sensoresTopados = condiciones
        .filter((sensor, i) => porSensor[i].length === LIMITE_LECTURAS)
        .map(sensor => sensor.name);
}

const tablaRegistros = document.getElementById("tablaRegistros");

const tablaContenedor = document.querySelector(".tabla-contenedor");

const sinLecturas = document.getElementById("sinLecturas");

const avisoLimite = document.getElementById("avisoLimite");

function mostrarTabla() {

    tablaRegistros.replaceChildren(...lecturas.map(function(lectura) {

        const estado = estadoLectura(lectura.value, lectura.sensor);

        const celdaEstado = document.createElement("td");

        celdaEstado.appendChild(crearElemento("span", estado.texto, "estado " + estado.clase));

        const fila = document.createElement("tr");

        fila.append(
            crearElemento("td", lectura.sensor.name),
            crearElemento("td", formatearNumero(lectura.value) + " " + lectura.sensor.unit),
            crearElemento("td", formatearFechaHora(lectura.recorded_at)),
            celdaEstado
        );

        return fila;
    }));

    sinLecturas.hidden = lecturas.length > 0;

    tablaContenedor.hidden = lecturas.length === 0;

    avisoLimite.textContent = sensoresTopados
        .map(nombre => "Se muestran las últimas 1000 lecturas de " + nombre + ".")
        .join(" ");

    avisoLimite.hidden = sensoresTopados.length === 0;
}


/* =====================================
   GRAFICOS: UNO POR MAGNITUD, UNA SERIE POR SENSOR (FR-4.c)
===================================== */

// Eje horizontal numérico (milisegundos) con etiquetas de fecha y hora:
// cada sensor tiene sus propias horas y el eje de tiempo de Chart.js
// pediría otra librería (plan 101 D2).

const COLORES_SERIES = ["#397b59", "#c27c2c", "#4a6fa5", "#9b4a8c", "#83b894"];

const graficos = {};

function dibujarGrafico(tipo, idCanvas, tituloEje) {

    const series = condiciones
        .filter(sensor => sensor.type === tipo)
        .map(function(sensor, i) {

            const color = COLORES_SERIES[i % COLORES_SERIES.length];

            return {
                label: sensor.name,
                data: lecturas
                    .filter(lectura => lectura.sensor.sensor_id === sensor.sensor_id)
                    .map(lectura => ({ x: Date.parse(lectura.recorded_at), y: lectura.value }))
                    .reverse(), // de la más antigua a la más reciente
                borderColor: color,
                backgroundColor: color,
                borderWidth: 2,
                pointRadius: 0,
                tension: 0.3
            };
        });

    const grafico = graficos[tipo];

    // Ya existe: cambiar solo los datos, así la leyenda conserva
    // las series ocultas y no parpadea (plan 101 D4).

    if (grafico) {

        grafico.data.datasets = series.map(function(serie) {

            const anterior = grafico.data.datasets.find(d => d.label === serie.label);

            if (anterior) {
                anterior.data = serie.data;
                return anterior;
            }

            return serie;
        });

        grafico.update();

        return;
    }

    graficos[tipo] = new Chart(document.getElementById(idCanvas), {

        type: "line",

        data: { datasets: series },

        options: {

            responsive: true,

            maintainAspectRatio: false,

            animation: false,

            locale: "es-CL", // ejes y valores con coma decimal (spec 104 FR-1.e)

            scales: {

                x: {
                    type: "linear",
                    ticks: {
                        maxTicksLimit: 6,
                        callback: valor => formatearFechaHora(valor).slice(0, -3) // sin segundos
                    }
                },

                y: {
                    title: { display: true, text: tituloEje }
                }
            },

            plugins: {

                legend: { display: true },

                tooltip: {
                    callbacks: {
                        title: puntos => formatearFechaHora(puntos[0].parsed.x)
                    }
                }
            }
        }
    });
}

function dibujarGraficos() {

    dibujarGrafico("humidity", "graficoHumedad", "Humedad (%)");

    dibujarGrafico("temperature", "graficoTemperatura", "Temperatura (°C)");
}


/* =====================================
   INICIAR PANTALLA DATOS
===================================== */

// Vuelve a leer condiciones e historial. Si falla, lo mostrado se conserva
// y el rechazo se muestra hasta la siguiente actualización exitosa (FR-3).
// Nunca corren dos a la vez: un pedido durante otra se repite al terminar.

const ACTUALIZAR_CADA_MS = 30 * 1000;

let actualizando = false;

let repetirAlTerminar = false;

async function actualizar() {

    if (actualizando) {
        repetirAlTerminar = true;
        return;
    }

    actualizando = true;

    try {

        await cargarCondiciones();

        await cargarHistorial();

        mostrarAviso("");

        mostrarTarjetas();

        mostrarEstadoGeneral();

        mostrarTabla();

        dibujarGraficos();

    } catch (error) {

        mostrarAviso(error.message);

    } finally {

        actualizando = false;
    }

    if (repetirAlTerminar) {
        repetirAlTerminar = false;
        actualizar();
    }
}

periodo.addEventListener("change", actualizar);

actualizar();

setInterval(actualizar, ACTUALIZAR_CADA_MS);
