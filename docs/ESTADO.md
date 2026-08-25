# ESTADO

Dónde va el proyecto, qué se decidió y por qué, y qué trampas ya se pisaron.

**Este archivo se actualiza en cada tarea, en el mismo commit.** Es lo que permite cerrar una
sesión cuando el contexto se llena y que la siguiente arranque sin perder nada.

Última actualización: 2026-08-24 (Fase 2)

---

## Hecho

### Fase 1 · Andamiaje

- **Proyecto Next.js 15.5.23** (App Router, TypeScript `strict` con `noUncheckedIndexedAccess`,
  `noUnusedLocals`, `noUnusedParameters`), ESLint 9 flat config + Prettier con
  `prettier-plugin-tailwindcss`.
- **Tailwind v4** con todos los tokens de marca en `app/globals.css` (`@theme`): paleta,
  escala tipográfica fluida con `clamp()`, degradado de marca, sombras, breakpoints, y el
  bloque global de `prefers-reduced-motion`.
- **Poppins** vía `next/font/google`, pesos 300–700, `display: swap`.
- **Assets de marca normalizados** (ver el mapeo abajo) más `icon.png`, `apple-icon.png` y
  `favicon.ico` generados con la convención de App Router.
- **`content/`**: `types.ts`, `site.ts`, `nav.ts`. Cero copy en JSX.
- **`lib/`**: `config.ts` (con `NEXT_PUBLIC_PORTAL_URL`), `utils.ts` (`cn` extendido).
- **Layout base**: grupos `(marketing)` y `(portal)`, enlace "Saltar al contenido", `Nav`
  sticky y translúcida, `NavMobile` full-screen con Radix Dialog, `Footer` en `ink-900`.
- **Primitivos iniciales**: `Container`, `Section`, `Grid`, `Button`, `Isotype`, `LogoLockup`.
- **`middleware.ts`** vacío, con el comentario de dónde va la resolución de tenant.
- **Vitest + Testing Library**: 11 tests en verde.
- **`scripts/contrast.mjs`**: auditoría WCAG de la paleta, 17/17.

**Verificación de la fase** — los cuatro en verde más el de contraste:

```
npm run typecheck   OK
npm run lint        OK
npm run test        OK  (11/11)
npm run build       OK  (home 103 kB First Load JS, presupuesto 120 kB)
npm run contrast    OK  (17/17)
```

Comprobado además en el navegador: cero scroll horizontal a 320px; el menú móvil abre, atrapa
el foco, cierra con `Escape` y devuelve el foco al disparador; `/portal` es `noindex` y no
arrastra la nav ni el footer de marketing.

### Fase 2 · Sistema de diseño

- **Primitivos**: `Heading` (nivel semántico separado del tamaño visual), `Eyebrow`, `Card`
  (+ `CardHeader`/`CardBody`/`CardFooter`/`CardLinkOverlay`), `Badge`, `IconTile`, `Accordion`.
- **`Reveal`**: la única animación del sitio, con Framer Motion. Entra una vez al aparecer en
  pantalla, se desactiva entera con `prefers-reduced-motion` y lleva un respaldo `<noscript>`.
- **`/kitchen-sink`**: cada primitivo, en cada variante, sobre los cuatro fondos. `noindex`,
  no enlazada desde ninguna parte.
- **Animación del acordeón** en `globals.css`, para que el bloque global de `prefers-reduced-motion`
  la aplane junto con todo lo demás.
- 26 tests en verde (15 nuevos: acordeón, Heading/Eyebrow, Reveal, variante `link` del Button).

**Verificado en el navegador**, no solo en tests:

- Un solo `h1` en `/kitchen-sink` y **cero saltos de jerarquía** en 20 encabezados.
- El anillo de foco es correcto en los cuatro fondos: `ink-900` sobre blanco, `paper-50` y la
  franja naranja; blanco sobre `ink-900`. Comprobado con `Tab` real, porque `.focus()`
  programático no activa `:focus-visible`.
