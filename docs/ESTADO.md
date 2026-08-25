# ESTADO

Dónde va el proyecto, qué se decidió y por qué, y qué trampas ya se pisaron.

**Este archivo se actualiza en cada tarea, en el mismo commit.** Es lo que permite cerrar una
sesión cuando el contexto se llena y que la siguiente arranque sin perder nada.

Última actualización: 2026-08-25 (Fase 6 — rendimiento y accesibilidad)

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
- **`Reveal`**: la única animación del sitio. Entra una vez al aparecer en pantalla y se
  desactiva entera con `prefers-reduced-motion`. _(Se construyó con Framer Motion y se
  reescribió en la Fase 3 sin él — ver la decisión 21.)_
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

**El presupuesto de JS se rompió en la Fase 3 y se arregló ahí mismo** — ver la decisión 21.

---

### Fase 3 · Home — completa

- **Contenido**: `content/pillars.ts` (los 5 pilares), `content/modules.ts` (los 7 módulos con
  copy largo para `/modulos`), `content/home.ts` (hero, comparación, intros de sección).
- **Secciones**: `Hero` con mockup, `TrustBar`, `Problem`, `Pillars`, `Modules`.
- **`components/mockups/dashboard.tsx`**: la pantalla de resumen del POS como marcado y SVG,
  con los tokens de marca. Sin capturas ni fotos de stock. `aria-hidden`: es decoración, y todo
  lo que muestra está dicho en el texto de al lado.
- **`Grid` acepta `asChild`**, para que una grilla pueda ser un `<ul>` de verdad.
- 38 tests en verde.

**Secciones 7 a 13**: `Process` (línea de tiempo, horizontal en escritorio y vertical en móvil),
`About` (la "N" contada como conexión, flujo y crecimiento, con el isotipo grande), `UseCases`
(6 tipos de negocio), `Pricing` (3 planes más tabla comparativa plegable), `Faq` (10 preguntas)
y `CtaBand` (la única franja naranja de la página). Contenido nuevo en `content/process.ts`,
`use-cases.ts`, `pricing.ts` y `faq.ts`.

**El acordeón de Radix se cambió por `<details>` nativo** — ver la decisión 24.

**Verificado en el navegador**: un solo `h1` y **cero saltos de jerarquía en 44 encabezados**;
ningún `<ul>`/`<ol>` con hijos que no sean `<li>`; el `<dl>` de "Quiénes somos" con solo
`dt`/`dd`/`div`; **una sola franja naranja** (el tope son dos); los 7 enlaces de módulo a su
ancla; el área de clic de cada tarjeta cubriendo sus 282×226 px; apertura exclusiva de la FAQ
sin una línea de JavaScript; y cero scroll horizontal a 320px y a 1280px.

**Sobre el desbordamiento de la tabla de precios a 320px:** `html.scrollWidth` reporta 493 con la
tabla abierta, pero **la página no se desplaza en horizontal** — `scrollLeft` se queda en 0 y
`body.scrollWidth` es exactamente 320. La tabla vive en su propia caja con `overflow-x: auto`.
Es un artefacto de medición, no un fallo: comprueba `scrollLeft`, no solo `scrollWidth`.

---

### Fase 4 · Páginas secundarias

- `/modulos` — un bloque por módulo con su ancla, más un índice de saltos en la cabecera.
- `/casos` — los seis tipos de negocio, con enlace desde cada etiqueta al módulo que usa.
- `/precios` — reusa las secciones de la home y añade "qué significa a medida en la factura",
  que es la pregunta que ningún plan responde.
- `/contacto` — formulario con React Hook Form y Zod, honeypot, y `app/api/contacto/route.ts`
  revalidando el **mismo** schema. El envío queda detrás de `sendLead()` en `lib/lead.ts`.
- `/legal/privacidad` y `/legal/terminos` — estructura de la Ley 1581 de 2012.
  **`content/legal.ts` tiene que revisarlo un abogado antes de publicar.**
- `components/layout/PageHeader` — dueño del único `<h1>` de cada página secundaria.
- `components/ui/Field` — liga label, hint y error con `aria-describedby` y `aria-invalid`
  mediante render prop, para que un error nunca quede visible pero sin anunciar.

