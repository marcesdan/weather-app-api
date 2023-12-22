import { Request, Response } from "express";
import { fetchOnecall } from "../../../services/weather-api-map-service";

export const getCurrentWeather = async (req: Request, res: Response) => {
  const { lat, lon } = req.query;
  const data = await fetchOnecall(lat as string, lon as string);
  res.json(data);
};
