# PROMPT — Sitio web corporativo de nexora-pos

> Copia **todo** este archivo y pégalo como primer mensaje en una sesión nueva de Claude Code,
> abierta en `C:\Users\VICTUS\projects\Nexora-Pos`. Los archivos de marca ya están en la raíz
> (ver §3), junto con `CLAUDE.md`, `README.md` y `docs/ESTADO.md`.

---

## 0. Contexto

Soy desarrollador independiente. Construí un POS a medida para un cliente y ahora quiero
convertirlo en producto: **nexora-pos**, software de punto de venta a medida, personalizable y
modular, para varios clientes (cada uno una empresa distinta).

Necesito el **sitio web público** de la marca: la cara comercial que explica quiénes somos, qué
hace el software, para quién es y cómo contratarlo. Incluye un botón **"Ingresar al portal"** que
por ahora apunta a una ruta placeholder `/portal` — el portal multi-cliente lo construyo yo
después, así que el sitio tiene que quedar preparado para recibirlo sin reescribir nada.

**Alcance de este trabajo: solo el sitio público.** No construyas autenticación, base de datos,
multi-tenancy ni dashboards. Sí deja la arquitectura lista para que eso entre luego.

---

## 1. Stack (no lo cambies sin avisarme y explicar por qué)

| Pieza       | Elección                                                   | Motivo                                                                                  |
| ----------- | ---------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| Framework   | **Next.js 15 (App Router) + TypeScript `strict`**          | SSG para SEO real; luego el portal entra como grupo de rutas `(portal)` sin migrar nada |
| Estilos     | **Tailwind CSS** + tokens de marca en `tailwind.config.ts` | Consistencia con mis otros proyectos                                                    |
| Componentes | **shadcn/ui** (solo los que use de verdad) + Radix         | Accesibilidad sin reinventar                                                            |
| Iconos      | **lucide-react**                                           | Coincide con los íconos del manual de marca                                             |
| Animación   | **Framer Motion**, sobria                                  | Nada de carruseles ni parallax gratuitos                                                |
| Formularios | **React Hook Form + Zod**                                  | Validación tipada                                                                       |
| Fuente      | **Poppins** vía `next/font/google`                         | Es la tipografía de la marca                                                            |
| Deploy      | **Vercel**                                                 | Preparar `vercel.json` si hace falta, no desplegar tú                                   |
| Tests       | **Vitest + Testing Library**                               | Al menos los componentes con lógica                                                     |

**Prohibido:** librerías de UI pesadas (MUI, Chakra, Bootstrap), jQuery, plantillas compradas,
imágenes de stock incrustadas en base64, dependencias que no uses.

---

## 2. Identidad de marca — respétala al pie de la letra

**Nombre:** `nexora-pos` (siempre en minúscula, con guion; nunca "Nexora POS" ni "NEXORA-POS"
salvo dentro de una caja en versalitas donde el diseño lo pida).

**Descriptor:** `SOFTWARE A MEDIDA · PERSONALIZABLE · ESCALABLE`

**Claim:** `Tu negocio. Tu forma. Nuestro software.`
(las dos primeras frases en gris oscuro, la tercera en naranja).

### Color

```
--brand-500  #FF7A00   Naranja principal — energía, entusiasmo, innovación
--brand-300  #FFB347   Naranja claro — acentos, degradados, hovers
--ink-900    #1A1D23   Casi negro — texto principal, fondos oscuros
--ink-500    #6B7280   Gris — texto secundario, bordes
--paper-50   #F2F4F7   Gris claro — fondos de sección, tarjetas
--white      #FFFFFF
```

Reglas: el naranja es **acento**, no fondo mayoritario — úsalo en CTAs, íconos, subrayados y una
o dos franjas completas por página como mucho. Los degradados van de `#FF7A00` a `#FFB347`, en
diagonal. Todo texto tiene que pasar **WCAG AA**: naranja sobre blanco NO sirve para texto pequeño,
solo para texto grande (≥24px), íconos y fondos; para texto normal usa `ink-900` o `ink-500`.

### Tipografía

Poppins. Pesos: `700 Bold` (títulos), `600 SemiBold` (subtítulos, botones), `500 Medium`,
`400 Regular` (cuerpo), `300 Light`. Los descriptores y etiquetas van en mayúscula con
`letter-spacing` amplio (`tracking-[0.2em]`). Escala tipográfica fluida con `clamp()`.

