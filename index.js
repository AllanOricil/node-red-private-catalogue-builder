const fs = require("fs");
const cors = require("cors");
const path = require("path");
const morgan = require("morgan");
const express = require("express");
const helmet = require("helmet");
const bodyParser = require("body-parser");
const superagent = require("superagent");
const nodeRedModule = require("@allanoricil/node-red-module-parser");

const port = process.env.PORT || 8080;
const host = process.env.HOST || "localhost";
const registry = process.env.REGISTRY || "http://127.0.0.1:4873";
const keyword = process.env.KEYWORD || "node-red";
const name = process.env.CATALOGUE_NAME || "verdaccio";

const catalogue = {
  name,
  updated_at: new Date().toISOString(),
  modules: [],
};

function update() {
  catalogue.modules = [];

  superagent.get(registry + "/-/all").end(async (err, res) => {
    if (!err) {
      const nodes = res.body;
      var nodeNames = Object.keys(nodes);
      const index = nodeNames.indexOf("_updated");
      if (index > -1) {
        nodeNames.splice(index, 1);
      }

      for (const node in nodeNames) {
        var n = nodes[nodeNames[node]];
        if (n.keywords) {
          if (n.keywords.indexOf(keyword) != -1) {
            try {
              let details = await superagent
                .get(registry + "/" + nodeNames[node])
                .set("accept", "json");
              let latest = details.body["dist-tags"].latest;
              let version = details.body.versions[latest];
              let tar = version.dist.tarball;
              let tarDir = path.join("temp", nodeNames[node]);
              fs.mkdirSync(tarDir, { recursive: true });
              let tarPath = path.join(
                tarDir,
                nodeNames[node].split("/").slice(-1) + ".tgz",
              );
              let tarRes = await superagent.get(tar).responseType("blob");
              fs.writeFileSync(tarPath, tarRes.body);
              let moduleDetails = nodeRedModule.examinTar(tarPath, tarDir);
              fs.rmSync(tarDir, { force: true, recursive: true });

              var entry = {
                id: n.name,
                version: n["dist-tags"].latest,
                description: n.description,
                keywords: n.keywords,
                updated_at: n.time.modified,
                url: registry + "/-/web/details/" + n.name,
              };

              if (moduleDetails.types.length) {
                entry.types = moduleDetails.types;
              }
              if (moduleDetails["node-red"]) {
                catalogue.modules.push(entry);
              }
            } catch (e) {
              console.log("err", e);
            }
          }
        }
      }

      console.log(JSON.stringify(catalogue, null, 2));
    } else {
      console.log(err);
    }
  });
}

const app = express();
app.use(morgan("combined"));
app.use(helmet());
app.use(bodyParser.json());

app.post("/update", (req, res, next) => {
  const updateRequest = req.body;
  console.log(JSON.stringify(updateRequest, null, 2));

  update();
  res.status(200).send();
});

app.get("/catalogue.json", cors(), (req, res, next) => {
  res.send(catalogue);
});

update();

app.listen(port, host, function () {
  console.log("App listening on  %s:%d", host, port);
});
