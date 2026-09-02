# CLAUDE.md — nexora-pos · sitio web

Fuente de verdad de **cómo debe ser** este proyecto. Si el código y este archivo no coinciden,
el que está mal es el código — o este archivo está desactualizado y hay que arreglarlo en el
mismo commit.

---

## 0. Protocolo de sesión — léelo siempre primero

**Al abrir una sesión, en este orden:**

1. `CLAUDE.md` (este archivo) — las reglas.
2. `docs/ESTADO.md` — dónde quedamos, qué decisiones se tomaron y por qué.
3. `README.md` — cómo se levanta y se verifica.

No preguntes "¿en qué vamos?": está en `docs/ESTADO.md`.

**Al cerrar cada tarea, antes de decir que terminaste**, en el mismo commit:

| Archivo          | Se actualiza cuando                                                                                    |
| ---------------- | ------------------------------------------------------------------------------------------------------ |
| `docs/ESTADO.md` | **Siempre.** Mueve lo hecho a "Hecho", ajusta "En curso" y "Siguiente", registra decisiones y trampas. |
| `README.md`      | Cambió cómo se levanta/prueba, o el mapa de páginas.                                                   |
| `CLAUDE.md`      | Cambió una regla, una convención o la arquitectura.                                                    |

Una tarea sin documentación actualizada **está incompleta**. Esto existe para poder cerrar la
sesión cuando el contexto se llena y que la siguiente arranque sin perder nada.

**Terminado = los cinco en verde:**

```bash
npm run typecheck && npm run lint && npm run test && npm run contrast && npm run build
```

Nunca digas "listo" sin haberlos corrido y visto la salida.

---

## 1. Qué es esto

El **sitio web público** de nexora-pos: software POS a medida, personalizable y modular, vendido
a varias empresas cliente. Es la cara comercial de la marca.

**Está dentro del alcance:** páginas de marketing, contenido, formulario de contacto, SEO.
**Está fuera del alcance (por ahora):** autenticación, base de datos, multi-tenancy, dashboards,
cualquier lógica del POS. El portal de clientes se construye después; aquí solo se deja el
enganche listo.

---

## 2. Stack

Next.js 15 (App Router) · TypeScript `strict` · **Tailwind CSS v4** · shadcn/ui + Radix ·
lucide-react · React Hook Form + Zod · Vitest + Testing Library · Vercel.

**Sin Framer Motion.** Se instaló el 2026-08-26 para el efecto de letras del nav y se desinstaló
el mismo día: costaba **29 kB gzip en todas las páginas** (el nav está en todas) y dejaba la home
en 153 kB, muy por encima del techo de ~120 kB. El efecto quedó en CSS puro —
`components/ui/RandomLetterSwap`, componente de **servidor**, con las reglas en `globals.css` —
y es visualmente el mismo a 0 kB. La home volvió a 124 kB. Decisiones 21, 42 y 43 en
`docs/ESTADO.md`: **es la tercera vez que una librería de animación se cae por el presupuesto.**

**Cuidado con el número que reporta `next build`.** Dice 111 kB para `/` pero no atribuye a la
ruta el chunk del layout de marketing. Para saber lo que de verdad baja el visitante hay que
sumar los `<script>` de la página servida — `docs/ESTADO.md` → Trampa 25.

Los tokens viven en `app/globals.css`, en el bloque `@theme` — **no hay `tailwind.config.ts`**;
esa es la forma de Tailwind v3. La versión de Next está fijada a mano: `create-next-app`
instala 16.

**No se agrega** ninguna dependencia que no se use en la fase actual. Nada de MUI, Chakra,
Bootstrap, jQuery ni plantillas compradas. Sin modo oscuro: la marca es clara.

---

## 3. Identidad de marca

Es un manual, no una sugerencia.

### Nombre y textos fijos

- Nombre: **`nexora-pos`** — siempre en minúscula, con guion.
- Descriptor: `SOFTWARE A MEDIDA · PERSONALIZABLE · ESCALABLE`
- Claim: `Tu negocio. Tu forma. Nuestro software.` — las dos primeras frases en `ink-900`,
  la tercera en `brand-500` — **la única excepción autorizada** a la regla de abajo: no pasa AA
  (2,0:1 sobre el fondo del hero contra el 3:1 que pide) y se usa igual, por decisión expresa
  del 2026-08-27, para que coincida con el naranja del botón. Está listada en
  `scripts/contrast.mjs` bajo "excepciones autorizadas", que la reimprime en cada ejecución.
