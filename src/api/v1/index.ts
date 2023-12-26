import express from "express";
import geoRoutes from "./geo/geo-routes";
import oneCallRoutes from "./onecall/onecall-routes";
import ipApiRoutes from "./ip-api/ip-api-routes";

const router = express.Router();

router.use("/geo", geoRoutes);
router.use("/onecall", oneCallRoutes);
router.use("/ip-api", ipApiRoutes);

export default router;