- Las cuatro variantes de botón por superficie, con sus colores medidos.
- Cero scroll horizontal a 320px.
- El `<noscript>` llega en el HTML servido.

**Ojo con el presupuesto de JS en la Fase 3.** La home sigue en 103 kB porque todavía no usa
`Reveal`; `/kitchen-sink` está en 167 kB precisamente porque carga Framer y todos los primitivos.
En cuanto la home envuelva secciones en `Reveal`, Framer entra en su bundle. El techo de
`CLAUDE.md §6` es ~120 kB, así que hay que mirar la salida de `next build` al cerrar la Fase 3, y
si no cabe, sustituir `Reveal` por una animación CSS con `IntersectionObserver` propio.

---

## En curso

Nada. Siguiente paso: **Fase 3 — Home**.

---

## Siguiente

| Fase                  | Qué incluye                                                                                                 | Estado |
| --------------------- | ----------------------------------------------------------------------------------------------------------- | ------ |
| 1 · Andamiaje         | Next.js 15 + TS strict, Tailwind con tokens de marca, Poppins, assets, `content/`, layout base, Nav, Footer | ✅     |
| 2 · Sistema de diseño | `Card`, `Badge`, `Accordion`, `Heading`, `Eyebrow`, `IconTile`, `Reveal`, página `/kitchen-sink`            | ✅     |
| 3 · Home              | Las 13 secciones, una por una, con los mockups React/SVG                                                    | ⬜     |
| 4 · Páginas           | `/modulos`, `/casos`, `/precios`, `/contacto`, legales                                                      | ⬜     |
| 5 · SEO               | Metadata por página, OG image, `sitemap.ts`, `robots.ts`, JSON-LD                                           | ⬜     |
| 6 · Pulido            | Accesibilidad, Lighthouse, tests, responsive, SVG del logo                                                  | ⬜     |

---

## Decisiones

Cada decisión técnica va aquí **con su porqué**, para no volver a discutirla en tres meses.

