/*
# Level 5 — User Growth & Feedback Infrastructure

Creates 3 tables to support Blue Belt requirements:
1. user_profiles — onboarding info (name, email) linked to wallet address
2. user_feedback — product feedback ratings + comments for iteration
3. referrals — referral tracking for user growth (50+ users goal)
4. user_activity — aggregate activity tracking for analytics dashboard

All tables use public RLS (anon + authenticated) because the app is
wallet-based, not account-based — data is keyed by Stellar public keys.
*/

-- 1. User profiles (onboarding)
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address text NOT NULL UNIQUE,
  name text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  joined_at timestamptz NOT NULL DEFAULT now(),
  last_active timestamptz NOT NULL DEFAULT now(),
  onboarded boolean NOT NULL DEFAULT false,
  referral_code text,
  referred_by text,
  CONSTRAINT valid_email CHECK (email = '' OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

CREATE INDEX IF NOT EXISTS idx_user_profiles_referral_code ON user_profiles (referral_code);
CREATE INDEX IF NOT EXISTS idx_user_profiles_referred_by ON user_profiles (referred_by);

-- 2. User feedback (product iteration)
CREATE TABLE IF NOT EXISTS user_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address text NOT NULL,
  name text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  rating int NOT NULL CHECK (rating >= 1 AND rating <= 5),
  ease_of_use int NOT NULL CHECK (ease_of_use >= 1 AND ease_of_use <= 5),
  would_recommend int NOT NULL CHECK (would_recommend >= 1 AND would_recommend <= 5),
  favorite_feature text,
  improvement_suggestion text,
  experienced_bugs text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_feedback_wallet ON user_feedback (wallet_address);
CREATE INDEX IF NOT EXISTS idx_user_feedback_created ON user_feedback (created_at DESC);

-- 3. Referrals (user growth tracking)
CREATE TABLE IF NOT EXISTS referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_address text NOT NULL,
  referred_address text NOT NULL UNIQUE,
  referral_code text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals (referrer_address);

-- 4. User activity (analytics dashboard)
CREATE TABLE IF NOT EXISTS user_activity (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address text NOT NULL,
  action_type text NOT NULL,
  action_detail text,
  tx_hash text,
  amount_xlm numeric(20, 7),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_activity_wallet ON user_activity (wallet_address);
CREATE INDEX IF NOT EXISTS idx_user_activity_type ON user_activity (action_type);
CREATE INDEX IF NOT EXISTS idx_user_activity_created ON user_activity (created_at DESC);

-- RLS — public access (wallet-based app, no auth session)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity ENABLE ROW LEVEL SECURITY;

-- user_profiles policies
DROP POLICY IF EXISTS "anon_select_profiles" ON user_profiles;
CREATE POLICY "anon_select_profiles" ON user_profiles FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_profiles" ON user_profiles;
CREATE POLICY "anon_insert_profiles" ON user_profiles FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_profiles" ON user_profiles;
CREATE POLICY "anon_update_profiles" ON user_profiles FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_profiles" ON user_profiles;
CREATE POLICY "anon_delete_profiles" ON user_profiles FOR DELETE
  TO anon, authenticated USING (true);

-- user_feedback policies
DROP POLICY IF EXISTS "anon_select_feedback" ON user_feedback;
CREATE POLICY "anon_select_feedback" ON user_feedback FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_feedback" ON user_feedback;
CREATE POLICY "anon_insert_feedback" ON user_feedback FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_feedback" ON user_feedback;
CREATE POLICY "anon_update_feedback" ON user_feedback FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_feedback" ON user_feedback;
CREATE POLICY "anon_delete_feedback" ON user_feedback FOR DELETE
  TO anon, authenticated USING (true);

-- referrals policies
DROP POLICY IF EXISTS "anon_select_referrals" ON referrals;
CREATE POLICY "anon_select_referrals" ON referrals FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_referrals" ON referrals;
CREATE POLICY "anon_insert_referrals" ON referrals FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_referrals" ON referrals;
CREATE POLICY "anon_update_referrals" ON referrals FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_referrals" ON referrals;
CREATE POLICY "anon_delete_referrals" ON referrals FOR DELETE
  TO anon, authenticated USING (true);

-- user_activity policies
DROP POLICY IF EXISTS "anon_select_activity" ON user_activity;
CREATE POLICY "anon_select_activity" ON user_activity FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_activity" ON user_activity;
CREATE POLICY "anon_insert_activity" ON user_activity FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_activity" ON user_activity;
CREATE POLICY "anon_update_activity" ON user_activity FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_activity" ON user_activity;
CREATE POLICY "anon_delete_activity" ON user_activity FOR DELETE
  TO anon, authenticated USING (true);
