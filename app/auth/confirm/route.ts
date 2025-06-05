import { createServerSupabaseClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const token_hash = requestUrl.searchParams.get("token_hash")
  const type = requestUrl.searchParams.get("type")
  const origin = requestUrl.origin

  console.log("Auth confirm received:", { token_hash: !!token_hash, type })

  if (token_hash && type) {
    const supabase = await createServerSupabaseClient()

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        type: type as any,
        token_hash,
      })

      if (error) {
        console.error("OTP verification error:", error)
        return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error.message)}`)
      }

      if (data.session) {
        console.log("Email confirmed successfully for user:", data.user?.email)
        return NextResponse.redirect(`${origin}/calendar`)
      }
    } catch (error) {
      console.error("Auth confirm exception:", error)
      return NextResponse.redirect(`${origin}/login?error=confirmation_error`)
    }
  }

  // Fallback redirect
  return NextResponse.redirect(`${origin}/login?error=invalid_confirmation_link`)
}
