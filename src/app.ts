import "dotenv/config";
import express from "express";
import morgan from "morgan";
import helmet from "helmet";
import cors from "cors";
import * as middlewares from "./middlewares";
import MessageResponse from "./interfaces/MessageResponse";
import v1Routes from "./api/v1";
import v2Routes from "./api/v2";

const app = express();
app.use(morgan("dev"));
// Map tiles are loaded as <img> from the front-end origin: allow cross-origin embedding.
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(cors());
app.use(express.json());
// Render's chain is client -> Cloudflare (public IP) -> Render (private IPs). Trust exactly those hops, so req.ip is
// the address Cloudflare saw; anything a client writes into X-Forwarded-For sits further left and is ignored.
// Ranges from https://www.cloudflare.com/ips (they change rarely; refresh if req.ip ever shows a 172.64/13 address).
const CLOUDFLARE = [
  "173.245.48.0/20",
  "103.21.244.0/22",
  "103.22.200.0/22",
  "103.31.4.0/22",
  "141.101.64.0/18",
  "108.162.192.0/18",
  "190.93.240.0/20",
  "188.114.96.0/20",
  "197.234.240.0/22",
  "198.41.128.0/17",
  "162.158.0.0/15",
  "104.16.0.0/13",
  "104.24.0.0/14",
  "172.64.0.0/13",
  "131.0.72.0/22",
  "2400:cb00::/32",
  "2606:4700::/32",
  "2803:f800::/32",
  "2405:b500::/32",
  "2405:8100::/32",
  "2a06:98c0::/29",
  "2c0f:f248::/32",
];
app.set("trust proxy", ["loopback", "linklocal", "uniquelocal", ...CLOUDFLARE]);
app.get<{}, MessageResponse>("/", (req, res) => {
  res.json({
    message: "🦄🌈✨👋🌎🌍🌏✨🌈🦄",
  });
});
app.use("/api", (req, res, next) =>
  (req.path.startsWith("/v2/tiles/")
    ? middlewares.tileRateLimit
    : middlewares.rateLimit)(req, res, next),
);
app.use("/api/v1", v1Routes);
app.use("/api/v2", v2Routes);
app.use(middlewares.notFound);
app.use(middlewares.errorHandler);

export default app;
