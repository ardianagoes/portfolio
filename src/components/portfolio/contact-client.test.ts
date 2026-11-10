import { afterEach, expect, it, vi } from "vitest";
import { sendContact } from "./contact-client";

const submission = {
  name: "Visitor",
  email: "visitor@example.com",
  message: "Hello",
  website: "",
  turnstileToken: "token",
  submissionId: "e70a627a-b3cb-4be8-85af-e87eed809038",
};
afterEach(() => vi.unstubAllGlobals());
it("posts only visitor fields and accepts a receipt", async () => {
  const fetch = vi.fn(async () => ({
    ok: true,
    json: async () => ({ accepted: true, receiptId: "receipt-123" }),
  }));
  vi.stubGlobal("fetch", fetch);
  expect(await sendContact(submission)).toEqual({ accepted: true, receiptId: "receipt-123" });
  expect(fetch).toHaveBeenCalledWith(
    "/api/contact",
    expect.objectContaining({
      method: "POST",
      body: JSON.stringify(submission),
      credentials: "same-origin",
    }),
  );
});
it("does not expose server/provider errors or accept an unconfirmed response", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => ({ ok: false, json: async () => ({ error: "private credential" }) })),
  );
  await expect(sendContact(submission)).rejects.toThrow("Contact submission unavailable");
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => ({ ok: true, json: async () => ({ accepted: false }) })),
  );
  await expect(sendContact(submission)).rejects.toThrow();
});