### Fase 5 · SEO

- `lib/seo.ts` con `buildMetadata()`: título, descripción, canónica, Open Graph y Twitter card
  desde un solo sitio.
- `app/opengraph-image.tsx` con `next/og`, embebiendo el isotipo real en base64.
- `app/sitemap.ts` (7 rutas públicas) y `app/robots.ts`, ambos excluyendo `/portal`,
  `/kitchen-sink` y `/api/`.
- JSON-LD `Organization` en el layout y `SoftwareApplication` en la home, vía
  `components/seo/JsonLd`. **Sin `offers` ni `aggregateRating`**: los precios todavía no
  existen y una calificación inventada es una mentira que el buscador repite.

**Verificado**: las 12 rutas responden 200; `robots.txt` y `sitemap.xml` con el contenido
correcto; una sola `<h1>` y **cero saltos de jerarquía** en las siete páginas públicas; ninguna
imagen sin `alt`; cero desplazamiento horizontal a 320px; los seis campos del formulario
etiquetados y de 48px; y la API probada de punta a punta con los cuatro casos (válido, inválido,
bot y cuerpo no-JSON).

---

### Fase 6 · Pulido

**Lighthouse sobre `next start`** (build de producción, emulación móvil con estrangulamiento
de CPU 4×, en esta máquina de desarrollo):

| Página | Rendimiento | Accesibilidad | Buenas prácticas | SEO |
|---|---|---|---|---|
| `/` | 82 | **100** | **100** | **100** |
| `/modulos` | 92 | **100** | **100** | **100** |
| `/contacto` | 85 | **100** | **100** | **100** |

**Accesibilidad, buenas prácticas y SEO llegan al 100. Rendimiento no llega al ≥95 que pide
`CLAUDE.md §6`** — ver "Lo que queda pendiente de rendimiento" abajo.

Lo que se arregló aquí, medido antes y después:

- **`Reveal` forzaba 15 recálculos de layout sincrónicos.** Cada instancia creaba su propio
  `IntersectionObserver` y llamaba a `getBoundingClientRect()` al montar. Lighthouse cobraba
  **1297 ms de Style & Layout** y marcaba `forced-reflow`. Con un observador compartido y la
  comprobación geométrica diferida a un frame: **487 ms**.
- **`Reveal` pasó a ser componente de servidor.** Antes eran 15 fronteras de hidratación para
  un efecto idéntico. Ahora las secciones emiten marcado plano con `data-reveal` y un único
  `RevealObserver` los arma a todos. La página de la home bajó de 776 B a **180 B**.
- **El menú móvil ya no se carga en escritorio.** Radix Dialog (~19 kB) hidrataba en todas las
  páginas para un menú que solo existe bajo `lg`. Ahora el panel vive en su propio chunk y se
  carga en el primer toque.
- **Regresión de foco encontrada y corregida.** Al cargar el panel de forma diferida, Radix
  perdió la referencia de a quién devolver el foco y al cerrar con `Escape` caía en `<body>`.
  Se restaura explícitamente, y **después** del desmontaje: mientras el diálogo sigue montado
  su trampa de foco anula cualquier `focus()`.

---

## En curso

Nada. El sitio está completo. Queda el **rendimiento** (abajo) y los `TODO(guti)`.

---

## Lo que queda pendiente de rendimiento

El objetivo de `CLAUDE.md §6` es Lighthouse ≥95 en las cuatro categorías. Tres están en 100;
rendimiento se quedó entre **82 y 92**.

Un aviso sobre la medición: repitiendo la misma página tres veces seguidas salió 86 / 94 / 84,
con TBT entre 200 y 480 ms. Es mucha varianza, propia de medir en localhost sobre una máquina de
desarrollo cargada. **No des un número por bueno sin repetirlo.**

Qué queda y qué ya se descartó:

- El coste dominante es la hidratación de React más el runtime de Next (103 kB compartidos). Lo
  que quedaba nuestro ya se quitó.
- `Nav` sigue siendo componente cliente por la nav translúcida al hacer scroll y por
  `usePathname` para el `aria-current`. Es lo siguiente a mirar si hace falta apretar más.
