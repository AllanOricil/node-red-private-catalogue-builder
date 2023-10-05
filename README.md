# node-red-private-catalogue-builder

A minimal web app to host a `catalogue.json` file for a private repository of
Node-RED nodes.

## Configure

Environment variables:

- NAME - catalogue name (defaults to `verdaccio`)
- PORT - which port to listen on (defaults to `8080`)
- HOST - which local IP Address to bind to (defaults to `0.0.0.0`)
- REGISTRY - a host and optional port number to connect to the NPM registry (defaults to `http://localhost:4873`)
- KEYWORD - the npm keyword to filter on (defaults to `node-red`)

It exposes 3 endpoints:

````bash
GET   /health         used to check the status of the service
POST  /update         rebuilds the catalogue
GET   /catalogue.json returns the current catalogue
````

The `GET /update` route is called by [Verdaccio every time it changes something](https://verdaccio.org/docs/configuration#notifications):

````yaml
notify:
  method: POST
  headers: [{'Content-Type': 'application/json'}]
  endpoint: http://catalogue/update
  content: '{"name": "{{name}}", "versions": "{{versions}}", "dist-tags": "{{dist-tags}}"}'
````

## Build

```bash
docker build . -t catalogue --no-cache
```
## Run

```bash
docker run -dit --network=host -e NAME="MY CATALOG" -e REGISTRY="http://localhost:4873" catalogue
```

