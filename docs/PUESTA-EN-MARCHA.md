# PUESTA EN MARCHA — reemplazado

**La guía viva es [PUESTA-EN-MARCHA-SUPABASE.md](PUESTA-EN-MARCHA-SUPABASE.md). Usa esa.**

Este archivo era un checklist de 8 pasos escrito el 2026-08-30, antes de que existiera un proyecto
de Supabase real. Se vació el 2026-09-13 porque había dejado de ser una guía y se había convertido
en una trampa: **seguirlo al pie de la letra rompía la puesta en marcha.**

Qué decía mal, para que nadie lo reconstruya de memoria:

| Decía | La verdad |
| --- | --- |
| «PASO 1: ejecuta `backend/esquema-supabase.sql`» | Ese archivo es **obsoleto** y no se ejecuta — lo dice `backend/README.md`. El esquema de cada empresa vive en su propio repositorio, en `docs/esquema-supabase.sql`. Correr el viejo aborta en su primera sentencia contra una base que ya tiene `public.tenants`. |
| «Portal preparado en la rama `portal-clientes`» | Esa rama está fusionada y borrada desde el 2026-09-02. |
| «Listos para conectar un proyecto Supabase real» | Hay **dos empresas conectadas y desplegadas** desde el 7 de septiembre de 2026. |
| `cd C:\Users\GHOSTBOY\OneDrive\Documentos\ProyectosINF\Nexora-Pos` | La ruta absoluta de una máquina concreta, en todos sus ejemplos. |

Lo único que tenía y no estaba en la otra guía —las variables `NEXT_PUBLIC_GOOGLE_*`— vive ahora en
`.env.example`, que es donde se busca una variable de entorno.

**La regla que deja esto:** dos documentos que explican el mismo procedimiento acaban
contradiciéndose, y el que se actualiza no es siempre el que alguien abre. Un procedimiento, un
archivo.
