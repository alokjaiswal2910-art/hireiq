-- Run this in Supabase SQL Editor to enable recruiter contact (email) for applicants.
-- After running: 1) Update auth signup to insert email. 2) In applications.ts getApplicationDetailsForRecruiter,
-- change the select to include applicant:users(id, full_name, avatar_url, email) and applicant.email in the return.

ALTER TABLE users ADD COLUMN IF NOT EXISTS email TEXT;

-- Optional: backfill existing users with email from auth.users (run in SQL Editor)
-- UPDATE users u SET email = (SELECT email FROM auth.users WHERE id = u.id) WHERE u.email IS NULL;
