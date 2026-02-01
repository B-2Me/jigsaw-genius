-- Function to handle new user signups
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  is_first_user boolean;
BEGIN
  -- Check if the public.users table is empty
  SELECT count(*) = 0 INTO is_first_user FROM public.users;

  INSERT INTO public.users (id, email, full_name, role)
  VALUES (
    new.id, -- Use the same ID as Supabase Auth
    new.email,
    new.raw_user_meta_data->>'full_name', -- Grabs full_name if sent during signup
    CASE 
      WHEN is_first_user THEN 'admin' -- First user gets admin
      ELSE 'user'                     -- Everyone else gets user
    END
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function every time a user signs up
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
  