- **Los polyfills no son el problema**, aunque Lighthouse mencione JavaScript heredado: Next los
  sirve con `noModule`, así que un navegador moderno ni los descarga. Se probó restringir
  `browserslist` a navegadores modernos y **no cambió nada**, así que se revirtió — no tiene
  sentido recortar compatibilidad a cambio de nada.
- Falta medirlo en Vercel, con CDN y red real. Es la medición que de verdad cuenta.

---

## Siguiente

| Fase                  | Qué incluye                                                                                                 | Estado |
| --------------------- | ----------------------------------------------------------------------------------------------------------- | ------ |
| 1 · Andamiaje         | Next.js 15 + TS strict, Tailwind con tokens de marca, Poppins, assets, `content/`, layout base, Nav, Footer | ✅     |
| 2 · Sistema de diseño | `Card`, `Badge`, `Accordion`, `Heading`, `Eyebrow`, `IconTile`, `Reveal`, página `/kitchen-sink`            | ✅     |
| 3 · Home              | Las 13 secciones, una por una, con los mockups React/SVG                                                    | ✅     |
| 4 · Páginas           | `/modulos`, `/casos`, `/precios`, `/contacto`, legales                                                      | ✅     |
| 5 · SEO               | Metadata por página, OG image, `sitemap.ts`, `robots.ts`, JSON-LD                                           | ✅     |
| 6 · Pulido            | Accesibilidad, Lighthouse, tests, responsive, SVG del logo                                                  | 🔶 a11y/BP/SEO en 100; rendimiento 82-92 |

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
| 19  | ~~**`Reveal` lleva `data-reveal` y un `<noscript>` en el layout**~~ **Superada por la 22.** | Framer escribía `opacity:0` en el HTML del servidor y el `<noscript>` lo neutralizaba. Se queda anotada porque el diagnóstico sigue siendo válido: el contenido no puede depender de JavaScript para leerse. Lo que cambió es el remedio |
| 20  | **La variante `link` del `Button` no llega a 44px**                     | Es texto en línea: forzarla a 44px metería espacio en blanco dentro de una frase. WCAG 2.5.8 exime los enlaces embebidos en texto y pide 24px en el resto, que sí cumple (26px). Para una acción terciaria con área táctil real, se usa `ghost` |
| 21  | **`Reveal` sin Framer Motion: CSS más un `IntersectionObserver` propio** | En cuanto la home usó `Reveal`, Framer metió 52 kB y la dejó en **155 kB**, por encima del techo de ~120 kB de `CLAUDE.md §6`. La animación permitida es una sola —fundido y 12px de subida, una vez— y eso son unas líneas de CSS. Al quitarlo la home bajó a **107 kB**. Framer se desinstaló: no se deja una dependencia que no se usa |
| 22  | **`Reveal` se arma dentro del efecto, no desde el CSS ni desde el HTML** | Es la tercera versión, y las dos anteriores fallaban la regla de "el contenido no depende de JavaScript". Framer horneaba `opacity:0` en el HTML del servidor. Gatearlo tras una clase `.js` puesta por un script en línea tampoco bastaba: el script ocultaba y **otro** código tenía que revelar, así que un observer muerto dejaba la página en blanco. Ahora ocultar y observar ocurren en la misma operación, una línea seguida de la otra |
| 23  | **Comprobación geométrica inmediata más respaldo en `scroll`**           | Un `IntersectionObserver` en una página que no compone nunca dispara. Medido: tras `scrollIntoView` el elemento estaba a 286px del borde superior, plenamente visible, y el observer no se activó. Sin estos dos respaldos la página se queda invisible |
| 24  | **`<details>` nativo en vez del acordeón de Radix**                      | Con la FAQ completa la home volvió a pasarse: **131 kB** contra un techo de ~120. Medido aislando la sección: Radix Accordion costaba **19 kB**, y sin él la home queda en **112 kB**. El navegador ya hace este trabajo, y lo hace mejor donde importa: abre sin JavaScript, el teclado y el anuncio de expandido vienen de fábrica, y la búsqueda del navegador encuentra texto dentro de un panel cerrado. `<details name="faq">` da apertura exclusiva de forma nativa; los navegadores sin soporte simplemente dejan abrir varios, que no rompe nada. Radix Accordion se desinstaló |
| 25  | **`components/ui/Disclosure` compartido por la FAQ y la tabla de precios** | Las dos son lo mismo: un panel que se abre. Tenerlo en un primitivo evita que la tabla y la FAQ se separen visualmente, y deja un solo sitio donde está el reset del marcador de `<summary>` |
| 26  | **Los precios y varias respuestas de la FAQ se publican con `TODO(guti)` visible** | Un precio inventado es una promesa que alguien tiene que sostener después, y "¿funciona sin internet?" o "¿emite factura DIAN?" son hechos del producto que no puedo verificar. Se renderizan tal cual en la página, a propósito: un hueco honesto se ve y se arregla; una respuesta inventada no |
| 27  | **El honeypot no se valida en el schema de Zod**                         | Al probar la API salió que un bot recibía **422 con `{"website": ["Invalid input"]}`** — es decir, el endpoint le decía cuál era la trampa y cómo esquivarla. Ahora `website` es un campo libre en el schema y `looksLikeBot()` lo decide aparte; la ruta responde **200 en silencio** y nunca llama a `sendLead`. Sigue sin haber reCAPTCHA: un acertijo castiga al visitante por lo que hace el spammer |
| 28  | **`Field` usa render prop en vez de clonar hijos**                       | El `id` tiene que llegar al control para que `htmlFor`, `aria-describedby` y `aria-invalid` queden atados. Clonar los hijos para inyectar props es magia que se rompe en silencio en cuanto alguien envuelve el input |
| 29  | **JSON-LD sin `offers` ni `aggregateRating`**                            | Los precios siguen siendo `TODO(guti)` y no hay reseñas. Los datos estructurados son el último sitio donde poner una suposición favorecedora, porque el buscador los trata como una afirmación sobre el mundo y los repite |
| 30  | **`Reveal` es componente de servidor; un solo `RevealObserver` los arma** | Quince fronteras de hidratación para un efecto idéntico en todas. Como marcado plano más un observador único, la página de la home pasó de 776 B a 180 B y desapareció el `forced-reflow` que costaba 1297 ms de Style & Layout |
| 31  | **El panel del menú móvil se carga en el primer toque**                  | Radix Dialog hidrataba en **todas** las páginas por un menú que solo existe bajo `lg`. En una visita de escritorio no se abre nunca. Ahora vive en su propio chunk |
| 32  | **El foco se devuelve a mano, y después del desmontaje**                 | Al diferir el panel, Radix perdió a quién devolver el foco y `Escape` lo dejaba en `<body>`. Hacerlo dentro del handler tampoco sirve: la trampa de foco lo recaptura mientras el diálogo sigue montado. Va en un efecto disparado al cerrarse |

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

