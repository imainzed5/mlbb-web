type JsonLdProps = {
  data: Record<string, unknown> | Array<Record<string, unknown>>;
};

function serializeJsonLd(data: Record<string, unknown>) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export function JsonLd({ data }: JsonLdProps) {
  const payloads = Array.isArray(data) ? data : [data];

  return (
    <>
      {payloads.map((payload, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(payload) }}
        />
      ))}
    </>
  );
}