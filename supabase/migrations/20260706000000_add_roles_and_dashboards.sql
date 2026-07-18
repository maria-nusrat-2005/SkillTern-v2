-- Migration to add admin and company/organization roles and dashboards

-- 1. Alter profiles table to add role and company details
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT CHECK (role IN ('student', 'company', 'admin'));
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS company_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS company_domain TEXT;

-- For existing profiles, assume they are students
UPDATE public.profiles SET role = 'student' WHERE role IS NULL;

-- 2. Alter internships table to add creator reference
ALTER TABLE public.internships ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Grant write access to internships for authenticated users (controlled by RLS policies below)
GRANT INSERT, UPDATE, DELETE ON public.internships TO authenticated;

-- 3. Security Helper Functions to prevent infinite recursion in RLS policies
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.is_company()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = auth.uid() AND role = 'company'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 4. RLS policies update

-- profiles table policies
-- Enable SELECT on profiles for all authenticated users to allow recruiters/admins to view student details
CREATE POLICY "Authenticated users can select all profiles" ON public.profiles
  FOR SELECT TO authenticated USING (true);

-- Admins can do anything on profiles
CREATE POLICY "Admins manage all profiles" ON public.profiles
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());


-- internships table policies
CREATE POLICY "Company/Admin can insert internships" ON public.internships
  FOR INSERT TO authenticated WITH CHECK (public.is_company() OR public.is_admin());

CREATE POLICY "Creator or Admin can update internships" ON public.internships
  FOR UPDATE TO authenticated USING (user_id = auth.uid() OR public.is_admin())
  WITH CHECK (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "Creator or Admin can delete internships" ON public.internships
  FOR DELETE TO authenticated USING (user_id = auth.uid() OR public.is_admin());


-- applications table policies
CREATE POLICY "Recruiters and admins can select applications" ON public.applications
  FOR SELECT TO authenticated USING (
    public.is_admin() OR EXISTS (
      SELECT 1 FROM public.internships
      WHERE internships.id = applications.internship_id
        AND internships.user_id = auth.uid()
    )
  );

CREATE POLICY "Recruiters and admins can update applications" ON public.applications
  FOR UPDATE TO authenticated USING (
    public.is_admin() OR EXISTS (
      SELECT 1 FROM public.internships
      WHERE internships.id = applications.internship_id
        AND internships.user_id = auth.uid()
    )
  ) WITH CHECK (
    public.is_admin() OR EXISTS (
      SELECT 1 FROM public.internships
      WHERE internships.id = applications.internship_id
        AND internships.user_id = auth.uid()
    )
  );


-- application_status_history table policies
CREATE POLICY "Recruiters and admins can view status history" ON public.application_status_history
  FOR SELECT TO authenticated USING (
    public.is_admin() OR EXISTS (
      SELECT 1 FROM public.applications
      JOIN public.internships ON internships.id = applications.internship_id
      WHERE applications.id = application_status_history.application_id
        AND (internships.user_id = auth.uid() OR applications.user_id = auth.uid())
    )
  );

CREATE POLICY "Recruiters and admins can insert status history" ON public.application_status_history
  FOR INSERT TO authenticated WITH CHECK (
    public.is_admin() OR EXISTS (
      SELECT 1 FROM public.applications
      JOIN public.internships ON internships.id = applications.internship_id
      WHERE applications.id = application_status_history.application_id
        AND (internships.user_id = auth.uid() OR applications.user_id = auth.uid())
    )
  );

-- Update company_reviews policy to allow anonymous/unauthenticated select queries (needed for publicClient queries)
DROP POLICY IF EXISTS "Anyone signed in can read reviews" ON public.company_reviews;
CREATE POLICY "Anyone can read reviews" ON public.company_reviews
  FOR SELECT USING (true);
