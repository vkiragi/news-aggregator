import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Define public routes that don't require authentication
const publicRoutes = [
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/news(.*)',
  '/api/health(.*)',
  '/api/articles/is-saved',
  '/api/articles/save',
  '/dashboard/article/(.*)'
];

// Create a route matcher for public paths
const isPublicRoute = createRouteMatcher(publicRoutes);

export default clerkMiddleware(async (auth, req) => {
  // If the route is public, allow access without authentication
  if (!isPublicRoute(req)) {
    // Otherwise, protect the route and require authentication
    await auth.protect();
  }
});

// Configure matcher to exclude static files and include all other routes
export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    '/((?!_next|.*\\.(?:jpg|jpeg|gif|png|svg|ico|css|js|woff|woff2)).*)',
  ],
}; 