# 103 — Notificaciones en la app · Tasks

Status: draft · Spec: `spec.md` · Plan: `plan.md`

Las revisiones en vivo necesitan el backend en
`:8000`, `python3 -m http.server 8080` y una sesión; para tener avisos, un riego a 1–2 minutos y el
simulador del backend con una lectura fuera de rango.

## A. Páginas y cliente compartido
- [ ] **T01 — Encabezado en Datos** · FR-1.b
  `Datos/datos.html`: `header.encabezado` con título y `.perfil`, como las demás páginas (también da el cierre de sesión de 001 FR-3.d).
  *Made when:* `grep -c 'class="perfil"' Datos/datos.html` es 1.
- [ ] **T02 — Campana y contador** · FR-1.a, FR-1.b, FR-1.c, FR-1.d · after T01
  `notificaciones.js`: inserta la campana antes de `.perfil`, lee no leídos al abrir y cada 30 s; las cuatro páginas lo cargan tras `api.js`; `styles.css`.
  *Made when:* con un aviso sin leer, la campana muestra "1" en Home, Calendario, Datos y Configuración.

— checkpoint: el contador se ve en todas las páginas —

- [ ] **T03 — Lista de avisos** · FR-2.a, FR-2.b, FR-2.c, FR-2.d, FR-2.e, FR-2.f · after T02
  `notificaciones.js`: `#panelAvisos`, `abrirLista()` con `GET /notifications`; `styles.css`.
  *Made when:* pulsar la campana lista un recordatorio con "Recordatorio de riego", fecha y hora, y "Sin leer".
- [ ] **T04 — Marcar como leído** · FR-3.a, FR-3.b, FR-3.c · after T03
  `notificaciones.js`: `marcarLeido(aviso)` con `PATCH`, actualiza el aviso y el contador.
  *Made when:* pulsar un aviso sin leer baja el contador en 1 y `GET /notifications?unread_only=true` ya no lo trae.
- [ ] **T05 — Notificaciones del navegador en todas las páginas** · FR-4.a, FR-4.b, FR-4.c, FR-4.d · after T02
  `notificaciones.js`: `notificarNuevos()` con `notificacionesEnviadas`; `calendario.js`: quitar `comprobarNotificaciones()` y su intervalo.
  *Made when:* `grep -n "comprobarNotificaciones" calendario.js` no encuentra nada y, con permiso, un recordatorio aparece estando en Configuración.
- [ ] **T06 — Pedir el permiso desde la lista** · FR-5.a, FR-5.b, FR-5.c, FR-5.d · after T03
  `notificaciones.js`: botón y textos de FR-5; `calendario.js`: quitar `solicitarPermisoNotificaciones()` (002 FR-7.a; 002 T13 deja de aplicar).
  *Made when:* con el permiso sin decidir, la lista ofrece "Activar avisos del navegador"; guardar un riego ya no pide permiso.

— checkpoint: avisos completos en todas las páginas —

- [ ] **T07 — Revisión en vivo** · FR-1.a, FR-1.b, FR-1.c, FR-1.d, FR-2.a, FR-2.b, FR-2.c, FR-2.d, FR-2.e, FR-2.f, FR-3.a, FR-3.b, FR-3.c, FR-4.a, FR-4.b, FR-4.c, FR-4.d, FR-5.a, FR-5.b, FR-5.c, FR-5.d
  Casos de plan §5; las notificaciones del navegador en un navegador con permiso. Anotarlos en spec §10.
  *Made when:* `sdd_check.py specs/103-notificaciones` lista todos los bullets como revisión en vivo.
- [ ] **T08 — Actualizar 002** · —
  `specs/002-calendario-home/spec.md`: marcar FR-7.b–e como reemplazados por 103 y FR-7.a por 103 FR-5 (§10, con el motivo).
  *Made when:* 002 §10 nombra 103 como reemplazo de FR-7.

— checkpoint: spec `built` —

## C. What could change

None yet.

## D. Requirement coverage

| FR | Tareas |
|---|---|
| FR-1 | T01, T02, T07 |
| FR-2 | T03, T07 |
| FR-3 | T04, T07 |
| FR-4 | T05, T07 |
| FR-5 | T06, T07 |

## E. The gates

CI: none defined (no workflow in the repo). Local: `for f in *.js */*.js; do node --check "$f" || exit 1; done`.

## F. Log