### El isotipo

La "N" simboliza **conexión, flujo y crecimiento** → conexión, personalización, crecimiento.
Ese trío es el hilo narrativo del sitio; úsalo en la sección de "quiénes somos".

### Voz

Español de Colombia, tuteo, directo y sin humo. Frases cortas. Cero jerga de agencia
("sinergia", "soluciones integrales", "transformación digital"). Habla de trabajo real:
inventario, caja, facturas, proveedores, cuadre del día. Cero emojis.

---

## 3. Archivos de marca — ya están en la raíz del proyecto

En la raíz hay tres PNG. **Ábrelos y míralos antes de escribir una línea de código:**

| Archivo                  | Qué es                                                                                                                                                                                     |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `Identidad de marca.png` | **El manual de marca completo.** Logotipo, isotipo, versión horizontal, paleta con hex, tipografía, los 5 pilares, los 7 módulos y aplicaciones. Es la referencia visual de todo el sitio. |
| `Logo png.png`           | Logotipo principal (isotipo + "nexora-pos" + descriptor), fondo claro                                                                                                                      |
| `Isotipo.png`            | La "N" suelta                                                                                                                                                                              |

**Qué hacer con ellos:**

1. Muévelos a `public/brand/` con nombres normalizados sin espacios ni mayúsculas:
   `logo.png`, `isotype.png`, y el manual a `docs/brand/manual-de-marca.png` (es referencia,
   no un asset del sitio — no lo sirvas desde `public/`).
2. Genera desde `Isotipo.png`: `favicon.ico`, `icon.png` (512×512) y `apple-icon.png` (180×180)
   con las convenciones de archivo de Next.js App Router.
3. Anota en `docs/ESTADO.md` el mapeo de nombres viejos → nuevos.

**Lo que NO tengo y necesito que me pidas** (no lo inventes, no lo "recrees" a ojo):

- Versión del logo **sobre fondo oscuro** (para el footer y la nav translúcida). Mientras no la
  tenga, usa el isotipo + el nombre como texto en Poppins con los tokens de marca — se ve limpio
  y no falsifica el logo.
- **SVG vectoriales** del logo y del isotipo. Los PNG pesan 2MB y no escalan. Si al terminar el
  sitio siguen siendo PNG, déjalo anotado como pendiente en `docs/ESTADO.md`.

Para mockups de producto (pantallas del POS en un monitor/tablet/celular): el manual trae un
render de referencia, pero **no lo recortes ni uses fotos de stock**. Construye las pantallas como
componentes React/SVG simplificados —tarjetas de resumen, una gráfica, una grilla de productos—
con los colores de la marca. Se ven mejor, pesan menos y se adaptan solas al responsive.

Para mockups de producto (pantallas del POS en un monitor/tablet/celular): si no te doy capturas,
**no uses fotos de stock**. Construye las pantallas como componentes React/SVG simplificados
—tarjetas de resumen, una gráfica, una grilla de productos— con los colores de la marca. Se ven
mejor y pesan menos.

---

## 4. Mapa del sitio

Una **home larga de una sola página** con anclas, más páginas secundarias reales:

```
/                  Home (todas las secciones de abajo)
/modulos           Detalle de los 7 módulos, uno por bloque
/casos             Casos de uso por tipo de negocio
/precios           Planes y qué incluye la personalización
/contacto          Formulario + WhatsApp + correo
/portal            Placeholder: "Portal de clientes" + login próximamente
/legal/privacidad  Política de tratamiento de datos (Ley 1581 de 2012, Colombia)
/legal/terminos    Términos de servicio
```

### Secciones de la home, en orden

1. **Nav** — sticky, translúcida al hacer scroll. Logo a la izquierda; enlaces Módulos, Casos,
   Precios, Contacto; a la derecha botón secundario **"Ingresar al portal"** y botón primario
   naranja **"Agendar demo"**. Menú hamburguesa full-screen en móvil.

2. **Hero** — Titular: **"Tu negocio. Tu forma. Nuestro software."** Bajada: un POS que se
   adapta a cómo tú ya trabajas, no al revés. Dos CTAs. A la derecha, el mockup del dashboard.
   Fondo blanco o `paper-50` con un degradado naranja muy sutil arriba a la derecha. Sin video.

