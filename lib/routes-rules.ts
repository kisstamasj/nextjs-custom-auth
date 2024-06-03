/**
 * An array of routes that used for authentication
 * @type {string[]}
 */
export const AUTH_ROUTES: string[] = [
  "/auth/sign-in",
  "/auth/signup",
  "/auth/error",
];

/**
 * The default redirect path after login
 */
export const REDIRECT_AFTER_LOGIN = "/dashboard";

/**
 * The default redirect path after logout
 */
export const LOGIN_PAGE = "/auth/sign-in";