| #   | Decisión                                                                | Por qué                                                                                                                                                                                                                                                                              |
| --- | ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | Next.js 15 App Router en vez de Vite                                    | El sitio necesita SEO real (SSG + metadata), y el portal de clientes entra después como grupo de rutas `(portal)` sin migrar nada                                                                                                                                                    |
| 2   | Sin modo oscuro                                                         | La identidad de marca es clara con acentos oscuros; el modo oscuro duplicaría el trabajo de diseño sin beneficio                                                                                                                                                                     |
| 3   | Todo el copy en `content/*.ts`                                          | Poder cambiar textos sin tocar JSX y sin riesgo de romper el layout                                                                                                                                                                                                                  |
| 4   | Mockups del producto como componentes React/SVG                         | Pesan menos que capturas, se ven consistentes con la marca y no dependen de fotos de stock                                                                                                                                                                                           |
| 5   | Sin backend en esta etapa                                               | El alcance es solo el sitio público; el envío del formulario queda detrás de una interfaz `sendLead()` para enchufar el servicio después                                                                                                                                             |
| 6   | El manual de marca vive en `docs/brand/`, no en `public/`               | Es referencia para diseñar, no un asset que el sitio deba servir                                                                                                                                                                                                                     |
| 7   | **Tailwind v4 con tokens en `@theme`, no `tailwind.config.ts`**         | `PROMPT.md §1` pedía `tailwind.config.ts`, que es la forma de v3. v4 es lo que instala el scaffold oficial de Next 15, no pelea con versiones y shadcn/ui ya lo soporta. Los tokens viven en `app/globals.css`                                                                       |
| 8   | **Primitivos a mano con Radix + `cva`, shadcn CLI solo para Accordion** | shadcn arrastra sus propias variables CSS y un bloque `.dark` que hay que podar para que no choque con los tokens de marca. Button/Card/Badge son 30 líneas cada uno                                                                                                                 |
| 9   | **Se queda en Next 15 pese a 3 vulnerabilidades `high`**                | `npm audit` reporta postcss y sharp/libvips, y el único arreglo es Next 16. Son de tiempo de compilación y procesan únicamente archivos propios: en un sitio estático no hay superficie de ataque. Revisar si Next 15 recibe backport, o al migrar a 16                              |
| 10  | **Texto `ink-900` sobre el naranja, no blanco**                         | Medido: blanco sobre `brand-500` da 2.61:1 y sobre `brand-300` (extremo claro del degradado) 1.78:1 — falla AA a cualquier tamaño. `ink-900` sobre naranja da 6.46:1. Contradice `PROMPT.md §4.12` y el arte del manual, pero `CLAUDE.md §6` exige AA y AA gana                      |
| 11  | **Token nuevo `brand-700` `#BD5A00`, solo para texto**                  | `brand-500` sobre blanco es 2.61:1: no alcanza ni el 3:1 de texto grande, así que la regla original de `CLAUDE.md §3` ("naranja sirve para texto ≥24px") era imposible de cumplir. `brand-700` da 4.54:1. `brand-500` queda para fondos, degradados, subrayados e íconos decorativos |
| 12  | **`ink-500` ajustado de `#6B7280` a `#69707E`**                         | El hex del manual daba 4.39:1 sobre `paper-50`, justo por debajo del 4.5 exigido. El ajuste es imperceptible y lo lleva a 4.52:1                                                                                                                                                     |
| 13  | **Los íconos naranjas se quedan**                                       | WCAG 1.4.11 exime lo decorativo, y en este sitio todo ícono va junto a su etiqueta de texto. Si algún día un ícono queda solo y comunica algo, tiene que ir en `brand-700` o en `ink-900`                                                                                            |
| 14  | **`scripts/contrast.mjs` como parte de la verificación**                | La paleta es naranja y el naranja engaña: parece de alto contraste y no lo es. Un script que falla es mejor que una queja de Lighthouse al final                                                                                                                                     |
| 15  | **`LogoLockup` con tres variantes en vez de un solo logo**              | No existe artwork para fondo oscuro ni monocromo, y `CLAUDE.md §3` prohíbe recolorear la marca. `light` usa el archivo real; `dark` y `onBrand` componen el nombre en Poppins, que es un tratamiento que el propio manual muestra                                                    |
| 16  | **`Section` solo expone cuatro fondos**                                 | Es la forma de que "el naranja es acento" sea una propiedad del código y no de la disciplina de quien maqueta                                                                                                                                                                        |
| 17  | **Sin `shadcn init`; Radix Accordion instalado directo**                | `shadcn init` reescribe `globals.css` con sus propias variables y un bloque `.dark`, que es justo lo que la decisión 8 quería evitar. El componente que genera el CLI es un envoltorio fino de Radix; escribirlo a mano cuesta lo mismo y no toca la configuración |
| 18  | **`AccordionTrigger` cablea `aria-controls` a mano**                    | Radix lo omite mientras el panel está cerrado, porque desmonta sus hijos. El elemento del panel sí sigue en el DOM, y el patrón WAI-ARIA de acordeón pide la referencia esté abierto o cerrado. `AccordionItem` genera un id con `useId` y se lo pasa a las dos mitades |
| 19  | **`Reveal` lleva `data-reveal` y un `<noscript>` en el layout**         | Framer escribe `opacity:0` en el HTML del servidor. Sin JS —bloqueador, proxy, navegador de texto— todo lo envuelto quedaría invisible para siempre. El contenido no puede depender de JavaScript para leerse |
| 20  | **La variante `link` del `Button` no llega a 44px**                     | Es texto en línea: forzarla a 44px metería espacio en blanco dentro de una frase. WCAG 2.5.8 exime los enlaces embebidos en texto y pide 24px en el resto, que sí cumple (26px). Para una acción terciaria con área táctil real, se usa `ghost` |

---

## Mapeo de assets de marca

Los tres PNG que estaban en la raíz:

