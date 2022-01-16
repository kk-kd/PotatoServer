const port = 3000;

var fs = require("fs");
var https = require("https");
var privateKey = fs.readFileSync(__dirname + "/../../cert/server.key", "utf8");
var certificate = fs.readFileSync(
  __dirname + "/../../cert/server.cert",
  "utf8"
);

var credentials = { key: privateKey, cert: certificate };
var express = require("express");
var app = express();

app.get("/", (req, res) => {
  res.send("Hello World!");
});

var httpsServer = https.createServer(credentials, app);
httpsServer.listen(port, () => {
  console.log(`Example app listening at https://localhost:${port}`);
});
