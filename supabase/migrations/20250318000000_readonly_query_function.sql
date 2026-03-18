-- Function to execute read-only queries safely (used by AI Natural Language Query feature)
-- Only SELECT statements are permitted; the function runs in a read-only transaction.
CREATE OR REPLACE FUNCTION execute_readonly_query(query_text TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET statement_timeout = '5s'
AS $$
DECLARE
  result JSONB;
  normalized TEXT;
BEGIN
  -- Normalize and validate
  normalized := lower(trim(query_text));

  -- Must start with SELECT
  IF NOT (normalized LIKE 'select%') THEN
    RAISE EXCEPTION 'Only SELECT queries are permitted';
  END IF;

  -- Block dangerous keywords
  IF normalized ~ '(insert|update|delete|drop|alter|truncate|create|grant|revoke|execute)\s' THEN
    RAISE EXCEPTION 'Only SELECT queries are permitted';
  END IF;

  -- Block comment injection and multiple statements
  IF normalized LIKE '%;%' OR normalized LIKE '%--%' THEN
    RAISE EXCEPTION 'Invalid query syntax';
  END IF;

  -- Execute in read-only mode
  SET LOCAL transaction_read_only = ON;
  EXECUTE 'SELECT jsonb_agg(row_to_json(t)) FROM (' || query_text || ') t' INTO result;

  RETURN COALESCE(result, '[]'::jsonb);
END;
$$;
