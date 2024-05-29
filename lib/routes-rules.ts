/**
 * An array of routes that used for authentication
 * @type {string[]}
 */
export const authRoutes: string[] = [
  "/auth/sign-in",
  "/auth/signup",
  "/auth/error",
];

/**
 * The default redirect path after login
 */
export const DEFAULT_LOGIN_REDIRECT = "/dashboard";

/**
 * The default redirect path after logout
 */
export const DEFAULT_LOGOUT_REDIRECT = "/auth/sign-in";
