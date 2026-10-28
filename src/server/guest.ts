import "server-only";

/** Guest sign-in lets people try tests without an account. On until GUEST_LOGIN_ENABLED=false. */
export function guestLoginEnabled() {
  return process.env.GUEST_LOGIN_ENABLED !== "false";
}
