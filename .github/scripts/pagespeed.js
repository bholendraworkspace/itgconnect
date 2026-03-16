// PageSpeed Insights → Firestore reporter
// Runs after deploy in CI. Uses only Node.js built-ins (Node 22+).
// Env vars required: GOOGLE_KEY, SERVICE_KEY, GITHUB_SHA (auto-set by Actions)

const crypto = require("crypto");

const SITE_URL = "https://studio-1240945126-b5f6c.web.app/login";
const PROJECT_ID = "studio-1240945126-b5f6c";
const API_KEY = process.env.GOOGLE_KEY;
const SERVICE_ACCOUNT = JSON.parse(process.env.SERVICE_KEY);
const COMMIT_SHA = (process.env.GITHUB_SHA || "local").slice(0, 7);
const CATEGORIES = ["performance", "accessibility", "best-practices", "seo"];

// ── JWT / OAuth2 ─────────────────────────────────────────────────────────────
async function getAccessToken() {
  const now = Math.floor(Date.now() / 1000);
  const b64 = (obj) => Buffer.from(JSON.stringify(obj)).toString("base64url");

  const header = b64({ alg: "RS256", typ: "JWT" });
  const payload = b64({
    iss: SERVICE_ACCOUNT.client_email,
    sub: SERVICE_ACCOUNT.client_email,
    aud: "https://oauth2.googleapis.com/token",
    scope: "https://www.googleapis.com/auth/datastore",
    iat: now,
    exp: now + 3600,
  });

  const sign = crypto.createSign("RSA-SHA256");
  sign.update(`${header}.${payload}`);
  const sig = sign.sign(SERVICE_ACCOUNT.private_key, "base64url");

  const jwt = `${header}.${payload}.${sig}`;

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });

  const data = await res.json();
  if (!data.access_token) throw new Error("OAuth2 failed: " + JSON.stringify(data));
  return data.access_token;
}

// ── PageSpeed API ─────────────────────────────────────────────────────────────
async function runPageSpeed(strategy, attempt = 1) {
  const params = new URLSearchParams({
    url: SITE_URL,
    key: API_KEY,
    strategy,
  });
  CATEGORIES.forEach((c) => params.append("category", c));

  console.log(`  → Running ${strategy} (attempt ${attempt})...`);
  const res = await fetch(
    `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?${params}`
  );
  const data = await res.json();

  if (data.error) {
    const isTransient = data.error.errors?.some((e) =>
      ["NO_FCP", "NO_LCP", "ERRORED_DOCUMENT_REQUEST"].includes(e.reason)
    );
    if (isTransient && attempt < 3) {
      const wait = attempt * 10000;
      console.log(`  ⚠ Transient error (${data.error.errors?.[0]?.reason}), retrying in ${wait / 1000}s...`);
      await new Promise((r) => setTimeout(r, wait));
      return runPageSpeed(strategy, attempt + 1);
    }
    throw new Error(`PageSpeed API error: ${JSON.stringify(data.error)}`);
  }

  const cats = data.lighthouseResult.categories;
  return {
    performance:   Math.round((cats["performance"]?.score   ?? 0) * 100),
    accessibility: Math.round((cats["accessibility"]?.score ?? 0) * 100),
    bestPractices: Math.round((cats["best-practices"]?.score ?? 0) * 100),
    seo:           Math.round((cats["seo"]?.score           ?? 0) * 100),
  };
}

// ── Firestore REST write ──────────────────────────────────────────────────────
function intField(n) { return { integerValue: String(n) }; }
function strField(s) { return { stringValue: s }; }
function mapField(obj) {
  return { mapValue: { fields: Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, v])) } };
}

async function saveToFirestore(token, mobile, desktop) {
  const docId = `run-${Date.now()}`;
  const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/pageInsights/${docId}`;

  const body = {
    fields: {
      url:       strField(SITE_URL),
      date:      strField(new Date().toISOString()),
      commitSha: strField(COMMIT_SHA),
      mobile:    mapField({
        performance:   intField(mobile.performance),
        accessibility: intField(mobile.accessibility),
        bestPractices: intField(mobile.bestPractices),
        seo:           intField(mobile.seo),
      }),
      desktop: mapField({
        performance:   intField(desktop.performance),
        accessibility: intField(desktop.accessibility),
        bestPractices: intField(desktop.bestPractices),
        seo:           intField(desktop.seo),
      }),
    },
  };

  const res = await fetch(url, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const result = await res.json();
  if (result.error) throw new Error("Firestore write failed: " + JSON.stringify(result.error));
  return result;
}

// ── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log("PageSpeed Insights reporter");
  console.log(`Site: ${SITE_URL}`);
  console.log(`Commit: ${COMMIT_SHA}`);
  console.log("");

  console.log("Running PageSpeed (mobile + desktop in parallel)...");
  const [mobile, desktop] = await Promise.all([
    runPageSpeed("mobile"),
    runPageSpeed("desktop"),
  ]);

  console.log("\nMobile  →", mobile);
  console.log("Desktop →", desktop);

  console.log("\nObtaining Firestore access token...");
  const token = await getAccessToken();

  console.log("Writing to Firestore...");
  const doc = await saveToFirestore(token, mobile, desktop);
  console.log("Saved:", doc.name);

  // Print summary table
  console.log("\n┌──────────────────┬────────┬─────────┐");
  console.log("│ Metric           │ Mobile │ Desktop │");
  console.log("├──────────────────┼────────┼─────────┤");
  const metrics = [
    ["Performance",   "performance"],
    ["Accessibility", "accessibility"],
    ["Best Practices","bestPractices"],
    ["SEO",           "seo"],
  ];
  metrics.forEach(([label, key]) => {
    const m = String(mobile[key]).padStart(3);
    const d = String(desktop[key]).padStart(3);
    console.log(`│ ${label.padEnd(16)} │  ${m}   │   ${d}   │`);
  });
  console.log("└──────────────────┴────────┴─────────┘");
}

main().catch((err) => {
  console.error("\nERROR:", err.message);
  process.exit(1);
});
