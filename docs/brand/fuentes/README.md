# Fuentes del arte

Los originales de los que salen las imágenes que sirve el sitio. **No se sirven
desde `public/`**: viven aquí para poder rehacer un asset sin volver a generarlo.

| Archivo                             | Qué es                                                                 | En el sitio                        |
| ----------------------------------- | ---------------------------------------------------------------------- | ---------------------------------- |
| `hero-plate-sin-datos.png`          | El plate del hero en uso. Panel sin cifras, a petición del usuario      | `public/brand/hero-mockup.png`     |
| `hero-plate-con-datos.png`          | El plate anterior, con las cifras del panel                            | —                                  |
| `proceso-fondo.png`                 | Fondo abstracto de "Cómo trabajamos"                                   | `public/brand/process-bg.png`      |
| `hero-plate-descartado-gemini.jpg`  | Descartado: el logo dice "nexora : pos" y los textos de la interfaz son inventados | —                     |

## Lo que se les hizo antes de publicarlos

Ninguno se usa tal cual. `public/brand/hero-mockup.png` es
`hero-plate-sin-datos.png` **con los tres iconos flotantes borrados** —
enmascarados por saturación y rellenados por interpolación de filas, con
`sharp` — porque el campo claro que dejan libre es lo que permite que el
titular llegue a 84px sin caer sobre la curva naranja. El procedimiento y las
medidas están en `docs/ESTADO.md`, decisión 78.

`public/brand/problem-devices.png` es un recorte de un arte anterior, del que
solo se tomó la parte de la foto; ese original ya no está aquí.

**Antes de cambiar cualquiera de estos, mide.** Las decisiones de tamaño y de
color del hero y de "Cómo trabajamos" dependen de dónde acaba el campo claro y
de cuál es el píxel más oscuro de cada imagen: eso está medido píxel a píxel y
anotado en `scripts/contrast.mjs` como pseudo-tokens. Una imagen nueva los
invalida todos.
