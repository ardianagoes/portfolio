import { useRef, useState, type FormEvent } from "react";
import { ArrowUpRight, Check, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  contactReceiptSchema,
  contactSchema,
  type ContactValues,
  type ContactSubmission,
} from "./contact-schema";
import { sendContact } from "./contact-client";
import { Turnstile } from "./Turnstile";

type FieldErrors = Partial<Record<keyof ContactValues, string>>;
type Status = "idle" | "sending" | "error" | "accepted";

export function ContactForm({
  onSend,
  siteKey = import.meta.env["VITE_TURNSTILE_SITE_KEY"],
}: {
  onSend?: (values: ContactSubmission) => Promise<unknown>;
  siteKey?: string;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<Status>("idle");
  const [sendError, setSendError] = useState("");
  const [token, setToken] = useState("");
  const [challenge, setChallenge] = useState(0);
  const inFlight = useRef(false);
  const attempt = useRef<{ content: string; id: string } | undefined>(undefined);
  const deliver = onSend ?? (siteKey ? sendContact : undefined);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (inFlight.current) return;
    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form));
    const result = contactSchema.safeParse(values);
    if (!result.success) {
      const nextErrors: FieldErrors = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0];
        if ((field === "name" || field === "email" || field === "message") && !nextErrors[field])
          nextErrors[field] = issue.message;
      }
      setErrors(nextErrors);
      setStatus("idle");
      const first = Object.keys(nextErrors)[0];
      const input = first ? form.elements.namedItem(first) : null;
      if (input instanceof HTMLElement) input.focus();
      return;
    }
    setErrors({});
    if (!deliver) {
      setStatus("error");
      setSendError("Message not sent. Contact delivery is not connected yet.");
      return;
    }
    if (siteKey && !token) {
      setStatus("error");
      setSendError("Please complete the spam verification before sending.");
      return;
    }
    const content = JSON.stringify(result.data);
    if (attempt.current?.content !== content)
      attempt.current = { content, id: crypto.randomUUID() };
    inFlight.current = true;
    setStatus("sending");
    setSendError("");
    try {
      const receipt = contactReceiptSchema.safeParse(
        await deliver({
          ...result.data,
          website: String(values["website"] ?? ""),
          turnstileToken: token,
          submissionId: attempt.current.id,
        }),
      );
      if (!receipt.success) throw new Error("No acceptance receipt");
      setStatus("accepted");
      formRef.current?.reset();
      attempt.current = undefined;
    } catch {
      setStatus("error");
      setSendError(
        "Your message could not be confirmed. Your text is still here; please try again later.",
      );
    } finally {
      inFlight.current = false;
      setToken("");
      setChallenge((value) => value + 1);
    }
  }

  return (
    <form
      ref={formRef}
      noValidate
      onSubmit={submit}
      onChange={() => {
        if (status === "accepted" || status === "error") setStatus("idle");
      }}
      aria-label="Contact form"
      aria-busy={status === "sending"}
      className="space-y-6"
    >
      <div className="sr-only" aria-hidden="true">
        <label htmlFor="contact-website">Leave this field empty</label>
        <input
          id="contact-website"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          maxLength={200}
        />
      </div>
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-3">
          <Label htmlFor="contact-name">
            Name <span className="text-muted-foreground">(required)</span>
          </Label>
          <Input
            disabled={status === "sending"}
            id="contact-name"
            name="name"
            autoComplete="name"
            required
            maxLength={100}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? "contact-name-error" : undefined}
            className="h-12 bg-card/40 shadow-none"
          />
          {errors.name && (
            <p id="contact-name-error" className="text-sm text-error" role="alert">
              {errors.name}
            </p>
          )}
        </div>
        <div className="space-y-3">
          <Label htmlFor="contact-email">
            Email address <span className="text-muted-foreground">(required)</span>
          </Label>
          <Input
            disabled={status === "sending"}
            id="contact-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            maxLength={255}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "contact-email-error" : undefined}
            className="h-12 bg-card/40 shadow-none"
          />
          {errors.email && (
            <p id="contact-email-error" className="text-sm text-error" role="alert">
              {errors.email}
            </p>
          )}
        </div>
      </div>
      <div className="space-y-3">
        <Label htmlFor="contact-message">
          Message <span className="text-muted-foreground">(required)</span>
        </Label>
        <Textarea
          disabled={status === "sending"}
          id="contact-message"
          name="message"
          required
          maxLength={3000}
          aria-invalid={Boolean(errors.message)}
          aria-describedby={errors.message ? "contact-message-error" : undefined}
          className="min-h-40 resize-y bg-card/40 shadow-none"
        />
        {errors.message && (
          <p id="contact-message-error" className="text-sm text-error" role="alert">
            {errors.message}
          </p>
        )}
      </div>
      {siteKey && <Turnstile key={challenge} siteKey={siteKey} onToken={setToken} />}
      <div className="flex flex-wrap items-center gap-4">
        <Button type="submit" disabled={status === "sending"} className="h-12 min-w-40 shadow-none">
          {status === "sending" ? (
            <>
              Sending… <LoaderCircle aria-hidden="true" />
            </>
          ) : (
            <>
              Send Message <ArrowUpRight aria-hidden="true" />
            </>
          )}
        </Button>
        {!deliver && <p className="text-sm text-muted-foreground">Sending is not available yet.</p>}
      </div>
      <div aria-live="polite" aria-atomic="true">
        {status === "error" && (
          <p role="alert" className="text-sm leading-6 text-error">
            {sendError}
          </p>
        )}
        {status === "accepted" && (
          <p className="flex items-center gap-2 text-sm text-primary">
            <Check aria-hidden="true" className="h-4 w-4" />
            Your message has been accepted. Thank you for reaching out.
          </p>
        )}
      </div>
    </form>
  );
}
