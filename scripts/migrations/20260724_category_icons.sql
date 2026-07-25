-- Migration: 20260724_category_icons.sql
-- Description: Drop per-category color column, backfill default Lucide icon import names, enforce icon NOT NULL.

-- 1. Backfill existing seeded categories with default Lucide icon import names
UPDATE public.categories SET icon = 'Car' WHERE name ILIKE 'Transport' AND (icon IS NULL OR icon = '' OR icon = 'car');
UPDATE public.categories SET icon = 'UtensilsCrossed' WHERE name ILIKE 'Feeding' AND (icon IS NULL OR icon = '' OR icon = 'utensils');
UPDATE public.categories SET icon = 'Building2' WHERE name ILIKE 'Rent' AND (icon IS NULL OR icon = '' OR icon = 'home');
UPDATE public.categories SET icon = 'Smartphone' WHERE name ILIKE 'Airtime / Data' AND (icon IS NULL OR icon = '' OR icon = 'smartphone');
UPDATE public.categories SET icon = 'Zap' WHERE name ILIKE 'NEPA / Electricity' AND (icon IS NULL OR icon = '' OR icon = 'zap');
UPDATE public.categories SET icon = 'GraduationCap' WHERE name ILIKE 'College / School' AND (icon IS NULL OR icon = '' OR icon = 'graduation-cap');
UPDATE public.categories SET icon = 'ShoppingCart' WHERE name ILIKE 'Groceries' AND (icon IS NULL OR icon = '' OR icon = 'shopping-cart');
UPDATE public.categories SET icon = 'House' WHERE name ILIKE 'Household' AND (icon IS NULL OR icon = '' OR icon = 'home');
UPDATE public.categories SET icon = 'HeartPulse' WHERE name ILIKE 'Health' AND (icon IS NULL OR icon = '' OR icon = 'heart-pulse');
UPDATE public.categories SET icon = 'MoreHorizontal' WHERE name ILIKE 'Misc' AND (icon IS NULL OR icon = '' OR icon = 'circle');
UPDATE public.categories SET icon = 'Banknote' WHERE name ILIKE 'Salary' AND (icon IS NULL OR icon = '' OR icon = 'briefcase');
UPDATE public.categories SET icon = 'Briefcase' WHERE name ILIKE 'Freelance' AND (icon IS NULL OR icon = '' OR icon = 'briefcase');
UPDATE public.categories SET icon = 'Gift' WHERE name ILIKE 'Gift' AND (icon IS NULL OR icon = '' OR icon = 'gift');

-- 2. Fallback for any custom category with null or empty icon
UPDATE public.categories SET icon = 'CircleDot' WHERE icon IS NULL OR icon = '';

-- 3. Drop color column
ALTER TABLE public.categories DROP COLUMN IF EXISTS color;

-- 4. Set icon column as NOT NULL
ALTER TABLE public.categories ALTER COLUMN icon SET NOT NULL;
