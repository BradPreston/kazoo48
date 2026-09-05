import type { Metadata } from "next";
import { Suspense } from "react";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import FestivalInfo from "./_components/FestivalInfo";
import RegistrationWizard from "./_components/RegistrationWizard";
import StepIndicator from "./_components/StepIndicator";

export const metadata: Metadata = {
  title: "Register — Kazoo 48",
  description:
    "Register your team for Kazoo 48, Kalamazoo's 48 hour film festival.",
};

function RegistrationWizardFallback() {
  return (
    <div className="order-1 flex flex-col items-center gap-3 text-center lg:col-span-2">
      <StepIndicator step={1} />
      <h1 className="text-3xl font-bold text-ink sm:text-4xl">
        Register your team
      </h1>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <div className="flex flex-1 flex-col">
      <Header />
      {/* <section className="mx-auto grid w-full max-w-4xl gap-5 px-6 pb-16 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start"> */}
      <section className="mx-auto grid w-full max-w-4xl gap-5 px-6 pb-16">
        <h1 className="text-3xl font-bold text-ink sm:text-4xl mx-auto">
          Stay tuned for registrations!
        </h1>
        <p className="mx-auto">Once the filming and premiere dates are determined, we will open up the registration.</p>
        <p className="mx-auto">We cannot wait to see all of your beautiful faces!</p>
        {/* <Suspense fallback={<RegistrationWizardFallback />}>
          <RegistrationWizard />
        </Suspense>
        <FestivalInfo /> */}
      </section>
      <Footer />
    </div>
  );
}
