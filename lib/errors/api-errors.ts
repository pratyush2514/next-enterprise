export function handleAPIError(error: unknown): Response {
  console.error("API Error:", error)

  if (error && typeof error === "object" && "code" in error) {
    const code = (error as { code: string }).code

    switch (code) {
      case "PGRST116": // Row not found
        return new Response(JSON.stringify({ error: "Resource not found" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        })
      case "23505": // Unique violation
        return new Response(JSON.stringify({ error: "Resource already exists" }), {
          status: 409,
          headers: { "Content-Type": "application/json" },
        })
      case "23503": // Foreign key violation
        return new Response(JSON.stringify({ error: "Invalid reference" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        })
    }
  }

  // Generic server error
  return new Response(
    JSON.stringify({
      error:
        process.env.NODE_ENV === "production"
          ? "Internal server error"
          : error instanceof Error
            ? error.message
            : "Unknown error",
    }),
    {
      status: 500,
      headers: { "Content-Type": "application/json" },
    }
  )
}