**10. No compiles con `next build` mientras corre `next dev`.**
Los dos escriben en el mismo `.next/`, y el build le arranca los chunks al servidor de
desarrollo por debajo. El síntoma es un 500 con `Cannot find module './611.js'` y
`ENOENT: fallback-build-manifest.json`, que parece un fallo del código y no lo es. Para el
servidor, borra `.next` y vuelve a levantarlo.

**11. Un `IntersectionObserver` en una página que no compone nunca dispara.**
No es teoría: tras `scrollIntoView` el elemento quedó a 286px del borde superior, plenamente
visible, y el observer no se activó. Por eso `Reveal` hace una comprobación geométrica inmediata
al armarse y deja un respaldo en `scroll`. Si alguna vez ves la página en blanco con el JS
cargado, mira si los `[data-reveal]` tienen `data-revealed`.

**12. `window.scrollTo` y `scrollTop` no mueven el panel del navegador.**
`scrollIntoView` sí. Si estás verificando algo que dependa del scroll, usa ese, y comprueba
`window.scrollY` después en vez de asumir que se movió.

**13. Vigila el presupuesto de JS al cerrar cada fase, no al final.**
Se pasó dos veces y las dos por la misma razón: una librería que entra al bundle en cuanto la
home usa un componente. Framer Motion (52 kB) y Radix Accordion (19 kB). Para aislar el culpable,
quita la sección del `page.tsx` —**y también su `import`**, o el lint tumba el build— compila y
compara. En los dos casos el reemplazo nativo salió mejor, no solo más liviano.

