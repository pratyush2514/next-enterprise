import { type NextRequest, NextResponse } from "next/server"

import { searchITunes } from "lib/services/itunes-api"

/**
 * iTunes Search API proxy endpoint
 * Accepts query parameters: term (required), limit, offset
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const term = searchParams.get("term")
  const limit = Math.min(Math.max(parseInt(searchParams.get("limit") || "20", 10) || 20, 1), 200)
  const offset = Math.max(parseInt(searchParams.get("offset") || "0", 10) || 0, 0)

  if (!term) {
    return NextResponse.json({ resultCount: 0, results: [] })
  }

  try {
    const data = await searchITunes({ term, limit, offset })
    return NextResponse.json(data)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch from iTunes API"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
