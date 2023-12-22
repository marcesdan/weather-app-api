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
app.get<{}, MessageResponse>("/", (req, res) => {
  res.json({
    message: "🦄🌈✨👋🌎🌍🌏✨🌈🦄",
  });
});
app.use("/api/v1", v1Routes);
app.use("/api/v2", v2Routes);
app.use(middlewares.notFound);
app.use(middlewares.errorHandler);

export default app;
