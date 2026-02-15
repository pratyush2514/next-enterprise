import { type NextRequest, NextResponse } from "next/server"

/**
 * iTunes is a public api endpoint which has a initial /search endpoint that can be used to search for music tracks. It accepts query parameters such as term, limit, and offset to customize the search results. The API returns a JSON response containing the search results, which can be used to display music tracks in the application.
 * it has the following query parameters:
 * - term: The search term to look for in the iTunes Store. This is a required parameter e.g. "beatles", "rock", "pop", etc.
 * - limit: The number of search results to return. The default value is 20, and the maximum value is 200.
 * - offset: The number of search results to skip before returning results. This is used for pagination.
 */
const ITUNES_API = "https://itunes.apple.com/search"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const term = searchParams.get("term")
  const limit = Math.min(Math.max(parseInt(searchParams.get("limit") || "20", 10) || 20, 1), 200).toString()
  const offset = Math.max(parseInt(searchParams.get("offset") || "0", 10) || 0, 0).toString()

  if (!term) {
    return NextResponse.json({ resultCount: 0, results: [] })
  }

  try {
    const url = new URL(ITUNES_API)
    url.searchParams.set("term", term) // which is used to search for the specified term in the iTunes Store
    url.searchParams.set("limit", limit)
    url.searchParams.set("offset", offset)
    url.searchParams.set("media", "music")

    const response = await fetch(url.toString(), {
      next: { revalidate: 60 },
    })

    if (!response.ok) {
      return NextResponse.json({ error: "iTunes API returned an error" }, { status: response.status })
    }

    const data: unknown = await response.json()
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: "Failed to fetch from iTunes API" }, { status: 500 })
  }
}
