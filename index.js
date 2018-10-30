const express = require("express");
const http = require("http");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

const pid = process.argv[2];
const max = process.argv[3];

const next = (pid % max) + 1;

let port = 300;
port += pid;

app.listen(port, err => {
  if (err) {
    return console.log("something bad happened", err);
  }

  console.log(`server is listening on ${port}`);
});

app.get("/", function(req, res) {
  res.send(`meu processo é ${pid}`);
});

setTimeout(() => {
  http
    .get(
      {
        host: "127.0.0.1",
        path: "/",
        port: `300${next}`
      },
      res => {
        res.on("data", data => {
          console.log("" + data);
        });
      }
    )
    .on("error", err => {
      console.log("error", err);
    });
}, 5000);
