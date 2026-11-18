# 101 — Datos en tiempo real e historial · Tasks

Status: draft · Spec: `spec.md` · Plan: `plan.md`

Las revisiones en vivo necesitan el backend
en `:8000`, `python3 -m http.server 8080`, una sesión con un sensor de humedad y uno de temperatura
(102 o `POST /sensors`) y el simulador del backend enviando lecturas.

## A. Páginas y cliente compartido
- [ ] **T01 — Datos usa el cliente, sin datos de ejemplo** · FR-1.a
  `Datos/datos.html`: `<script src="../api.js">` antes de `datos.js`; `Datos/datos.js`: borrar el arreglo `registros`.
  *Made when:* sin token, abrir `Datos/datos.html` termina en `login.html`, y `grep -n "registros = \[" Datos/datos.js` no encuentra nada.
- [ ] **T02 — Estado de una lectura** · FR-1.d, FR-1.e, FR-1.f
  `Datos/datos.js`: `estadoLectura(valor, sensor)` → `{texto, clase}` según plan §2.
  *Made when:* en la consola de Datos, `estadoLectura(90, {type:"humidity", min_val:70, max_val:90}).texto` es "En rango" y con 92.5 es "Alta".
- [ ] **T03 — Tarjetas por sensor** · FR-1.a, FR-1.b, FR-1.c · after T02
  `Datos/datos.html`: `#tarjetasSensores` en lugar de las dos tarjetas; `Datos/datos.js`: `cargarCondiciones()`, `mostrarTarjetas()`; `Datos/datos.css`.
  *Made when:* con dos sensores, Datos muestra dos tarjetas con nombre, valor, hora y estado; uno sin lecturas dice "Sin lecturas".
- [ ] **T04 — Estado general** · FR-2.a, FR-2.b, FR-2.c, FR-2.d · after T03
  `Datos/datos.js`: `mostrarEstadoGeneral()` con los cuatro casos.
  *Made when:* con un sensor fuera de rango aparece "⚠ Atención: fuera de rango <nombre>".

— checkpoint: Datos muestra las condiciones actuales reales —

- [ ] **T05 — Periodo e historial en tabla** · FR-4.a, FR-4.b, FR-4.d, FR-4.e, FR-4.f · after T03
  `Datos/datos.html`: `<select id="periodo">` con etiqueta, `#avisoDatos`, columnas nuevas; `Datos/datos.js`: `cargarHistorial()`, `mostrarTabla()`.
  *Made when:* la tabla lista lecturas del simulador, la más reciente primero; elegir "Últimos 7 días" vuelve a pedir con otro `start`.
- [ ] **T06 — Actualización cada 30 s** · FR-3.a, FR-3.b, FR-3.c · after T05
  `Datos/datos.js`: `actualizar()` sin superponerse; rechazo en `#avisoDatos`, se limpia al tener éxito.
  *Made when:* con el simulador enviando, el valor de una tarjeta cambia sin recargar; con el backend detenido aparece "No se pudo conectar con el servidor." y los datos siguen.
- [ ] **T07 — Gráficos por magnitud con serie por sensor** · FR-4.c · after T05
  `Datos/datos.html`: Chart.js con versión fija; `Datos/datos.js`: `dibujarGraficos()` crea una vez y luego `update()`; eje numérico con etiquetas de hora.
  *Made when:* con dos sensores de humedad, el gráfico de humedad muestra dos series con leyenda por nombre.

— checkpoint: Datos completa con historial y actualización —

- [ ] **T08 — Home con condiciones actuales** · FR-5.a, FR-5.b, FR-5.c
  `Home/home.html`: "--" en lugar de 25 y 75; `Home/home.js`: `cargarCondicionesHome()` cada 30 s.
  *Made when:* Home muestra el valor de la tarjeta más reciente de cada tipo en Datos; sin sensor de humedad muestra "--".
- [ ] **T09 — Revisión en vivo** · FR-1.a, FR-1.b, FR-1.c, FR-1.d, FR-1.e, FR-1.f, FR-2.a, FR-2.b, FR-2.c, FR-2.d, FR-3.a, FR-3.b, FR-3.c, FR-4.a, FR-4.b, FR-4.c, FR-4.d, FR-4.e, FR-4.f, FR-5.a, FR-5.b, FR-5.c
  Casos de plan §5 en el navegador de Orca; anotarlos en spec §10 *Taken while building*.
  *Made when:* `sdd_check.py specs/101-datos-tiempo-real` lista todos los bullets como revisión en vivo.

— checkpoint: spec `built` —

## C. What could change

None yet.

## D. Requirement coverage

| FR | Tareas |
|---|---|
| FR-1 | T01, T02, T03, T09 |
| FR-2 | T04, T09 |
| FR-3 | T06, T09 |
| FR-4 | T05, T07, T09 |
| FR-5 | T08, T09 |

## E. The gates

CI: none defined (no workflow in the repo). Local: `for f in *.js */*.js; do node --check "$f" || exit 1; done`.

## F. Log
