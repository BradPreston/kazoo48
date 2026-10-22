"use client";

import { useActionState } from "react";
import { getRecaptchaToken } from "@/lib/recaptcha.client";
import { submitContact } from "../actions";
import { type CreateContactState, initialCreateContactState } from "../types";
import ContactForm from "./ContactForm";

export default function ContactWizard() {
  const [state, formAction] = useActionState(
    // Fetches the reCAPTCHA token inside the action (rather than in an
    // onSubmit handler) so SubmitButton's pending state covers it and every
    // resubmit gets a fresh single-use token.
    async (
      prevState: CreateContactState,
      formData: FormData
    ): Promise<CreateContactState> => {
      try {
        formData.set("recaptchaToken", await getRecaptchaToken("contact_form"));
      } catch (error) {
        console.error("Failed to get reCAPTCHA token:", error);
        return {
          status: "error",
          formError:
            "Security check couldn't load. Please refresh and try again.",
          fieldErrors: {},
          values: {
            name: String(formData.get("name") ?? ""),
            email: String(formData.get("email") ?? ""),
            message: String(formData.get("message") ?? ""),
          },
        };
      }
      return submitContact(prevState, formData);
    },
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
