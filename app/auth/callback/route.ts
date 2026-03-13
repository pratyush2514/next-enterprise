import { NextResponse } from "next/server"

import { createClient } from "lib/supabase/server"

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const next = requestUrl.searchParams.get("next") ?? "/song"

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (error) {
      // Redirect to login with error if code exchange fails
      return NextResponse.redirect(new URL("/login?error=auth_callback_error", request.url))
    }
  }

  return NextResponse.redirect(new URL(next, request.url))
}
