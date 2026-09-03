export type ButtonVariant = "primary" | "secondary";

/**
 * Shared neo-brutalist CTA treatment (border, hard drop-shadow, hover/active
 * states) used by both the anchor-based `Button` and the real
 * `<button type="submit">` `SubmitButton`.
 */
export function ctaClassName(variant: ButtonVariant = "primary") {
  const bg = variant === "primary" ? "bg-primary" : "bg-secondary";

  return `inline-flex justify-center items-center gap-2 rounded-md border-2 border-ink ${bg} px-8 py-4 font-bold text-ink shadow-[4px_4px_0_0_var(--color-ink)] transition-all hover:-translate-y-0.5 hover:shadow-[6px_6px_0_0_var(--color-ink)] active:translate-y-0 active:shadow-[2px_2px_0_0_var(--color-ink)]`;
}
