const { createClient } = require('@supabase/supabase-js');

exports.handler = async (event, context) => {
  // Allow CORS for the extension
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ ok: false, error: 'Method Not Allowed' })
    };
  }

  try {
    const { licenseKey, machineId } = JSON.parse(event.body);

    if (!licenseKey) {
      return { statusCode: 400, headers, body: JSON.stringify({ ok: false, error: 'Missing licenseKey' }) };
    }

    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return { statusCode: 500, headers, body: JSON.stringify({ ok: false, error: 'DB config missing' }) };
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Update the last_used_at field for the matching license
    // Note: requires the last_used_at column to exist in the database.
    const { data, error } = await supabase
      .from('licenses')
      .update({ last_used_at: new Date().toISOString() })
      .eq('license_key', licenseKey)
      .select('id')
      .single();

    if (error) {
      console.error('Supabase Update Error:', error);
      // Even if there's an error (e.g. column doesn't exist), we return ok so it doesn't break the client
      return { statusCode: 200, headers, body: JSON.stringify({ ok: true, note: 'Update failed or skipped' }) };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ ok: true })
    };
  } catch (err) {
    console.error("Function error:", err);
    return {
      statusCode: 200, // Return 200 to prevent noisy errors in the extension
      headers,
      body: JSON.stringify({ ok: true, error: "Internal Error" })
    };
  }
};
