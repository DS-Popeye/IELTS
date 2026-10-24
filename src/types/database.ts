/** Phase 1 schema contract. Regenerate with the Supabase CLI after migration. */
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Profile = {
  user_id: string;
  display_name: string;
  country: string | null;
  timezone: string;
  language: "en" | "bn";
  target_overall: number | null;
  exam_date: string | null;
  study_goal_minutes: number;
  created_at: string;
  updated_at: string;
};

export type ProfileUpdate = Partial<
  Pick<Profile, "display_name" | "country" | "timezone" | "language" | "target_overall" | "exam_date" | "study_goal_minutes">
>;

export type UserRole = {
  user_id: string;
  role: "student" | "admin";
  assigned_by: string | null;
  assigned_at: string;
};

export type AuditEvent = {
  id: string;
  actor_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  created_at: string;
  metadata_json: Json;
};

export type SecurityEventName = "login" | "logout" | "password_updated" | "mfa_verified";

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: { user_id: string } & Partial<Omit<Profile, "user_id">>;
        Update: ProfileUpdate;
        Relationships: [];
      };
      user_roles: {
        Row: UserRole;
        Insert: { user_id: string } & Partial<Omit<UserRole, "user_id">>;
        Update: Partial<Omit<UserRole, "user_id">>;
        Relationships: [];
      };
      private_access: {
        Row: { email: string; active: boolean; created_at: string };
        Insert: { email: string; active?: boolean; created_at?: string };
        Update: { active?: boolean };
        Relationships: [];
      };
      audit_events: {
        Row: AuditEvent;
        Insert: { action: string; entity_type: string } & Partial<Omit<AuditEvent, "action" | "entity_type">>;
        Update: never;
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: {
      is_active_member: { Args: Record<string, never>; Returns: boolean };
      has_admin_access: { Args: Record<string, never>; Returns: boolean };
      record_security_event: { Args: { event_name: SecurityEventName }; Returns: undefined };
    };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};
