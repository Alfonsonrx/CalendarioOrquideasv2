# 102 — Sensores en Configuración · Tasks

Status: draft · Spec: `spec.md` · Plan: `plan.md`

Las revisiones en vivo
necesitan el backend en `:8000`, `python3 -m http.server 8080`, una sesión, y el simulador del backend
(`../RiegoBackend/tools/sensor_sim.py`) para las conexiones. Nunca pegar una clave real en un spec ni en
el registro de tareas.

## A. Páginas y cliente compartido
- [ ] **T01 — Configuración usa el cliente, sin simulación** · FR-7.a
  `Configuracion/configuracion.html`: `<script src="../api.js">`; quitar "Estado de conexión" simulado y "Frecuencia del registro histórico"; `Configuracion/configuracion.js`: quitar su código y `localStorage`.
  *Made when:* sin token, abrir Configuración termina en `login.html`, y `grep -n "localStorage" Configuracion/configuracion.js` no encuentra nada.
- [ ] **T02 — Lista de sensores** · FR-1.a, FR-1.b, FR-1.c, FR-1.d, FR-1.e · after T01
  `configuracion.html`: tarjeta "Mis sensores" con `#listaSensores`; `configuracion.js`: `cargarSensores()`, `mostrarSensores()`; `configuracion.css`.
  *Made when:* un sensor creado con `POST /sensors` aparece con "Humedad", "Wi-Fi", su intervalo y límites; una cuenta nueva ve "Aún no registras sensores.".
- [ ] **T03 — Estado de conexión** · FR-2.a, FR-2.b, FR-2.c, FR-2.d, FR-2.e · after T02
  `configuracion.js`: `estadoConexion()` con `/conditions` según plan §2; lista de qué revisar.
  *Made when:* con el simulador enviando, el sensor dice "Conectado"; recién registrado dice "Esperando la primera lectura" con qué revisar.

— checkpoint: Configuración muestra los sensores reales y si envían —

- [ ] **T04 — Registrar un sensor y mostrar su clave** · FR-3.a, FR-3.b, FR-3.c, FR-3.d, FR-3.e, FR-3.f, FR-3.g · after T02
  `configuracion.html`: `#formSensor`, `#claveSensor`; `configuracion.js`: `abrirFormulario()`, `guardarSensor()` (POST, límites vacíos omitidos), `mostrarClave()`.
  *Made when:* registrar un sensor muestra id y clave; el simulador con esos datos recibe 201; `Object.values(localStorage).some(v => v.includes(clave))` es `false`.
- [ ] **T05 — Editar un sensor** · FR-4.a, FR-4.b, FR-4.c, FR-4.d, FR-4.e · after T04
  `configuracion.js`: `abrirFormulario(sensor)` con tipo y conexión deshabilitados; `PATCH` con lo cambiado; límite vacío = `null`.
  *Made when:* vaciar el máximo deja "—" en la lista y `GET /sensors/{id}` devuelve `max_val: null`.
- [ ] **T06 — Activar, desactivar y clave nueva** · FR-5.a, FR-5.b, FR-5.c, FR-6.a, FR-6.b · after T02
  `configuracion.js`: `cambiarActivo()`, `nuevaClave()` con `confirm()`.
  *Made when:* tras "Clave nueva", el simulador con la clave anterior recibe "Clave de sensor inválida"; desactivar deja "Inactivo".

— checkpoint: sensores administrados de punta a punta —

- [ ] **T07 — Revisión en vivo** · FR-1.a, FR-1.b, FR-1.c, FR-1.d, FR-1.e, FR-2.a, FR-2.b, FR-2.c, FR-2.d, FR-2.e, FR-3.a, FR-3.b, FR-3.c, FR-3.d, FR-3.e, FR-3.f, FR-3.g, FR-4.a, FR-4.b, FR-4.c, FR-4.d, FR-4.e, FR-5.a, FR-5.b, FR-5.c, FR-6.a, FR-6.b, FR-7.a
  Casos de plan §5 en el navegador de Orca; anotarlos en spec §10 *Taken while building* sin copiar claves.
  *Made when:* `sdd_check.py specs/102-sensores-configuracion` lista todos los bullets como revisión en vivo.

— checkpoint: spec `built` —

## C. What could change

None yet.

## D. Requirement coverage

| FR | Tareas |
|---|---|
| FR-1 | T02, T07 |
| FR-2 | T03, T07 |
| FR-3 | T04, T07 |
| FR-4 | T05, T07 |
| FR-5 | T06, T07 |
| FR-6 | T06, T07 |
| FR-7 | T01, T07 |

## E. The gates

CI: none defined (no workflow in the repo). Local: `for f in *.js */*.js; do node --check "$f" || exit 1; done`.

## F. Log
