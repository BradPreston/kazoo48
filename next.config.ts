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
//   - style-src 'unsafe-inline'          inline `style={{...}}` (Reveal, Inspiration)
//   - connect-src https://api.stripe.com Stripe Elements calls this directly from the browser
//   - frame-src   https://js.stripe.com / hooks.stripe.com   Payment Element + 3DS challenge iframes
//   - frame-src   https://www.youtube.com   trailer embeds (Inspiration)
// font-src/img-src stay at 'self' — next/font self-hosts Inter at build time
// and every image is local (no next.config `images.remotePatterns` either).
const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-inline' https://js.stripe.com${isDev ? " 'unsafe-eval'" : ""};
  style-src 'self' 'unsafe-inline';
  img-src 'self' blob: data:;
  font-src 'self';
  connect-src 'self' https://api.stripe.com;
  frame-src https://js.stripe.com https://hooks.stripe.com https://www.youtube.com;
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
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.ytimg.com",
      },
    ],
  },
};

export default nextConfig;