3. **Barra de confianza** — 4 métricas o sellos (ej. "100% personalizable", "Datos cifrados",
   "Soporte real", "Funciona sin internet" si aplica). Deja los números como constantes en
   `content/site.ts` con un `TODO` para que yo ponga los reales — **no inventes cifras de
   clientes ni testimonios**.

4. **El problema** — dos columnas: "Lo que pasa con un POS enlatado" vs "Lo que pasa con
   nexora-pos". Honesto, concreto, sin caricaturizar a la competencia.

5. **Lo que nos define** — las 5 tarjetas del manual de marca, con su ícono lucide:
   - **A medida** — Se adapta a los procesos únicos de tu negocio.
   - **Personalizable** — Configura módulos, campos, reportes y más.
   - **Modular** — Activa solo lo que necesitas, cuando lo necesitas.
   - **Seguro** — Tu información siempre protegida.
   - **Soporte real** — Estamos contigo en cada paso del camino.

6. **Módulos** — los 7, con su ícono: Punto de venta, Inventario, Contabilidad, Reportes,
   Clientes, Proveedores, Usuarios. Grid de tarjetas; cada una enlaza a su ancla en `/modulos`.
   En escritorio, tarjetas con hover de elevación suave; en móvil, grid de 2 columnas.

7. **Cómo trabajamos** — 4 pasos numerados: _Entendemos tu operación → Configuramos tu sistema →
   Migramos tus datos → Acompañamos la puesta en marcha_. Timeline horizontal en escritorio,
   vertical en móvil.

8. **Quiénes somos** — el significado de la "N": conexión, flujo, crecimiento. Aquí va el
   isotipo grande. Texto en primera persona del plural, honesto sobre el tamaño del equipo.

9. **Casos de uso** — 4–6 tipos de negocio (tienda de barrio, distribuidora, restaurante,
   ferretería, comercializadora agrícola, papelería). Cada uno: qué le duele y qué módulos usa.

10. **Precios** — 3 planes (Esencial / Negocio / A medida). Precios como constantes con `TODO`;
    el tercero dice "Hablemos". Tabla comparativa colapsable debajo.

11. **FAQ** — acordeón accesible, 8–10 preguntas reales: ¿mis datos son míos?, ¿qué pasa si me
    voy?, ¿funciona sin internet?, ¿factura electrónica DIAN?, ¿cuánto tarda la implementación?,
    ¿puedo pedir un módulo nuevo?, ¿sirve para varias sedes?, ¿qué soporte incluye?

12. **CTA final** — franja naranja a todo el ancho con el degradado de marca, logo en blanco,
    "Hecho para ti. Pensado para crecer contigo." y el botón de demo.

13. **Footer** — oscuro (`ink-900`). Logo blanco, descriptor, columnas de enlaces, datos de
    contacto (WhatsApp, correo, ciudad), enlaces legales, © con año dinámico.

---

## 5. Requisitos técnicos

**Contenido separado del código.** Todos los textos, módulos, planes, FAQ y casos viven en
`content/*.ts` tipados con Zod o tipos explícitos. Ningún componente lleva copy hardcodeado.
Así puedo cambiar textos sin tocar JSX.

**Sistema de diseño primero.** Antes de maquetar secciones, crea:
`components/ui/` (botones, tarjetas, badge, accordion), `components/layout/` (Section, Container,
Grid) y los tokens en Tailwind. Nada de valores mágicos: `#FF7A00` no aparece en ningún `.tsx`,
solo `text-brand-500`.

**Responsive de verdad.** Diseña móvil primero. Breakpoints 640/768/1024/1280. Área táctil mínima
44px. Ningún scroll horizontal en 320px de ancho.

**Accesibilidad — no negociable.** HTML semántico (`header`/`nav`/`main`/`section`/`footer`), un
solo `h1` por página, jerarquía de headings sin saltos, `alt` descriptivo, foco visible, navegable
completa con teclado, acordeón y menú con ARIA correcto, `prefers-reduced-motion` respetado.

**Rendimiento.** Objetivo Lighthouse ≥95 en las cuatro categorías. `next/image` siempre,
`next/font` sin FOUT, cero librerías pesadas, JS de la home por debajo de ~120KB gzip.

