/**
 * Pragmatic e-mail check: something before and after a single @, and a dot
 * in the domain. The real verification is the confirmation e-mail.
 */
export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());
}
