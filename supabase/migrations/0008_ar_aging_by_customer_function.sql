-- Per-customer AR aging rollup for the collections quadrant chart: invoice
-- count, total invoiced dollars, and average days-to-pay.
--
-- Invoice dollars and days-to-pay are both computed per (customer_id,
-- invoice_number) group first, taking the single non-null invoice_amount
-- and the latest payment_date touching that invoice — NOT a naive sum of
-- payment_amount across every row. The source AR ledger frequently repeats
-- the same payment_ref (at its full amount) across multiple invoice_number
-- rows, which inflates a naive sum; grouping by invoice_number and taking
-- one invoice_amount + the latest payment date sidesteps that double-count.
create or replace function public.get_ar_aging_by_customer()
returns table (
  customer_id uuid,
  invoice_count bigint,
  total_invoice_amount numeric,
  avg_days_to_pay numeric
)
language sql
security definer
set search_path = public
stable
as $$
  with per_invoice as (
    select
      t.customer_id,
      t.invoice_number,
      max(t.invoice_amount) filter (where t.invoice_amount is not null) as invoice_amount,
      min(t.invoice_date) as invoice_date,
      max(t.payment_date) as last_payment_date
    from public.ar_transactions t
    where t.invoice_number is not null and t.is_credit_memo = false
    group by t.customer_id, t.invoice_number
  )
  select
    pi.customer_id,
    count(*) as invoice_count,
    sum(coalesce(pi.invoice_amount, 0)) as total_invoice_amount,
    avg(pi.last_payment_date - pi.invoice_date)
      filter (where pi.invoice_date is not null and pi.last_payment_date is not null) as avg_days_to_pay
  from per_invoice pi
  group by pi.customer_id;
$$;

grant execute on function public.get_ar_aging_by_customer() to service_role;
