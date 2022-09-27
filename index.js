require("./config/mysql");
// require("./controller/user");
const express = require("express");
const port = 2001;

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Monde 🚀🚀🚀");
});

app.use("/api", require("./controller/user"));
app.use("/api", require("./controller/book"));
app.use("/api", require("./controller/category"));

app.listen(port, () => {
  console.log("listening to port", port);
});

module.exports = app;
