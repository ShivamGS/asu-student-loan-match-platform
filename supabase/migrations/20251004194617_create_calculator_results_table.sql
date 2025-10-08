/*
  # Create Calculator Results Storage

  1. New Tables
    - `calculator_results`
      - `id` (uuid, primary key) - Unique identifier for each calculation
      - `annual_salary` (numeric) - User's annual salary input
      - `monthly_loan_payment` (numeric) - Monthly student loan payment
      - `match_percentage` (numeric) - ASU match percentage (typically 3-6%)
      - `match_cap` (numeric) - Match cap percentage of salary
      - `monthly_401k_contribution` (numeric) - User's current 401(k) contribution
      - `annual_loan_payments` (numeric) - Calculated annual loan payments
      - `eligible_match_amount` (numeric) - Calculated ASU match amount
      - `total_employee_contribution` (numeric) - Total employee 401(k) contribution
      - `projected_balance_10_year` (numeric) - Projected 10-year balance
      - `created_at` (timestamptz) - Timestamp of calculation
      - `ip_address` (text) - Optional IP for analytics (nullable)
  
  2. Security
    - Enable RLS on `calculator_results` table
    - Add policy for anonymous users to insert their own calculations
    - This is a public calculator, so we allow inserts without authentication
    
  3. Analytics
    - Create index on created_at for time-based queries
    - This allows tracking usage patterns and popular salary ranges
*/

CREATE TABLE IF NOT EXISTS calculator_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  annual_salary numeric NOT NULL,
  monthly_loan_payment numeric NOT NULL,
  match_percentage numeric NOT NULL,
  match_cap numeric NOT NULL,
  monthly_401k_contribution numeric DEFAULT 0,
  annual_loan_payments numeric NOT NULL,
  eligible_match_amount numeric NOT NULL,
  total_employee_contribution numeric NOT NULL,
  projected_balance_10_year numeric NOT NULL,
  created_at timestamptz DEFAULT now(),
  ip_address text
);

ALTER TABLE calculator_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert calculator results"
  ON calculator_results
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Users cannot read calculator results"
  ON calculator_results
  FOR SELECT
  TO anon, authenticated
  USING (false);

CREATE INDEX IF NOT EXISTS idx_calculator_results_created_at 
  ON calculator_results(created_at DESC);
