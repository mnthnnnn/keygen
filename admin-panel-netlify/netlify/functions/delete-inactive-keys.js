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

    if (password !== adminPassword) {
      return {
        statusCode: 401,
        body: JSON.stringify({ ok: false, error: 'Incorrect admin password' })
      };
    }

    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return {
        statusCode: 500,
        body: JSON.stringify({ ok: false, error: 'DB config missing' })
      };
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Delete specific ids if provided, else fallback to 'revoked' and 'expired' statuses
    let error;
    if (event.body) {
      const bodyParams = JSON.parse(event.body);
      if (bodyParams.ids && Array.isArray(bodyParams.ids) && bodyParams.ids.length > 0) {
        const res = await supabase
          .from('licenses')
          .delete()
          .in('id', bodyParams.ids);
        error = res.error;
      } else {
        const res = await supabase
          .from('licenses')
          .delete()
          .in('status', ['revoked', 'expired']);
        error = res.error;
      }
    } else {
      const res = await supabase
        .from('licenses')
        .delete()
        .in('status', ['revoked', 'expired']);
      error = res.error;
    }

    if (error) {
      throw error;
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ ok: true })
    };
  } catch (err) {
    console.error("Delete error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ ok: false, error: 'Failed to delete keys' })
    };
  }
};
