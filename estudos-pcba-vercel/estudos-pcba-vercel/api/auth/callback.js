const { cookies, setCookie, seal, base } = require("../_lib");
const fail = (res, c, m) => { res.statusCode = c; res.setHeader("Content-Type", "text/plain; charset=utf-8"); res.end(m); };
module.exports = async (req, res) => {
  try {
    const u = new URL(req.url, "http://x"), code = u.searchParams.get("code"), st = u.searchParams.get("state");
    if (!code || !st || st !== cookies(req).st) return fail(res, 400, "Estado de login inválido. Tente novamente.");
    const r = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ code, client_id: process.env.GOOGLE_CLIENT_ID, client_secret: process.env.GOOGLE_CLIENT_SECRET, redirect_uri: base(req) + "/api/auth/callback", grant_type: "authorization_code" })
    });
    const t = await r.json();
    if (!t.access_token) return fail(res, 400, "Falha ao autenticar com o Google.");
    if (!t.refresh_token) return fail(res, 400, "Google não devolveu permissão offline. Revogue o acesso do app em myaccount.google.com/permissions e entre de novo.");
    const p = await (await fetch("https://openidconnect.googleapis.com/v1/userinfo", { headers: { Authorization: "Bearer " + t.access_token } })).json();
    const allow = (process.env.ALLOWED_EMAILS || "").toLowerCase().split(",").map(s => s.trim()).filter(Boolean);
    if (allow.length && !allow.includes((p.email || "").toLowerCase())) return fail(res, 403, "Este e-mail não está autorizado.");
    setCookie(res, "sess", seal({ sub: p.sub, email: p.email, name: p.name, rt: t.refresh_token, exp: Date.now() + 30 * 864e5 }), 30 * 86400);
    res.statusCode = 302; res.setHeader("Location", "/"); res.end();
  } catch (e) { fail(res, 500, "Erro interno no login."); }
};
