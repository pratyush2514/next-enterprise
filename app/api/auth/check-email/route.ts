import { NextRequest, NextResponse } from "next/server"

import { createClient } from "lib/supabase/server"

export async function GET(request: NextRequest) {
  const email = request.nextUrl.searchParams.get("email")

  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 })
  }

  try {
    const supabase = await createClient()
    const { data, error } = await supabase.rpc("check_email_exists", {
      email_to_check: email,
    })

    if (error) {
      return NextResponse.json({ exists: false })
    }

    return NextResponse.json({ exists: data === true })
  } catch {
    return NextResponse.json({ exists: false })
  }
}
