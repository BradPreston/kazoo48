import type { ContactInput } from "@/lib/validation/contact";

// Name of the offscreen honeypot input in ContactForm. Real people never
// see it, so any value means a bot filled every field it found.
export const HONEYPOT_FIELD = "website";

// Real names flip case a few times at most ("McDonald", "DeShawn" = 3);
// random bot strings like "uIesvNRDSyRGhUPoCZKtr" flip it constantly.
const MIN_RANDOM_CASE_CHANGES = 5;

function looksLikeRandomToken(value: string): boolean {
  // One unbroken run of 10+ letters — real messages have spaces.
  if (!/^[A-Za-z]{10,}$/.test(value)) return false;

  let caseChanges = 0;
  for (let i = 1; i < value.length; i++) {
    const prevUpper = value[i - 1] === value[i - 1].toUpperCase();
    const currUpper = value[i] === value[i].toUpperCase();
    if (prevUpper !== currUpper) caseChanges++;
  }
  return caseChanges >= MIN_RANDOM_CASE_CHANGES;
}

/**
 * Cheap checks for bots that get past reCAPTCHA (headless browsers can
 * score as high as real people). Returns why a submission looks like spam,
 * or null if it doesn't. Kept deliberately narrow — the random-text check
 * needs *both* name and message to match — so a real person is never
 * silently dropped.
 */
export function detectContactSpam(
  input: ContactInput,
  honeypotValue: string
): string | null {
  if (honeypotValue.trim()) return "honeypot filled";
  if (looksLikeRandomToken(input.name) && looksLikeRandomToken(input.message)) {
    return "random-string name and message";
  }
  return null;
}
