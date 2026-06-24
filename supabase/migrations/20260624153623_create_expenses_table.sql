/*
# Create expenses and expense_participants tables

This migration sets up persistent storage for Divify expense splits.

1. New Tables
   - `expenses`
     - id (uuid, pk)
     - payer_address (text) — Stellar public key of the payer
     - description (text) — expense label e.g. "Tokyo dinner"
     - total_amount_xlm (numeric) — total in XLM (7 decimal places)
     - currency (text) — "XLM" or "USD"
     - total_amount_usd (numeric, nullable)
     - participant_count (int)
     - contract_expense_id (bigint, nullable) — on-chain expense ID from DivifySplitter
     - tx_hash (text, nullable) — Stellar transaction hash
     - status (text) — "pending" | "paid" | "partial"
     - created_at (timestamptz)

   - `expense_participants`
     - id (uuid, pk)
     - expense_id (uuid, fk → expenses.id)
     - name (text)
     - stellar_address (text, nullable)
     - amount_xlm (numeric)
     - paid (boolean, default false)
     - tx_hash (text, nullable)
     - created_at (timestamptz)

2. Security
   - RLS enabled on both tables.
   - Public/shared access (anon + authenticated) because the app is wallet-based,
     not account-based — expenses are associated with Stellar public keys.

3. Indexes
   - expenses.payer_address for wallet-scoped queries
   - expense_participants.expense_id for joins
*/

CREATE TABLE IF NOT EXISTS expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  payer_address text NOT NULL,
  description text NOT NULL,
  total_amount_xlm numeric(20, 7) NOT NULL,
  currency text NOT NULL DEFAULT 'XLM',
  total_amount_usd numeric(20, 2),
  participant_count int NOT NULL DEFAULT 0,
  contract_expense_id bigint,
  tx_hash text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS expense_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  expense_id uuid NOT NULL REFERENCES expenses(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT '',
  stellar_address text,
  amount_xlm numeric(20, 7) NOT NULL,
  paid boolean NOT NULL DEFAULT false,
  tx_hash text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_expenses_payer ON expenses (payer_address);
CREATE INDEX IF NOT EXISTS idx_expense_participants_expense ON expense_participants (expense_id);

-- RLS
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_participants ENABLE ROW LEVEL SECURITY;

-- Expenses: public access keyed by Stellar address (no auth session required)
DROP POLICY IF EXISTS "anon_select_expenses" ON expenses;
CREATE POLICY "anon_select_expenses" ON expenses FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_expenses" ON expenses;
CREATE POLICY "anon_insert_expenses" ON expenses FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_expenses" ON expenses;
CREATE POLICY "anon_update_expenses" ON expenses FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_expenses" ON expenses;
CREATE POLICY "anon_delete_expenses" ON expenses FOR DELETE
  TO anon, authenticated USING (true);

-- Expense participants
DROP POLICY IF EXISTS "anon_select_participants" ON expense_participants;
CREATE POLICY "anon_select_participants" ON expense_participants FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_participants" ON expense_participants;
CREATE POLICY "anon_insert_participants" ON expense_participants FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_participants" ON expense_participants;
CREATE POLICY "anon_update_participants" ON expense_participants FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_participants" ON expense_participants;
CREATE POLICY "anon_delete_participants" ON expense_participants FOR DELETE
  TO anon, authenticated USING (true);