- Cierre: `Hecho para ti. Pensado para crecer contigo.`

### Color

| Token Tailwind | Hex       | Uso                                                              |
| -------------- | --------- | ---------------------------------------------------------------- |
| `brand-500`    | `#FF7A00` | Acento: **fondos**, degradados, subrayados, íconos decorativos   |
| `brand-300`    | `#FFB347` | Degradados, hovers, acentos suaves                               |
| `brand-700`    | `#BD5A00` | El naranja de texto normal sobre fondo claro (4.54:1)            |
| `brand-600`    | `#E86F00` | Naranja de texto **solo para texto grande** (≥24px o ≥18.66px bold). 3.13:1 **sobre blanco**: pasa el umbral AA de texto grande (3:1), no el de texto normal (4.5:1). Hoy no se usa: sobre el plate del hero, su único sitio, se queda en 2.16:1 |
| `ink-900`      | `#1A1D23` | Texto principal, fondos oscuros, footer, **texto sobre naranja** |
| `ink-500`      | `#626976` | Texto secundario, bordes (oscurecido el 2026-08-27 para permitir el gris más oscuro) |
| `paper-50`     | `#EDEDED` | Fondos de sección, tarjetas. Gris neutro, no azulado |

Reglas duras:

- El naranja es **acento**, no fondo mayoritario. Máximo dos franjas naranjas completas por página.
  Eso está codificado: `Section` solo expone `white | paper | ink | brand`.
- Los degradados van de `#FF7A00` a `#FFB347`, en diagonal.
- **Nunca** un hex literal dentro de un `.tsx`. Solo tokens (`bg-brand-500`, `text-brand-700`).
- Todo texto pasa **WCAG AA**. Esto no es aspiracional: `npm run contrast` lo verifica y
  falla el build de la fase si algo se rompe.

**Contraste — medido, no supuesto.** El naranja de la marca engaña: parece vibrante y tiene
menos contraste del que aparenta. Cuatro combinaciones están **prohibidas**:

| Prohibido                                        | Ratio  | Usa en su lugar           |
| ------------------------------------------------ | ------ | ------------------------- |
| Blanco sobre `brand-500`                         | 2.61:1 | `text-ink-900` (6.46:1)   |
| Blanco sobre `brand-300`                         | 1.78:1 | `text-ink-900` (9.48:1)   |
| `brand-500` como color de texto sobre blanco     | 2.61:1 | `text-brand-700` (4.54:1) |
| `brand-500` como color de texto sobre `paper-50` | 2.23:1 | `text-brand-700` (3.88:1) |

**Hay tres excepciones autorizadas**, todas en `brand-500` y todas por decisión expresa del
usuario, que vio la medida en cada caso y pidió el naranja brillante igual:

| Dónde                                   | Mide   | Pide   | La que sí cumple    |
| --------------------------------------- | ------ | ------ | ------------------- |
| Acento del `h1` del hero, sobre la imagen | 2,0:1  | 3:1    | `brand-700`         |
| Eyebrow de sección, 13px sobre blanco   | 2,61:1 | 4,5:1  | `brand-700` (4,54)  |
| Acento del `h2` de "El problema"        | 2,61:1 | 3:1    | `brand-600` (3,13)  |

Viven en la lista de excepciones de `scripts/contrast.mjs`, que las imprime en cada ejecución en
vez de darlas por buenas. (Hubo una cuarta —los valores de la barra de confianza— revertida el
mismo día porque no gustó cómo se veía.) **Añadir otra no es decisión de quien programa**: se
pregunta, se enseña el número, y solo entonces.

Por eso la franja naranja de cierre y el botón primario llevan texto `ink-900`, no blanco.
El anillo de foco es `ink-900`, y solo se vuelve blanco sobre `ink-900`.
`brand-600` (`#E86F00`) es más brillante y da 3.13:1 **sobre blanco**, que es su mejor caso:
pasa el umbral de **texto grande** (≥24px o ≥18.66px bold, que pide 3:1) pero no el de texto
normal (4.5:1), y en cuanto el fondo se entibia deja de pasar. Hoy no se usa en ninguna parte
— el acento del `h1` del hero, que era su único sitio, pasó a `brand-700`.

**Texto sobre una imagen: la paleta no te cubre.** El hero pone copy encima de la imagen de
producto, y ahí el fondo son píxeles que van de crema casi blanco a negro puro. La regla:

