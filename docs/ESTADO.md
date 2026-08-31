# ESTADO

Dónde va el proyecto, qué se decidió y por qué, y qué trampas ya se pisaron.

**Este archivo se actualiza en cada tarea, en el mismo commit.** Es lo que permite cerrar una
sesión cuando el contexto se llena y que la siguiente arranque sin perder nada.

Última actualización: 2026-08-31 (**la factura de El Labrador**: impresión silenciosa, tipografía más grande y el pie de nexora-pos — hecho en el repo del cliente, pendiente de sincronizar aquí)

---

## Hecho

### Fase 1 · Andamiaje

- **Proyecto Next.js 15.5.23** (App Router, TypeScript `strict` con `noUncheckedIndexedAccess`,
  `noUnusedLocals`, `noUnusedParameters`), ESLint 9 flat config + Prettier con
  `prettier-plugin-tailwindcss`.
- **Tailwind v4** con todos los tokens de marca en `app/globals.css` (`@theme`): paleta,
  escala tipográfica fluida con `clamp()`, degradado de marca, sombras, breakpoints, y el
  bloque global de `prefers-reduced-motion`.
- **Poppins** vía `next/font/google`, pesos 300–700, `display: swap`. _(Sustituida por Plus Jakarta Sans en la sesión del 2026-08-26 — ver la decisión 41. Poppins sigue cargada con un solo peso, solo para el wordmark.)_
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

**Rehacer cinco secciones siguiendo el arte de referencia** (los PNG en la raíz), una por una y
verificando cada una antes de seguir. Hecho: **nav**, **hero** y **"El problema"**. Faltan: "Lo que nos define" (seis tarjetas) y los siete módulos con la tarjeta oscura
"¿Te falta uno?".

El contenido ya está movido: los seis pilares y el copy nuevo del problema (decisiones 46 y 47).
**El arte no manda sobre el contraste ni sobre la voz**: su CTA es blanco sobre naranja
(prohibido) y su lead de pilares usa "potencia", que `CLAUDE.md` §3 prohíbe. Queda el **rendimiento** (abajo) y los `TODO(guti)`.

---

## El portal de clientes — construido el 2026-08-30

Rompe lo que `CLAUDE.md` §1 y §9 declaraban fuera de alcance, **por decisión expresa del usuario**:
había que entregarle el sistema a un cliente real, Papas El Labrador. Ambas secciones ya están
actualizadas.

Qué quedó funcionando:

- **`/portal`** es el login (Supabase Auth), no un placeholder. Usa los primitivos del sitio.
- **`middleware.ts`** dejó de ser pass-through: valida la sesión, comprueba que el slug de la URL
  sea el de esa empresa, y reescribe a `index.html` lo que no sea un archivo para que el router de
  la SPA sobreviva a un F5.
- **`public/portal/<slug>/`** guarda el build compilado de la app de cada cliente. Lo trae
  `scripts/sync-tenant-app.mjs`. Se versiona: es lo que despliega Vercel.
- **`scripts/crear-usuario-portal.mjs`** crea el usuario de una empresa con la `service_role`,
  a mano y fuera del repositorio.
- **`docs/PUESTA-EN-MARCHA-SUPABASE.md`** es el instructivo para el socio que conecta la base.

**La home pasó de 111 kB a 113 kB.** Sigue bajo el techo de ~120 kB (`CLAUDE.md` §6). El portal
pesa 219 kB, pero solo lo baja quien entra a él.

**Lo que NO se ha podido verificar** sin un proyecto de Supabase real: el login de verdad,
Realtime, y que PostgREST acepte los `select` con tablas embebidas. Está en el paso 7 del
instructivo, y hay que mirarlo antes de entregar.

### Cómo sigue — para quien retome

**El código está terminado; lo que falta es conectar un Supabase real.** El documento a seguir es
**[`docs/PUESTA-EN-MARCHA-SUPABASE.md`](PUESTA-EN-MARCHA-SUPABASE.md)**: ocho pasos, nueve
comprobaciones manuales, y cómo agregar un usuario o una empresa nueva (§8).

Está en las ramas `feat/portal-clientes` (aquí) y `feat/supabase-multi-tenant` (repo de Papas),
ya subidas. **Ninguna se fusionó a `main` a propósito**: hasta que los pasos estén hechos y
verificados, `main` conserva la versión que funciona.

Dos cosas que sorprenden si no se saben:

1. **`public/portal/` no existe todavía.** La app del cliente se genera con
   `scripts/sync-tenant-app.mjs`, y el script **se niega a construir sin configuración de
   Supabase**: Vite la incrusta en el bundle, así que sin ella se desplegaría una app que arranca
   y falla al primer clic.
2. **Sin las variables, el portal falla cerrado.** La página de login sigue en pie, pero nadie
   entra a ninguna aplicación. Es deliberado.

#### La factura de El Labrador cambió el 2026-08-31 — pendiente de sincronizar

El dueño imprimió por primera vez en la impresora térmica y trajo el papel. Se arregló **en el repo
de Papas El Labrador** (rama `feat/supabase-multi-tenant`, commit `ef723ee`), porque la aplicación
del cliente no se compila aquí:

- **Impresión silenciosa.** El ticket ya no se imprime desde la página: se monta en un iframe con su
  propio documento y se imprime ahí. Eso quita el diálogo *nuestro* del camino, pero **el diálogo
  del navegador no se puede quitar por código** — `window.print()` siempre lo abre. Se consigue
  abriendo Chrome con `--kiosk-printing`, y eso es configuración del equipo del negocio. El
  instructivo es `docs/IMPRESION.md` de aquel repo.
- **El ancho lo pone ahora el driver de la impresora** (`@page { size: auto }`) en vez de los 78,5 mm
  escritos a mano, que era parte del papel en blanco que sobraba.
- **La letra subió a 13 px con peso 600 y negro puro**; una térmica quema puntos y lo fino sale gris.
- **Pie de nexora-pos en el recibo**: `Software de operación` / `nexora-pos` /
  `www.nexora-pos.online`, igual que XUMA-POS imprime el suyo. Va fijo en el componente, no
  configurable por negocio: es la marca del software.

**Todavía no se refleja en este repositorio.** `public/portal/papas-el-labrador/` no existe, y
`scripts/sync-tenant-app.mjs` se niega a construir sin las variables de Supabase (probado: falla con
"No hay configuración de Supabase para el build"). En cuanto exista el `.env.local` del paso 5 del
instructivo, la primera sincronización trae ya esta versión de la factura — no hay nada extra que
hacer aquí.

#### La tarea siguiente: agregar un perfil nuevo

Está pedida y todavía no empezada. **"Perfil" puede ser dos cosas distintas y el camino no es el
mismo** — el §8 del instructivo las separa:

