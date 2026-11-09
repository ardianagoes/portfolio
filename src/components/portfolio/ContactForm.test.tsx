import { act, fireEvent, render, screen, cleanup } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { ContactForm } from "./ContactForm";
import { contactSchema } from "./contact-schema";

afterEach(cleanup);
function fillForm() {
  fireEvent.change(screen.getByLabelText(/Name/), { target: { value: "Test visitor" } });
  fireEvent.change(screen.getByLabelText(/Email address/), { target: { value: "visitor@example.com" } });
  fireEvent.change(screen.getByLabelText(/Message/), { target: { value: "I would like to discuss your project." } });
}
describe("contact requirements", () => {
  for (const field of ["name", "email", "message"] as const) {
    it(`requires ${field}`, () => {
      expect(contactSchema.safeParse({ name: "Visitor", email: "visitor@example.com", message: "Hello", [field]: " " }).success).toBe(false);
    });
  }
  it("rejects invalid email addresses", () => {
    expect(contactSchema.safeParse({ name: "Visitor", email: "not-an-email", message: "Hello" }).success).toBe(false);
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
    const delivery = new Promise<unknown>((resolve) => { accept = resolve; });
    render(<ContactForm onSend={() => delivery} />);
    fillForm();
    fireEvent.click(screen.getByRole("button", { name: "Send Message" }));
    expect(screen.getByRole("button", { name: /Sending/ })).toBeDisabled();
    expect(screen.queryByText(/Your message has been accepted/)).toBeNull();
    await act(async () => { accept?.({ accepted: true, receiptId: "receipt-123" }); });
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