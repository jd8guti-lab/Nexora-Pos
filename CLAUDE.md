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
lucide-react · Framer Motion · React Hook Form + Zod · Vitest + Testing Library · Vercel.

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
  la tercera en `brand-500`.
- Cierre: `Hecho para ti. Pensado para crecer contigo.`

### Color

| Token Tailwind | Hex       | Uso                                                              |
| -------------- | --------- | ---------------------------------------------------------------- |
| `brand-500`    | `#FF7A00` | Acento: **fondos**, degradados, subrayados, íconos decorativos   |
| `brand-300`    | `#FFB347` | Degradados, hovers, acentos suaves                               |
| `brand-700`    | `#BD5A00` | **El único naranja que puede llevar texto** sobre fondo claro    |
| `ink-900`      | `#1A1D23` | Texto principal, fondos oscuros, footer, **texto sobre naranja** |
| `ink-500`      | `#69707E` | Texto secundario, bordes                                         |
| `paper-50`     | `#F2F4F7` | Fondos de sección, tarjetas                                      |

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
| `brand-500` como color de texto sobre `paper-50` | 2.37:1 | `text-brand-700` (4.12:1) |

Por eso la franja naranja de cierre y el botón primario llevan texto `ink-900`, no blanco.
El anillo de foco es `ink-900`, y solo se vuelve blanco sobre `ink-900`.
Los íconos en `brand-500` **sí** se quedan: siempre van junto a su etiqueta de texto, y
WCAG 1.4.11 exime lo decorativo. Un ícono que comunique algo por sí solo va en `brand-700`.

### Tipografía

**Poppins** vía `next/font/google`. Bold 700 títulos · SemiBold 600 subtítulos y botones ·
Medium 500 · Regular 400 cuerpo · Light 300. Etiquetas y descriptores en mayúscula con
`tracking-[0.2em]`. Escala tipográfica fluida con `clamp()`.

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

## 4. Los 7 módulos y los 5 pilares

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

---

## 6. Calidad — no negociable

**Accesibilidad.** HTML semántico. Un solo `h1` por página. Jerarquía de headings sin saltos.
`alt` descriptivo. Foco visible. Navegación completa con teclado. ARIA correcto en acordeón y
menú móvil. `prefers-reduced-motion` respetado.

**Responsive.** Móvil primero. Breakpoints 640/768/1024/1280. Área táctil ≥44px. Cero scroll
horizontal a 320px.

**Rendimiento.** Lighthouse ≥95 en las cuatro categorías. `next/image` siempre. `next/font` sin
FOUT. JS de la home por debajo de ~120KB gzip.

**SEO.** Metadata API por página, Open Graph + Twitter card, `sitemap.ts`, `robots.ts`, JSON-LD
(`Organization` + `SoftwareApplication`), canónicas.

**Animación.** Sobria y funcional: entradas suaves, hovers, nada más. Sin carruseles automáticos,
sin parallax, sin scroll secuestrado.

---

## 7. Honestidad del contenido

**No se inventan datos de la empresa.** Ni cifras, ni clientes, ni testimonios, ni años de
experiencia, ni número de instalaciones, ni logos de terceros.

Donde falte un dato real: `TODO(guti):` visible en `content/` y una línea en `docs/ESTADO.md`.
Un sitio con un placeholder honesto es mejor que uno con una mentira bonita.

Lo mismo para los mockups del producto: se construyen como componentes React/SVG con los colores
de la marca. **Nada de fotos de stock ni capturas falsas.**

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
- **No** se instala Supabase, NextAuth ni ORM alguno todavía.
