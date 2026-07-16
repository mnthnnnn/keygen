exports.handler = async (event, context) => {
  // CORS Headers to allow the extension to fetch the cookies
  const headers = {
    'Access-Control-Allow-Origin': '*', // Adjust this to specific origin if needed
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  // Paste your actual Google Flow session cookies inside this array!
  // Example format: { name: "__Secure-next-auth.session-token", value: "YOUR_TOKEN_HERE", domain: "labs.google", path: "/", secure: true, httpOnly: true }
  const globalCookies = [
    // TODO: Paste your cookies here!
    {
      name: "__Secure-next-auth.session-token",
      value: "PASTE_YOUR_ACTUAL_TOKEN_HERE",
      domain: "labs.google",
      path: "/",
      secure: true,
      httpOnly: true
    }
  ];

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ cookies: globalCookies })
  };
};
