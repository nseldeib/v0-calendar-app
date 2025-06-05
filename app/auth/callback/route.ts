import { createServerSupabaseClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const error = requestUrl.searchParams.get("error")
  const error_description = requestUrl.searchParams.get("error_description")
  const origin = requestUrl.origin

  console.log("Auth callback received:", { code: !!code, error, error_description })

  if (error) {
    console.error("Auth callback error:", error, error_description)
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error_description || error)}`)
  }

  if (code) {
    const supabase = await createServerSupabaseClient()

    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)

      if (error) {
        console.error("Session exchange error:", error)
        return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error.message)}`)
      }

      if (data.session) {
        console.log("Session created successfully for user:", data.user?.email)
        return NextResponse.redirect(`${origin}/calendar`)
      }
    } catch (error) {
      console.error("Auth callback exception:", error)
      return NextResponse.redirect(`${origin}/login?error=auth_callback_error`)
    }
  }

  // No code parameter, redirect to login
  return NextResponse.redirect(`${origin}/login?error=no_code_provided`)
}
