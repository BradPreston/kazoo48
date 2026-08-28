export type RegistrationFormValues = {
  name: string;
  email: string;
  phone: string;
  teamName: string;
  category: string;
  additionalEmails: string[];
};

export type CreateRegistrationState =
  | { status: "idle" }
  | {
      status: "error";
      formError?: string;
      fieldErrors: Partial<Record<keyof RegistrationFormValues, string[]>>;
      values: RegistrationFormValues;
    }
  | {
      status: "success";
      registrationId: string;
      // null when the registration saved but the immediate PaymentIntent
      // creation failed (e.g. a transient Stripe error) — the client still
      // advances to Step 2 and `createPaymentIntentForRegistration` there
      // picks up the retry, the same path used to resume after a refresh.
      clientSecret: string | null;
    };

export const initialCreateRegistrationState: CreateRegistrationState = {
  status: "idle",
};
