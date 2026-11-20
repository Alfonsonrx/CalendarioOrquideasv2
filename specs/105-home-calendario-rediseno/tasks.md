# 105 — Home y Calendario del rediseño · Tasks

Status: draft · Spec: `spec.md` · Plan: `plan.md`

Requiere 104 construido (sistema en `styles.css`, marco en las páginas). Revisiones en vivo con backend en
`:8000`, servidor sin caché en `:8080`, cuenta `@example.com` en un perfil aislado de Orca; comparar con
`docs/rediseno-maqueta.html`.

## A. Páginas y cliente compartido
- [ ] **T01 — Lecturas de Home con estado, rango y antigüedad** · FR-1.a, FR-1.b, FR-1.c, FR-1.d, FR-1.e
  `api.js`: `estadoLectura` movida desde `datos.js`; `home.html`/`home.js`/`home.css`: tarjetas `.lectura` con chip, "Ideal …" y antigüedad.
  *Made when:* con un sensor de temperatura 18–24 °C y una lectura de 25 °C, Home muestra "Calor", "Ideal 18–24 °C · hace N min"; Datos sigue mostrando sus estados.
- [ ] **T02 — Próximo riego** · FR-2.a, FR-2.b, FR-2.c, FR-2.d, FR-2.e, FR-2.f · after T01
  `home.js`: riegos con hora, `proximoRiego()`, `textoDia()`, `textoFalta()`, `mostrarProximo()` cada 60 s; tarjeta `.proximo`.
  *Made when:* con riegos a 30 min y mañana, la tarjeta dice "Hoy, HH:MM · Faltan 30 min"; sin riegos futuros, "No hay riegos programados.".
- [ ] **T03 — Calendario pequeño y reloj** · FR-3.a, FR-3.b, FR-3.c · after T01
  `styles.css`: `.cal`, `.dia` y estados compartidos; `home.js`: días pasados atenuados; reloj SVG y `#fechaHoy`.
  *Made when:* Home muestra los días anteriores atenuados, el reloj SVG avanzando y "… · hora del dispositivo".

— checkpoint: Home como la maqueta —

- [ ] **T04 — Calendario grande con horas y "Hoy"** · FR-3.a, FR-4.a, FR-4.b, FR-4.c, FR-4.d, FR-4.e · after T03
  `index.html`/`calendario.js`: días `button.dia` con `.horas` y `aria-label`; "Hoy"; leyenda; corte de 640 px.
  *Made when:* un día con 19:30 y 08:00 muestra "08:00" sobre "19:30"; su nombre accesible es "N, 2 riegos"; "Hoy" vuelve al mes actual.
- [ ] **T05 — Próximos riegos con conteo** · FR-5.a, FR-5.b · after T04
  `calendario.js`: `mostrarProximosRiegos()` con "N programados" y seis filas `.fecha-box`.
  *Made when:* con 8 riegos futuros se lee "8 programados" y 6 filas "Riego a las HH:MM".
- [ ] **T06 — Ventana de un día** · FR-6.a, FR-6.b, FR-6.c, FR-6.d, FR-6.e, FR-6.f, FR-6.g, FR-6.h · after T04
  `index.html`: `<dialog id="dlgRiego">`; `calendario.js`: `showModal()`, chips con `aria-pressed`, 08:00 por defecto, `#mensajeRiego`, sin `alert()`.
  *Made when:* `grep -c "alert(" calendario.js` es 0; guardar en un día pasado muestra el rechazo en la ventana abierta; Escape cierra sin peticiones.

— checkpoint: Calendario como la maqueta —

- [ ] **T07 — Revisión en vivo** · FR-1.a, FR-1.b, FR-1.c, FR-1.d, FR-1.e, FR-2.a, FR-2.b, FR-2.c, FR-2.d, FR-2.e, FR-2.f, FR-3.a, FR-3.b, FR-3.c, FR-4.a, FR-4.b, FR-4.c, FR-4.d, FR-4.e, FR-5.a, FR-5.b, FR-6.a, FR-6.b, FR-6.c, FR-6.d, FR-6.e, FR-6.f, FR-6.g, FR-6.h
  Casos de plan §5 en claro y oscuro, a 1280 y 390 px; anotados en spec §10.
  *Made when:* `sdd_check.py specs/105-home-calendario-rediseno` lista todos los bullets como revisión en vivo.
- [ ] **T08 — Actualizar 002** · —
  `specs/002-calendario-home/spec.md` §10: FR-2.b, FR-2.c, FR-3.a, FR-3.d, FR-3.e, FR-4.b y FR-6.a reemplazados por 105 (con el motivo).
  *Made when:* 002 §10 nombra 105.

— checkpoint: spec `built` —

## C. What could change

None yet.

## D. Requirement coverage

| FR | Tareas |
|---|---|
| FR-1 | T01, T07 |
| FR-2 | T02, T07 |
| FR-3 | T03, T04, T07 |
| FR-4 | T04, T07 |
| FR-5 | T05, T07 |
| FR-6 | T06, T07 |

## E. The gates

CI: none defined (no workflow in the repo). Local: `for f in *.js */*.js; do node --check "$f" || exit 1; done`.

## F. Log