**SEO.** Metadata API de Next por página, Open Graph + Twitter card con imagen generada
(`opengraph-image.tsx`), `sitemap.ts`, `robots.ts`, JSON-LD (`Organization` + `SoftwareApplication`),
canónicas. Textos ALT y títulos pensados para búsquedas como "software POS a medida Colombia".

**Modo oscuro:** no lo hagas. La marca es clara con acentos oscuros. No inviertas tiempo ahí.

**Formulario de contacto:** valida con Zod en cliente y en un Route Handler (`app/api/contacto`).
Deja el envío detrás de una interfaz `sendLead()` con implementación de consola + `TODO`, para que
yo enchufe Resend o el correo que use. Incluye honeypot anti-spam. No agregues reCAPTCHA.

**Preparado para el portal (sin construirlo):**

- Rutas agrupadas: `app/(marketing)/…` y `app/(portal)/portal/page.tsx`.
- `middleware.ts` vacío pero creado, con un comentario de dónde irá la resolución de tenant.
- `lib/config.ts` con `NEXT_PUBLIC_PORTAL_URL` (por defecto `/portal`) para que el botón
  "Ingresar" apunte a un dominio distinto el día que exista.
- No instales Supabase, NextAuth ni ORM alguno todavía.

---

## 6. Protocolo de documentación — **esto es obligatorio en cada tarea**

Trabajo en sesiones cortas y cambio de sesión cuando el contexto se llena. La documentación es
cómo la siguiente sesión sabe dónde quedamos. Por eso:

**Al empezar cualquier sesión:** lee `CLAUDE.md`, luego `docs/ESTADO.md`, luego `README.md`.
No preguntes qué falta: está escrito ahí.

**Al terminar cada tarea, antes de decir que terminaste**, actualiza en el mismo commit:

1. `docs/ESTADO.md` — mueve lo hecho a "Hecho", ajusta "En curso" y "Siguiente", y anota toda
   decisión técnica con su porqué y toda trampa que hayas pisado.
2. `README.md` — solo si cambió cómo se levanta, se prueba o qué páginas existen.
3. `CLAUDE.md` — solo si cambió una regla, una convención o la arquitectura.

Una tarea sin sus documentos actualizados **está incompleta**. No la des por terminada.

**Definición de terminado**, los cuatro en verde:

```bash
npm run typecheck && npm run lint && npm run test && npm run build
```

---

## 7. Cómo quiero que trabajes

1. **Primero léeme el plan, no escribas código.** Dame el árbol de archivos propuesto, los
   componentes del sistema de diseño y las fases. Espera mi visto bueno.
2. Trabaja **por fases**, una a la vez, y para al final de cada una para que yo revise:
   - **Fase 1** — Andamiaje: Next.js, Tailwind con tokens de marca, fuentes, assets ordenados,
     `content/`, layout base, nav y footer. `CLAUDE.md`, `README.md` y `docs/ESTADO.md` creados.
   - **Fase 2** — Sistema de diseño: primitivos UI + página `/kitchen-sink` para verlos todos.
   - **Fase 3** — Home completa, sección por sección.
   - **Fase 4** — Páginas secundarias (`/modulos`, `/casos`, `/precios`, `/contacto`, `/portal`, legales).
   - **Fase 5** — SEO, OG image, sitemap, JSON-LD, metadata.
   - **Fase 6** — Accesibilidad, rendimiento, tests, pulido responsive.
3. Commits pequeños, en español, imperativo: `feat: sección de módulos en la home`.
4. **Si algo no lo sabes, pregunta.** No inventes datos de la empresa: ni cifras, ni clientes,
   ni testimonios, ni años de experiencia, ni número de instalaciones. Donde falte un dato real,
   pon un `TODO(guti):` visible en `content/` y anótalo en `docs/ESTADO.md`.
5. No instales nada que no vayas a usar en la fase actual.

---

## 8. El resultado que quiero

Un sitio que un dueño de negocio de 45 años abre en el celular, entiende en 15 segundos qué
vendemos, y termina escribiendo por WhatsApp. Que se vea **caro y serio** —no como plantilla de
Wix— pero que cargue rápido y no tenga una sola animación que estorbe.

**Empieza así:** lee `CLAUDE.md` y `docs/ESTADO.md`, abre los tres PNG de marca de la raíz
(sobre todo `Identidad de marca.png`), y muéstrame el plan. No escribas código todavía.