| Antes (raíz)             | Ahora                                                               | Qué se le hizo                                                                                                      |
| ------------------------ | ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `Identidad de marca.png` | `docs/brand/manual-de-marca.png`                                    | Solo se movió. Es referencia, no se sirve                                                                           |
| `Logo png.png`           | `public/brand/logo.png`                                             | Recorte al bbox del contenido `(220,375)–(1315,587)`. De 1536×1024 a **1095×212**. Ningún píxel de la marca se tocó |
| `Logo png.png`           | `docs/brand/original-logo.png`                                      | El original se conserva intacto                                                                                     |
| `Isotipo.png`            | `public/brand/isotype.png`                                          | Fondo casi blanco convertido a alfa por luminancia + saturación, luego recorte. De 1254×1254 a **703×704**          |
| `Isotipo.png`            | `docs/brand/original-isotipo.png`                                   | El original se conserva intacto                                                                                     |
| (derivados)              | `app/icon.png` (512), `app/apple-icon.png` (180), `app/favicon.ico` | Isotipo dentro del cuadrado blanco redondeado, que es el tratamiento que prescribe el manual                        |

El script que los genera está en el historial de la sesión; si hay que rehacerlos, parte de los
originales de `docs/brand/`, nunca de los normalizados.

---

## Datos pendientes (`TODO(guti):`)

Lo que hay que reemplazar por información real antes de publicar. **Nada de esto se inventa.**

| Dónde                       | Qué falta                                                                                                                                                                                  |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `content/site.ts`           | Métricas de la barra de confianza — hoy son afirmaciones sobre el producto, no cifras de la empresa. **Confirma que las cuatro son ciertas**, sobre todo si aplica "funciona sin internet" |
| `content/site.ts`           | WhatsApp, correo de contacto y ciudad                                                                                                                                                      |
| `content/site.ts`           | Razón social y NIT, para las páginas legales                                                                                                                                               |
| `lib/config.ts`             | Dominio definitivo (hoy `https://nexora-pos.co` como marcador)                                                                                                                             |
| `content/pricing.ts`        | Precios reales de los planes Esencial y Negocio (Fase 4)                                                                                                                                   |
| `app/api/contacto/route.ts` | Servicio de correo para `sendLead()` (Fase 4)                                                                                                                                              |
| `content/legal.ts`          | Revisión de los textos legales con la normativa vigente (Fase 4)                                                                                                                           |
| `public/brand/`             | **Versión del logo sobre fondo oscuro.** Hoy `LogoLockup variant="dark"` compone el nombre en Poppins                                                                                      |
| `public/brand/`             | **Versión monocroma del isotipo**, para la franja naranja. Hoy `variant="onBrand"` va sin isotipo                                                                                          |
| `public/brand/`             | **SVG vectoriales** del logo y del isotipo. Los PNG normalizados pesan ~330 KB cada uno                                                                                                    |

---

## Trampas pisadas

Errores que ya costaron tiempo, para no repetirlos.

**1. `tailwind-merge` se comía los colores de texto.**
`cn("text-ink-900", "text-body")` devolvía solo `text-body`. Nuestras escalas tipográficas se
llaman `text-display`, `text-h2`, `text-body`…, y `tailwind-merge` asume que cualquier `text-*`
que no reconozca es un **color**, así que creía que las dos clases chocaban y descartaba la
primera. Habría dejado sin color a todo componente que fijara tamaño y color a la vez, en
silencio. Arreglado con `extendTailwindMerge` en `lib/utils.ts`, declarando los grupos
`font-size`, `shadow`, `tracking` y `rounded`. Hay tests en `lib/utils.test.ts` que lo fijan.
**Si añades un token con nombre propio, decláralo ahí también.**

**2. Los dos PNG de logo no eran lo que parecían.**
`Logo png.png` se veía como un render con fondo gris y glow naranja; en realidad tiene un canal
alfa limpio y lo gris era el visor aplanando los píxeles transparentes. Era perfectamente usable
con solo recortarlo. `Isotipo.png`, en cambio, sí venía sin alfa. Antes de descartar un asset,
mira el canal alfa, no la vista previa.