1. Mide la imagen antes de maquetar — píxel a píxel con `sharp`, no a ojo — para saber qué
   zonas son seguras y hasta dónde puede llegar la columna de texto.
2. Si el peor caso no da, hay dos salidas: **cambiar el color del texto** o **velar la imagen**.
   Velar tiñe el arte de blanco, así que es la segunda opción, no la primera. Hoy no hay velo:
   el eyebrow y el lead van en `ink-900` y el cuerpo en `ink-900/80`. El acento del claim es
   la excepción autorizada de arriba y no pasa AA.
3. Mete ese peor caso en `scripts/contrast.mjs` como pseudo-token, para que quede auditado.
   Hoy son `hero-bg-min` (`#FDB870`) y `hero-bg-h1` (`#FBCEA9`).
4. Compruébalo en el navegador sobre los píxeles compuestos reales, no solo en el modelo. Y
   **mide la caja de las letras, no la del bloque**: un `span` a todo el ancho de la columna
   arrastra la medición sobre píxeles que el texto nunca toca, y te hace perseguir un fallo
   que no existe.

`ink-500` **no vale** sobre la imagen (3.23:1 contra el peor caso): usa `ink-900`.
Está contado en `docs/ESTADO.md` → Trampas 21 y 22.
Los íconos en `brand-500` **sí** se quedan: siempre van junto a su etiqueta de texto, y
WCAG 1.4.11 exime lo decorativo. Un ícono que comunique algo por sí solo va en `brand-700`.

### Tipografía

**Figtree** vía `next/font/google`, en `--font-sans`. Bold 700 títulos · SemiBold 600
subtítulos y botones · Medium 500 · Regular 400 cuerpo · Light 300. Etiquetas y descriptores en
mayúscula con `tracking-[0.2em]`. Escala tipográfica fluida con `clamp()`.

Sustituyó a Poppins el 2026-08-26 y se afinó a Figtree el 2026-08-27 midiendo el arte de referencia (decisiones 41 y 44). Es geométrica igual, así que la marca sigue
leyéndose moderna, pero tiene las contraformas más estrechas y la altura de x mayor, que es lo
que la sostiene en tamaños de cuerpo y en interfaz densa en vez de parecer tipografía de cartel.

**Poppins se queda, solo para el wordmark.** `LogoLockup` compone "nexora-pos" con tipografía
sobre fondo oscuro y sobre naranja porque no hay artwork para esos fondos; esa composición
sustituye al logotipo real, así que **no puede seguir a un cambio de fuente de cuerpo**. Vive en
el token `--font-wordmark` (clase `font-wordmark`) y carga un solo peso. Si algún día llegan los
SVG del logo, este token y esa carga desaparecen.

### Isotipo y assets

La "N" significa **conexión, flujo y crecimiento** → conexión, personalización, crecimiento.
Ese trío es el hilo narrativo de la sección "Quiénes somos".

Los assets viven en `public/brand/`. El manual de marca completo está en
`docs/brand/manual-de-marca.png` — **es la referencia visual de todo el sitio**; ábrelo antes de
diseñar cualquier sección. No se sirve desde `public/`.

**No hay versión del logo sobre fondo oscuro ni SVG vectoriales.** Mientras no existan: en fondos
oscuros usa el isotipo más el nombre como texto en Poppins con los tokens de marca. **Nunca
recolorees, recortes ni "recrees" el logotipo a ojo.**

### Voz

Español de Colombia, tuteo, directo, sin humo. Frases cortas. Prohibido: "sinergia",
"soluciones integrales", "transformación digital", "potenciamos", "revolucionar". Se habla de
trabajo real: inventario, caja, facturas, proveedores, cuadre del día. **Cero emojis.**

---

## 4. Los 7 módulos y los 6 pilares

Son la columna vertebral del contenido. No se inventan otros ni se renombran.

**Módulos:** Punto de venta · Inventario · Contabilidad · Reportes · Clientes · Proveedores · Usuarios.

**Pilares:**

| Pilar          | Frase                                              |
| -------------- | -------------------------------------------------- |
| A medida       | Se adapta a los procesos únicos de tu negocio.     |
| Personalizable | Configura módulos, campos, reportes y más.         |
| Modular        | Activa solo lo que necesitas, cuando lo necesitas. |
| Seguro         | Tu información siempre protegida.                  |
| Soporte real   | Estamos contigo en cada paso del camino.           |
| Escalable      | Crece sin límites. Tu sistema crece contigo.       |

---

