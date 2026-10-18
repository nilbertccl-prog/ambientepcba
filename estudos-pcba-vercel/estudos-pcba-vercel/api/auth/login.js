const crypto = require("crypto");
const { setCookie, base } = require("../_lib");
module.exports = (req, res) => {
  const st = crypto.randomBytes(16).toString("hex");
  setCookie(res, "st", st, 600);
  const q = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID,
    redirect_uri: base(req) + "/api/auth/callback",
    response_type: "code",
    scope: "openid email profile https://www.googleapis.com/auth/drive.appdata",
    access_type: "offline",
    prompt: "consent",
    state: st
  });
  res.statusCode = 302;
  res.setHeader("Location", "https://accounts.google.com/o/oauth2/v2/auth?" + q);
  res.end();
};
