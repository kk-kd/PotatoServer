const express = require("express");
const path = require("path");

const app = express();
const port = 3000;

app.use(express.static(path.join(__dirname, "..", "view", "build")));

app.get("/*", function (req, res) {
  res.sendFile(path.join(__dirname, "..", "view", "build", "index.html"));
});

app.listen(3000);

// app.get("/", (req, res) => {
//   res.send("Hello World!");
// });

// app.listen(port, () => {
//   console.log(`Example app listening at http://localhost:${port}`);
// });

// module.exports = app;
