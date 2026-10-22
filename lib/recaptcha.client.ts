/**
 * Browser half of the contact form's reCAPTCHA v3 check — fetches a token
 * that lib/recaptcha.ts verifies server-side. The script itself is loaded
 * by app/contact-us/page.tsx (and allowed by the CSP in next.config.ts).
 */

declare global {
  interface Window {
    // Undefined until api.js finishes loading.
    grecaptcha?: {
      ready: (callback: () => void) => void;
      execute: (
        siteKey: string,
        options: { action: string }
      ) => Promise<string>;
    };
  }
}

/**
 * Tokens expire after 2 minutes and are single-use, so call this at submit
 * time rather than on page load.
 *
 * Resolves to "" in local dev when no site key is set — the server skips
 * verification there too (see verifyRecaptcha), so the form still works
 * before reCAPTCHA keys are configured.
 */
export function getRecaptchaToken(action: string): Promise<string> {
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_V3_SITE_KEY;
  if (!siteKey) {
    if (process.env.NODE_ENV !== "production") return Promise.resolve("");
    return Promise.reject(
      new Error("NEXT_PUBLIC_RECAPTCHA_V3_SITE_KEY is not set.")
    );
  }

  return new Promise((resolve, reject) => {
    const grecaptcha = window.grecaptcha;
    if (!grecaptcha) {
      reject(new Error("reCAPTCHA script not loaded"));
      return;
    }
    grecaptcha.ready(() => {
      grecaptcha.execute(siteKey, { action }).then(resolve, reject);
    });
  });
}
