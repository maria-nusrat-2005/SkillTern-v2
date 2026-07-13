-- Alter public.internships table to add contact_email
ALTER TABLE public.internships ADD COLUMN IF NOT EXISTS contact_email TEXT;

-- Alter public.applications table to add cv_url, ssc_certificate_url, and hsc_certificate_url
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS cv_url TEXT;
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS ssc_certificate_url TEXT;
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS hsc_certificate_url TEXT;
