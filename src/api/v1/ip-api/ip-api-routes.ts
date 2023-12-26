import express from "express";
import { getIpData } from "./ip-api-controller";

const router = express.Router();

router.get("/", getIpData);

export default router;
