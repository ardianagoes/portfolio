import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().trim().min(1, "Please enter your name.").max(100, "Use 100 characters or fewer."),
  email: z.string().trim().min(1, "Please enter your email address.").email("Enter a valid email address.").max(255, "Use 255 characters or fewer."),
  message: z.string().trim().min(1, "Please enter a message.").max(3000, "Use 3,000 characters or fewer."),
});

export type ContactValues = z.infer<typeof contactSchema>;

// A future delivery adapter must return a receipt from the configured service.
export const contactReceiptSchema = z.object({
  accepted: z.literal(true),
  receiptId: z.string().trim().min(1),
});