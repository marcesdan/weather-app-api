import express from "express";
import geoRoutes from "./geo/geo-routes";
import oneCallRoutes from "./onecall/onecall-routes";
import ipApiRoutes from "./ip-api/ip-api-routes";
import MessageResponse from "../../interfaces/MessageResponse";

const router = express.Router();

router.use("/geo", geoRoutes);
router.use("/onecall", oneCallRoutes);
router.use("/ip-api", ipApiRoutes);
router.get<{}, MessageResponse>("/", (req, res) => {
  res.json({
    message: "API - 👋🌎🌍🌏",
  });
});
export default router;
