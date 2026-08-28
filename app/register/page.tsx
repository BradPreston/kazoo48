import type { Metadata } from "next";
import { Suspense } from "react";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import RegistrationWizard from "./_components/RegistrationWizard";
import StepIndicator from "./_components/StepIndicator";

export const metadata: Metadata = {
  title: "Register — Kazoo 48",
  description:
    "Register your team for Kazoo 48, Kalamazoo's 48 hour film festival.",
};

function RegistrationWizardFallback() {
  return (
    <section className="mx-auto flex w-full max-w-4xl flex-col items-center gap-8 px-6 py-16">
      <div className="flex flex-col items-center gap-3 text-center">
        <StepIndicator step={1} />
        <h1 className="text-3xl font-bold text-ink sm:text-4xl">
          Register your team
        </h1>
      </div>
    </section>
  );
}

export default function RegisterPage() {
  return (
    <div className="flex flex-1 flex-col">
      <Header />
      <Suspense fallback={<RegistrationWizardFallback />}>
        <RegistrationWizard />
      </Suspense>
      <Footer />
    </div>
  );
}
