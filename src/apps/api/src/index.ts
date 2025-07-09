import "dotenv/config";
import { Server } from "./Server.js";
import { config } from "./config.js";

const { stop } = await Server({
  port: config.server.port,
  host: config.server.host,
});

process.on("SIGINT", () => {
  console.info("Stopping");
  stop()
    .then(() => console.info("Game server stopped"))
    .catch((err) => console.error("Error stopping game server:", err));
});
