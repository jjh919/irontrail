// Quick Supabase connection sanity check via REST API.
// Run: node --env-file=.env.local scripts/test-supabase.mjs

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const secret = process.env.SUPABASE_SECRET_KEY;

if (!url || !secret) {
  console.error("✗ Missing env: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SECRET_KEY");
  process.exit(1);
}

console.log("URL:", url);
console.log("Querying /rest/v1/races (will 404 the table if migrations not applied — that proves connection)...");

const res = await fetch(`${url}/rest/v1/races?select=id&limit=1`, {
  headers: {
    apikey: secret,
    Authorization: `Bearer ${secret}`,
  },
});

const body = await res.text();

if (res.status === 200) {
  console.log("✓ Connected + table exists. Body:", body);
  process.exit(0);
}

// Supabase returns JSON error bodies
let parsed;
try { parsed = JSON.parse(body); } catch { parsed = { raw: body }; }

if (res.status === 404 || (parsed?.code === "42P01") || /does not exist/i.test(parsed?.message ?? "")) {
  console.log("✓ Connected to Supabase. Table 'races' not created yet — apply migrations next.");
  console.log("  (Server replied:", res.status, parsed?.message ?? parsed?.raw, ")");
  process.exit(0);
}

console.error("✗ Unexpected response:", res.status, parsed);
process.exit(1);
