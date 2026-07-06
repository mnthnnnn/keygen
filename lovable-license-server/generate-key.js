require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

// Initialize Supabase Client
const supabaseUrl = process.env.SUPABASE_URL || "https://dummy.supabase.co";
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || "dummy-key";
const supabase = createClient(supabaseUrl, supabaseKey);

async function generateNewKey(durationDays) {
  // Generate a cryptographically secure key
  const segment = () => crypto.randomBytes(2).toString('hex').toUpperCase();
  const newKey = `LVBL-${segment()}-${segment()}-${segment()}-${segment()}`;

  // Insert into Supabase
  const { data, error } = await supabase.from('licenses').insert([
    {
      license_key: newKey,
      duration_days: durationDays,
      status: 'active'
    }
  ]).select();

  if (error) {
    console.error("❌ Failed to create key:", error.message);
    process.exit(1);
  }

  console.log("==========================================");
  console.log("✅ SUCCESS! NEW KEY GENERATED");
  console.log("==========================================");
  console.log(`🔑 Key: ${newKey}`);
  console.log(`⏱️  Duration: ${durationDays} Days`);
  console.log("==========================================");
  console.log("Give this key to the customer who paid via GPay!");
}

// Get the duration from the command line argument (default to 30)
const duration = parseInt(process.argv[2]) || 30;

generateNewKey(duration);
