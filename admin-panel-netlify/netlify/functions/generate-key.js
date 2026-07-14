const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ ok: false, error: 'Method Not Allowed' })
    };
  }

  try {
    const { password, durationDays } = JSON.parse(event.body);

    // Get variables from Netlify environment
    const adminPassword = process.env.ADMIN_PASSWORD || "lovable123";
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

    if (!supabaseUrl || !supabaseKey) {
       return {
        statusCode: 500,
        body: JSON.stringify({ ok: false, error: 'Database configuration missing in Netlify' })
      };
    }

    if (password !== adminPassword) {
      return {
        statusCode: 401,
        body: JSON.stringify({ ok: false, error: 'Incorrect admin password' })
      };
    }

    // Connect to Supabase
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Generate random key segments
    const segment = () => crypto.randomBytes(2).toString('hex').toUpperCase();
    const newKey = `LVBL-${segment()}-${segment()}-${segment()}-${segment()}`;

    // Insert into Supabase
    const { error } = await supabase.from('licenses').insert([
      {
        license_key: newKey,
        duration_days: parseInt(durationDays, 10) || 30,
        status: 'active'
      }
    ]);

    if (error) {
      console.error('Supabase Insert Error:', error);
      throw error;
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ ok: true, key: newKey })
    };
  } catch (err) {
    console.error("Function error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ ok: false, error: "Internal Server Error" })
    };
  }
};
