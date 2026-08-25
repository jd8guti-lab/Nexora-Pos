import type { LegalDocument } from "./types";

/**
 * Legal pages.
 *
 * TODO(guti): **esto lo tiene que revisar un abogado antes de publicar.**
 * Está redactado siguiendo la estructura que pide la Ley 1581 de 2012 y el
 * Decreto 1074 de 2015 para una política de tratamiento de datos, pero yo no
 * puedo dar por buena la redacción legal de tu empresa, y la razón social, el
 * NIT y los datos de contacto todavía no existen. Todo eso sale de
 * `content/site.ts`, donde también está marcado.
 *
 * Lo que sí está bien planteado es el alcance: este sitio solo recoge lo que
 * la gente escribe en el formulario de contacto. No hay cuentas, no hay
 * cookies de terceros y no hay analítica. Si mañana agregas cualquiera de
 * esas cosas, esta política tiene que cambiar el mismo día.
 */

export const privacy: LegalDocument = {
  title: "Política de tratamiento de datos personales",
  updatedAt: "TODO(guti): fecha de expedición",
  intro:
    "En cumplimiento de la Ley 1581 de 2012 y el Decreto 1074 de 2015, aquí te explicamos qué datos personales recogemos, para qué los usamos y cómo puedes controlarlos.",
  sections: [
    {
      heading: "Quién responde por tus datos",
      body: [
        "TODO(guti): razón social, NIT, domicilio, correo y teléfono del responsable del tratamiento. Estos datos son obligatorios y salen de content/site.ts.",
      ],
    },
    {
      heading: "Qué datos recogemos",
      body: [
        "Únicamente lo que tú escribes en el formulario de contacto: tu nombre, el nombre de tu negocio, tu correo, tu número de teléfono, el tipo de negocio si lo seleccionas, y el mensaje que nos envías.",
        "Este sitio no usa cookies de analítica, no tiene píxeles de publicidad y no comparte tu navegación con terceros. Si eso cambia, esta política cambia con ello.",
      ],
    },
    {
      heading: "Para qué los usamos",
      body: [
        "Para responderte, entender qué necesita tu negocio y, si decides avanzar, prepararte una propuesta.",
        "No usamos tus datos para publicidad, no los vendemos y no los cedemos a terceros con fines comerciales.",
      ],
    },
    {
      heading: "Cuánto tiempo los guardamos",
      body: [
        "Mientras exista una relación comercial contigo o una conversación abierta, y después durante el tiempo que la ley nos obligue a conservarlos. Cuando ya no haga falta, los eliminamos.",
      ],
    },
    {
      heading: "Tus derechos",
      body: [
        "Como titular de tus datos puedes conocer, actualizar y rectificar la información que tenemos sobre ti; pedir prueba de la autorización que nos diste; ser informado del uso que les hemos dado; presentar quejas ante la Superintendencia de Industria y Comercio; y revocar la autorización o pedir que borremos tus datos cuando no exista un deber legal que lo impida.",
        "TODO(guti): correo al que se envían estas solicitudes y plazo de respuesta. La ley da diez días hábiles para consultas y quince para reclamos.",
      ],
    },
    {
      heading: "Seguridad",
      body: [
        "Aplicamos medidas técnicas y administrativas razonables para proteger tu información frente a accesos no autorizados, pérdida o alteración.",
      ],
    },
    {
      heading: "Cambios",
      body: [
        "Si modificamos esta política, publicamos la nueva versión en esta misma página con su fecha de actualización.",
      ],
    },
  ],
};

export const terms: LegalDocument = {
  title: "Términos de servicio",
  updatedAt: "TODO(guti): fecha de expedición",
  intro:
    "Estas condiciones aplican al uso de este sitio web. Las condiciones del software, del soporte y de la facturación se pactan en el contrato que firmamos contigo, no aquí.",
  sections: [
    {
      heading: "Alcance de este sitio",
      body: [
        "Este sitio es informativo. Describe qué hace nexora-pos y cómo contactarnos. No es una oferta comercial vinculante ni un contrato.",
        "TODO(guti): revisa esta frase con tu abogado. En Colombia una oferta con precio publicado sí puede tener efectos, así que la redacción importa cuando pongas los precios reales.",
      ],
    },
    {
      heading: "Precios e información publicada",
      body: [
        "Los precios y las funcionalidades que aparecen en este sitio son de referencia y pueden cambiar. Lo que rige es lo acordado por escrito contigo.",
        "Ponemos cuidado en que la información sea exacta, pero no garantizamos que esté libre de errores.",
      ],
    },
    {
      heading: "Propiedad intelectual",
      body: [
        "La marca nexora-pos, su logotipo, sus textos y el software son de su titular. Puedes leer y compartir este sitio; no puedes usar la marca ni copiar el contenido para otro producto sin autorización escrita.",
      ],
    },
    {
      heading: "Enlaces y servicios de terceros",
      body: [
        "Si enlazamos a un servicio de terceros, no respondemos por su contenido ni por sus políticas.",
      ],
    },
    {
      heading: "El portal de clientes",
      body: [
        "El acceso al portal de clientes se rige por el contrato de servicio y por las credenciales que te entregamos. Eres responsable de cuidar tus claves y de quién accede con ellas.",
      ],
    },
    {
      heading: "Ley aplicable",
      body: [
        "Estas condiciones se rigen por la ley colombiana.",
        "TODO(guti): define aquí la ciudad para efectos de jurisdicción.",
      ],
    },
  ],
};
