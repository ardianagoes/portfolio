import { z } from "zod";

export const contactSchema = z.object({
  name: z
    .string()
    .max(100, "Use 100 characters or fewer.")
    .trim()
    .min(1, "Please enter your name.")
    .regex(/^[^\p{Cc}]+$/u, "Please use a single line for your name."),
  email: z
    .string()
    .max(255, "Use 255 characters or fewer.")
    .trim()
    .min(1, "Please enter your email address.")
    .email("Enter a valid email address.")
    .regex(/^[^\p{Cc}]+$/u, "Enter a valid email address."),
  message: z
    .string()
    .max(3000, "Use 3,000 characters or fewer.")
    .trim()
    .min(1, "Please enter a message.")
    .regex(/^(?:[^\p{Cc}]|[\t\r\n])+$/u, "Please remove control characters."),
});

export type ContactValues = z.infer<typeof contactSchema>;

export type ContactSubmission = ContactValues & {
  website: string;
  turnstileToken: string;
  submissionId: string;
};

// Delivery is accepted only after the provider returns a real receipt.
export const contactReceiptSchema = z.object({
  accepted: z.literal(true),
  receiptId: z.string().trim().min(1),
});
