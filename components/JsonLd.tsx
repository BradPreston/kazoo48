// Renders a JSON-LD <script> tag for structured data (schema.org).
// See node_modules/next/dist/docs/01-app/02-guides/json-ld.md for the
// recommended pattern this follows, including the XSS-safe escaping.
export default function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
