import { z } from "zod";

export const emailSchema = z.string().trim().toLowerCase().email("Enter a valid email address.").max(254);
export const passwordSchema = z.string().min(12, "Use at least 12 characters.").max(128, "Use no more than 128 characters.");
export const loginSchema = z.object({ email: emailSchema, password: z.string().min(1, "Enter your password.").max(128) });
export const registrationSchema = z.object({ email: emailSchema, password: passwordSchema });
export const passwordChangeSchema = z.object({ password: passwordSchema, confirmation: z.string() })
  .refine((value) => value.password === value.confirmation, { message: "The passwords do not match.", path: ["confirmation"] });

const nullableBand = z.union([z.literal(""), z.coerce.number().min(1).max(9).multipleOf(0.5)])
  .transform((value) => value === "" ? null : value);
const nullableDate = z.string().refine((value) => {
  if (!value) return true;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  if (Number(value.slice(0, 4)) < 1) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.valueOf()) && parsed.toISOString().slice(0, 10) === value;
}, "Enter a valid date.").transform((value) => value || null);

export const profileSchema = z.object({
  display_name: z.string().trim().max(80, "Keep your name under 80 characters."),
  country: z.string().trim().max(80).transform((value) => value || null),
  timezone: z.string().min(1).max(80).refine((value) => {
    try { new Intl.DateTimeFormat("en", { timeZone: value }); return true; } catch { return false; }
  }, "Enter a valid IANA time zone, such as Asia/Singapore."),
  language: z.enum(["en", "bn"]),
  target_overall: nullableBand,
  exam_date: nullableDate,
  study_goal_minutes: z.coerce.number().int().min(5, "Choose at least 5 minutes.").max(480, "Choose up to 480 minutes."),
});

export type ProfileValues = z.output<typeof profileSchema>;

const returnPaths = new Set([
  "/dashboard", "/reading", "/listening", "/writing", "/speaking", "/mock-tests",
  "/analytics", "/profile", "/admin", "/planner", "/bookmarks", "/reset-password",
]);

export function safeReturnPath(value: unknown): string {
  return typeof value === "string" && returnPaths.has(value) ? value : "/dashboard";
}

export function formString(form: FormData, name: string): string {
  const value = form.get(name);
  return typeof value === "string" ? value : "";
}