- **Otro usuario de la misma empresa** (§8.a): correr `scripts/crear-usuario-portal.mjs` con otro
  correo y el mismo slug. No se toca código. Ojo: **no hay roles**, los dos usuarios ven y pueden
  exactamente lo mismo.
- **Otra empresa cliente** (§8.b): fila en `tenants`, su usuario, su aplicación en
  `public/portal/<slug>/`, desplegar. El esquema y el middleware ya sirven a cualquier número de
  empresas.

Lo primero que hay que preguntar al empezar es **cuál de las dos es**.

Decisiones ya tomadas sobre la facturación, para no reabrirlas: el consecutivo **arranca en 0**
(el negocio estrena sistema) y el prefijo **se queda en `JOS-LL-`**, el mismo de XUMA-POS. Las dos
las tomó el dueño el 30 de agosto de 2026.

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
| 33  | **El hero usa una imagen de producto (`public/brand/hero-mockup.png`) en vez del `DashboardMockup` React/SVG** | Pedido explícito del usuario, con la excepción de `CLAUDE.md §7` documentada ahí mismo: son cifras de ejemplo, no datos reales de la empresa. `DashboardMockup` no tenía más usos y se borró en el mismo commit para no dejar código muerto |
| 34  | **Token nuevo `brand-600` `#E86F00`, solo para texto grande**             | El usuario pidió un naranja más brillante para el acento "Nuestro software." del `h1`, y luego un poco más brillante todavía. `brand-500` como texto es 2.61:1 y falla AA a cualquier tamaño (decisión 11). `#E86F00` da 3.13:1: es lo más brillante que deja un margen real sobre el umbral de texto grande (3:1) — un paso más arriba (`#EB7000`, s=0.92) queda en 3.07:1, y otro más (`#ED7100`) en 3.02:1, a un error de redondeo de fallar. El `h1` mide 40px+ en todos los breakpoints, así que es seguro ahí y solo ahí. Sumado a `scripts/contrast.mjs`, con la combinación normal listada en `banned` |
| 35  | **El hero es la imagen a sangre completa con el texto encima (xl+), apilada por debajo de xl** | Pedido del usuario: la imagen ocupa todo el hero, no una columna. Por debajo de 1280 no se superpone: la imagen es 1.87:1, así que en un viewport estrecho `object-cover` la recorta a una franja ilegible del monitor o empuja el texto sobre los equipos. Ahí va a ancho completo debajo del texto, que es como llena el hero a ese tamaño |
| 36  | **`bg-hero-scrim`: el velo que hace determinista el fondo del texto**    | Con la imagen detrás, el fondo del texto son píxeles, no un token plano, y la imagen se va a negro donde está el monitor. El velo fija un peor caso conocido: ≥0.97 hasta el 46% y ≥0.93 hasta el 50%, con la columna de texto tapada al 46%. Medido sobre la imagen en una rejilla 10×8: el 30% izquierdo nunca baja de 0.576 de luminancia y la zona del monitor es negro puro. Los dos peores casos resultantes (`#EDEDED` bajo el cuerpo, `#FDFDFD` bajo el `h1`) están en `scripts/contrast.mjs`. **Ensanchar la columna más allá del 50% o suavizar las paradas rompe AA** |
| 37  | **El cuerpo del hero va en `ink-900/80`, no en `ink-500`**               | `ink-500` está calibrado contra superficies planas: sobre el peor caso del velo (`#EDEDED`) da 4.26:1 y falla. `ink-900/80` da 7.98:1 y conserva la jerarquía visual frente al lead. Es una excepción local del hero, no un cambio de la regla general |
| 38  | **El hero mide exactamente una pantalla: `100svh` menos el nav**        | Pedido del usuario: sobraba espacio bajo el nav y el hero se pasaba de la pantalla. El espaciado ya no lo hace el `padding` vertical sino el centrado dentro de la altura fija, que es lo que cierra el hueco. `svh` y no `vh` porque en móvil la barra de direcciones que se contrae haría desbordar a `vh`. Medido: 1920×1080, 1280×800 y 375×812 dan nav + hero = altura de viewport exacta |
| 39  | **La columna de texto del hero baja del 46% al 36%**                    | Dos objetivos a la vez: el usuario quería ver mejor la impresora de recibos y la tableta, y el texto más estrecho cae sobre la zona más clara de la imagen. El scrim ahora se retira a partir del 42% y desaparece en el 58% en vez del 68%, que es lo que destapa los equipos. El contraste **subió**: cuerpo de 8.45 a 8.48, lead de 15.76 |
| 40  | **`RandomLetterSwap` es `aria-hidden` entero y el nombre lo pone quien lo usa** | La primera versión traía su propia etiqueta `sr-only` y **los cuatro enlaces del nav quedaron sin nombre accesible** — no un nombre malo, ninguno. Ahora el componente es puramente presentacional y `Nav` pone `aria-label`. Hay dos tests en `components/layout/nav.test.tsx` que lo fijan, porque es un fallo silencioso |
| 41  | **Plus Jakarta Sans en vez de Poppins, salvo el wordmark**              | Pedido del usuario: algo más profesional sin perder lo moderno. Es geométrica igual pero con contraformas más estrechas y mayor altura de x, que aguanta mejor en cuerpo y en interfaz. Poppins se queda cargada con **un solo peso** para `LogoLockup`: esa composición sustituye al logotipo real y no puede seguir a un cambio de fuente de cuerpo |
| 42  | ~~**Framer Motion entra al bundle de todas las páginas, y se acepta**~~ **Revertida el mismo día por la 43.** | Se midió en el cable: **29 kB gzip** en todas las páginas, home a ~153 kB contra un techo de ~120 kB. Se dejó anotada porque el diagnóstico vale: el coste de una librería de animación en el nav se paga en cada página, no solo en la que la usa |
| 43  | **`RandomLetterSwap` en CSS puro, componente de servidor; Framer desinstalado** | El usuario eligió el CSS al ver el coste. El efecto es dos copias por letra y una `transition` con `--letter-delay` por letra: **0 kB de JavaScript** y visualmente lo mismo. La home bajó de 153 a **124 kB**. El barajado se siembra del propio texto en vez de `Math.random()`, porque aleatorio de verdad daría distinto en servidor y cliente y React marcaría un desajuste de hidratación. **Es la tercera librería de animación que se cae por el presupuesto** — Framer por `Reveal` (21), Radix Accordion (24) y ahora Framer otra vez |
| 44  | **Figtree en vez de Plus Jakarta Sans, elegida midiendo el arte de referencia** | El usuario pidió verificar la fuente de los mockups. Se midieron tres cosas sobre el PNG y se compararon contra diez candidatas: altura-de-x / altura-de-mayúscula (referencia **0.704**, Figtree 0.706 — la más cercana de todas), ancho total sobre altura de mayúscula, y proporciones de tinta glifo a glifo para C/o/n/s/c. Figtree salió primera o casi primera en las tres. **Poppins salió última en las tres**, y su "a" es de un piso mientras la referencia la tiene de dos: el arte no está en Poppins. Manrope y Plus Jakarta Sans quedan a distancia de ruido — el rasterizado no da para separarlas |
| 45  | **`paper-50` a `#EDEDED` y `ink-500` a `#626976`**                       | El usuario pidió el gris "un poco más oscuro". El viejo `#F2F4F7` era frío y azulado; el arte de referencia usa gris **neutro** en la banda `#F0F0F0`–`#EDEDED` (sacado por histograma, no a ojo), y el neutro además pesa más a la misma luminosidad. **No se podía oscurecer solo el gris**: `ink-500` sobre el viejo papel daba 4.517:1, por encima del mínimo por nada. Oscurecer `ink-500` primero es lo que paga el cambio — ahora da 4.72:1 con margen real |
| 46  | **Sexto pilar: "Escalable". El título pasa a "Seis cosas que no negociamos"** | El arte de referencia muestra seis tarjetas y el título decía "Cinco": se contaba mal a sí mismo. El usuario eligió **subir a seis** en vez de quitar la tarjeta. "Escalable" no es un pilar inventado — es la tercera palabra del descriptor de marca (`SOFTWARE A MEDIDA · PERSONALIZABLE · ESCALABLE`). `CLAUDE.md` §4 se actualizó en el mismo commit, que es lo que exige la regla: si el código y el manual no coinciden, uno de los dos está mal |
| 47  | **Copy de "El problema" cambiado al del arte**                          | El arte trae un titular distinto al de `content/home.ts` ("El software genérico te obliga a adaptarte. El nuestro se adapta a ti.") y columnas con subtítulo — "Plantilla única / Tú te adaptas al sistema" contra "Con nexora-pos / El sistema se adapta a ti". El usuario confirmó que es el texto que quiere, no relleno del generador. `ComparisonColumn` gana un `subtitle` obligatorio; la sección todavía no lo pinta (se rehace después) |
| 48  | **El nav rehecho: barra a todo el ancho, tipografía y botones más grandes** | Primero se hizo flotante e insertada, que es la forma del arte; el usuario pidió el ancho completo de vuelta. Con esa anchura los enlaces en `text-body` quedaban perdidos, así que suben a un token propio **`--text-nav`** (17→20px) y los botones pasan de `sm` a `md`. `text-lead` se descartó: a 1920 daba 22px, más grande que los botones de al lado. **El arte pone el CTA en blanco sobre naranja: 2.61:1, prohibido por `CLAUDE.md` §3** — se queda en `ink-900` (6.46:1), y el enlace activo en `brand-700` en vez del `brand-500` del arte |
| 51  | **La app del cliente se sirve compilada, no fusionada** | Papas El Labrador es React 18 + Tailwind 3 + react-router; este sitio es React 19 + Tailwind 4 + App Router. Un bundle no admite dos Reacts y un PostCSS no compila dos majors de Tailwind: fusionar obligaba a reescribir un proyecto entregado que maneja plata. Se copia su `dist/` a `public/portal/<slug>/` y corre tal cual, con sus propios tests como garantía |
| 50  | **La sesión va en cookies, no en `localStorage`** | El middleware tiene que decidir en el SERVIDOR si hay sesión antes de entregar un archivo, y `localStorage` no viaja en la petición. De paso, la app del cliente —otro bundle, mismo origen— toma la sesión sin código de traspaso |
| 49  | **La altura del nav es un token, `--spacing-nav`**                        | El hero mide una pantalla menos el nav (decisión 38) y ese `4.5rem` estaba escrito a mano en el hero. Al cambiar el nav, nav + hero pasó a **1108px en un viewport de 1080** — la decisión 38 rota en silencio. Ahora la altura vive en `--spacing-nav` y la leen el hero y el `scroll-padding-top` de los anclas. Cambiar la barra sin tocar el token ya no puede romper ninguno de los dos |
| 50  | **El claim del hero va a tres líneas, una frase por línea**              | Es como está en el arte, y las tres frases son tres afirmaciones: el ritmo es el mensaje. Cuesta una línea de alto, que en 375×812 sacaba la sección 10px por debajo del pliegue; el suelo de la imagen en móvil baja de 22svh a 20svh y vuelve a encajar exacto. **La línea naranja baja a la banda media del velo, donde `brand-600` da 2.92:1 contra el peor caso teórico** — por eso se midió sobre los píxeles compuestos reales: 3.12:1 a 1920 y 3.13:1 a 1280, por encima del 3:1 de texto grande. Si esa línea baja más, hay que volver a medir o pasar a `brand-700` |
| 51  | **El CTA secundario del hero es placa blanca con filete, no el `secondary` con borde** | Es lo que muestra el arte y es lo correcto aquí: el botón se apoya en la imagen, donde un relleno transparente pondría su etiqueta sobre los píxeles del escritorio. Se usa la variante `inverse` (blanco, etiqueta `ink-900`, 16.9:1) más un filete `ink-900/25` — bajo xl, donde el fondo es blanco plano, el filete es lo único que impide que desaparezca |
| 52  | **"El problema" rehecho: dos tarjetas con el badge "VS" en la costura**   | La comparación del arte. El badge es **`ink-900` sobre naranja, no blanco** (2.61:1, prohibido), va `aria-hidden` — "versus" es lo que ya significan dos columnas tituladas así — y **se oculta bajo md**: centrado sobre una pila cae en mitad de una tarjeta y no marca nada. El subtítulo de la columna buena va en `brand-700` y no en el naranja del arte: es de tamaño cuerpo, así que pide 4.5:1 |
| 53  | **El arranque en negrita de cada punto se decide en `content/`, no cortando la frase** | El arte pone en negrita las primeras palabras de cada línea. Es parte del copy, no del maquetado, así que `ComparisonPoint` es `{ emphasis, rest }` y el componente solo los pinta. Un componente partiendo el string por la primera coma habría puesto la negrita en el sitio equivocado en cuanto cambiara una frase |
| 54  | **Sobre xl, el hero se sale del contenedor y se pega al borde izquierdo** | Pedido del usuario: quería ver más imagen. El `max-width` centrado del contenedor dejaba el texto a 320px del borde en una pantalla de 1920 y tapaba justo lo que el arte quiere que se vea. Ahora la columna va de **5% a 35%** del viewport, que es exactamente donde la pone el arte, y bajo xl se comporta igual que un `Container`. **El contraste mejoró**, no empeoró: el velo es más opaco a la izquierda — acento 3.13:1, cuerpo de 8.03 a 8.42 |
| 55  | **El nav de escritorio cambia en xl, no en lg**                          | Regresión que introdujo la barra grande: con `text-nav` y botones `md`, a **1024px el grupo de escritorio se salía 56px** del viewport. Entre lg y xl se usa el menú de pantalla completa. Es la lección de siempre: subir un tamaño no es un cambio local, hay que volver a medir el punto de ruptura más estrecho donde ese bloque sigue visible |
| 56  | **"El problema" lleva la foto del arte, pero el texto sigue siendo texto**| El usuario propuso poner el PNG del arte tal cual, ya que la sección es informativa. Se descartó y él eligió la alternativa: la comparación se queda en HTML — seleccionable, traducible, legible por lector de pantalla y nítida en retina — y del PNG se **recorta solo la parte de la foto** (monitor, tarjetas flotantes, lector e impresora) a `public/brand/problem-devices.png`. Bajo lg la imagen cae debajo del titular a todo el ancho en vez de estrujarse al lado. Un PNG con las diez frases dentro habría roto §6 entero |
| 57  | **El plate del hero se coloca por ancho y anclado arriba, no con `cover`** | El usuario generó el arte sin texto. `cover` centrado le cortaba la parte de arriba del monitor en cualquier ventana de 1080p. Se probó ensanchar el plate a 2.73:1 replicando su borde izquierdo para que `cover` escalara siempre por altura: eso arregla el recorte pero **mueve los equipos con la forma de la ventana** — medido, del 54% al 15% del ancho — y el copy terminaba impreso encima del monitor. La solución es no usar `cover` sobre xl: la imagen va al 100% del ancho y clavada arriba, así **los equipos caen siempre en la misma fracción de pantalla (la impresora en el 34,4%)** y el recorte solo ocurre abajo, donde la mesa se va a sangre. En ventanas más altas que el arte, la imagen simplemente termina y el fondo blanco de la sección sigue debajo |
| 58  | **Fuera el velo del hero; el color del texto es lo que paga el contraste** | El plate ya trae un campo claro a la izquierda: velarlo sería teñir de blanco el naranja del que está hecho el arte. En vez de eso se cambió el texto — `brand-700` en vez de `brand-600` (que no llega ni a 3:1 sobre este fondo: 2,16:1) e `ink-900` en vez de `ink-500` para el eyebrow, que cae en la banda naranja de arriba. Medido sobre los píxeles compuestos: acento **4,16–4,18:1**, cuerpo 6,4–8,1, lead ≥16, eyebrow ≥6,9. Los pseudo-tokens del auditor pasan a `#FDB870` y `#FBCEA9`, leídos del plate píxel a píxel |
| 59  | **La altura del hero vuelve a ser un mínimo, no una altura fija**        | La decisión 38 lo dejó en `height` fijo para que midiera exactamente una pantalla. Con el claim a tres líneas eso **recortaba contenido**: en 1280×720 el copy mide 723px contra 640px de sección y `overflow-hidden` se comía el eyebrow y los botones. Ahora es `min-height` más centrado: en las ventanas normales sigue siendo una pantalla exacta (verificado a 1440×780, 1920×945 y 1920×1080) y las bajas crecen en vez de perder contenido. **Ninguna regla de maquetación vale un texto cortado** |
| 60  | **El borde inferior del hero se desvanece con una máscara CSS**          | Pedido del usuario, a partir de un componente de terceros que trae `mask-b-from-*`. Se tomó **solo la idea**: la máscara son dos clases de Tailwind sobre la imagen (`mask-b-from-88% mask-b-to-100%`), 0 kB de JavaScript. **No se instaló el componente**: arrastra `motion` y `react-wrap-balancer`, y `motion` es la librería de animación que ya se cayó tres veces por el presupuesto de la home (decisiones 21, 42 y 43). Además desvanece a transparente, no a blanco, así que sigue funcionando sea cual sea la sección siguiente |
| 61  | **La columna del hero se mide contra la imagen, no a ojo**              | El usuario pidió el texto "más ancho y menos largo" para cerrar el hueco entre copy y equipos. El techo no es estético: la impresora empieza en el 34,4% del ancho, así que la columna va de 5% a **30,4%** y ahí se acaba el presupuesto. Se probó al 38% y el cuerpo del texto quedó **encima de la impresora** — contraste 1,04:1, medido. El hueco lo cerró sobre todo volver a colocar la imagen (57): antes los equipos estaban en el 46,7% |
| 62  | **El acento del claim va en `brand-500` aunque no pase AA — excepción autorizada** | El usuario quiso el mismo naranja del botón. Se le enseñó la medida (**2,04:1 en el modelo, 2,52:1 sobre los píxeles reales**, contra el 3:1 que pide texto de ese tamaño) y las tres alternativas que sí cumplían, y eligió el naranja. Se aplica, y se añade a `scripts/contrast.mjs` una lista de **excepciones autorizadas** que se imprime en cada ejecución con su ratio: falla AA, se usa igual, y no se esconde. **Añadir otra no es decisión de quien programa** — se pregunta, se enseña el número, y solo entonces. Es la única en todo el sitio |
| 63  | **La barra de confianza: cinco datos, gris, a todo el ancho y con el fade del componente** | Pedido del usuario en dos pasos. Primero se probó en naranja y estrecha y **no le gustó**; quedó gris (`paper-50`) y a todo el ancho, como estaba, pero con cinco datos en vez de cuatro — fuera "7 · Módulos que activas", dentro "A medida" y "Modular" — y con el efecto del componente de referencia: **el gris vive en su propia capa `absolute` con `mask-t`/`mask-b`**, porque una máscara sobre la sección desvanecería también el texto. Encima, el velo blanco en `mix-blend-overlay`. La idea, no el componente: ese arrastra `motion`. Los cinco datos son reformulaciones de los pilares, que es lo único honesto — §7 prohíbe cifras inventadas sobre la empresa. Ajustes posteriores: los datos van **centrados** dentro de su columna; tipografía a `text-h2` (40px) y `text-body` (17px) porque a `text-small` las etiquetas se leían como letra pequeña, y **etiquetas recortadas a una línea** (24 caracteres o menos) — el alto de la banda lo mandaba el texto envuelto, no el padding, así que acortarlas es lo que la baja de 199 a **136px**. Y los cinco solo caben en una fila desde **xl**: a 1024 las columnas salen de 163px y tres etiquetas se parten en dos, así que ahí van 3+2 |
| 64  | **`calc()` en un valor arbitrario de Tailwind necesita los guiones bajos** | `basis-[calc(50%-0.75rem)]` es **CSS inválido** — `calc` exige espacios alrededor del signo — y el navegador no avisa: descarta la declaración, `flex-basis` vuelve a `auto` y la fila se colapsa sola. Se ve como un fallo de maquetación, no como un error de sintaxis. Se escribe `basis-[calc(50%_-_0.75rem)]`: Tailwind convierte los guiones bajos en espacios |
| 65  | **El desvanecido del hero va en la caja, no en la imagen**               | Estaba puesto sobre el `<img>` con `mask-b-from-88%`, y **no se veía**: la imagen se va a sangre por debajo del borde de la sección, así que su último 12% —justo la zona que se desvanece— quedaba fuera de pantalla. El efecto existía y nunca se vio. Puesto sobre la caja que ocupa la sección, el degradado es siempre el último 20% de lo que se ve. La copia va en un div hermano, así que no la toca |
| 66  | ~~**Los valores de la barra de confianza también en `brand-500`**~~ **Revertida el mismo día.** | Se aplicó a petición del usuario (2,23:1 sobre `paper-50`) y al verlo no le gustó, así que vuelven a `brand-700` (3,88:1) y la excepción sale del auditor. Queda **una sola excepción** en el sitio: el acento del `h1` del hero |
| 67  | **La home se recorta de once secciones a cinco**                         | Pedido del usuario: "más simple y directa". Quedan hero, barra de confianza, El problema, Cómo trabajamos y Casos de uso, más el footer. Salen pilares, módulos, quiénes somos, precios, FAQ y la franja de cierre — **la home se queda sin franja naranja**. `Pricing`, `Faq` y `CtaBand` siguen usados por las páginas secundarias; `Pillars`, `Modules` y `About` **no los usa ya ninguna página** y se conservan sin borrar, porque acortar es fácil de revertir. `UseCases` vuelve a fondo blanco: iba en `paper` y quedaba pegada a `Process`, que también lo es |
| 68  | **El nav apunta a secciones, no a páginas**                              | Pedido del usuario. Los cuatro enlaces pasan a tres anclas — `#problema`, `#proceso`, `#casos` — que son las secciones que la home renderiza de verdad. **"Contacto" sale del nav**: no hay sección de contacto en la home y el botón de al lado ya va al formulario. Dos cosas que el cambio rompió y hubo que arreglar: `aria-current` marcaba las tres a la vez (una ancla nunca es "la página actual"), y **el menú móvil se cerraba al cambiar de ruta**, que con anclas no ocurre — ahora cierra en el clic. Los tests del nav leían las etiquetas a mano y ahora las leen de `content/nav.ts` |
| 69  | **Plate del hero sin datos, y el texto crece con la columna**            | El usuario cambió el arte: el panel de la pantalla ya no lleva cifras porque "abrumaba y quitaba la concentración en el texto". Con el fondo más limpio la tipografía sube — el lead pasa a `text-h3` (24px) desde md — pero el titular **no puede pasar de 72px**: a 84px "Nuestro software." llega al 43% del ancho y aterriza sobre la curva naranja del fondo, donde el naranja sobre naranja mide **1,11:1**. El campo claro se acaba entre el 34% y el 35%, medido banda a banda. La escala pasa a `clamp(2.5rem, 3.7vw, 4.5rem)`: la pendiente sin offset es lo que evita que la línea se parta a 1280 |
| 70  | **`max-w` en % dentro del hero mide contra el contenedor, no contra la pantalla** | Media hora de desconcierto: el titular se partía en dos con una caja que "era del 38%". Ese 38% se resolvía contra el envoltorio del copy, no contra el viewport, y daba 579px donde se esperaban 730. Las cotas del hero van en **`vw`** — 30vw el titular, 27vw todo lo de abajo — y la caja intermedia se quedó sin cota |
| 71  | **Todas las citas se agendan por WhatsApp, en un solo sitio**            | Número del usuario: +57 313 271 2410. `content/site.ts` expone `whatsapp` con el `wa.me` y un mensaje prellenado, y de ahí lo leen el nav, el hero, el CTA de cada sección y la franja de cierre — un solo lugar donde cambiarlo. Todos abren en pestaña nueva con `rel="noreferrer"`, y el CTA lo dice en voz alta ("Te escribimos por WhatsApp, sin formularios"): un botón que salta a otra app debería avisarlo antes, no después. El formulario de /contacto sigue existiendo y el footer lo enlaza |
| 72  | **Vuelve la franja de cierre y cada sección termina en un CTA**          | Pedido del usuario. `SectionCta` es un componente único usado por las tres secciones de la home, no tres copias, para que destino y redacción no se separen |
| 73  | **El nav va de borde a borde: logo pegado a la izquierda, acciones a la derecha** | Pedido del usuario. Salió el `Container`: su `max-width` centrado dejaba el logo a 344px del borde en 1920. Ahora el gutter es `px-10` y los enlaces se centran en el espacio que queda |
| 74  | **Malla de constelación como fondo de sección, adaptada y diferida**     | Del componente que pasó el usuario se toma la idea y se reescribe: **llena su sección, no la ventana** (el original pintaba un rectángulo negro opaco a pantalla completa), colores de marca en vez de cian, **sin las etiquetas hexadecimales** que dibujaba junto a cada punto — el usuario las pidió fuera y sobre copy de marketing son ruido —, se detiene con `IntersectionObserver` cuando la sección no se ve, y con `prefers-reduced-motion` pinta un fotograma y para. **Importado directo costaba 11 kB y dejaba la home en 122 kB**, por encima del techo de §6; cargado con `next/dynamic` la deja en **113 kB** y el contenido no depende de él |
| 75  | **El lienzo se dimensiona por CSS; JS solo toca el búfer de píxeles**    | El componente original fijaba `canvas.style.width` en píxeles. Si el `ResizeObserver` llega tarde —y llega, en una pestaña que no compone— el lienzo se queda con el ancho anterior: **a 320px medía 1425 y la página se desplazaba en horizontal**. Ahora el tamaño de caja lo pone `size-full` y JS solo escribe `canvas.width/height`. Peor caso: un instante borroso, nunca scroll lateral |
| 76  | **Enlaces del nav en `ink-900` y barra a 4,5rem**                        | Pedido del usuario: negro para que se vean, y la barra un poco más angosta. El gris daba 5,5:1 y el negro da 16,9:1. La altura vuelve a leerse del token `--spacing-nav`, así que el hero siguió encajando sin tocarlo |
| 77  | **"Casos de uso" se queda vacía a propósito**                            | Pedido del usuario mientras decide el contenido. Conserva título e id porque el nav enlaza a `#casos` y un ancla sin sección es un enlace que no hace nada. Los seis casos siguen escritos en `content/use-cases.ts` y el marcado que los pintaba está en git: volver a ponerlos es un import y un bucle |
| 78  | **Los tres iconos flotantes se borran del plate para que crezca el titular** | El usuario dio permiso explícito: quería el texto más grande y ofreció quitar los iconos. Se enmascaran por saturación y se rellenan por interpolación de filas — el fondo ahí es un degradado liso, así que no quedan fantasmas. **El campo claro pasa del 35% al 39% del ancho**, y con eso el titular sube de 72 a 80px (`clamp(2.5rem, 4.2vw, 5rem)`) sin partirse ni pisar la curva naranja. Medido banda a banda antes y después |
| 79  | **Los eyebrows de sección van en `brand-700` y a 13px**                  | Pedido del usuario: el naranja de la marca y un pelín más grandes. `brand-500` no vale aquí — a 13px esto es texto normal y pide 4,5:1, donde da 2,61. `brand-700` da 4,54 sobre blanco. **Y por eso "Cómo trabajamos" pasa a fondo blanco**: sobre `paper-50` el mismo naranja se queda en 3,88 y el ritmo gris de la página ya lo pone la banda de confianza. El eyebrow del hero se queda en `ink-900`: sobre la imagen ningún naranja llega |
| 80  | **"El problema" sin imagen, a todo el ancho y con la comparación jerarquizada** | Pedido del usuario. Fuera la foto de los equipos; el titular ocupa el ancho y su segunda frase va en naranja — la partición vive en `content/`, no en el componente, porque qué mitad lleva el énfasis es una decisión del copy. La columna de nexora se levanta sobre la otra: fondo blanco, anillo `brand-500/40`, sombra alta, marcas en naranja sólido y una etiqueta "La diferencia". El anillo va al 40% y no sólido: un contorno naranja a plena fuerza se lee como error |
| 81  | **La malla de constelación se queda solo en "El problema"**              | El usuario la quería únicamente ahí. Fuera de "Cómo trabajamos" y "Casos de uso" |
| 82  | **La franja de cierre es la sección de contacto**                        | Lleva `id="contacto"` y el nav enlaza a ella; se le quita el botón "Ver precios", que apuntaba a una página de la que la home ya no habla |
| 83  | **El naranja brillante gana en tres sitios más, y AA pierde**            | El usuario pidió `brand-500` para el eyebrow de sección (2,61:1 donde pide 4,5) y para el acento del `h2` de "El problema" (2,61:1 donde pide 3). Se aplica y se anota: ya son **tres excepciones autorizadas**, todas impresas en cada `npm run contrast` con la alternativa que sí cumple al lado. Ninguna se añade sin preguntar |
| 84  | **El titular del hero llega a 84px moviendo la columna, no agrandando la caja** | El campo claro acaba en el 39% y ahí no hay más sitio. Lo que da margen es **arrancar la columna en 3vw en vez de 5vw**: con eso el titular pasa de 80 a 84px y sigue terminando en el 39%. Sube a la vez el ancho de la caja (36vw) y la pendiente (4,4vw), que van atados — pendiente sin caja es una línea partida a 1280 |
| 85  | **La malla baja de intensidad y las tarjetas dejan de ser translúcidas** | El usuario dijo que el fondo se confundía con la información. Enlaces de la malla al 0,09 y puntos al 0,13 (iban a 0,16 y 0,22), y la tarjeta gris pasa de `bg-paper-50/60` a `paper-50` opaco con borde y sombra: **un fondo animado bajo un panel semitransparente se lee a través del texto**, que es justo lo que un fondo no puede hacer |
| 86  | **"Cómo trabajamos" pasa a tener arte de fondo, con velo medido**        | Imagen del usuario en `public/brand/process-bg.png`. **Su píxel más oscuro es `#BAA3A0` (0,392 de luminancia)**, donde el cuerpo en `ink-500` daría 2,33:1. Se le pone un velo blanco al **65%** —suelo `#E7DFDE`— y el texto secundario de esa sección pasa a `ink-900/80`: con el velo, `ink-500` sigue en 4,20 y necesita 4,5, mientras que `ink-900/80` llega a 7,41. Ambos números viven en `scripts/contrast.mjs` como el pseudo-token `process-bg`. El velo no es estética: sin él esa sección no cumple |
| 87  | **El segundo botón del hero lleva a los casos, no a los módulos**        | Los módulos ya no forman parte de lo que cuenta la home, así que "Ver los módulos" apuntaba fuera de la conversación. Ahora es **"Ver casos reales" → `#casos`**, y el hero se queda con dos botones que van a los dos únicos sitios a los que tiene sentido mandar a alguien: WhatsApp y los casos |
| 88  | **"Casos de uso" cambia de tema a implementaciones reales, y admite que no hay** | Pedido del usuario. Antes eran seis tipos de negocio; ahora la sección promete clientes reales, y esa promesa no se puede cumplir a medias: en vez de categorías disfrazadas de clientes hay un **estado vacío que dice por qué está vacío**. El título pasa a "Casos reales, no ejemplos inventados" y no a "Negocios que ya trabajan con nexora-pos", que con el bloque vacío justo debajo se leería como una afirmación sobre clientes que no tenemos (§7). `TODO(guti)` para reemplazarlo cuando haya uno con permiso |
| 89  | **`SectionHeading`: un solo sitio para el encabezado de las secciones**  | Pedido del usuario: que "Cómo trabajamos" y "Casos reales" se vean como "El problema" — mismo tamaño y con parte subrayada. En vez de copiar el marcado por tercera vez se extrae a `components/sections/section-heading.tsx`, y con eso **la excepción de contraste del naranja brillante vive en un único archivo** en vez de propagarse por copia. La partición del título sigue en `content/`, y el nav pasa a decir "Casos reales" |
| 90  | **Los cuatro pasos suben un escalón, y solo uno**                        | Pedido del usuario: más notorios pero "tampoco tanto". La ficha del número pasa de 48 a **56px** con el dígito en `text-h2` (40px), y la descripción de `text-body` a `text-lead` (22px). **El título del paso se queda en `h3`**: a `h2` se parte en tres líneas dentro de una columna de 282px, que es más grande y peor. El filete de la línea de tiempo se mueve de `left-6` a `left-7` para seguir cruzando el centro de la ficha |
| 91  | La factura del cliente se imprime desde un iframe aparte, y el ancho lo pone el driver           | Imprimir la página obligaba a esconder la aplicación con `@media print`, y eso ya había sacado el recibo en hoja carta una vez y en blanco otra. Un documento con solo el ticket adentro no tiene entorno que se cuele en el papel. Y el ancho escrito a mano (78,5 mm) hacía maquetar sobre un papel que puede no ser el que la impresora tiene puesto. **Vive en el repo de Papas El Labrador**, no aquí |

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
| `Hero (3).png`           | `public/brand/hero-mockup.png`                                      | Imagen de producto del hero (decisión 33), 1717×916, servida con `next/image`. Reemplazó al `DashboardMockup` React/SVG, que se borró por quedar sin uso |

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

