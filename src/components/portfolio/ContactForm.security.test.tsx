import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { ContactForm } from "./ContactForm";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

it("keeps contact details out of native GET URLs when JavaScript is unavailable", () => {
  render(<ContactForm />);
  expect(screen.getByRole("form", { name: "Contact form" })).toHaveAttribute("method", "post");
});

it("makes no network request when unconfigured contact delivery is submitted", async () => {
  const network = vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("Unexpected request"));
  render(<ContactForm />);
  fireEvent.change(screen.getByLabelText(/Name/), { target: { value: "Test visitor" } });
  fireEvent.change(screen.getByLabelText(/Email address/), {
    target: { value: "visitor@example.com" },
  });
  fireEvent.change(screen.getByLabelText(/Message/), {
    target: { value: "I would like to discuss your project." },
  });
  await act(async () => fireEvent.click(screen.getByRole("button", { name: "Send Message" })));
  expect(network).not.toHaveBeenCalled();
  expect(screen.getByRole("alert")).toHaveTextContent("Message not sent");
  expect(screen.getByLabelText(/Message/)).toHaveValue("I would like to discuss your project.");
});
