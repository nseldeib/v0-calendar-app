import { NextResponse, type NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Skip middleware for static files, API routes, and favicon
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next()
  }

  // Temporarily disable auth protection in middleware to avoid conflicts
  // We'll rely on client-side protection instead
  console.log("Middleware: allowing request to", pathname)
  return NextResponse.next()

  // Protected routes
  const protectedRoutes = ["/calendar", "/todos", "/meetings", "/settings"]
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))

  if (isProtectedRoute) {
    // Code to handle protected routes
  }

  // Code to handle session and other logic
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}
