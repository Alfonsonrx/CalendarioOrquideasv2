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
    }).replace(",", ""); // "18/11 16:47:12" (spec 106 FR-3.e)
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

const TIPOS_SENSOR = { humidity: "Humedad relativa", temperature: "Temperatura" };

// Las clases de estadoLectura() son las de 101; las tarjetas usan los chips de 104.

const CHIP_ESTADO = { "en-rango": "ok", calor: "hot", frio: "cold" };

// Escala de la barra de rango (plan 106 §2): humedad de 0 a 100; temperatura
// alrededor de sus límites y su valor, con margen para ver cuánto se sale.

function escalaRango(sensor) {

    if (sensor.type === "humidity") {
        return [0, 100];
    }

    const numeros = [sensor.min_val, sensor.max_val, sensor.value].filter(n => n != null);

    if (numeros.length === 0) {
        return [0, 40];
    }

    const bajo = Math.min(...numeros);
    const alto = Math.max(...numeros);
    const margen = Math.max((alto - bajo) / 2, 2);

    return [bajo - margen, alto + margen];
}

// Franja entre los límites (abierta hacia el lado sin límite) y marcador
// en el último valor; fuera de los límites, el marcador queda en el borde (FR-3.b, FR-3.d).

function barraRango(sensor) {

    const [inicio, fin] = escalaRango(sensor);
    const posicion = v => Math.min(Math.max((v - inicio) / (fin - inicio), 0), 1) * 100;

    const barra = crearElemento("div", "", "rango");
    barra.setAttribute("role", "img");

    const franja = document.createElement("i");
    franja.style.left = (sensor.min_val != null ? posicion(sensor.min_val) : 0) + "%";
    franja.style.right = (100 - (sensor.max_val != null ? posicion(sensor.max_val) : 100)) + "%";
    barra.append(franja);

    if (sensor.value !== null) {
        const marcador = document.createElement("b");
        marcador.style.left = posicion(sensor.value) + "%";
        barra.append(marcador);
    }

    // Texto equivalente: "68 %, entre 60 y 80 %" (spec 106 §5, Accessibility).

    const conUnidad = v => formatearNumero(v) + " " + sensor.unit;
    const valor = sensor.value !== null ? conUnidad(sensor.value) : "Sin lecturas";

    const rango = sensor.min_val != null && sensor.max_val != null
        ? "entre " + formatearNumero(sensor.min_val) + " y " + conUnidad(sensor.max_val)
        : sensor.max_val != null ? "hasta " + conUnidad(sensor.max_val)
        : sensor.min_val != null ? "desde " + conUnidad(sensor.min_val)
        : "sin límites";

    barra.setAttribute("aria-label", valor + ", " + rango);

    return barra;
}

function mostrarTarjetas() {

    tarjetasSensores.replaceChildren(...condiciones.map(function(sensor) {

        const sinLectura = sensor.value === null;
        const estado = sinLectura ? null : estadoLectura(sensor.value, sensor);

        const nombre = document.createElement("div");
        nombre.append(
            crearElemento("h3", sensor.name),
            crearElemento("div", TIPOS_SENSOR[sensor.type] || sensor.type, "tipo")
        );

        const arriba = crearElemento("div", "", "sensor-top");
        arriba.append(nombre, sinLectura
            ? crearElemento("span", "Sin lecturas", "chip none")
            : crearElemento("span", estado.texto, "chip " + CHIP_ESTADO[estado.clase]));

        const valor = crearElemento("div", sinLectura ? "--" : formatearNumero(sensor.value), "valor");

        if (!sinLectura) {
            valor.append(crearElemento("span", sensor.unit));
        }

        const etiquetas = crearElemento("div", "", "rango-labels");
        etiquetas.append(
            crearElemento("span", sensor.min_val != null ? "mín " + formatearNumero(sensor.min_val) + " " + sensor.unit : "sin mínimo"),
            crearElemento("span", sensor.max_val != null ? "máx " + formatearNumero(sensor.max_val) + " " + sensor.unit : "sin máximo")
        );

        const pie = crearElemento("footer", sinLectura
            ? "Esperando la primera lectura"
            : "Última lectura " + formatearFechaHora(sensor.recorded_at));

        const tarjeta = crearElemento("article", "", "sensor" + (sinLectura ? " sin-lectura" : ""));
        tarjeta.append(arriba, valor, barraRango(sensor), etiquetas, pie);

        return tarjeta;
    }));
}


/* =====================================
   ESTADO GENERAL (FR-2)
===================================== */

const estadoGeneral = document.getElementById("estadoGeneral");

const textoEstado = document.getElementById("textoEstado");

const antiguedadEstado = document.getElementById("antiguedad");

function mostrarEstadoGeneral() {

    const conLectura = condiciones.filter(sensor => sensor.value !== null);

    const fueraDeRango = conLectura.filter(
        sensor => estadoLectura(sensor.value, sensor).clase !== "en-rango"
    );

    // Verde si todo está en rango, roja si algo se sale, gris sin nada que evaluar (106 FR-1.a).

    let texto = "✓ Las condiciones ambientales son adecuadas para las orquídeas.";

    let clase = "ok";

    if (condiciones.length === 0) {

        texto = "No hay sensores activos. Regístralos en Configuración.";

        clase = "none";

    } else if (conLectura.length === 0) {

        texto = "Aún no hay lecturas de tus sensores.";

        clase = "none";

    } else if (fueraDeRango.length > 0) {

        texto = "⚠ Atención: fuera de rango " +
            fueraDeRango.map(sensor => sensor.name).join(", ");

        clase = "hot";
    }

    textoEstado.textContent = texto;

    estadoGeneral.className = "estado " + clase;

    // La edad de la lectura más reciente: "todo en rango" puede ser de hace horas (106 FR-1.b, FR-1.c).

    const masReciente = Math.max(...conLectura.map(sensor => Date.parse(sensor.recorded_at)));

    antiguedadEstado.textContent = conLectura.length === 0 ? ""
        : "Última lectura " + antiguedad(masReciente, new Date());
}


/* =====================================
   HISTORIAL DEL PERIODO (FR-4)
===================================== */

// El backend entrega a lo más 1000 lecturas por sensor y consulta,
// de la más reciente a la más antigua (backend 103).

const LIMITE_LECTURAS = 1000;

// Periodo elegido en el encabezado: 24 horas al abrir (106 FR-2.a).

let horasPeriodo = 24;

const botonesPeriodo = document.querySelectorAll(".periodo button");

// "% · últimas 24 h", "°C · últimos 7 días" junto al título de cada gráfico (106 FR-2.c).

function mostrarPeriodo() {

    for (const boton of botonesPeriodo) {
        boton.setAttribute("aria-pressed", String(Number(boton.dataset.horas) === horasPeriodo));
    }

    for (const etiqueta of document.querySelectorAll(".per")) {
        etiqueta.textContent = etiqueta.dataset.unidad + " · " +
            (horasPeriodo === 24 ? "últimas 24 h" : "últimos 7 días");
    }
}

for (const boton of botonesPeriodo) {

    boton.addEventListener("click", function() {

        horasPeriodo = Number(boton.dataset.horas);

        mostrarPeriodo();

        actualizar();
    });
}

mostrarPeriodo();

let lecturas = [];        // { value, recorded_at, sensor } del periodo, más reciente primero

let sensoresTopados = []; // nombres de sensores que llegaron al tope

async function cargarHistorial() {

    const inicio = new Date(Date.now() - horasPeriodo * 3600 * 1000).toISOString();

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

actualizar();

setInterval(actualizar, ACTUALIZAR_CADA_MS);