**0. `npm run contrast` mide tokens, no composiciones — y por eso no vio una etiqueta invisible.**
El login del portal se renderizó con las etiquetas "Correo" y "Contraseña" **sin verse**: solo
aparecía el asterisco rojo. `Field` traía `text-ink-900` fijo para la etiqueta, y el portal va
sobre `bg-ink-900`. Texto de la marca sobre fondo de la marca, los dos tokens autorizados, y aun
así ilegible: `ink-900` sobre `ink-900` da 1:1.

El script de contraste no podía atraparlo porque compara pares que alguien le declara, no lo que
de verdad quedó compuesto en la pantalla. **Lo atrapó abrir la página.**

`Field` ahora tiene `inverse` para fondos oscuros (etiqueta blanca, asterisco y errores en
`brand-300`, que da 9.48:1 sobre `ink-900`). La lección: un primitivo con un color fijo solo sirve
para el fondo que su autor tenía en la cabeza. **Mira la pantalla, no solo el número.**

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

**21. Texto sobre una imagen no lo audita la paleta.**
`scripts/contrast.mjs` compara tokens contra tokens, y el hero puso texto encima de píxeles que
van de crema casi blanco a negro puro. La paleta seguía dando 26/26 mientras el cuerpo del hero
iba camino de 4.26:1. Lo que se hizo: muestrear la imagen en una rejilla 10×8 con `sharp` para
saber dónde es segura, fijar el peor caso con un velo (`bg-hero-scrim`), meter ese peor caso en
la paleta como pseudo-token, y **comprobarlo en el navegador** dibujando la imagen y el degradado
en un `<canvas>` con la geometría real de `object-cover` y leyendo el píxel más oscuro bajo cada
bloque de texto. Los números del canvas coincidieron con el modelo (3.08 / 16.74 / 8.76). Si
pones texto sobre una imagen, mide la imagen — la paleta no te va a avisar.

