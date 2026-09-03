import type { Metadata } from "next";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import ContactWizard from "./_components/ContactWizard";

export const metadata: Metadata = {
  title: "Contact us — Kazoo 48",
  description: "Get in touch with the Kazoo 48 Hour Film Festival team.",
};

export default function ContactUsPage() {
  return (
    <div className="flex flex-1 flex-col">
      <Header />
      <section className="mx-auto flex w-full max-w-4xl flex-col items-center gap-10 px-6 py-16">
        <h1 className="text-3xl font-bold text-ink sm:text-4xl">
          Contact us
        </h1>
        <ContactWizard />
      </section>
      <Footer />
    </div>
  );
}
