const { createClient } = require('@supabase/supabase-js');

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ ok: false, error: 'Method Not Allowed' })
    };
  }

  try {
    const { password } = JSON.parse(event.body);

    const adminPassword = process.env.ADMIN_PASSWORD || "lovable123";
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return {
        statusCode: 500,
        body: JSON.stringify({ ok: false, error: 'Database configuration missing' })
      };
    }

    if (password !== adminPassword) {
      return {
        statusCode: 401,
        body: JSON.stringify({ ok: false, error: 'Incorrect admin password' })
      };
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: licenses, error } = await supabase
      .from('licenses')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase Fetch Error:', error);
      throw error;
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ ok: true, licenses })
    };
  } catch (err) {
    console.error("Function error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ ok: false, error: "Internal Server Error" })
    };
  }
};
