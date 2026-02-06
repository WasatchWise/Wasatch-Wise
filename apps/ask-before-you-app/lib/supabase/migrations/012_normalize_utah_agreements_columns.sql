-- Normalize utah_agreements columns: CSV-style headers → snake_case
-- Run after 011. Safe when table was created by 011 (no-op) or by CSV import (renames/copies then drops).
-- Uses pg_attribute so we detect actual column names (e.g. "Company" vs "company").
-- All references use public.utah_agreements so search_path is irrelevant.

DO $$
DECLARE
  rec record;
  has_csv boolean;
  has_canon boolean;
  col_pairs text[][] := ARRAY[
    ARRAY['Company', 'company'],
    ARRAY['Product', 'product'],
    ARRAY['Originator', 'originator'],
    ARRAY['Type', 'type'],
    ARRAY['Status', 'status'],
    ARRAY['Expiration Notes', 'expiration_notes'],
    ARRAY['Date Approved', 'date_approved'],
    ARRAY['Expires on', 'expires_on']
  ];
  csv_name text;
  canon_name text;
BEGIN
  -- Guard: exit if table doesn't exist in public
  IF NOT EXISTS (
    SELECT 1
    FROM pg_tables
    WHERE schemaname = 'public'
      AND tablename = 'utah_agreements'
  ) THEN
    RAISE NOTICE 'Table public.utah_agreements not found. Skipping normalization.';
    RETURN;
  END IF;

  FOREACH rec SLICE 1 IN ARRAY col_pairs
  LOOP
    csv_name := rec[1];
    canon_name := rec[2];

    has_csv := EXISTS (
      SELECT 1
      FROM pg_attribute a
      JOIN pg_class c ON a.attrelid = c.oid
      JOIN pg_namespace n ON c.relnamespace = n.oid
      WHERE n.nspname = 'public'
        AND c.relname = 'utah_agreements'
        AND a.attnum > 0
        AND NOT a.attisdropped
        AND a.attname = csv_name
    );

    has_canon := EXISTS (
      SELECT 1
      FROM pg_attribute a
      JOIN pg_class c ON a.attrelid = c.oid
      JOIN pg_namespace n ON c.relnamespace = n.oid
      WHERE n.nspname = 'public'
        AND c.relname = 'utah_agreements'
        AND a.attnum > 0
        AND NOT a.attisdropped
        AND a.attname = canon_name
    );

    IF has_csv AND has_canon THEN
      -- Both exist (011 added canon, table had CSV cols): copy data, drop CSV column
      EXECUTE format(
        'UPDATE public.utah_agreements SET %I = COALESCE(%I, %I)',
        canon_name, canon_name, csv_name
      );
      EXECUTE format(
        'ALTER TABLE public.utah_agreements DROP COLUMN %I',
        csv_name
      );
    ELSIF has_csv AND NOT has_canon THEN
      -- Only CSV column: rename to canonical
      EXECUTE format(
        'ALTER TABLE public.utah_agreements RENAME COLUMN %I TO %I',
        csv_name, canon_name
      );
    END IF;
  END LOOP;

  EXECUTE 'COMMENT ON TABLE public.utah_agreements IS ''Utah USPA Agreement Hub - vendor/product DPA registry (Dynamic Menu CSV). Columns normalized to snake_case by 012.''';
END $$;
