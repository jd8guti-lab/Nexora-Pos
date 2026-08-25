# nexora-pos — sitio web

Sitio corporativo de **nexora-pos**: software de punto de venta a medida, personalizable y
modular. Es la cara pública de la marca — explica qué hace el producto, para quién es y cómo
contratarlo, y enlaza al portal de clientes.

**Es solo el sitio de marketing.** El portal multi-cliente (login, dashboards, multi-tenancy) se
construye después; aquí ya está el enganche listo en `/portal` y en `middleware.ts`.

---

## Arrancar

```bash
npm install
npm run dev
```

Abre en `http://localhost:3000`.

## Verificar

Los cinco tienen que pasar antes de dar algo por terminado:

```bash
npm run typecheck && npm run lint && npm run test && npm run contrast && npm run build
```

`npm run contrast` audita la paleta contra WCAG AA. Está en la lista porque el naranja de la
marca tiene bastante menos contraste del que aparenta, y varias combinaciones "obvias" fallan.
Si lo rompes, te dice exactamente qué par y con qué ratio.

> Estado actual: **Fases 1 y 2 terminadas**, y la **Fase 3 a mitad** (secciones 1 a 6 de la
> home). Los cinco en verde con 38 tests; la home va en 107 kB de JS. Detalle en
> [docs/ESTADO.md](docs/ESTADO.md).

## Por dónde empezar a leer

| Documento                        | Qué contiene                                                                                                               |
| -------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| **[CLAUDE.md](CLAUDE.md)**       | **Empieza aquí.** Las reglas: marca, arquitectura, calidad, convenciones. La fuente de verdad de _cómo debe ser_ el sitio. |
| [docs/ESTADO.md](docs/ESTADO.md) | En qué punto va cada cosa, las decisiones con su porqué y las trampas ya pisadas.                                          |
| [PROMPT.md](PROMPT.md)           | El encargo original, por si hay que reconstruir el contexto desde cero.                                                    |

## Páginas

| Ruta                                    | Qué es                                                                                         | Estado |
| --------------------------------------- | ---------------------------------------------------------------------------------------------- | ------ |
| `/`                                     | Home larga: hero, problema, pilares, módulos, proceso, quiénes somos, casos, precios, FAQ, CTA | Fase 3 |
| `/modulos`                              | Detalle de los 7 módulos                                                                       | Fase 4 |
| `/casos`                                | Casos de uso por tipo de negocio                                                               | Fase 4 |
| `/precios`                              | Planes y alcance de la personalización                                                         | Fase 4 |
| `/contacto`                             | Formulario, WhatsApp y correo                                                                  | Fase 4 |
| `/portal`                               | Placeholder del portal de clientes                                                             | ✅     |
| `/kitchen-sink`                         | Todos los primitivos, en todas sus variantes. Solo desarrollo: `noindex`, sin enlazar          | ✅     |
| `/legal/privacidad` · `/legal/terminos` | Legales (Ley 1581 de 2012)                                                                     | Fase 4 |

## Stack

Next.js 15 (App Router) · TypeScript `strict` · **Tailwind CSS v4** · shadcn/ui + Radix ·
lucide-react · React Hook Form + Zod · Vitest · Vercel

Los tokens de marca están en `app/globals.css` (bloque `@theme`), no en un `tailwind.config.ts`
— Tailwind v4 los define en CSS.

## Marca en corto

`nexora-pos` siempre en minúscula. Naranja `#FF7A00` como **acento**, nunca como fondo
mayoritario. Poppins. Español de Colombia, tuteo, sin humo, sin emojis. El detalle completo está
en [CLAUDE.md](CLAUDE.md) — respétalo.

## Lo que falta

Ver [docs/ESTADO.md](docs/ESTADO.md). En grande:

1. Fases 3 a 6: home → páginas secundarias → SEO → pulido.
2. Reemplazar los `TODO(guti):` de `content/` por datos reales (contacto, precios, dominio).
3. Conectar el envío del formulario a un servicio de correo.
4. **Assets pendientes:** el logo sobre fondo oscuro y los SVG vectoriales. Mientras no
   existan, sobre `ink-900` y sobre la franja naranja el nombre se compone en Poppins con
   los tokens de marca — nunca se recolorea el PNG.
5. El portal de clientes — proyecto aparte.

> **Ojo:** ningún componente lleva copy hardcodeado. Si quieres cambiar un texto, se cambia en
> `content/`, no en el JSX.
