export const content = {
  title: "Window Functions",
  sections: [
    {
      heading: "What are Window Functions?",
      body: `**Window functions** perform calculations across a set of rows related to the current row — without collapsing rows like GROUP BY does. The "window" is the set of rows the function operates on, defined by the OVER clause. This makes them powerful for rankings, running totals, and comparing each row to a group average.`,
      code: `-- The OVER clause defines the window
-- Empty OVER = entire result set
SELECT
  name,
  salary,
  AVG(salary) OVER () AS company_avg   -- average across all employees
FROM employees;

-- PARTITION BY = split into sub-windows (like GROUP BY but without collapsing)
SELECT
  name,
  department,
  salary,
  AVG(salary) OVER (PARTITION BY department) AS dept_avg
FROM employees;
-- Each row keeps its own data AND sees the department average

-- ORDER BY in OVER = running/cumulative calculations
SELECT
  order_date,
  total,
  SUM(total) OVER (ORDER BY order_date) AS running_total
FROM orders;`,
    },
    {
      heading: "Ranking Functions",
      body: `Ranking functions assign a position to each row within a partition. They differ in how they handle ties.`,
      code: `-- ROW_NUMBER: unique sequential number, no gaps, no ties
SELECT
  name,
  salary,
  ROW_NUMBER() OVER (ORDER BY salary DESC) AS row_num
FROM employees;
-- Ties get different numbers (arbitrary ordering between tied rows)

-- RANK: same rank for ties, then skips numbers
SELECT
  name,
  salary,
  RANK() OVER (ORDER BY salary DESC) AS rank
FROM employees;
-- Two employees tied at 95000 both get rank 1; next is rank 3

-- DENSE_RANK: same rank for ties, NO gaps
SELECT
  name,
  salary,
  DENSE_RANK() OVER (ORDER BY salary DESC) AS dense_rank
FROM employees;
-- Two tied → both rank 1; next is rank 2 (not 3)

-- Rank within partitions: top earner per department
SELECT
  name,
  department,
  salary,
  RANK() OVER (PARTITION BY department ORDER BY salary DESC) AS dept_rank
FROM employees;

-- Get only the top earner per department (interview classic)
SELECT name, department, salary
FROM (
  SELECT
    name,
    department,
    salary,
    RANK() OVER (PARTITION BY department ORDER BY salary DESC) AS rnk
  FROM employees
) ranked
WHERE rnk = 1;`,
    },
    {
      heading: "LAG & LEAD",
      body: `**LAG** accesses a value from a previous row; **LEAD** accesses a value from a following row — within the current window. Essential for comparing consecutive rows (period-over-period growth, detecting gaps).`,
      code: `-- Month-over-month revenue change
SELECT
  month,
  revenue,
  LAG(revenue) OVER (ORDER BY month)  AS prev_month_revenue,
  revenue - LAG(revenue) OVER (ORDER BY month) AS change,
  ROUND(
    (revenue - LAG(revenue) OVER (ORDER BY month))
    / LAG(revenue) OVER (ORDER BY month) * 100, 2
  ) AS pct_change
FROM monthly_revenue;

-- LEAD: look ahead — days until next order per user
SELECT
  user_id,
  order_date,
  LEAD(order_date) OVER (PARTITION BY user_id ORDER BY order_date) AS next_order_date,
  LEAD(order_date) OVER (PARTITION BY user_id ORDER BY order_date) - order_date AS days_between
FROM orders;

-- LAG with offset and default value
-- LAG(column, offset, default_if_null)
SELECT
  month,
  revenue,
  LAG(revenue, 1, 0) OVER (ORDER BY month) AS prev_month
FROM monthly_revenue;`,
    },
    {
      heading: "FIRST_VALUE, LAST_VALUE & NTH_VALUE",
      body: `These functions return a value from a specific position within the window — the first row, last row, or Nth row of the partition.`,
      code: `-- First and last order amount per user
SELECT
  user_id,
  order_date,
  total,
  FIRST_VALUE(total) OVER (PARTITION BY user_id ORDER BY order_date)  AS first_order,
  LAST_VALUE(total)  OVER (
    PARTITION BY user_id
    ORDER BY order_date
    ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING
  ) AS last_order
FROM orders;
-- ⚠ LAST_VALUE needs ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING
-- Without it, the default frame only goes to the current row

-- Running total and running average
SELECT
  order_date,
  total,
  SUM(total)  OVER (ORDER BY order_date ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS running_total,
  AVG(total)  OVER (ORDER BY order_date ROWS BETWEEN 6 PRECEDING AND CURRENT ROW)         AS rolling_7day_avg
FROM orders;`,
    },
    {
      heading: "NTILE & PERCENT_RANK",
      body: `**NTILE** divides rows into N equal buckets. **PERCENT_RANK** gives each row's relative rank as a value between 0 and 1. Useful for percentile analysis and segmentation.`,
      code: `-- NTILE(4): assign each customer to a quartile based on spending
SELECT
  user_id,
  total_spent,
  NTILE(4) OVER (ORDER BY total_spent DESC) AS quartile
FROM customer_spending;
-- quartile 1 = top 25%, quartile 4 = bottom 25%

-- PERCENT_RANK: what percentile is this customer's spend?
SELECT
  user_id,
  total_spent,
  ROUND(PERCENT_RANK() OVER (ORDER BY total_spent) * 100, 1) AS percentile
FROM customer_spending;

-- CUME_DIST: fraction of rows <= current row
SELECT
  salary,
  CUME_DIST() OVER (ORDER BY salary) AS cumulative_fraction
FROM employees;`,
    },
  ],
};
