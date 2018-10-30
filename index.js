const express = require("express");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

const args = process.argv.slice(2);
const port = args[0];

app.listen(port, err => {
  if (err) {
    return console.log("something bad happened", err);
  }

  console.log(`server is listening on ${port}`);
});
