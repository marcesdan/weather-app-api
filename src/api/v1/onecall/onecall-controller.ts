import { Request, Response } from "express";
import { fetchOnecall } from "../../../services/weather-api-map-service";

export const getCurrentWeather = async (req: Request, res: Response) => {
  const { lat, lon } = req.query;
  if (!(lat && lon)) {
    res.status(400).json({ error: "Geocords are required" });
    return;
  }
  const { data, ok, status, problem, error } = await fetchOnecall(
    lat as string,
    lon as string,
  );
  if (ok) res.json(data);
  else res.status(status).json({ problem, error });
};
