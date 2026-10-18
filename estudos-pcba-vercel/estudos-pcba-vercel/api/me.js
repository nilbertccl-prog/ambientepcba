const { session } = require("./_lib");
module.exports = (req, res) => {
  const s = session(req);
  res.setHeader("Content-Type", "application/json"); res.setHeader("Cache-Control", "no-store");
  if (!s) { res.statusCode = 401; return res.end("{}"); }
  res.end(JSON.stringify({ sub: s.sub, email: s.email, name: s.name }));
};