**22. `ink-500` no sirve sobre una imagen velada.**
Está calibrado contra superficies planas: sobre el peor caso del scrim (`#EDEDED`) da **4.26:1** y
falla. En el hero el cuerpo va en `ink-900/80` (7.98:1). La jerarquía se consigue con tamaño y
peso, no bajando el color.


**23. Una etiqueta `sr-only` dentro de un envoltorio animado puede dejar el enlace sin nombre.**
`RandomLetterSwap` marcaba las letras como `aria-hidden` y ponía el nombre real en un `sr-only`
al lado. Resultado: los cuatro enlaces del nav salieron en el árbol de accesibilidad **sin
nombre ninguno**. No un nombre feo — vacío. Lo correcto es que un componente así sea
presentacional entero y que el `aria-label` lo ponga el elemento interactivo. **Compruébalo en
el árbol de accesibilidad, no con `textContent`**: `textContent` decía "MMóódduulloossMódulos",
que parecía suficiente y no lo era. Cubierto en `components/layout/nav.test.tsx`.

**24. En un panel que no compone, las transiciones CSS no avanzan nunca.**
`a.matches(':hover')` daba `true` y `getComputedStyle(a).color` seguía devolviendo el gris de
reposo, con la regla `hover:text-brand-700` correctamente generada. No era un fallo: con
`transition-colors 200ms` y el panel sin componer, el color se queda congelado en el valor
inicial para siempre. Para medir un estado con transición, ponle `style.transition='none'`
antes de leer. Es pariente de la trampa 8.

