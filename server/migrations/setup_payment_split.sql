-- Setup App Settings for Razorpay Payment Split

-- 1. Add admin UPI setting (update with your actual app provider UPI)
INSERT INTO appsettings (setting_key, setting_value, description, created_at, updated_at)
VALUES (
  'admin_upi',
  'your_app_upi_id@bankname',
  'App Provider UPI for receiving commission payments',
  NOW(),
  NOW()
)
ON DUPLICATE KEY UPDATE
  setting_value = 'your_app_upi_id@bankname',
  updated_at = NOW();

-- 2. Add commission percentage setting (optional, already in code as 2.5%)
INSERT INTO appsettings (setting_key, setting_value, description, created_at, updated_at)
VALUES (
  'commission_percentage',
  '2.5',
  'Commission percentage deducted from orders (in percentage)',
  NOW(),
  NOW()
)
ON DUPLICATE KEY UPDATE
  setting_value = '2.5',
  updated_at = NOW();

-- 3. Verify restaurants have UPI field
-- If not exists, run:
-- ALTER TABLE restaurant ADD COLUMN upi VARCHAR(100);

-- Check current settings
SELECT setting_key, setting_value, description FROM appsettings 
WHERE setting_key IN ('admin_upi', 'commission_percentage');

-- Check restaurant UPI
SELECT id, name, upi FROM restaurant WHERE upi IS NOT NULL LIMIT 10;
