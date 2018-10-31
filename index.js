const fs = require("fs");
const express = require("express");
const http = require("http");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

const filepath = "output.txt";
let port = 300;

const pid = process.argv[2];
const max = process.argv[3];
let next = (pid % max) + 1;
let processos = [];

for(let i = 1; i <= max; i++){
  processos.push(`${i}`);
}

let queroEscrever = false;
let recebiToken = true;
let timeout;

port += pid;

app.listen(port, err => {
  if (err) {
    return console.log("something bad happened", err);
  }
  console.log(`server is listening on ${port}`);
});

//-------------Rotas-------------
app.get("/", function(req, res) {
  res.send(`meu processo é ${pid}`);
});

app.get("/token", function(req, res) {
  recebiToken = true;
  let resposta = `token recebido pelo processo ${pid}`;
  res.send(resposta);
  if (queroEscrever) {
    setTimeout(() => {
      queroEscrever = false;
      fs.appendFileSync(filepath, `Processo ${pid} escreveu no arquivo\n`);
      console.log("escrevi");
      enviaMsg();
      pedeEscrita();
    }, 1000);
  } else {
    setTimeout(() => {
      enviaMsg();
    }, 1000);
  }
});

app.get("/morte", function(req, res) {
  let p = req.query.id;
  processos = processos.filter(pr => pr != p);
  next = getNext();
  let resposta = `processo ${p} eliminado pelo processo ${pid}`;
  console.log(resposta);
  res.send(resposta);
});

app.get("/ismorte", function(req, res) {
  res.send(true);
});

//----------Comunicação----------
let enviaMsg = () => {
  console.log(`enviando token para o processo ${next}`);
  http
    .get(
      {
        host: "127.0.0.1",
        path: "/token",
        port: `300${next}`
      },
      res => {
        res.on("data", data => {
          console.log("" + data);
          recebiToken = false;
          clearTimeout(timeout);
          timeout = setTimeout(() => {
            if (!recebiToken) {
              perguntaMorte();
            }
          }, 20000);
        });
      }
    )
    .on("error", err => {
      console.log(`processo ${next} parece estar morto`);
      let morto = next;
      processos = processos.filter(p => p != next);
      next = getNext();
      return new Promise(resolve => {
        processos.filter(pr => pr != pid).forEach(p => {
          enviaMsgMorte(p, morto);
        });
        setTimeout(() => {
          resolve();
        }, 1000);
      }).then(() => {
        enviaMsg();
      });
    });
};

let enviaMsgMorte = (p, morto) => {
  http
    .get(`http://127.0.0.1:300${p}/morte?id=${morto}`, res => {
      res.on("data", data => {
        console.log("" + data);
      });
    })
    .on("error", err => {
      console.log("deu muito ruim");
    });
};

let perguntaMorte = () => {
  console.log(`processo ${next} parece estar morto`);
  http
    .get(`http://127.0.0.1:300${next}/ismorte`, res => {
      res.on("data", () => {
        console.log(`processo ${next} esta vivo`);
      });
    })
    .on("error", err => {
      console.log(`processo ${next} está morto`);
      let morto = next;
      processos = processos.filter(p => p != next);
      next = getNext();
      return new Promise(resolve => {
        processos.filter(pr => pr != pid).forEach(p => {
          enviaMsgMorte(p, morto);
        });
        setTimeout(() => {
          resolve();
        }, 1000);
      }).then(() => {
        enviaMsg();
      });
    });
};

//-----------Outras Funções-----------
function pedeEscrita(force) {
  let time = getRandom(5, 10);
  if (force) {
    time = 1;
  }
  setTimeout(() => {
    queroEscrever = true;
  }, `${time}000`);
}

function getRandom(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getNext() {
  let index = processos.indexOf(pid);
  let res = processos[(index + 1) % processos.length];
  return res;
}

//------------Inicialização--------------
pedeEscrita(pid == 1);

if (pid == 1) {
  setTimeout(() => enviaMsg(), 5000);
}