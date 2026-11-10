import { contactReceiptSchema, type ContactSubmission } from "./contact-schema";

export async function sendContact(values: ContactSubmission): Promise<unknown> {
  const response = await fetch("/api/contact", {
    method: "POST",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(values),
    signal: AbortSignal.timeout(30_000),
  });
  // Never surface provider/configuration details, even if an upstream proxy fails.
  if (!response.ok) throw new Error("Contact submission unavailable");
  return contactReceiptSchema.parse(await response.json());
}
