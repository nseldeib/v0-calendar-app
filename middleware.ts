import { createServerClient, type CookieOptions } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: "",
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: "",
            ...options,
          })
        },
      },
    },
  )

  const pathname = request.nextUrl.pathname

  // Skip middleware for static files and API routes
  if (pathname.startsWith("/_next") || pathname.startsWith("/api") || pathname.includes(".")) {
    return response
  }

  try {
    // Get the session
    const {
      data: { session },
    } = await supabase.auth.getSession()

    console.log("Middleware check:", {
      pathname,
      hasSession: !!session,
      userId: session?.user?.id,
    })

    // Protected routes
    const protectedRoutes = ["/calendar", "/todos", "/meetings", "/settings"]
    const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))

    // Auth routes
    const authRoutes = ["/login", "/signup"]
    const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route))

    if (isProtectedRoute && !session) {
      console.log("Redirecting to login - no session")
      return NextResponse.redirect(new URL("/login", request.url))
    }

    if (isAuthRoute && session) {
      console.log("Redirecting to calendar - already authenticated")
      return NextResponse.redirect(new URL("/calendar", request.url))
    }

    return response
  } catch (error) {
    console.error("Middleware error:", error)
    // On error, allow the request to continue
    return response
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
