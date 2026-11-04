// .invalid is a reserved TLD, so a guest address can never receive mail or collide with a real one.
export const GUEST_EMAIL_DOMAIN = "@guest.ourmocks.invalid";

export const isGuestEmail = (email: string) => email.endsWith(GUEST_EMAIL_DOMAIN);
