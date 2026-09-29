CREATE OR REPLACE FUNCTION prevent_admin_account_removal()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'DELETE' AND OLD."role" IN ('admin', 'demo') THEN
    RAISE EXCEPTION 'Protected system accounts cannot be deleted.' USING ERRCODE = '23514';
  END IF;

  IF TG_OP = 'UPDATE' AND OLD."role" IN ('admin', 'demo')
     AND (NEW."role" <> OLD."role" OR NEW."isActive" = false) THEN
    RAISE EXCEPTION 'Protected system accounts cannot be demoted or suspended.' USING ERRCODE = '23514';
  END IF;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$;
