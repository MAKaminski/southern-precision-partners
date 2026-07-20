-- Read-only ad-hoc SQL runner backing the /sql console tab.
--
-- Enforced read-only at the Postgres engine level (`transaction_read_only`),
-- not by keyword-blocklisting the input string — blocklists are bypassable,
-- an engine-level read-only transaction is not. Only a single SELECT/WITH
-- statement is accepted (PL/pgSQL's EXECUTE runs exactly one SQL command
-- per call, so statement-stacking via ";" is rejected before it ever
-- reaches EXECUTE). Row count and execution time are both capped.
create or replace function public.run_readonly_query(query_text text, row_limit integer default 500)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  cleaned text;
  capped_limit integer;
  result jsonb;
begin
  cleaned := btrim(query_text);
  cleaned := regexp_replace(cleaned, ';\s*$', '');

  if cleaned = '' then
    raise exception 'empty query';
  end if;
  if position(';' in cleaned) > 0 then
    raise exception 'multiple statements are not allowed';
  end if;
  if cleaned !~* '^(select|with)\y' then
    raise exception 'only SELECT / WITH queries are allowed';
  end if;

  capped_limit := least(greatest(coalesce(row_limit, 500), 1), 500);

  set local transaction_read_only = on;
  set local statement_timeout = '5s';

  execute format(
    'select coalesce(jsonb_agg(t), ''[]''::jsonb) from (select * from (%s) as user_query limit %L) as t',
    cleaned, capped_limit
  ) into result;

  return result;
end;
$$;

grant execute on function public.run_readonly_query(text, integer) to service_role;
