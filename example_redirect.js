const port = 443;

var fs = require("fs");
var privateKey = fs.readFileSync(
  "/etc/letsencrypt/live/potato.colab.duke.edu/privkey.pem",
  "utf8"
);
var certificate = fs.readFileSync(
  "/etc/letsencrypt/live/potato.colab.duke.edu/cert.pem",
  "utf8"
);

var credentials = { key: privateKey, cert: certificate };
var express = require("express");
const path = require("path");
var app = express();

app.use(express.static(path.join(__dirname, "..", "view", "build")));

app.get("/*", function (req, res) {
  res.sendFile(path.join(__dirname, "..", "view", "build", "index.html"));
});

var https = require("https");
var httpsServer = https.createServer(credentials, app);
httpsServer.listen(port, () => {
  console.log(`Example app listening at https://localhost:${port}`);
});

// Redirect from http port 80 to https
var http = require("http");
http
  .createServer(function (req, res) {
    res.writeHead(301, {
      Location: "https://" + req.headers["host"] + req.url,
    });
    res.end();
  })
  .listen(80);
