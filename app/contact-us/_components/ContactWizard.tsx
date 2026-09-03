"use client";

import { useActionState } from "react";
import { submitContact } from "../actions";
import { initialCreateContactState } from "../types";
import ContactForm from "./ContactForm";

export default function ContactWizard() {
  const [state, formAction] = useActionState(
    submitContact,
    initialCreateContactState
  );

  if (state.status === "success") {
    return (
      <div className="w-full max-w-xl rounded-md border-2 border-ink bg-white p-8 text-center shadow-[6px_6px_0_0_var(--color-ink)]">
        <h3 className="text-xl font-bold text-ink">Message sent!</h3>
        <p className="mt-2 text-sm text-ink/70">
          Thanks for reaching out — we&apos;ll get back to you soon.
        </p>
      </div>
    );
  }

  return <ContactForm state={state} formAction={formAction} />;
}
