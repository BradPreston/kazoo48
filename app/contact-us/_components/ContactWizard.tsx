"use client";

import * as Sentry from "@sentry/nextjs";
import { useActionState } from "react";
import { getRecaptchaToken } from "@/lib/recaptcha.client";
import { CONTACT_FORM_SENTRY_TAGS } from "@/lib/sentry";
import { submitContact } from "../actions";
import {
  type ContactFormValues,
  type CreateContactState,
  initialCreateContactState,
} from "../types";
import ContactForm from "./ContactForm";

function readFormValues(formData: FormData): ContactFormValues {
  return {
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    message: String(formData.get("message") ?? ""),
  };
}

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
        Sentry.captureException(error, { tags: CONTACT_FORM_SENTRY_TAGS });
        return {
          status: "error",
          formError:
            "Security check couldn't load. Please refresh and try again.",
          fieldErrors: {},
          values: readFormValues(formData),
        };
      }

      // submitContact returns its own errors as state, so this only catches
      // the call itself failing (network drop, server crash), which would
      // otherwise escape to the error boundary and replace the whole page.
      try {
        return await submitContact(prevState, formData);
      } catch (error) {
        console.error("Contact form submission failed:", error);
        Sentry.captureException(error, { tags: CONTACT_FORM_SENTRY_TAGS });
        return {
          status: "error",
          formError:
            "Something went wrong sending your message. Please try again.",
          fieldErrors: {},
          values: readFormValues(formData),
        };
      }
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
