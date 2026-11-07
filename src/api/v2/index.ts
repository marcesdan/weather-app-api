import express from "express";
import MessageResponse from "../../interfaces/MessageResponse";
import { validCoords } from "../../utils/validCoords";
import {
  fetchAir,
  fetchTile,
  TILE_LAYERS,
} from "../../services/weather-api-map-service/v2";

const router = express.Router();

router.get<{}, MessageResponse>("/", (req, res) => {
  res.json({ message: "API v2" });
});

router.get("/air", async (req, res) => {
  const { lat, lon } = req.query;
  if (!validCoords(lat, lon)) {
    res.status(400).json({ error: "Geocords are required" });
    return;
  }
  const result = await fetchAir(lat as string, lon as string);
  if (result.ok) res.json(result.data);
  else res.status(result.status).json({ problem: result.problem });
});

// Map tiles proxied so the API key never reaches the browser; cached here and by the browser for 10 minutes.
router.get("/tiles/:layer/:z/:x/:y.png", async (req, res) => {
  const { layer } = req.params;
  const [z, x, y] = [req.params.z, req.params.x, req.params.y].map(Number);
  const max = 2 ** z;
  if (
    !(TILE_LAYERS as readonly string[]).includes(layer) ||
    ![z, x, y].every(Number.isInteger) ||
    z < 0 ||
    z > 12 ||
    x < 0 ||
    x >= max ||
    y < 0 ||
    y >= max
  ) {
    res.status(400).json({ error: "Unknown layer or tile" });
    return;
  }
  const tile = await fetchTile(layer, z, x, y);
  if (!tile.ok) {
    res.status(tile.status).end();
    return;
  }
  res.set("Cache-Control", "public, max-age=600");
  res.type("png").send(tile.body);
});

export default router;
