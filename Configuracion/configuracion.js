
/* =====================================
   ESTADO DE CONEXION DEL SENSOR
===================================== */

// RECUPERAR ESTADO GUARDADO

let sensorConectado =
    localStorage.getItem("sensorConectado") === "true";


// ELEMENTOS HTML

const estadoConexion = document.getElementById("estadoConexion");

const descripcionConexion =
    document.getElementById("descripcionConexion");

const btnConexion = document.getElementById("btnConexion");


/* =====================================
   ACTUALIZAR ESTADO DEL SENSOR
===================================== */

function actualizarEstadoSensor() {

    if (sensorConectado) {

        estadoConexion.classList.remove("desconectado");

        estadoConexion.classList.add("conectado");

        estadoConexion.innerHTML = `
            <span class="indicador-conexion"></span>
            Conectado
        `;

        descripcionConexion.textContent =
            "Sensor conectado (estado de demostración).";

        btnConexion.textContent = "Desconectar sensor";

    } else {

        estadoConexion.classList.remove("conectado");

        estadoConexion.classList.add("desconectado");

        estadoConexion.innerHTML = `
            <span class="indicador-conexion"></span>
            Desconectado
        `;

        descripcionConexion.textContent =
            "No hay sensores conectados.";

        btnConexion.textContent = "Simular conexión";

    }

}


// MOSTRAR ESTADO INICIAL

actualizarEstadoSensor();


/* =====================================
   SIMULAR CONEXION Y DESCONEXION
===================================== */

btnConexion.addEventListener("click", function() {

    sensorConectado = !sensorConectado;

    // GUARDAR ESTADO EN EL NAVEGADOR

    localStorage.setItem(
        "sensorConectado",
        sensorConectado
    );

    // ACTUALIZAR PANTALLA

    actualizarEstadoSensor();

});


/* =====================================
   FRECUENCIA DEL REGISTRO HISTORICO
===================================== */

// ELEMENTOS HTML

const frecuencia = document.getElementById("frecuencia");

const guardarFrecuencia =
    document.getElementById("guardarFrecuencia");

const mensajeFrecuencia =
    document.getElementById("mensajeFrecuencia");


/* =====================================
   RECUPERAR FRECUENCIA GUARDADA
===================================== */

const frecuenciaGuardada =
    localStorage.getItem("frecuenciaRegistro");

if (frecuenciaGuardada !== null) {

    frecuencia.value = frecuenciaGuardada;

}


/* =====================================
   GUARDAR CONFIGURACION
===================================== */

guardarFrecuencia.addEventListener("click", function() {

    const valorSeleccionado = frecuencia.value;

    // VALIDAR SELECCION

    if (!valorSeleccionado) {

        mensajeFrecuencia.textContent =
            "Por favor, selecciona una frecuencia.";

        mensajeFrecuencia.className = "mensaje-error";

        return;

    }


    // OBTENER TEXTO DE LA OPCION

    const textoSeleccionado =
        frecuencia.options[frecuencia.selectedIndex].text;


    // GUARDAR EN LOCALSTORAGE

    localStorage.setItem(
        "frecuenciaRegistro",
        valorSeleccionado
    );


    // MOSTRAR CONFIRMACION

    mensajeFrecuencia.textContent =
        "✓ Configuración guardada correctamente: " +
        textoSeleccionado;

    mensajeFrecuencia.className = "mensaje-exito";

});


/* =====================================
   MENSAJE INICIAL
===================================== */

if (frecuenciaGuardada !== null) {

    mensajeFrecuencia.textContent =
        "Frecuencia actual: " +
        frecuencia.options[frecuencia.selectedIndex].text;

    mensajeFrecuencia.className = "mensaje-exito";

} else {

    mensajeFrecuencia.textContent =
        "Selecciona la frecuencia para el registro histórico.";

}
