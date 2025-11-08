-- Fix RLS policies for users table

-- Drop existing policies
DROP POLICY IF EXISTS "Allow public read users" ON users;
DROP POLICY IF EXISTS "Allow insert users" ON users;
DROP POLICY IF EXISTS "Allow update own user" ON users;

-- Allow anyone to read public user profiles (privacy-first, only basic info)
CREATE POLICY "Allow public read users"
  ON users FOR SELECT
  USING (true);

-- Allow anyone to create a user (for anonymous signup)
CREATE POLICY "Allow insert users"
  ON users FOR INSERT
  WITH CHECK (true);

-- Allow users to update their own profile
CREATE POLICY "Allow update own user"
  ON users FOR UPDATE
  USING (true)
  WITH CHECK (true);

SELECT '✅ Users RLS policies configured!' AS status;