**3. El naranja de la marca engaña.**
`#FF7A00` parece vibrante y de alto contraste, y es de los peores colores de la paleta: 2.61:1
contra blanco. Ocho de las dieciocho combinaciones que el manual da por buenas fallaban WCAG AA.
De ahí las decisiones 10 a 14.

**4. `sizes` en imágenes de tamaño fijo.**
Pasarle `sizes="40px"` a `next/image` hace que Next genere un `srcset` de 16 candidatos con la
escala completa de dispositivos. Para una imagen de tamaño fijo, no pongas `sizes`: con
`width`/`height` Next emite solo 1x y 2x.

**5. `create-next-app` instala Next 16, no 15.**
Si hay que volver a andamiar, el scaffold trae 16.3.2. Las versiones de este proyecto están
fijadas a mano en `package.json`.

**6. Framer deja `opacity:0` en el HTML del servidor.**
`Reveal` usa `whileInView`, y Framer escribe el estado inicial —`opacity:0;transform:translateY(12px)`—
directamente en el marcado que sirve Next. Si el JavaScript no llega a ejecutarse, ese contenido
queda invisible de forma permanente. Se comprueba con `curl -s localhost:3000/... | grep opacity:0`.
Está cubierto con `data-reveal` más un `<style>` dentro de `<noscript>` en `app/layout.tsx`.
**Cualquier animación nueva que oculte contenido tiene que llevar el mismo respaldo.**

**7. Medir el foco con `.focus()` no sirve.**
`element.focus()` desde la consola no activa `:focus-visible`, así que `getComputedStyle` devuelve
el `outline-color` heredado (que es `currentColor`) y parece que el anillo está mal. Hay que pulsar
`Tab` de verdad al menos una vez para que el navegador entre en modalidad teclado; a partir de ahí
`.focus()` sí lo activa. Verifica siempre con `el.matches(':focus-visible')` antes de creerte la
medición.

**8. El panel del navegador que no compone da medidas falsas.**
Si el panel no está visible, `document.documentElement.clientWidth` vale **0** y cualquier prueba
de desbordamiento horizontal reporta cientos de píxeles inventados. Fija siempre un viewport
explícito antes de medir, y desconfía de cualquier resultado con `viewport: 0`. Por la misma razón
no disparan ni el lazy-loading de `next/image` ni el `IntersectionObserver` de Framer.

**9. Los eventos de teclado sintéticos no accionan Radix.**
`el.dispatchEvent(new KeyboardEvent('keydown', {key:'Enter'}))` desde la consola no abre el
acordeón, y el automatizador del navegador manda tecla **y** clic, con lo que alterna dos veces y
parece que no funciona. Ninguna de las dos cosas es un fallo del componente: con `userEvent`, que
reproduce la secuencia real, `Enter` y `Espacio` alternan exactamente una vez. Para interacción,
fíate de los tests, no de la consola.

**10. `IntersectionObserver` no existe en jsdom.**
Framer lo pide en cuanto montas un `Reveal`, y el test revienta con `ReferenceError`. Está
poblado en `tests/setup.ts`, junto a `ResizeObserver` y `matchMedia`.

---

## Bitácora

Una línea por sesión: fecha, qué se hizo, cómo quedó la verificación.

| Fecha      | Sesión                                                                                  | Resultado                                                           |
| ---------- | --------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| 2026-08-24 | Plan del sitio + Fase 1 (andamiaje completo, tokens, assets, layout, Nav/Footer, tests) | typecheck · lint · test (11/11) · build · contrast (17/17) en verde |
| 2026-08-24 | Fase 2 (primitivos, `Reveal`, `/kitchen-sink`), push inicial al remoto | typecheck · lint · test (26/26) · build · contrast (17/17) en verde |
