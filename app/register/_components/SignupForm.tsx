"use client";

import { useRef, useState } from "react";
import { Plus, X } from "lucide-react";
import SubmitButton from "@/components/SubmitButton";
import type { CreateRegistrationState } from "../types";

const inputClassName =
  "w-full rounded-md border-2 border-ink bg-white px-4 py-3 text-ink shadow-[3px_3px_0_0_var(--color-ink)] transition-shadow placeholder:text-ink/40 focus:shadow-[5px_5px_0_0_var(--color-ink)] focus:outline-none";

function Field({
  label,
  name,
  type = "text",
  placeholder,
  autoComplete,
  errors,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
  errors?: string[];
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-sm font-semibold text-ink">{label}</span>
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required
        className={inputClassName}
      />
      <span className="min-h-5 text-sm text-red-600">{errors?.[0]}</span>
    </label>
  );
}

function CategoryOption({
  value,
  title,
  description,
}: {
  value: string;
  title: string;
  description: string;
}) {
  return (
    <label className="flex-1 cursor-pointer rounded-md border-2 border-ink bg-white p-4 shadow-[4px_4px_0_0_var(--color-ink)] transition-shadow has-[:checked]:bg-primary has-[:checked]:shadow-[2px_2px_0_0_var(--color-ink)]">
      <input
        type="radio"
        name="category"
        value={value}
        required
        className="sr-only"
      />
      <span className="block font-semibold text-ink">{title}</span>
      <span className="mt-1 block text-sm text-ink/70">{description}</span>
    </label>
  );
}

export default function SignupForm({
  state,
  formAction,
}: {
  state: CreateRegistrationState;
  formAction: (formData: FormData) => void;
}) {
  const nextRowId = useRef(0);
  const [emailRowIds, setEmailRowIds] = useState<number[]>([]);

  const fieldErrors = state.status === "error" ? state.fieldErrors : {};

  function addEmailRow() {
    setEmailRowIds((ids) => [...ids, nextRowId.current++]);
  }

  function removeEmailRow(id: number) {
    setEmailRowIds((ids) => ids.filter((rowId) => rowId !== id));
  }

  return (
    <form
      action={formAction}
      className="flex w-full max-w-xl flex-col gap-8 rounded-md border-2 border-ink bg-white p-8 shadow-[6px_6px_0_0_var(--color-ink)]"
    >
      {state.status === "error" && state.formError && (
        <p className="rounded-md border-2 border-red-600 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {state.formError}
        </p>
      )}

      <div className="flex flex-col gap-6">
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
        <Field
          label="Phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          errors={fieldErrors.phone}
        />
        <Field
          label="Team name"
          name="teamName"
          errors={fieldErrors.teamName}
        />
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-sm font-semibold text-ink">Category</span>
        <div className="flex flex-col gap-3 sm:flex-row">
          <CategoryOption
            value="amateur"
            title="Amateur"
            description="First-timers and hobbyist filmmakers."
          />
          <CategoryOption
            value="professional"
            title="Professional"
            description="Experienced crews and working filmmakers."
          />
        </div>
        <span className="min-h-5 text-sm text-red-600">
          {fieldErrors.category?.[0]}
        </span>
      </div>

      <div className="flex flex-col gap-3">
        <span className="text-sm font-semibold text-ink">
          Additional emails{" "}
          <span className="font-normal text-ink/60">(optional)</span>
        </span>

        {emailRowIds.map((id) => (
          <div key={id} className="flex items-center gap-2">
            <input
              type="email"
              name="additionalEmails[]"
              placeholder="teammate@example.com"
              className={inputClassName}
            />
            <button
              type="button"
              onClick={() => removeEmailRow(id)}
              aria-label="Remove email"
              className="shrink-0 rounded-md border-2 border-ink bg-white p-2 shadow-[2px_2px_0_0_var(--color-ink)] transition-shadow hover:shadow-[3px_3px_0_0_var(--color-ink)]"
            >
              <X size={18} />
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={addEmailRow}
          className="inline-flex w-fit items-center gap-1 text-sm font-semibold text-ink underline decoration-2 underline-offset-4 hover:text-primary"
        >
          <Plus size={16} />
          Add another email
        </button>

        <span className="min-h-5 text-sm text-red-600">
          {fieldErrors.additionalEmails?.[0]}
        </span>
      </div>

      <SubmitButton>Continue to payment</SubmitButton>
    </form>
  );
}
