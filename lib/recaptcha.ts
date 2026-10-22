import { env, usingDevDefault } from "./env";

// Google's recommended starting threshold: 1.0 is very likely a human,
// 0.0 very likely a bot.
const MIN_SCORE = 0.5;

// Must match the action passed to getRecaptchaToken in ContactWizard.
const EXPECTED_ACTION = "contact_form";

type SiteverifyResponse = {
  success: boolean;
  score?: number;
  action?: string;
  challenge_ts?: string;
  hostname?: string;
  "error-codes"?: string[];
};

export type RecaptchaResult = {
  success: boolean;
  score?: number;
  error?: string;
};

/**
 * Verifies a reCAPTCHA v3 token from the browser (see
 * lib/recaptcha.client.ts). Never throws — every failure, including a
 * network error reaching Google, comes back as `success: false` with a
 * reason for logging.
 */
export async function verifyRecaptcha(token: string): Promise<RecaptchaResult> {
  // Local dev without real keys: a placeholder secret can never verify, so
  // skip the check rather than block every submission (see lib/env.ts).
  if (usingDevDefault("RECAPTCHA_V3_SECRET_KEY")) {
    return { success: true };
  }

  if (!token) {
    return { success: false, error: "Missing reCAPTCHA token" };
  }

  try {
    const res = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      body: new URLSearchParams({
        secret: env.RECAPTCHA_V3_SECRET_KEY,
        response: token,
      }),
    });

    if (!res.ok) {
      return {
        success: false,
        error: `reCAPTCHA siteverify returned HTTP ${res.status}`,
      };
    }

    const result: SiteverifyResponse = await res.json();

    if (!result.success) {
      return {
        success: false,
        error:
          result["error-codes"]?.join(", ") || "reCAPTCHA verification failed",
      };
    }

    if (result.action !== EXPECTED_ACTION) {
      return {
        success: false,
        score: result.score,
        error: `Unexpected reCAPTCHA action "${result.action}"`,
      };
    }

    if (result.score !== undefined && result.score < MIN_SCORE) {
      return {
        success: false,
        score: result.score,
        error: `reCAPTCHA score ${result.score} below ${MIN_SCORE}`,
      };
    }

    return { success: true, score: result.score };
  } catch (error) {
    console.error("reCAPTCHA verification error:", error);
    return { success: false, error: "Network error during verification" };
  }
}