## 5. Arquitectura

```
app/
  (marketing)/          layout con nav + footer
    page.tsx            home
    modulos/  casos/  precios/  contacto/
    legal/privacidad/  legal/terminos/
  (portal)/portal/      placeholder — aquí entra el portal después
  api/contacto/route.ts
  opengraph-image.tsx  sitemap.ts  robots.ts
components/
  ui/                   primitivos (button, card, badge, accordion…)
  layout/               Section, Container, Grid, Nav, Footer
  sections/             una carpeta o archivo por sección de la home
  brand/                Logo, Isotype, mockups del producto
content/                TODO el copy, tipado
lib/                    config.ts, utils.ts, seo.ts
public/brand/           logos normalizados
docs/                   ESTADO.md y demás
middleware.ts           vacío; aquí irá la resolución de tenant
```

**Regla de contenido:** ningún componente lleva copy hardcodeado. Textos, módulos, planes, FAQ y
casos viven en `content/*.ts` con tipos explícitos. Cambiar un texto no debe tocar JSX.

**Regla de diseño:** primero los primitivos y los tokens, después las secciones. Nada de valores
mágicos de espaciado, radio o sombra: todo sale de la escala de Tailwind.

**Encabezados:** usa siempre `components/ui/Heading`. Tiene `as` (el nivel semántico) separado de
`size` (lo grande que se ve), y es lo que impide que una sección se vuelva `h4` solo porque el
diseño la quiere pequeña. `Eyebrow` es una etiqueta, **nunca** un encabezado.

**La altura del nav es el token `--spacing-nav`.** El hero mide una pantalla menos el nav —
**como mínimo, no como altura fija**: fijarla recortaba el copy en ventanas bajas, y ninguna
regla de maquetación vale un texto cortado. El `scroll-padding-top` de los anclas también lo lee. Si cambias la barra, cambia el
token: escribir la altura a mano en el hero ya rompió el encaje una vez, en silencio.

**`/kitchen-sink`** muestra cada primitivo en cada variante sobre los cuatro fondos. Está en
`noindex` y no se enlaza. Si tocas un primitivo, míralo ahí antes de seguir.

---

## 6. Calidad — no negociable

**Accesibilidad.** HTML semántico. Un solo `h1` por página. Jerarquía de headings sin saltos.
`alt` descriptivo. Foco visible. Navegación completa con teclado. `prefers-reduced-motion`
respetado.

**Prefiere el elemento nativo antes que el componente.** La FAQ y la tabla de precios usan
`components/ui/Disclosure`, que es `<details>`/`<summary>`: abre sin JavaScript, el teclado y el
anuncio de expandido vienen de fábrica, y no hay ARIA que equivocar. Un `name` compartido da
apertura exclusiva. Sustituyó a un acordeón de Radix que costaba 19 KB. El único sitio donde sí
hace falta Radix es el menú móvil, por el atrapado de foco.

**Responsive.** Móvil primero. Breakpoints 640/768/1024/1280. Área táctil ≥44px. Cero scroll
horizontal a 320px.

**Rendimiento.** Lighthouse ≥95 en las cuatro categorías. `next/image` siempre. `next/font` sin
FOUT. **JS de la home por debajo de ~120KB gzip.**

Ese número no es decorativo: se ha roto dos veces, y las dos por una librería que entró al bundle
en cuanto la home usó un componente. Mira la salida de `next build` al cerrar cada fase, no al
final. Hoy la home va en 111 KB.

**Al medir con Lighthouse, mata primero cualquier `next start` anterior.** Si el puerto está
ocupado el nuevo servidor no arranca, Lighthouse mide el build viejo con los assets fallando, y
el resultado sale **más alto** porque no llega a cargar el JavaScript. Comprueba que el servidor
respondió y que el CSS da 200 antes de creerte una cifra.

**SEO.** Metadata API por página, Open Graph + Twitter card, `sitemap.ts`, `robots.ts`, JSON-LD
(`Organization` + `SoftwareApplication`), canónicas.

**Animación.** Sobria y funcional: entradas suaves, hovers, nada más. Sin carruseles automáticos,
sin parallax, sin scroll secuestrado.

Toda animación de entrada pasa por `components/motion/Reveal`, que es **componente de servidor**:
solo emite `data-reveal`. Un único `RevealObserver`, montado en el layout de marketing, los arma
todos con un solo `IntersectionObserver`. No conviertas `Reveal` en componente cliente — quince
fronteras de hidratación para el mismo efecto es justo lo que se quitó. **`Reveal` no vuelve a
Framer Motion**: costaba 52 KB y dejaba la home en 155 KB, por encima del techo. Que el paquete
esté instalado otra vez (§2) no cambia esto — para las entradas al hacer scroll, `Reveal` gana.

