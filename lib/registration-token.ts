import { createHmac, timingSafeEqual } from "node:crypto";
import { env } from "@/lib/env";

/**
 * Proves that this browser is the one that created a given registration,
 * so the Step 2 resume path (`/register?step=2&rid=<id>`) can't be used by
 * anyone who merely obtains the id — e.g. from a shared screenshot, a
 * proxy log, or browser history — to pull up or pay against someone
 * else's registration. The id itself is an unguessable random UUID, but
 * it isn't a secret once it leaves the URL bar.
 *
 * Deliberately not a JWT/session library: this only ever needs to answer
 * "does this cookie authorize this one id", so a single HMAC covers it.
 */

export const REGISTRATION_TOKEN_COOKIE = "reg_token";

export function signRegistrationId(id: string): string {
  return createHmac("sha256", env.REGISTRATION_TOKEN_SECRET)
    .update(id)
    .digest("hex");
}

export function verifyRegistrationToken(
  id: string,
  token: string | undefined
): boolean {
  if (!token) return false;

  const expected = Buffer.from(signRegistrationId(id), "hex");
  const actual = Buffer.from(token, "hex");
  // Buffers of different lengths would throw in timingSafeEqual; a
  // mismatched length is just as much a "no" as a mismatched digest.
  if (expected.length !== actual.length) return false;

  return timingSafeEqual(expected, actual);
}
