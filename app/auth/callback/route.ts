import { createServerSupabaseClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const error = requestUrl.searchParams.get("error")
  const error_description = requestUrl.searchParams.get("error_description")
  const token_hash = requestUrl.searchParams.get("token_hash")
  const type = requestUrl.searchParams.get("type")
  const origin = requestUrl.origin

  console.log("Auth callback received:", {
    code: !!code,
    error,
    error_description,
    token_hash: !!token_hash,
    type,
    url: requestUrl.toString(),
  })

  if (error) {
    console.error("Auth callback error:", error, error_description)
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error_description || error)}`)
  }

  const supabase = await createServerSupabaseClient()

  try {
    if (code) {
      // Handle PKCE flow (modern)
      console.log("Processing PKCE code exchange...")
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)

      if (error) {
        console.error("PKCE exchange error:", error)
        return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error.message)}`)
      }

      if (data.session) {
        console.log("PKCE session created successfully for user:", data.user?.email)
        return NextResponse.redirect(`${origin}/calendar`)
      }
    } else if (token_hash && type) {
      // Handle legacy token hash flow
      console.log("Processing token hash verification...")
      const { data, error } = await supabase.auth.verifyOtp({
        type: type as any,
        token_hash,
      })

      if (error) {
        console.error("Token hash verification error:", error)
        return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error.message)}`)
      }

      if (data.session) {
        console.log("Token hash session created successfully for user:", data.user?.email)
        return NextResponse.redirect(`${origin}/calendar`)
      }
    }
  } catch (error) {
    console.error("Auth callback exception:", error)
    return NextResponse.redirect(`${origin}/login?error=auth_callback_error`)
  }

  // No valid auth data provided
  console.log("No valid auth data in callback")
  return NextResponse.redirect(`${origin}/login?error=no_auth_data`)
}
