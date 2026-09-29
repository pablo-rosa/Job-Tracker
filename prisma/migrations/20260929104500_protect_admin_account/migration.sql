-- Keep the bootstrap administrator present and active even if future code paths change.
CREATE OR REPLACE FUNCTION prevent_admin_account_removal()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'DELETE' AND OLD."role" = 'admin' THEN
    RAISE EXCEPTION 'The administrator account cannot be deleted.' USING ERRCODE = '23514';
  END IF;

  IF TG_OP = 'UPDATE' AND OLD."role" = 'admin'
     AND (NEW."role" <> 'admin' OR NEW."isActive" = false) THEN
    RAISE EXCEPTION 'The administrator account cannot be demoted or suspended.' USING ERRCODE = '23514';
  END IF;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER protect_admin_account
BEFORE DELETE OR UPDATE OF "role", "isActive" ON "User"
FOR EACH ROW
EXECUTE FUNCTION prevent_admin_account_removal();
