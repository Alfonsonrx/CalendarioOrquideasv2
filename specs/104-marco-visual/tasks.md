# 104 — Marco visual del rediseño · Tasks

Status: draft · Spec: `spec.md` · Plan: `plan.md`

Las revisiones en vivo necesitan el backend en `:8000`, el servidor sin caché en `:8080` y una cuenta
`@example.com` en un perfil aislado del navegador de Orca (la pestaña principal tiene la sesión del
dueño). Comparar siempre con `docs/rediseno-maqueta.html`.

## A. Páginas y cliente compartido
- [ ] **T01 — Sistema visual en `styles.css`** · FR-1.a, FR-1.b, FR-1.c, FR-1.d, FR-1.f
  `styles.css` reescrito con las variables claras y oscuras, base, `:focus-visible` y componentes de la maqueta; `<link>` de Google Fonts en las cuatro páginas y `login.html`.
  *Made when:* `grep -c -- "--brand-2" styles.css` ≥ 3 y en Home `getComputedStyle(document.body).fontFamily` empieza con "Inter".
- [ ] **T02 — Barra lateral y "Cerrar sesión"** · FR-2.a, FR-2.b, FR-2.c, FR-2.d · after T01
  `aside.sidebar` nueva en las cuatro páginas con `aria-current`; `api.js`: `button.salir` cierra sesión; se quita `.perfil` de los HTML y de `api.js`.
  *Made when:* `grep -c 'class="perfil"' index.html */*.html` da 0 en todos y pulsar "Cerrar sesión" termina en `login.html` sin token.
- [ ] **T03 — Encabezado con título, descripción y avatar** · FR-3.a, FR-3.b, FR-3.c, FR-3.d, FR-3.e · after T02
  `header.head` con los textos de FR-3.a y `.avatar`; `api.js`: `mostrarAvatar()` con `GET /auth/me` (backend 001 FR-4.a).
  *Made when:* el avatar muestra la inicial del nombre de la cuenta de prueba, y con `api` forzado a fallar en `/auth/me` (consola) muestra el ícono.

— checkpoint: marco común en las cuatro páginas —

- [ ] **T04 — Lista de avisos con el diseño nuevo** · FR-4.a, FR-4.b, FR-4.c · after T03
  `notificaciones.js`: campana antes de `.avatar` con el SVG y `.count`; aviso con `.pip`, "No leído"/"Leído", `formatearFechaAviso()` de cuatro formas; clic fuera cierra.
  *Made when:* con un aviso de hoy y uno de ayer la lista dice "HH:MM" y "Ayer HH:MM", y un clic en el contenido la cierra.
- [ ] **T05 — Inicio de sesión en dos columnas** · FR-5.a, FR-5.b, FR-5.c · after T01
  `login.html`: `.login-art` y `.login-form` con los textos de FR-5; el script cambia los textos al alternar el modo.
  *Made when:* `login.html` muestra la presentación y "Entrar"; "Crear cuenta" cambia a "¿Ya tienes cuenta? Iniciar sesión"; entrar sigue abriendo Home.
- [ ] **T06 — Pantallas angostas y hojas de página sin duplicados** · FR-2.e, FR-5.d, FR-1.a · after T02, T05
  Cortes de 980/720/640 px del marco en `styles.css`; `home.css`, `datos.css`, `configuracion.css` sin barra, encabezado ni `.perfil`.
  *Made when:* en un `<iframe>` de 390 px Home muestra la franja con "Cerrar sesión" y `login.html` la presentación arriba; `grep -c "sidebar\|\.perfil" Home/home.css Datos/datos.css Configuracion/configuracion.css` da 0.
- [ ] **T07 — Coma decimal** · FR-1.e · after T01
  `api.js`: `formatearNumero()`; `home.js`, `datos.js`, `configuracion.js` lo usan para valores y límites.
  *Made when:* una lectura de 27.4 se ve "27,4" en Home, Datos y en los límites de Configuración.

— checkpoint: marco completo —

- [ ] **T08 — Revisión en vivo** · FR-1.a, FR-1.b, FR-1.c, FR-1.d, FR-1.e, FR-1.f, FR-2.a, FR-2.b, FR-2.c, FR-2.d, FR-2.e, FR-3.a, FR-3.b, FR-3.c, FR-3.d, FR-3.e, FR-4.a, FR-4.b, FR-4.c, FR-5.a, FR-5.b, FR-5.c, FR-5.d
  Casos de plan §5 en tema claro y oscuro, a 1280 y 390 px; anotados en spec §10.
  *Made when:* `sdd_check.py specs/104-marco-visual` lista todos los bullets como revisión en vivo.
- [ ] **T09 — Actualizar 001 y 103** · —
  `specs/001-sesion-cliente-api/spec.md` §10: FR-3.d reemplazado por 104 FR-2.d; `specs/103-notificaciones/spec.md` §10: "No leído" y la hora corta de 104 FR-4.
  *Made when:* 001 §10 y 103 §10 nombran 104.

— checkpoint: spec `built` —

## C. What could change

None yet.

## D. Requirement coverage

| FR | Tareas |
|---|---|
| FR-1 | T01, T06, T07, T08 |
| FR-2 | T02, T06, T08 |
| FR-3 | T03, T08 |
| FR-4 | T04, T08 |
| FR-5 | T05, T06, T08 |

## E. The gates

CI: none defined (no workflow in the repo). Local: `for f in *.js */*.js; do node --check "$f" || exit 1; done`.

## F. Log
