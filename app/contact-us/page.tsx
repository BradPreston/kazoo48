import type Metadata from "next";
import Script from "next/script";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import ContactWizard from "./_components/ContactWizard";

export const metadata: Metadata = {
  title: "Contact us — Kazoo 48",
  description: "Get in touch with the Kazoo 48 Hour Film Festival team.",
};

export default function ContactUsPage() {
  // Read directly rather than via @/lib/env so local dev without a key skips
  // the script (that file fills in a placeholder that only satisfies its
  // schema) — getRecaptchaToken skips the token for the same reason.
  const recaptchaSiteKey = process.env.NEXT_PUBLIC_RECAPTCHA_V3_SITE_KEY;

  return (
    <div className="flex flex-1 flex-col">
      {recaptchaSiteKey && (
        <Script
          src={`https://www.google.com/recaptcha/api.js?render=${recaptchaSiteKey}`}
        />
      )}
      <Header />
      <section className="mx-auto flex w-full max-w-4xl flex-col items-center gap-10 px-6 pb-16">
        <h1 className="text-3xl font-bold text-ink sm:text-4xl">
          Contact us
        </h1>
        <ContactWizard />
      </section>
      <Footer />
    </div>
  );
}
