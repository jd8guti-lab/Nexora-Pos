/**
 * Renders a JSON-LD block.
 *
 * Lives in its own component rather than in lib/seo.ts because that file is
 * plain data and stays a .ts.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // The payload is ours and contains no user input.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
