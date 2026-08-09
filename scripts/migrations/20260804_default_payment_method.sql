-- Migration: 20260804_default_payment_method.sql
-- Description: Add default_payment_method preference to profiles (P3-G settings).
-- Idempotent per AGENTS.md §1.4: re-running is a no-op, not an error.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS default_payment_method text
  CHECK (default_payment_method IN ('Cash', 'Card', 'Transfer', 'POS', 'Other'));
