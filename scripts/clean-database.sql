-- clean-database.sql
--
-- Truncate all tables in a Postgres database while keeping the schema.
-- WARNING: THIS WILL DELETE ALL DATA IRREVERSIBLY.
-- Run with `psql` or via your database client after setting the connection string.
-- Example:
--   PGPASSWORD=<pwd> psql "postgres://user:pass@host:port/dbname" -f scripts/clean-database.sql

DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename NOT LIKE 'spatial_ref_sys') LOOP
        EXECUTE 'TRUNCATE TABLE "' || r.tablename || '" RESTART IDENTITY CASCADE';
    END LOOP;
END $$;
