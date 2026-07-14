require('dotenv').config();
const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public')); // Serve the admin panel HTML from public folder

// Initialize Supabase Client using the exact same credentials as your main server
const supabaseUrl = process.env.SUPABASE_URL || "https://dummy.supabase.co";
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || "dummy-key";
const supabase = createClient(supabaseUrl, supabaseKey);

// Admin Panel Key Generation API
app.post('/api/admin/generate-key', async (req, res) => {
  const { password, durationDays } = req.body;
  // Default password is lovable123 if you haven't set ADMIN_PASSWORD in your .env
  const adminPassword = process.env.ADMIN_PASSWORD || "lovable123";
  
  if (password !== adminPassword) {
    return res.status(401).json({ ok: false, error: "Incorrect admin password" });
  }

  try {
    const segment = () => crypto.randomBytes(2).toString('hex').toUpperCase();
    const newKey = `LVBL-${segment()}-${segment()}-${segment()}-${segment()}`;

    const { error } = await supabase.from('licenses').insert([
      {
        license_key: newKey,
        duration_days: parseInt(durationDays, 10),
        status: 'active'
      }
    ]);

    if (error) throw error;
    
    console.log(`✅ [Admin] New key generated: ${newKey} for ${durationDays} days`);
    return res.json({ ok: true, key: newKey });
  } catch (err) {
    console.error("❌ Admin Key Generation Error:", err);
    return res.status(500).json({ ok: false, error: "Database error. Check logs." });
  }
});

const PORT = 4000;
app.listen(PORT, () => {
  console.log("==========================================");
  console.log(`🛡️  Admin Panel Server Running!`);
  console.log("==========================================");
  console.log(`Open in browser: http://localhost:${PORT}/admin.html`);
  console.log(`To open on your phone, find your local IP address and go to:`);
  console.log(`http://<YOUR_LOCAL_IP>:${PORT}/admin.html`);
  console.log("==========================================");
});
