-- Enable public Google registration while preserving admin MFA and RLS.

BEGIN;

-- Remove the old invitation-only registration restriction.
DROP TRIGGER IF EXISTS enforce_private_registration ON auth.users;

-- Allow confirmed users with an assigned student/admin role.
CREATE OR REPLACE FUNCTION public.is_active_member()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO ''
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM auth.users u
    JOIN public.user_roles r
      ON r.user_id = u.id
    WHERE u.id = (SELECT auth.uid())
      AND u.email_confirmed_at IS NOT NULL
      AND r.role IN ('student', 'admin')
  );
$function$;

COMMIT;
