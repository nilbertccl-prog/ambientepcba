const { session, accessToken } = require("./_lib");
const NAME = "estudos-pcba-2026.json";
module.exports = async (req, res) => {
  res.setHeader("Content-Type", "application/json"); res.setHeader("Cache-Control", "no-store");
  const s = session(req);
  if (!s) { res.statusCode = 401; return res.end("{}"); }
  try {
    const H = { Authorization: "Bearer " + await accessToken(s) };
    const l = await (await fetch("https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&fields=files(id)&q=" + encodeURIComponent(`name='${NAME}'`), { headers: H })).json();
    const id = l.files && l.files[0] && l.files[0].id;
    if (req.method === "GET") {
      if (!id) return res.end("{}");
      const r = await fetch(`https://www.googleapis.com/drive/v3/files/${id}?alt=media`, { headers: H });
      return res.end(await r.text());
    }
    if (req.method === "PUT") {
      const body = typeof req.body === "string" ? req.body : JSON.stringify(req.body || {});
      if (body.length > 2e6) { res.statusCode = 413; return res.end('{"error":"grande"}'); }
      let r;
      if (id) {
        r = await fetch(`https://www.googleapis.com/upload/drive/v3/files/${id}?uploadType=media`, { method: "PATCH", headers: { ...H, "Content-Type": "application/json" }, body });
      } else {
        const b = "b" + Date.now();
        const mp = `--${b}\r\nContent-Type: application/json\r\n\r\n${JSON.stringify({ name: NAME, parents: ["appDataFolder"] })}\r\n--${b}\r\nContent-Type: application/json\r\n\r\n${body}\r\n--${b}--`;
        r = await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart", { method: "POST", headers: { ...H, "Content-Type": "multipart/related; boundary=" + b }, body: mp });
      }
      if (!r.ok) { res.statusCode = 502; return res.end('{"error":"drive"}'); }
      return res.end('{"ok":true}');
    }
    res.statusCode = 405; res.end("{}");
  } catch (e) { res.statusCode = 500; res.end('{"error":"drive"}'); }
};
