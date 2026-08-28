"use client";

import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { ctaClassName, type ButtonVariant } from "./buttonStyles";

type SubmitButtonProps = {
  children: ReactNode;
  icon?: ReactNode;
  variant?: ButtonVariant;
  disabled?: boolean;
};

/**
 * Real `<button type="submit">` with Button.tsx's visual treatment, for use
 * inside a `<form>`. Reads pending state from the nearest form via
 * `useFormStatus` so it works without prop-drilling from a parent's
 * `useActionState`.
 */
export default function SubmitButton({
  children,
  icon,
  variant = "primary",
  disabled,
}: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={disabled || pending}
      className={`${ctaClassName(variant)} disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-[4px_4px_0_0_var(--color-ink)]`}
    >
      {icon}
      {pending ? "Please wait…" : children}
    </button>
  );
}
