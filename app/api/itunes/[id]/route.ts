import { type NextRequest, NextResponse } from "next/server"

const ITUNES_LOOKUP_API = "https://itunes.apple.com/lookup"

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  if (!/^\d+$/.test(id)) {
    return NextResponse.json({ error: "Invalid track ID" }, { status: 400 })
  }

  try {
    const url = new URL(ITUNES_LOOKUP_API)
    url.searchParams.set("id", id)

    const response = await fetch(url.toString(), {
      next: { revalidate: 3600 },
    })

    if (!response.ok) {
      return NextResponse.json({ error: "iTunes API returned an error" }, { status: response.status })
    }

    const data = (await response.json()) as { resultCount: number; results: unknown[] }

    if (!data.results?.length) {
      return NextResponse.json({ error: "Track not found" }, { status: 404 })
    }

    return NextResponse.json(data.results[0])
  } catch {
    return NextResponse.json({ error: "Failed to fetch from iTunes API" }, { status: 500 })
  }
}
