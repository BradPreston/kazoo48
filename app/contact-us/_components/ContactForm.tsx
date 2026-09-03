"use client";

import SubmitButton from "@/components/SubmitButton";
import type { CreateContactState } from "../types";

const inputClassName =
  "w-full rounded-md border-2 border-ink bg-white px-4 py-3 text-ink shadow-[3px_3px_0_0_var(--color-ink)] transition-shadow placeholder:text-ink/40 focus:shadow-[5px_5px_0_0_var(--color-ink)] focus:outline-none";

function Field({
  label,
  name,
  type = "text",
  autoComplete,
  errors,
}: {
  label: string;
  name: string;
  type?: string;
  autoComplete?: string;
  errors?: string[];
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-sm font-semibold text-ink">{label}</span>
      <input
        type={type}
        name={name}
        autoComplete={autoComplete}
        required
        className={inputClassName}
      />
      <span className="min-h-5 text-sm text-red-600">{errors?.[0]}</span>
    </label>
  );
}

export default function ContactForm({
  state,
  formAction,
}: {
  state: CreateContactState;
  formAction: (formData: FormData) => void;
}) {
  const fieldErrors = state.status === "error" ? state.fieldErrors : {};

  return (
    <form
      action={formAction}
      className="flex w-full flex-col gap-8 rounded-md border-2 border-ink bg-white p-8 shadow-[6px_6px_0_0_var(--color-ink)]"
    >
      {state.status === "error" && state.formError && (
        <p className="rounded-md border-2 border-red-600 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {state.formError}
        </p>
      )}

      <div className="flex flex-col gap-6 md:grid md:grid-cols-2">
        <Field
          label="Name"
          name="name"
          autoComplete="name"
          errors={fieldErrors.name}
        />
        <Field
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          errors={fieldErrors.email}
        />
        <label className="flex flex-col gap-2 md:col-span-2">
          <span className="text-sm font-semibold text-ink">Message</span>
          <textarea
            name="message"
            required
            rows={6}
            className={`${inputClassName} min-h-40 resize-y`}
          />
          <span className="min-h-5 text-sm text-red-600">
            {fieldErrors.message?.[0]}
          </span>
        </label>
      </div>

      <SubmitButton>Send message</SubmitButton>
    </form>
  );
}
