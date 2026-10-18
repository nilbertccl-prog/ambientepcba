const { setCookie } = require("../_lib");
module.exports = (req, res) => {
  setCookie(res, "sess", "", 0);
  res.statusCode = 302; res.setHeader("Location", "/"); res.end();
};
