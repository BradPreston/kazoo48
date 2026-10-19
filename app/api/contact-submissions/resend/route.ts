import { createHash, timingSafeEqual } from "node:crypto";
import { z } from "zod";
import { deliverContactNotification } from "@/lib/email/notify-contact";
import { env } from "@/lib/env";
import { contactSubmissionRepository } from "@/lib/repositories";

// Node runtime (the default for route handlers) is required for node:crypto.

const bodySchema = z.object({ id: z.string().min(1) });

// Hashing both sides first gives timingSafeEqual equal-length inputs, so the
// comparison leaks neither the key's contents nor its length.
function isAuthorized(request: Request): boolean {
  const header = request.headers.get("authorization") ?? "";
  const provided = header.startsWith("Bearer ") ? header.slice(7) : "";
  const digest = (value: string) => createHash("sha256").update(value).digest();
  return timingSafeEqual(digest(provided), digest(env.ADMIN_API_KEY));
}

/**
 * Re-sends the staff notification for an existing contact submission —
 * same From, To, ReplyTo, Subject and body as the original, rebuilt from
 * the stored row. Admin-only: requires `Authorization: Bearer <ADMIN_API_KEY>`.
 *
 *   POST /api/contact-submissions/resend
 *   { "id": "<contact_submissions id>" }
 */
export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return Response.json({ error: "Body must be valid JSON" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return Response.json(
      { error: "Body must be { \"id\": string }" },
      { status: 400 }
    );
  }

  const submission = await contactSubmissionRepository.findById(parsed.data.id);
  if (!submission) {
    return Response.json(
      { error: "Contact submission not found" },
      { status: 404 }
    );
  }

  try {
    await deliverContactNotification(submission);
  } catch (error) {
    console.error("Failed to resend contact notification email:", error);
    return Response.json(
      { error: "Failed to send email" },
      { status: 502 }
    );
  }

  return Response.json({ ok: true, id: submission.id });
}
