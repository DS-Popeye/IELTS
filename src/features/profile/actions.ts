"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getAuthConfiguration } from "@/lib/env";
import { formString, profileSchema } from "@/lib/auth/validation";

export type ProfileActionState = { status: "idle" | "error" | "success"; message: string };

export async function updateProfileAction(_previous: ProfileActionState, form: FormData): Promise<ProfileActionState> {
  if (!getAuthConfiguration().ready) return { status: "error", message: "Connected profile saving is unavailable in this preview." };
  const parsed = profileSchema.safeParse({
    display_name: formString(form, "display_name"), country: formString(form, "country"), timezone: formString(form, "timezone"),
    language: formString(form, "language"), target_overall: formString(form, "target_overall"), exam_date: formString(form, "exam_date"),
    study_goal_minutes: formString(form, "study_goal_minutes"),
  });
  if (!parsed.success) return { status: "error", message: parsed.error.issues[0].message };
  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  const { data: active, error: accessError } = await supabase.rpc("is_active_member");
  if (userError || !user || accessError || !active) return { status: "error", message: "Sign in with an approved account before saving your profile." };
  const { data, error } = await supabase.from("profiles").update(parsed.data).eq("user_id", user.id).select("user_id").single();
  if (error || !data) return { status: "error", message: "Your profile could not be saved. Please try again." };
  revalidatePath("/profile");
  revalidatePath("/dashboard");
  return { status: "success", message: "Your profile and study preferences have been saved." };
}
