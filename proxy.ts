import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/transactions(.*)',
  '/budgets(.*)',
  '/goals(.*)',
  '/analytics(.*)',
  '/recurring(.*)',
  '/settings(.*)'
])

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect()
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.[\\w]+$|_next/image|_next/static|favicon.ico).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
    // Clerk auto-proxy path
    '/__clerk/:path*',
  ],
};
