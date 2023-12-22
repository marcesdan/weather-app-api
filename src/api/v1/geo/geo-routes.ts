import express from "express";
import { getDirectGeocoding, getReverseGeocoding } from "./geo-controller";

const router = express.Router();

router.get("/direct", getDirectGeocoding);
router.get("/reverse", getReverseGeocoding);

export default router;
