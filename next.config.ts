import { withSentryConfig } from "@sentry/nextjs/config";
import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

// No proxy/middleware in this app, so this is the CSP without nonces — see
// node_modules/next/dist/docs/01-app/02-guides/content-security-policy.md.
// Nonces would need per-request dynamic rendering across the whole
// (otherwise static) marketing site just to cover a payment form nested a
// few routes deep, so 'unsafe-inline' is the accepted trade-off here.
//
// Allowances beyond the doc's baseline, and why each is needed:
//   - script-src https://js.stripe.com   Stripe.js, loaded by PaymentForm
//   - script-src https://www.google.com/recaptcha/ / www.gstatic.com/recaptcha/
//                                        reCAPTCHA v3 on the contact form
//   - style-src 'unsafe-inline'          inline `style={{...}}` (Reveal, Inspiration)
//   - connect-src https://api.stripe.com Stripe Elements calls this directly from the browser
//   - connect-src https://www.google.com/recaptcha/   reCAPTCHA v3's api.js fetches from the page itself
//   - worker-src  blob:                  Sentry Replay spins up its compression worker from a blob URL
//   - frame-src   https://js.stripe.com / hooks.stripe.com   Payment Element + 3DS challenge iframes
//   - frame-src   https://www.youtube.com   trailer embeds (Inspiration)
//   - frame-src   https://www.google.com/recaptcha/ / recaptcha.google.com/recaptcha/
//                                        reCAPTCHA v3 runs its check in a hidden iframe
// Sentry needs no connect-src entry: browser events go through the
// same-origin `tunnelRoute` set in withSentryConfig below.
// font-src/img-src stay at 'self' — next/font self-hosts Inter at build time
// and every image is local (no next.config `images.remotePatterns` either).
const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-inline' https://js.stripe.com https://www.google.com/recaptcha/ https://www.gstatic.com/recaptcha/${isDev ? " 'unsafe-eval'" : ""};
  style-src 'self' 'unsafe-inline';
  img-src 'self' blob: data:;
  font-src 'self';
  connect-src 'self' https://api.stripe.com https://www.google.com/recaptcha/;
  worker-src 'self' blob:;
  frame-src https://js.stripe.com https://hooks.stripe.com https://www.youtube.com https://www.google.com/recaptcha/ https://recaptcha.google.com/recaptcha/;
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  upgrade-insecure-requests;
`
  .replace(/\s{2,}/g, " ")
  .trim();

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Content-Security-Policy", value: cspHeader },
          // Belt-and-suspenders alongside frame-ancestors above, for
          // browsers that only understand the older header.
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
    ];
  },
  allowedDevOrigins: ['77d2-2601-406-0-f89-ec39-971d-ba49-aab9.ngrok-free.app'],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.ytimg.com",
      },
    ],
  },
};

export default withSentryConfig(nextConfig, {
  // For all available options, see:
  // https://www.npmjs.com/package/@sentry/webpack-plugin#options

  org: "brad-preston",

  project: "kazoo48",

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Uncomment to route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
  // side errors will fail.
  // Also keeps Sentry under connect-src 'self' — see the CSP note above.
  tunnelRoute: "/monitoring",

  webpack: {
    // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
    // See the following for more information:
    // https://docs.sentry.io/product/crons/
    // https://vercel.com/docs/cron-jobs
    automaticVercelMonitors: true,

    // Tree-shaking options for reducing bundle size
    treeshake: {
      // Automatically tree-shake Sentry logger statements to reduce bundle size
      removeDebugLogging: true,
    },
  },
});
