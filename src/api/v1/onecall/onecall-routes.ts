import express from "express";
import { getCurrentWeather } from "./onecall-controller";

const router = express.Router();

router.get("/", getCurrentWeather);

export default router;
