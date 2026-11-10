import { useEffect, useRef, useState } from "react";

interface TurnstileApi {
  render(element: HTMLElement, options: Record<string, unknown>): string;
  remove(id: string): void;
}

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

let scriptPromise: Promise<TurnstileApi> | undefined;
function loadTurnstile(): Promise<TurnstileApi> {
  if (window.turnstile) return Promise.resolve(window.turnstile);
  if (!scriptPromise) {
    scriptPromise = new Promise<TurnstileApi>((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      script.async = true;
      const fail = () => {
        clearTimeout(timer);
        script.remove();
        reject(new Error("Verification unavailable"));
      };
      const timer = setTimeout(fail, 15_000);
      script.addEventListener(
        "load",
        () => {
          clearTimeout(timer);
          if (window.turnstile) resolve(window.turnstile);
          else fail();
        },
        { once: true },
      );
      script.addEventListener("error", fail, { once: true });
      document.head.append(script);
    }).catch((error: unknown) => {
      scriptPromise = undefined;
      throw error;
    });
  }
  return scriptPromise;
}

/** Managed, interaction-only challenge: keyboard accessible and visible when needed. */
export function Turnstile({
  siteKey,
  onToken,
}: {
  siteKey: string;
  onToken: (token: string) => void;
}) {
  const container = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let cancelled = false;
    let widget: string | undefined;
    let api: TurnstileApi | undefined;
    onToken("");
    void loadTurnstile()
      .then((loaded) => {
        if (cancelled || !container.current) return;
        api = loaded;
        widget = loaded.render(container.current, {
          sitekey: siteKey,
          action: "portfolio-contact",
          theme: "dark",
          size: "flexible",
          appearance: "interaction-only",
          "response-field": false,
          callback: (token: string) => {
            if (!cancelled) {
              setFailed(false);
              onToken(token);
            }
          },
          "expired-callback": () => {
            if (!cancelled) onToken("");
          },
          "timeout-callback": () => {
            if (!cancelled) onToken("");
          },
          "error-callback": () => {
            if (!cancelled) {
              onToken("");
              setFailed(true);
            }
          },
        });
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
      if (widget !== undefined) api?.remove(widget);
    };
  }, [siteKey, onToken]);
  return (
    <div className="max-w-full" aria-label="Spam verification">
      <div ref={container} />
      {failed && (
        <p role="alert" className="text-sm text-error">
          Verification is unavailable. Please refresh and try again.
        </p>
      )}
    </div>
  );
}