**25. El número de `next build` deja fuera el chunk del layout.**
Después de meter Framer Motion en el nav, la tabla seguía diciendo **111 kB** para `/`. Framer
estaba en el chunk del layout de marketing, que la tabla no le atribuye a la ruta. Lo real,
sumando los `<script>` de la página servida y descontando los polyfills (que un navegador
moderno no baja, porque van con `noModule`): **153 kB**, de los cuales 29 kB son Framer. Si
metes una dependencia en el layout, mide en el cable, no en la tabla.

---

**27. Los tests fallan en aspa cuando la máquina está cargada.**
Con `next build` o el servidor de desarrollo corriendo a la vez, Vitest empieza a soltar
`Test timed out in 5000ms` en archivos **distintos en cada pasada** — nav, botones, formulario,
`Reveal`. No es una regresión: el conjunto que falla cambia, que es justo lo que no hace un
fallo de verdad. Repite en limpio, o en serie:
`npx vitest run --pool=forks --poolOptions.forks.singleFork=true --testTimeout=15000`.

**26. `npm run build` con el servidor de desarrollo levantado deja el `dev` inservible.**
Los dos escriben en `.next`. El build de producción reemplaza los chunks que el servidor de
desarrollo tiene abiertos y, a partir de ahí, cada petición muere con
`Cannot find module './331.js'` y responde **500** — sin ningún error en el código. Pasó al
cerrar el hero: el sitio dejó de verse en `localhost:3000` sin haber tocado nada.
**Antes de correr el build, para el `dev`**; si ya pasó, `rm -rf .next` y vuelve a arrancarlo.

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
| 2026-08-26 | Hero: imagen de producto en vez del `DashboardMockup` React/SVG (excepción autorizada, decisión 33), y token `brand-600` para el acento "Nuestro software." en naranja más brillante que sigue en AA (decisión 34) | typecheck · lint · test (71/71) · contrast (26/26) · build (home sigue en 111 kB) en verde |
| 2026-08-26 | Hero a sangre completa con el texto encima y `bg-hero-scrim` (decisiones 35-37). Contraste sobre la imagen medido en el navegador muestreando los píxeles compuestos reales a 1280/1440/1920: acento 3.08:1, lead 16.74:1, cuerpo 8.76:1 | typecheck · lint · test (71/71) · contrast (29/29) · build (home sigue en 111 kB) en verde |
| 2026-08-26 | `framer-motion@13.1.1` reinstalado a petición expresa. Nada lo importa todavía, así que no pesa en el bundle. **Pendiente decidir para qué se usa**: en cuanto la home importe un componente suyo, entra entero y hay que medir contra el techo de ~120 kB | build en verde, home sigue en **111 kB** |
| 2026-08-26 | Hero exactamente a una pantalla y columna al 36% (decisiones 38-39); `RandomLetterSwap` en el nav con Framer (40, 42); Plus Jakarta Sans salvo el wordmark (41); claim con "Tu negocio." subrayado, cuerpo justificado, CTA a "Agendar una cita". **Encontrado y corregido: los enlaces del nav quedaron sin nombre accesible** (trampa 23) | typecheck · lint · test (73/73, +2) · contrast (30/30) · build en verde. Encaje exacto medido a 1920×1080, 1280×800 y 375×812. **JS real en el cable: 153 kB, por encima del techo de ~120 kB** — 29 kB son Framer |
| 2026-08-27 | Pasos de "Cómo trabajamos" un escalón más grandes, con el filete recentrado (90) | typecheck · lint · test (76/76) · contrast (32/32 + 3 excepciones) · build en verde. Cuatro columnas iguales a 1280 y 1440, sin desplazamiento horizontal a 320px |
| 2026-08-27 | Encabezados de sección unificados en `SectionHeading`, con acento subrayado en naranja, y nav renombrado a "Casos reales" (89) | typecheck · lint · test (76/76) · contrast (32/32 + 3 excepciones) · build en verde |
| 2026-08-27 | Segundo botón del hero a `#casos` y sección de casos convertida en implementaciones reales con estado vacío honesto (87, 88) | typecheck · lint · test (76/76, en serie) · contrast (32/32 + 3 excepciones) · build en verde |
| 2026-08-27 | Arte de fondo en "Cómo trabajamos" con velo al 65% y cuerpo a `ink-900/80` (86) | typecheck · lint · test (76/76) · contrast (32/32 + 3 excepciones) · build en verde |
| 2026-08-27 | Titular del hero a 84px, tres excepciones más de contraste en `brand-500`, malla más tenue y tarjetas opacas, texto de las tarjetas a 22px, CTA sin la línea de apoyo y más aire entre secciones (83-85) | typecheck · lint · test (76/76) · contrast (30/30 + 3 excepciones) · build en verde, home 113 kB |
| 2026-08-27 | Iconos borrados del plate y titular del hero a 80px (78); eyebrows naranjas y más grandes (79); "El problema" sin imagen y con la comparación jerarquizada (80); malla solo ahí (81); franja de cierre como sección de contacto, enlazada desde el nav (82) | typecheck · lint · test (76/76) · contrast (31/31 + 1 excepción) · build en verde. Claim a una línea por frase y encaje exacto a una pantalla en 1920×945, 1440×900, 1280×720 y 375×812 |
| 2026-08-27 | Malla de constelación de fondo en las tres secciones, diferida para no pasarse del presupuesto (74, 75); nav en negro y más angosto (76); "Casos de uso" vaciada (77) | typecheck · lint · test (76/76) · contrast (30/30 + 1 excepción) · build en verde, home en **113 kB**. Sin desplazamiento horizontal a 320px |
| 2026-08-27 | Plate del hero sin datos y tipografía del hero recalibrada (69, 70); WhatsApp como destino único de "Agendar una cita" (71); vuelve la franja de cierre y CTA al final de cada sección (72); nav de borde a borde (73) | typecheck · lint · test (75/75) · contrast (30/30 + 1 excepción) · build en verde. Encaje exacto a una pantalla en 1920×945, 1440×900, 1280×720 y 375×812; claim a una línea por frase desde 1280 |
| 2026-08-27 | Home recortada a cinco bloques y nav convertido en anclas de la propia página (66-68); naranja de la barra revertido a `brand-700` | typecheck · lint · test (75/75) · contrast (30/30 + 1 excepción) · build en verde. Las tres anclas existen y aterrizan a 88px del borde, bajo el nav; el menú móvil cierra al tocar una |
| 2026-08-27 | Barra de confianza a cinco datos, gris y a todo el ancho, con el fade y el velo del componente de referencia (63); anotado el `calc()` inválido de Tailwind que colapsaba la fila (64) | typecheck · lint · test (75/75) · contrast (29/29 + 1 excepción) · build en verde. 2/2/1 a 320 y 375, 3/2 a 768, cinco en fila desde 1024 |
| 2026-08-27 | Acento del claim a `brand-500` por decisión del usuario, con lista de excepciones autorizadas en el auditor (62) | typecheck · lint · test (75/75) · contrast (29/29 + 1 excepción impresa) · build en verde |
| 2026-08-27 | Hero recolocado: imagen al ancho completo y anclada arriba, columna de copy medida contra la impresora, y desvanecido inferior con máscara CSS (57 corregida, 60, 61) | typecheck · lint · test (75/75) · contrast (30/30) · build en verde. Estable de 1280×720 a 2560×1080 y en ventanas altas: texto siempre al 30,4%, equipos al 34,4%, monitor entero, cero contenido cortado |
| 2026-08-27 | Hero sobre el plate nuevo sin texto, ensanchado a 2.73:1 para que el equipo no se recorte (57); velo eliminado y contraste pagado con el color del texto (58); altura del hero de fija a mínima tras encontrar que recortaba el copy en 1280×720 (59) | typecheck · lint · test (75/75) · contrast (30/30) · build en verde. Recorte vertical 0 y cero contenido cortado en 1280×720, 1440×780, 1920×945, 1920×1080, 375×812 y 320×720 |
| 2026-08-27 | Hero pegado al borde izquierdo sobre xl (54); nav de escritorio movido a xl tras encontrar 56px de desbordamiento a 1024 (55); "El problema" con la foto recortada del arte y el texto intacto (56) | typecheck · lint · test (75/75) · contrast (30/30) · build en verde. Columna del hero al 5%-35% del viewport; acento 3.13:1 y cuerpo 8.42:1 medidos sobre los píxeles compuestos; cero desbordamiento a 1024, 1279, 1280 y 320 |
| 2026-08-27 | "El problema" rehecho: dos tarjetas con cabecera, filete entre filas, marca de veredicto y badge "VS" en la costura (52, 53). Trampa 26 anotada: `next build` con el `dev` levantado deja el servidor de desarrollo en 500 | typecheck · lint · test (75/75, +2) · contrast (30/30) · build en verde. Sin solapes del badge a 1280; oculto y sin desplazamiento horizontal a 320px |
| 2026-08-27 | Nav a todo el ancho con `--text-nav` y botones `md` (48), altura del nav como token (49); hero con el claim a tres líneas y CTA secundario en placa blanca (50, 51) | typecheck · lint · test (73/73) · contrast (30/30) · build en verde. Nav + hero = exactamente el viewport a 1920×1080, 1280×800 y 375×812. Contraste del acento medido sobre los píxeles compuestos: **3.12:1** a 1920 y **3.13:1** a 1280 |
| 2026-08-27 | Sexto pilar "Escalable" y copy nuevo de "El problema" (46, 47); nav rehecho como barra flotante siguiendo el arte (48) | typecheck · lint · test (73/73) · contrast (30/30) · build en verde. Verificado en el navegador: activo en `brand-700` 44px, estado con scroll translúcido + desenfoque, cero desplazamiento horizontal a 320px y disparador móvil de 44×44 |
| 2026-08-27 | Efecto del nav reescrito en CSS puro y `framer-motion` desinstalado (43): home de 153 a **124 kB**. Fuente afinada a **Figtree** midiendo el arte de referencia (44). `paper-50` a `#EDEDED` y `ink-500` a `#626976` (45) | typecheck · lint · test (73/73) · contrast (30/30) · build en verde. JS real en el cable: **124 kB** |
| 2026-08-31 | Factura de El Labrador: impresión desde un iframe aparte, ancho a cargo del driver, letra a 13 px/600 y pie `www.nexora-pos.online`. **Cambio hecho en el repo del cliente**; aquí solo documentación | En Papas El Labrador: typecheck · lint · test (659/659) · build en verde, y comprobado en el navegador. Aquí: sin cambios de código — `sync-tenant-app.mjs` sigue bloqueado sin Supabase |
