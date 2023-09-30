# node-red-private-catalogue-builder

A minimal web app to host a `catalogue.json` file for a private repository of
Node-RED nodes.

Intended to be run in it's own container as part of either
[multi-tenant-node-red]() or [multi-tenant-node-red-k8s]()

## Configure

Environment variables:

- NAME - catalogue name (defaults to `verdaccio`)
- PORT - which port to listen on (defaults to `8080`)
- HOST - which local IP Address to bind to (defaults to `localhost`)
- REGISTRY - a host and optional port number to connect to the NPM registry (defaults to `http://localhost:4873`)
- KEYWORD - the npm keyword to filter on (defaults to `node-red`)

It presents 2 HTTP endpoints

- /update - a POST to this endpoint will trigger a rebuild of the catalogue
- /catalogue.json - a GET request returns the current catalogue

The `/update` endpoint is intended to be used with the verdaccio private registry configured to send notifications when packages are uploaded/updated. e.g.

```
notify:
  method: POST
  headers: [{'Content-Type': 'application/json'}]
  endpoint: http://catalogue/update
  content: '{"name": "{{name}}", "versions": "{{versions}}", "dist-tags": "{{dist-tags}}"}'
```

## Build

Before building this docker image, login to this AWS (845044614340) and then publish this [repo](https://us-east-2.console.aws.amazon.com/codesuite/codecommit/repositories/node-red-module-parser/browse?region=us-east-2) to a local verdaccio instance.

```bash
docker build . -t catalogue --no-cache
```

If you don't want to publish the package to verdaccio, clone the [repo](https://us-east-2.console.aws.amazon.com/codesuite/codecommit/repositories/node-red-module-parser/browse?region=us-east-2), and run `npm link node-red-module-parser` in the root of it. Then run the following command to build the image

```bash
docker build . -t catalogue --build-arg REGISTRY=https://registry.npmjs.org/ --no-cache
```

## Run

```bash
docker run -dit --network=host -e NAME="MY CATALOG" -e REGISTRY="http://localhost:4873" catalogue
```
