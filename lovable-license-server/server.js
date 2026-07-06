require('dotenv').config();
const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Supabase Client
const supabaseUrl = process.env.SUPABASE_URL || "https://dummy.supabase.co";
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || "dummy-key";
const supabase = createClient(supabaseUrl, supabaseKey);

app.post('/api/validate-license', async (req, res) => {
  const { key, machineId } = req.body;
  console.log(`[License Check] Key: ${key}, Machine: ${machineId}`);

  if (!key || !machineId) {
    return res.status(400).json({ ok: false, error: "Missing key or machineId" });
  }

  // === LOCAL TESTING BYPASS ===
  // Use this key to test the extension before you set up your database!
  if (key === "LVBL-TEST-KEY") {
     return res.json({
      ok: true,
      license: {
        plan: "Test Premium (Unlimited)",
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        status: "active"
      },
      decryption_key: process.env.PAYLOAD_SECRET || "SUPER_SECRET_LOVABLE_PASSWORD_123!"
    });
  }
  // ============================

  try {
    // 1. Fetch license from Supabase
    const { data: license, error } = await supabase
      .from('licenses')
      .select('*')
      .eq('license_key', key)
      .single();

    if (error || !license) {
      return res.status(401).json({ ok: false, error: "Invalid or unknown license key." });
    }

    // 2. Chargeback/Refund Check
    if (license.status === 'revoked') {
      return res.status(403).json({ ok: false, error: "This license has been revoked." });
    }

    // 3. Anti-Sharing (Bind to 1 Machine)
    let updatePayload = {};
    
    if (!license.bound_machine_id) {
      // First activation! Lock it to this machine.
      license.bound_machine_id = machineId;
      updatePayload.bound_machine_id = machineId;
    } else if (license.bound_machine_id !== machineId) {
      // Someone else trying to use it!
      return res.status(403).json({ ok: false, error: "This key is already in use on another computer." });
    }

    // 4. Expiry / Activation check
    let activatedAt = license.activated_at ? new Date(license.activated_at).getTime() : null;
    
    if (!activatedAt) {
      // Set activation time
      activatedAt = Date.now();
      license.activated_at = new Date(activatedAt).toISOString();
      updatePayload.activated_at = license.activated_at;
    }

    // Check if it's a DEMO key (-1) or a standard days key
    let durationMs;
    let planName;
    if (license.duration_days === -1) {
       durationMs = 20 * 60 * 1000; // 20 Minutes
       planName = "Free Demo (20 Minutes)";
    } else {
       durationMs = license.duration_days * 24 * 60 * 60 * 1000; // Days
       planName = `Premium (${license.duration_days} Days)`;
    }

    const expiresAt = activatedAt + durationMs;
    const now = Date.now();

    if (now > expiresAt) {
      // Auto-update status to expired if it just expired
      if (license.status !== 'expired') {
        await supabase.from('licenses').update({ status: 'expired' }).eq('id', license.id);
      }
      return res.status(403).json({ ok: false, error: `This ${planName} has expired.` });
    }
    
    // Only update if there's something to update (like binding a new machine)
    if (Object.keys(updatePayload).length > 0) {
      await supabase.from('licenses').update(updatePayload).eq('id', license.id);
    }

    // 6. Return Success!
    return res.json({
      ok: true,
      license: {
        plan: planName,
        expires_at: new Date(expiresAt).toISOString(),
        status: "active"
      },
      // This is the magic! We send the password back to the extension
      decryption_key: process.env.PAYLOAD_SECRET || "SUPER_SECRET_LOVABLE_PASSWORD_123!"
    });

  } catch (err) {
    console.error("Database error:", err);
    return res.status(500).json({ ok: false, error: "Internal server error." });
  }
});

// Mock Webhook (How LemonSqueezy / Stripe tells you a payment succeeded)
app.post('/api/webhook', async (req, res) => {
  // In production, verify the webhook signature here!
  
  // Generate a cryptographically secure key
  const segment = () => crypto.randomBytes(2).toString('hex').toUpperCase();
  const newKey = `LVBL-${segment()}-${segment()}-${segment()}-${segment()}`;

  // Insert into Supabase
  const { error } = await supabase.from('licenses').insert([
    {
      license_key: newKey,
      duration_days: req.body.duration_days || 30 // Example: 30 days
    }
  ]);

  if (error) {
    return res.status(500).send("Error saving key");
  }

  res.send(`Key Generated: ${newKey}`);
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Production Server running on http://localhost:${PORT}`);
});

module.exports = app;
