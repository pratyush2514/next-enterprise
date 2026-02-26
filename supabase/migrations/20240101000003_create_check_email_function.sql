-- Function to check if an email exists in auth.users
-- Used by the check-email API endpoint during signup
-- SECURITY DEFINER allows the function to access auth schema
CREATE OR REPLACE FUNCTION public.check_email_exists(email_to_check text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = auth, public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM auth.users WHERE email = lower(email_to_check)
  );
$$;

-- Only allow authenticated and anonymous users to call this function
-- (anon key is used from the API route)
GRANT EXECUTE ON FUNCTION public.check_email_exists(text) TO anon;
GRANT EXECUTE ON FUNCTION public.check_email_exists(text) TO authenticated;
