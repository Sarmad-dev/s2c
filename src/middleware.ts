import {
  convexAuthNextjsMiddleware,
  createRouteMatcher,
  nextjsMiddlewareRedirect,
} from "@convex-dev/auth/nextjs/server";
import {
  isByPassRoutes,
  isProtectedRoutes,
  isPublicRoutes,
} from "./lib/permissions";

const PublicMatcher = createRouteMatcher(isPublicRoutes);
const ByPassMatcher = createRouteMatcher(isByPassRoutes);
const ProtectedMatcher = createRouteMatcher(isProtectedRoutes);

export default convexAuthNextjsMiddleware(
  async (request, { convexAuth }) => {
    if (ByPassMatcher(request)) return;

    const authed = await convexAuth.isAuthenticated();

    if (PublicMatcher(request) && authed) {
      return nextjsMiddlewareRedirect(request, "/dashboard");
    }

    if (ProtectedMatcher(request) && !authed) {
      return nextjsMiddlewareRedirect(request, "/auth/sign-in");
    }

    return;
  },
  {
    cookieConfig: { maxAge: 60 * 60 * 24 * 30 },
  }
);

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
