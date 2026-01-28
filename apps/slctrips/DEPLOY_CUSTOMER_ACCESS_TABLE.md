# Deploy customer_product_access Table

## Step-by-Step Rollout

### 1. Open Supabase SQL Editor
1. Go to: https://supabase.com/dashboard
2. Select your project
3. Navigate to: **SQL Editor** (left sidebar)
4. Click: **New query**

### 2. Copy and Paste This SQL

```sql
-- Create customer_product_access table for Welcome Wagon purchases
CREATE TABLE IF NOT EXISTS customer_product_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_email TEXT NOT NULL,
  product_type TEXT NOT NULL,
  product_id TEXT NOT NULL,
  granted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  revoked_at TIMESTAMPTZ,
  purchase_id UUID REFERENCES purchases(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_customer_product_access_email
  ON customer_product_access(customer_email);

CREATE INDEX IF NOT EXISTS idx_customer_product_access_product
  ON customer_product_access(product_type, product_id);

-- Enable Row Level Security
ALTER TABLE customer_product_access ENABLE ROW LEVEL SECURITY;

-- Policy: Service role has full access (for webhooks)
CREATE POLICY "Service role has full access"
  ON customer_product_access
  FOR ALL
  TO service_role
  USING (true);

-- Policy: Authenticated users can view their own access
CREATE POLICY "Users can view their own access"
  ON customer_product_access
  FOR SELECT
  TO authenticated
  USING (customer_email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- Success message
SELECT 'customer_product_access table created successfully!' as message;
```

### 3. Execute the Query
- Click **Run** (or press Cmd/Ctrl + Enter)
- Should complete in < 1 second

### 4. Verify Success
You should see:
```
message: "customer_product_access table created successfully!"
```

### 5. Run Verification Script
After running the SQL, run this from your terminal:

```bash
node verify-customer-access-table.mjs
```

Expected output:
```
✅ Table exists and is queryable
✅ Policies are in place
✅ Webhook can insert records
✅ Ready for production!
```

---

## What This Enables

Once deployed, the Stripe webhook will be able to:
1. Record Welcome Wagon purchases
2. Grant customer access to purchased content
3. Track access by email + product
4. Support revocation if needed (fraud/refunds)

---

## Rollback (If Needed)

If you need to undo this:

```sql
DROP TABLE IF EXISTS customer_product_access CASCADE;
```

---

## Next Steps After Deployment

1. ✅ Run `node verify-customer-access-table.mjs`
2. ✅ Test Welcome Wagon form on production
3. ✅ Test Stripe checkout in test mode
4. ✅ Verify webhook grants access correctly

Ready for Dan's review! 🚀
