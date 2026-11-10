import { act, fireEvent, render, screen, cleanup } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ContactForm } from "./ContactForm";
import { contactSchema, type ContactSubmission } from "./contact-schema";

vi.mock("./Turnstile", () => ({
  Turnstile: ({ onToken }: { onToken: (token: string) => void }) => (
    <button type="button" onClick={() => onToken("verified-test-token")}>
      Complete verification
    </button>
  ),
}));

afterEach(cleanup);
function fillForm() {
  fireEvent.change(screen.getByLabelText(/Name/), { target: { value: "Test visitor" } });
  fireEvent.change(screen.getByLabelText(/Email address/), {
    target: { value: "visitor@example.com" },
  });
  fireEvent.change(screen.getByLabelText(/Message/), {
    target: { value: "I would like to discuss your project." },
  });
}
describe("contact requirements", () => {
  it("requires a challenge when the site key is configured", async () => {
    const send = vi.fn();
    render(<ContactForm siteKey="public-test-key" onSend={send} />);
    fillForm();
    fireEvent.click(screen.getByRole("button", { name: "Send Message" }));
    expect(screen.getByRole("alert")).toHaveTextContent("complete the spam verification");
    expect(send).not.toHaveBeenCalled();
  });
  it("locks duplicate submissions and fields until the single request completes", async () => {
    let finish!: (value: unknown) => void;
    const send = vi.fn(
      (_values: ContactSubmission) =>
        new Promise((resolve) => {
          finish = resolve;
        }),
    );
    render(<ContactForm siteKey="public-test-key" onSend={send} />);
    fillForm();
    fireEvent.click(screen.getByRole("button", { name: "Complete verification" }));
    const form = screen.getByRole("form", { name: "Contact form" });
    act(() => {
      fireEvent.submit(form);
      fireEvent.submit(form);
    });
    expect(send).toHaveBeenCalledTimes(1);
    expect(screen.getByLabelText(/Name/)).toBeDisabled();
    expect(send.mock.calls[0]![0]).toMatchObject({
      turnstileToken: "verified-test-token",
      website: "",
    });
    await act(async () => finish({ accepted: true, receiptId: "receipt-123" }));
    expect(screen.getByLabelText(/Message/)).toHaveValue("");
    expect(screen.getByLabelText(/Name/)).not.toBeDisabled();
  });
  it("retains content and submission identity for retries but requires fresh verification", async () => {
    const send = vi.fn(async (_values: ContactSubmission) => {
      throw new Error("network failure");
    });
    render(<ContactForm siteKey="public-test-key" onSend={send} />);
    fillForm();
    fireEvent.click(screen.getByRole("button", { name: "Complete verification" }));
    await act(async () => fireEvent.click(screen.getByRole("button", { name: "Send Message" })));
    expect(screen.getByLabelText(/Message/)).toHaveValue("I would like to discuss your project.");
    fireEvent.click(screen.getByRole("button", { name: "Send Message" }));
    expect(send).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole("button", { name: "Complete verification" }));
    await act(async () => fireEvent.click(screen.getByRole("button", { name: "Send Message" })));
    expect(send.mock.calls[0]![0]).toMatchObject({
      submissionId: (send.mock.calls[1]![0] as { submissionId: string }).submissionId,
    });
    fireEvent.change(screen.getByLabelText(/Message/), { target: { value: "Different message." } });
    fireEvent.click(screen.getByRole("button", { name: "Complete verification" }));
    await act(async () => fireEvent.click(screen.getByRole("button", { name: "Send Message" })));
    expect((send.mock.calls[2]![0] as { submissionId: string }).submissionId).not.toBe(
      (send.mock.calls[0]![0] as { submissionId: string }).submissionId,
    );
  });
  for (const field of ["name", "email", "message"] as const) {
    it(`requires ${field}`, () => {
      expect(
        contactSchema.safeParse({
          name: "Visitor",
          email: "visitor@example.com",
          message: "Hello",
          [field]: " ",
        }).success,
      ).toBe(false);
    });
  }
  it("rejects invalid email addresses", () => {
    expect(
      contactSchema.safeParse({ name: "Visitor", email: "not-an-email", message: "Hello" }).success,
    ).toBe(false);
  });
  it("focuses the first invalid field", () => {
    render(<ContactForm />);
    fireEvent.click(screen.getByRole("button", { name: "Send Message" }));
    expect(screen.getByLabelText(/Name/)).toHaveFocus();
    expect(screen.getAllByRole("alert")).toHaveLength(3);
  });
  it("never claims success without configured delivery", async () => {
    render(<ContactForm />);
    fillForm();
    await act(async () => fireEvent.click(screen.getByRole("button", { name: "Send Message" })));
    expect(screen.getByRole("alert")).toHaveTextContent("Message not sent");
    expect(screen.queryByText(/Your message has been accepted/)).toBeNull();
  });
  it("shows sending while waiting and success only after acceptance", async () => {
    let accept: ((value: unknown) => void) | undefined;
    const delivery = new Promise<unknown>((resolve) => {
      accept = resolve;
    });
    render(<ContactForm onSend={() => delivery} />);
    fillForm();
    fireEvent.click(screen.getByRole("button", { name: "Send Message" }));
    expect(screen.getByRole("button", { name: /Sending/ })).toBeDisabled();
    expect(screen.queryByText(/Your message has been accepted/)).toBeNull();
    await act(async () => {
      accept?.({ accepted: true, receiptId: "receipt-123" });
    });
    expect(screen.getByText(/Your message has been accepted/)).toBeInTheDocument();
  });
  it("rejects an unconfirmed delivery and preserves the message", async () => {
    render(<ContactForm onSend={async () => ({ accepted: false })} />);
    fillForm();
    await act(async () => fireEvent.click(screen.getByRole("button", { name: "Send Message" })));
    expect(screen.getByRole("alert")).toHaveTextContent("could not be confirmed");
    expect(screen.getByLabelText(/Message/)).toHaveValue("I would like to discuss your project.");
    expect(screen.queryByText(/Your message has been accepted/)).toBeNull();
  });
});
