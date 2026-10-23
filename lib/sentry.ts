/**
 * Tags on every Sentry event the contact form reports, server and client,
 * so a single Sentry alert rule filtered on `feature:contact-form` covers
 * all of them. Plain data, so it's safe to import from Client Components.
 */
export const CONTACT_FORM_SENTRY_TAGS = { feature: "contact-form" } as const;
