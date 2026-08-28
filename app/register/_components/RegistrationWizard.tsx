"use client";

import { useActionState, useEffect, useState, type ReactNode } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  createPaymentIntentForRegistration,
  createRegistration,
  initialCreateRegistrationState,
} from "../actions";
import PaymentForm from "./PaymentForm";
import SignupForm from "./SignupForm";
import StepIndicator from "./StepIndicator";

type ResumeState =
  | { status: "idle" }
  | { status: "ready"; clientSecret: string }
  | { status: "already_paid" }
  | { status: "error"; message: string };

function InfoCard({ children }: { children: ReactNode }) {
  return (
    <div className="w-full max-w-xl rounded-md border-2 border-ink bg-white p-8 text-center shadow-[6px_6px_0_0_var(--color-ink)]">
      {children}
    </div>
  );
}

export default function RegistrationWizard() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [state, formAction] = useActionState(
    createRegistration,
    initialCreateRegistrationState
  );

  // `step` and `registrationId` are derived, not stored: they come from
  // either a just-completed Step 1 submit (`state`) or the URL (a resumed
  // Step 2 after a refresh) — no need to duplicate either into local state.
  const step =
    state.status === "success" || searchParams.get("step") === "2" ? 2 : 1;
  const registrationId =
    state.status === "success"
      ? state.registrationId
      : searchParams.get("rid");
  const freshClientSecret =
    state.status === "success" ? state.clientSecret : null;

  const [resume, setResume] = useState<ResumeState>({ status: "idle" });

  // Keep the URL in sync after a fresh Step 1 submit so a refresh resumes
  // Step 2 instead of restarting the whole flow.
  useEffect(() => {
    if (state.status === "success") {
      router.replace(`/register?step=2&rid=${state.registrationId}`, {
        scroll: false,
      });
    }
  }, [state, router]);

  // Resume path: no client secret from a fresh submit (fresh page load /
  // refresh, or recovering from a PaymentIntent creation failure right
  // after signup) — fetch or create one.
  const needsResume =
    step === 2 &&
    Boolean(registrationId) &&
    !freshClientSecret &&
    resume.status === "idle";

  useEffect(() => {
    if (!needsResume || !registrationId) return;

    let cancelled = false;

    createPaymentIntentForRegistration(registrationId).then((result) => {
      if (cancelled) return;
      if (result.status === "success") {
        setResume({ status: "ready", clientSecret: result.clientSecret });
      } else if (result.status === "already_paid") {
        setResume({ status: "already_paid" });
      } else if (result.status === "not_found") {
        setResume({
          status: "error",
          message: "We couldn't find that registration. Please start again.",
        });
      } else {
        setResume({ status: "error", message: result.message });
      }
    });

    return () => {
      cancelled = true;
    };
  }, [needsResume, registrationId]);

  const clientSecret =
    freshClientSecret ??
    (resume.status === "ready" ? resume.clientSecret : null);
  const alreadyPaid = resume.status === "already_paid";
  const resumeError = resume.status === "error" ? resume.message : null;

  return (
    <section className="mx-auto flex w-full max-w-4xl flex-col items-center gap-8 px-6 py-16">
      <div className="flex flex-col items-center gap-3 text-center">
        <StepIndicator step={step} />
        <h1 className="text-3xl font-bold text-ink sm:text-4xl">
          Register your team
        </h1>
      </div>

      {step === 1 && <SignupForm state={state} formAction={formAction} />}

      {step === 2 && (
        <>
          {alreadyPaid && (
            <InfoCard>
              <h3 className="text-xl font-bold text-ink">
                You&apos;re already registered!
              </h3>
              <p className="mt-2 text-sm text-ink/70">
                We&apos;ve already received payment for this registration.
              </p>
            </InfoCard>
          )}

          {!alreadyPaid && !resumeError && !clientSecret && (
            <InfoCard>
              <p className="text-sm text-ink/70">Preparing payment…</p>
            </InfoCard>
          )}

          {resumeError && (
            <InfoCard>
              <p className="text-sm text-red-700">{resumeError}</p>
              <button
                type="button"
                onClick={() => setResume({ status: "idle" })}
                className="mt-4 text-sm font-semibold text-ink underline decoration-2 underline-offset-4 hover:text-primary"
              >
                Try again
              </button>
            </InfoCard>
          )}

          {!alreadyPaid && !resumeError && clientSecret && (
            <PaymentForm clientSecret={clientSecret} />
          )}
        </>
      )}
    </section>
  );
}