Y la regla que no se negocia: **el contenido nunca depende de JavaScript para poder leerse.**
El servidor renderiza todo visible; `Reveal` solo oculta *dentro de su propio efecto*, una línea
antes de enganchar el observador que va a revelarlo. Ocultar y revelar son el mismo camino de
código: si el JS no corre, no se oculta nada.

Si añades otra animación que oculte contenido, tiene que cumplir lo mismo. Y **el observador no
basta como única garantía** — en una página que no compone nunca dispara. Por eso hay además una
comprobación geométrica inmediata y un respaldo en `scroll`.

---

## 7. Honestidad del contenido

**No se inventan datos de la empresa.** Ni cifras, ni clientes, ni testimonios, ni años de
experiencia, ni número de instalaciones, ni logos de terceros.

Donde falte un dato real: `TODO(guti):` visible en `content/` y una línea en `docs/ESTADO.md`.
Un sitio con un placeholder honesto es mejor que uno con una mentira bonita.

Lo mismo para los mockups del producto: por defecto se construyen como componentes React/SVG con
los colores de la marca. **Nada de fotos de stock.**

**Excepción autorizada:** el mockup del hero (`public/brand/hero-mockup.png`) es una imagen de
producto con cifras de ejemplo, no datos reales de la empresa ni de un cliente. Se aceptó así
explícitamente — ver decisión 33 en `docs/ESTADO.md`. No es precedente para otros mockups: uno
nuevo sigue construyéndose como componente React/SVG salvo que se pida y documente lo contrario.

---

## 8. Convenciones

- Commits en español, imperativo, con prefijo: `feat:`, `fix:`, `docs:`, `refactor:`, `chore:`.
- Componentes en `PascalCase.tsx`; utilidades y contenido en `kebab-case.ts`.
- Todo exportado con nombre; `export default` solo donde Next lo exige.
- Sin `any`. Sin `@ts-ignore`. Sin `console.log` en el commit final.
- Textos visibles al usuario **en español**; código, nombres y comentarios **en inglés**.
- Clases combinadas siempre con `cn()` de `lib/utils.ts`. **Si añades un token con nombre
  propio** (`text-*`, `shadow-*`, `tracking-*`, `rounded-*`), decláralo también en el
  `extendTailwindMerge` de ese archivo: si no, `tailwind-merge` lo confunde con un color y se
  come clases en silencio. Está explicado en `docs/ESTADO.md` → Trampas pisadas.

---

## 9. Preparado para el portal, sin construirlo

- `NEXT_PUBLIC_PORTAL_URL` en `lib/config.ts`, por defecto `/portal`, para que el botón
  "Ingresar al portal" pueda apuntar a otro dominio el día que exista.
- `middleware.ts` creado y vacío, con el comentario de dónde irá la resolución de tenant.
- Grupos de rutas `(marketing)` y `(portal)` ya separados.
- **No** se instala NextAuth ni ORM alguno. Supabase sí entró (2026-08-30): `@supabase/ssr` y
  `@supabase/supabase-js`, con los clientes en `utils/supabase/` y la config en `lib/config.ts`.

**El portal ya lee datos reales** (2026-09-02). La regla que lo gobierna:

- Toda lectura del negocio pasa por `lib/dashboard.ts`. Ningún componente consulta Supabase
  directamente.
- **Cada consulta filtra por `tenant_id` aunque la RLS ya lo haga.** Es redundante a propósito:
  si una política se cae, el filtro explícito hace que se vea como cero filas y no como los datos
  de otro cliente.
- **El esquema real no está en este repo.** `backend/esquema-supabase.sql` solo tiene `tenants`,
  `profiles` y `business_config`; las tablas del negocio (`pedidos`, `lineas_pedido`, `productos`,
  `clientes`, `proveedores`, `compras`, `abonos`, `gastos`, `balances`…) llegaron por otro camino.
  Antes de escribir una consulta nueva, **enumera contra la base viva**, no contra el SQL del repo.
- No hay inventario en ese esquema: no existen saldos de producto ni mínimos de stock. Si una
  tarjeta necesita un número que la base no tiene, se cambia la tarjeta — no se inventa el número
  (§7).
