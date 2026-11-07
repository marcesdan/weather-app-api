import { Request, Response } from "express";
import { validCoords } from "../../../utils/validCoords";
import {
  fetchDirectGeocoding,
  fetchReverseGeocoding,
} from "../../../services/weather-api-map-service";

export const getDirectGeocoding = async (req: Request, res: Response) => {
  const city = req.query.city;
  if (typeof city !== "string" || !city.trim() || city.length > 100) {
    return res.status(400).json({ error: "City is required" });
  }
  const { data, ok, status, problem, error } = await fetchDirectGeocoding(
    city as string,
  );
  if (ok) res.json(data);
  else {
    res.status(status).json({ problem, error });
  }
};

export const getReverseGeocoding = async (req: Request, res: Response) => {
  const { lat, lon } = req.query;
  if (!validCoords(lat, lon)) {
    res.status(400).json({ error: "Geocords are required" });
    return;
  }
  const { data, ok, status, problem, error } = await fetchReverseGeocoding(
    lat as string,
    lon as string,
  );
  if (ok) res.json(data);
  else res.status(status).json({ problem, error });
};
