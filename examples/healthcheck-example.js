// Sanitized disposable service used to demonstrate container health behavior.
// Reference example only — no production configuration or secrets.

const http = require("node:http");

const host = "0.0.0.0";
const port = Number(process.env.PORT || 8080);

const server = http.createServer((req, res) => {
  res.setHeader("Content-Type", "application/json");

  if (req.url === "/health") {
    res.writeHead(200);
    res.end(JSON.stringify({ status: "ok" }));
    return;
  }

  res.writeHead(200);
  res.end(JSON.stringify({ service: "portfolio-healthcheck", status: "running" }));
});

server.listen(port, host, () => {
  console.log(JSON.stringify({ event: "server_started", port }));
});
