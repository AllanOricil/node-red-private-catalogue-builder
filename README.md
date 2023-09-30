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

Build and push the container to the private container repository.

```bash
docker build . -t catalogue --no-cache
docker tag catalogue private.example.com/catalogue
docker push private.example.com/catalogue
```

## Run

```bash
docker run -dit --network=host -e NAME="MY CATALOG" -e REGISTRY="http://localhost:4837" catalogue
```
