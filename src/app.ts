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
app.use(helmet());
app.use(cors());
app.use(express.json());
// Trust only proxies with private addresses (Render's internal hops), so req.ip is the right-most public address
// in X-Forwarded-For: the client as seen by Render's edge. A client-sent X-Forwarded-For sits further left and is ignored.
app.set("trust proxy", "loopback, linklocal, uniquelocal");
app.get<{}, MessageResponse>("/", (req, res) => {
  res.json({
    message: "🦄🌈✨👋🌎🌍🌏✨🌈🦄",
  });
});
app.use("/api", middlewares.rateLimit);
app.use("/api/v1", v1Routes);
app.use("/api/v2", v2Routes);
app.use(middlewares.notFound);
app.use(middlewares.errorHandler);

export default app;
