/** True jika body sudah berupa `BodyInit` sehingga tidak perlu di-JSON-kan. */
export function isExplicitBodyInit(body: unknown): body is BodyInit {
  return (
    typeof body === "string" ||
    (typeof FormData !== "undefined" && body instanceof FormData) ||
    (typeof Blob !== "undefined" && body instanceof Blob) ||
    (typeof ArrayBuffer !== "undefined" && body instanceof ArrayBuffer) ||
    (typeof URLSearchParams !== "undefined" && body instanceof URLSearchParams) ||
    (typeof ReadableStream !== "undefined" && body instanceof ReadableStream) ||
    ArrayBuffer.isView(body)
  );
}

export function serializeBody(body: unknown): BodyInit | undefined {
  if (body === undefined || body === null) {
    return undefined;
  }

  if (isExplicitBodyInit(body)) {
    return body;
  }

  return JSON.stringify(body);
}
