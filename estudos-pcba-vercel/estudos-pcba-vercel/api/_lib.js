const crypto = require("crypto");
const key = () => crypto.createHash("sha256").update(process.env.SESSION_SECRET || "").digest();
function seal(o) {
  const iv = crypto.randomBytes(12), c = crypto.createCipheriv("aes-256-gcm", key(), iv);
  const b = Buffer.concat([c.update(JSON.stringify(o)), c.final()]);
  return Buffer.concat([iv, c.getAuthTag(), b]).toString("base64url");
}
function open(s) {
  try {
    const b = Buffer.from(s, "base64url"), d = crypto.createDecipheriv("aes-256-gcm", key(), b.subarray(0, 12));
    d.setAuthTag(b.subarray(12, 28));
    return JSON.parse(Buffer.concat([d.update(b.subarray(28)), d.final()]).toString());
  } catch (e) { return null; }
}
function cookies(req) {
  const o = {};
  (req.headers.cookie || "").split(";").forEach(p => { const i = p.indexOf("="); if (i > 0) o[p.slice(0, i).trim()] = p.slice(i + 1).trim(); });
  return o;
}
function setCookie(res, name, val, age) {
  res.setHeader("Set-Cookie", `${name}=${val}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${age}`);
}
function session(req) {
  const s = cookies(req).sess, o = s && open(s);
  return o && o.exp > Date.now() ? o : null;
}
const base = req => process.env.APP_URL || ("https://" + req.headers.host);
async function accessToken(sess) {
  const r = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ client_id: process.env.GOOGLE_CLIENT_ID, client_secret: process.env.GOOGLE_CLIENT_SECRET, refresh_token: sess.rt, grant_type: "refresh_token" })
  });
  const j = await r.json();
  if (!j.access_token) throw new Error("token");
  return j.access_token;
}
module.exports = { seal, open, cookies, setCookie, session, base, accessToken };
