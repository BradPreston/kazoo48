export type ContactFormValues = {
  name: string;
  email: string;
  message: string;
};

export type CreateContactState =
  | { status: "idle" }
  | {
      status: "error";
      formError?: string;
      fieldErrors: Partial<Record<keyof ContactFormValues, string[]>>;
      values: ContactFormValues;
    }
  | { status: "success" };

export const initialCreateContactState: CreateContactState = {
  status: "idle",
};
