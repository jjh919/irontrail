// Verify that migration 003 (DEFAULT auth.uid()) is applied.
// Tries inserting a row with admin client + NO user_id.
// - If 003 IS applied (and we run with service role), auth.uid() returns NULL,
//   so the INSERT still fails with not-null violation. Same as 003 not applied.
//   So this check is inconclusive that way.
// - Better: ask PostgREST for the OpenAPI schema and inspect column defaults.

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const secret = process.env.SUPABASE_SECRET_KEY;

if (!url || !secret) {
  console.error("✗ Missing env vars");
  process.exit(1);
}

// PostgREST exposes the schema via the root endpoint with apikey.
const res = await fetch(`${url}/rest/v1/`, {
  headers: { apikey: secret, Authorization: `Bearer ${secret}` },
});
const spec = await res.json();
const wkSchema = spec?.definitions?.workouts;

if (!wkSchema) {
  console.error("✗ Could not introspect workouts table");
  process.exit(1);
}

const uid = wkSchema.properties?.user_id;
console.log("workouts.user_id introspection:");
console.log(JSON.stringify(uid, null, 2));

if (uid?.default !== undefined) {
  console.log(`\n✓ user_id has a DEFAULT set (value: ${uid.default})`);
  console.log("Migration 003 IS applied.");
} else {
  console.log("\n✗ user_id has NO DEFAULT.");
  console.log("Migration 003 NOT applied — this is causing the insert error.");
  console.log("Run supabase/migrations/20260514000003_user_id_defaults.sql in dashboard.");
}