**14. Las opacidades de Tailwind hay que medirlas.**
`text-ink-900/75` sobre el naranja da **4.29:1** y falla; `/85` da 5.16 y pasa. La opacidad es
cómoda de escribir e imposible de estimar a ojo. `scripts/contrast.mjs` ahora aplana el color
sobre su fondo y audita también estas parejas. **Si usas un token con `/NN`, agrégalo ahí.**

**15. Un comentario JSX no cabe en el `return` de una arrow function.**
`{items.map(x => ( {/* nota */} <Comp/> ))}` es un error de sintaxis con un mensaje que no ayuda
("')' expected"). El comentario va antes del `map`, o dentro de un fragmento.

**16. Un honeypot dentro del schema delata la trampa.**
Si el campo señuelo forma parte de la validación, el 422 nombra el campo y el bot aprende a
dejarlo vacío. Se comprueba con `curl`, no de cabeza: manda el formulario con el honeypot lleno
y confirma que responde **200** y que el cuerpo no menciona `website`.

**17. `getByLabelText` no respeta `aria-hidden`.**
Un test que afirmaba "el honeypot no se anuncia" pasaba por razones equivocadas. Las consultas
por rol (`getByRole`) sí respetan `aria-hidden` y `display:none`; las de label, no.

**18. satori pide `display: flex` explícito.**
En `app/opengraph-image.tsx`, cualquier `<div>` con más de un hijo tiene que declararlo o el
build falla con `Expected <div> to have explicit "display: flex"`. Rompe el build entero, no solo
la imagen.

**19. Mata el `next start` viejo antes de medir con Lighthouse.**
Costó dos mediciones inventadas. Un `next start` anterior seguía ocupando el puerto, el nuevo
fallaba con `EADDRINUSE` sin que se notara, y Lighthouse medía el build viejo sirviendo assets
con 400 — lo que da un rendimiento **más alto** porque no llega a cargar el JS. Salieron un 89 y
un 97 falsos. Antes de creerte una cifra: comprueba que el servidor arrancó y que el CSS
responde 200. En Windows, `pkill` no basta; usa `Get-NetTCPConnection -LocalPort N` y
`Stop-Process`.

**20. `IntersectionObserver` no existe en jsdom.**
Framer lo pide en cuanto montas un `Reveal`, y el test revienta con `ReferenceError`. Está
poblado en `tests/setup.ts`, junto a `ResizeObserver` y `matchMedia`.

---

## Bitácora

Una línea por sesión: fecha, qué se hizo, cómo quedó la verificación.

| Fecha      | Sesión                                                                                  | Resultado                                                           |
| ---------- | --------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| 2026-08-24 | Plan del sitio + Fase 1 (andamiaje completo, tokens, assets, layout, Nav/Footer, tests) | typecheck · lint · test (11/11) · build · contrast (17/17) en verde |
| 2026-08-24 | Fase 2 (primitivos, `Reveal`, `/kitchen-sink`), push inicial al remoto | typecheck · lint · test (26/26) · build · contrast (17/17) en verde |
| 2026-08-24 | Fase 3, secciones 1-6 (contenido, hero con mockup, barra de confianza, problema, pilares, módulos). `Reveal` reescrito sin Framer: home de 155 kB a **107 kB** | typecheck · lint · test (38/38) · build · contrast (17/17) en verde |
| 2026-08-24 | Fase 3 completa: proceso, quiénes somos, casos, precios, FAQ y franja de cierre. Acordeón de Radix cambiado por `<details>` nativo: home de 131 kB a **112 kB** | typecheck · lint · test (47/47) · build · contrast (25/25) en verde |
| 2026-08-24 | Fases 4 y 5: las seis páginas secundarias, formulario con API, y SEO completo (metadata, OG, sitemap, robots, JSON-LD) | typecheck · lint · test (69/69) · build (16 rutas) · contrast (25/25) en verde |
| 2026-08-25 | Fase 6: `Reveal` a componente de servidor, menú móvil diferido, foco corregido. Lighthouse a11y/BP/SEO en 100; rendimiento 82-92, **sin llegar al ≥95** | typecheck · lint · test (71/71) · build · contrast (25/25) en verde |
