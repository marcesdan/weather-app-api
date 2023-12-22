import express from "express";
import geoRoutes from "./geo/geo-routes";
import oneCallRoutes from "./onecall/onecall-routes";

const router = express.Router();

router.use("/geo", geoRoutes);
router.use("/onecall", oneCallRoutes);

export default router;
