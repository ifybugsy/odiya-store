export async function readRequestBody(request: Request): Promise<Buffer> {
  const reader = request.body?.getReader()
  if (!reader) throw new Error("No body reader available")

  const chunks: Uint8Array[] = []

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      chunks.push(value)
    }
  } catch (error) {
    reader.cancel()
    throw error
  }

  return Buffer.concat(chunks.map((chunk) => Buffer.from(chunk)))
}
