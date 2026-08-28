export default function StepIndicator({ step }: { step: 1 | 2 }) {
  return (
    <span className="inline-block rounded-md border-2 border-ink bg-secondary px-3 py-1 text-xs font-bold tracking-wide text-ink uppercase shadow-[2px_2px_0_0_var(--color-ink)]">
      Step {step} of 2 — {step === 1 ? "Team info" : "Payment"}
    </span>
  );
}
