import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const email = request.nextUrl.searchParams.get("email")

  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 })
  }

  // Stub: always returns false — replace with real backend lookup
  return NextResponse.json({ exists: false })
}
