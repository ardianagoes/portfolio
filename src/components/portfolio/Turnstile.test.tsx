import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { Turnstile } from "./Turnstile";

afterEach(() => {
  cleanup();
  delete window.turnstile;
  vi.useRealTimers();
});
it("renders an accessible, flexible managed challenge and handles solved/expired tokens", async () => {
  const onToken = vi.fn();
  const renderWidget = vi.fn(
    (_element: HTMLElement, _options: Record<string, unknown>) => "widget-1",
  );
  const remove = vi.fn();
  window.turnstile = { render: renderWidget, remove };
  const view = render(<Turnstile siteKey="public-test-key" onToken={onToken} />);
  await act(async () => {});
  const options = renderWidget.mock.calls[0]![1];
  expect(options).toMatchObject({
    sitekey: "public-test-key",
    size: "flexible",
    theme: "dark",
    appearance: "interaction-only",
    action: "portfolio-contact",
    "response-field": false,
  });
  act(() => (options["callback"] as (token: string) => void)("token"));
  expect(onToken).toHaveBeenLastCalledWith("token");
  act(() => (options["expired-callback"] as () => void)());
  expect(onToken).toHaveBeenLastCalledWith("");
  view.unmount();
  expect(remove).toHaveBeenCalledWith("widget-1");
});
it("announces widget errors and invalidates the token", async () => {
  let options!: Record<string, unknown>;
  window.turnstile = {
    render: (_element, value) => {
      options = value;
      return "widget-2";
    },
    remove: vi.fn(),
  };
  const onToken = vi.fn();
  render(<Turnstile siteKey="public-test-key" onToken={onToken} />);
  await act(async () => {});
  act(() => (options["error-callback"] as () => void)());
  expect(screen.getByRole("alert")).toHaveTextContent("Verification is unavailable");
  expect(onToken).toHaveBeenLastCalledWith("");
});
it("loads only the official script and safely handles a blocked script", async () => {
  render(<Turnstile siteKey="public-test-key" onToken={vi.fn()} />);
  const script = document.querySelector(
    'script[src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"]',
  );
  expect(script).not.toBeNull();
  await act(async () => {
    script!.dispatchEvent(new Event("error"));
  });
  expect(screen.getByRole("alert")).toHaveTextContent("Verification is unavailable");
});
it("announces a script-load timeout without accepting a token", async () => {
  vi.useFakeTimers();
  const onToken = vi.fn();
  render(<Turnstile siteKey="public-test-key" onToken={onToken} />);
  await act(async () => {
    await vi.advanceTimersByTimeAsync(15_000);
  });
  expect(screen.getByRole("alert")).toHaveTextContent("Verification is unavailable");
  expect(onToken).toHaveBeenLastCalledWith("");
});
