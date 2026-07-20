-- ============================================================
-- Southern Precision Partners — live schema introspection (ERD)
-- Applied to the dedicated Supabase project `southern-precision-partners`
-- (ref yscxrvuwwfpjuciuawcv). Committed here for reproducibility.
--
-- get_schema_erd() reads information_schema directly (tables, columns,
-- PK/unique flags, FK relationships + cardinality, row counts) so the
-- app's /erd page can never drift from what's actually in the database —
-- it's a live snapshot, not a hand-maintained diagram. Intended to be
-- reviewed before every new migration for auditability: what tables/
-- columns already exist, what relates to what, so new work extends the
-- schema instead of duplicating it.
--
-- SECURITY DEFINER so it can read information_schema regardless of the
-- caller's RLS context; execute is granted to service_role only, matching
-- every other table in this schema (app reads exclusively via the
-- service-role client, gated again by next-auth middleware).
-- ============================================================

create or replace function public.get_schema_erd()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  result jsonb;
  row_counts jsonb := '{}'::jsonb;
  t record;
  cnt bigint;
begin
  for t in
    select table_name from information_schema.tables
    where table_schema = 'public' and table_type = 'BASE TABLE'
  loop
    execute format('select count(*) from public.%I', t.table_name) into cnt;
    row_counts := row_counts || jsonb_build_object(t.table_name, cnt);
  end loop;

  select jsonb_build_object(
    'generated_at', now(),
    'tables', (
      select jsonb_agg(
        jsonb_build_object(
          'table_name', tbl.table_name,
          'row_count', row_counts -> tbl.table_name,
          'columns', (
            select jsonb_agg(
              jsonb_build_object(
                'column_name', col.column_name,
                'data_type', col.data_type,
                'is_nullable', col.is_nullable = 'YES',
                'column_default', col.column_default,
                'is_primary_key', exists (
                  select 1 from information_schema.table_constraints tc
                  join information_schema.key_column_usage kcu
                    on tc.constraint_name = kcu.constraint_name and tc.table_schema = kcu.table_schema
                  where tc.constraint_type = 'PRIMARY KEY' and tc.table_schema = 'public'
                    and tc.table_name = col.table_name and kcu.column_name = col.column_name
                ),
                -- Only true when this column *alone* carries a unique/PK
                -- constraint — a column that's merely part of a composite
                -- unique key (e.g. (customer_id, year)) is not unique on
                -- its own and shouldn't be labeled as if it were.
                'is_unique', exists (
                  select 1 from information_schema.table_constraints tc
                  join information_schema.key_column_usage kcu
                    on tc.constraint_name = kcu.constraint_name and tc.table_schema = kcu.table_schema
                  where tc.constraint_type in ('UNIQUE','PRIMARY KEY') and tc.table_schema = 'public'
                    and tc.table_name = col.table_name and kcu.column_name = col.column_name
                    and (select count(*) from information_schema.key_column_usage k2 where k2.constraint_name = tc.constraint_name) = 1
                ),
                -- Part of a *multi*-column unique constraint (e.g. the
                -- (customer_id, year) pair) — flagged separately from
                -- is_unique so it's not confused with a single-column key.
                'is_composite_key_member', exists (
                  select 1 from information_schema.table_constraints tc
                  join information_schema.key_column_usage kcu
                    on tc.constraint_name = kcu.constraint_name and tc.table_schema = kcu.table_schema
                  where tc.constraint_type in ('UNIQUE','PRIMARY KEY') and tc.table_schema = 'public'
                    and tc.table_name = col.table_name and kcu.column_name = col.column_name
                    and (select count(*) from information_schema.key_column_usage k2 where k2.constraint_name = tc.constraint_name) > 1
                )
              ) order by col.ordinal_position
            )
            from information_schema.columns col
            where col.table_schema = 'public' and col.table_name = tbl.table_name
          )
        ) order by tbl.table_name
      )
      from (
        select distinct table_name from information_schema.tables
        where table_schema = 'public' and table_type = 'BASE TABLE'
      ) tbl
    ),
    'relationships', (
      select coalesce(jsonb_agg(
        jsonb_build_object(
          'constraint_name', tc.constraint_name,
          'source_table', kcu.table_name,
          'source_column', kcu.column_name,
          'target_table', ccu.table_name,
          'target_column', ccu.column_name,
          'on_delete', rc.delete_rule,
          -- One-to-one only when the FK's source column is *itself* covered
          -- by a single-column unique/PK constraint; composite-key columns
          -- (e.g. part of a (customer_id, year) unique pair) stay many-to-one.
          'cardinality', case when exists (
            select 1
            from information_schema.table_constraints utc
            join information_schema.key_column_usage ukcu
              on utc.constraint_name = ukcu.constraint_name and utc.table_schema = ukcu.table_schema
            where utc.constraint_type in ('UNIQUE','PRIMARY KEY')
              and utc.table_schema = 'public'
              and utc.table_name = kcu.table_name
              and ukcu.column_name = kcu.column_name
              and (select count(*) from information_schema.key_column_usage k2 where k2.constraint_name = utc.constraint_name) = 1
          ) then 'one-to-one' else 'many-to-one' end
        ) order by kcu.table_name, kcu.column_name
      ), '[]'::jsonb)
      from information_schema.table_constraints tc
      join information_schema.key_column_usage kcu
        on tc.constraint_name = kcu.constraint_name and tc.table_schema = kcu.table_schema
      join information_schema.constraint_column_usage ccu
        on tc.constraint_name = ccu.constraint_name and tc.table_schema = ccu.table_schema
      join information_schema.referential_constraints rc
        on tc.constraint_name = rc.constraint_name and tc.table_schema = rc.constraint_schema
      where tc.constraint_type = 'FOREIGN KEY' and tc.table_schema = 'public'
    )
  ) into result;

  return result;
end;
$$;

grant execute on function public.get_schema_erd() to service_role;
