import { Request, Response } from "express";
import {
  fetchDirectGeocoding,
  fetchReverseGeocoding,
} from "../../../services/weather-api-map-service";

export const getDirectGeocoding = async (req: Request, res: Response) => {
  const city = req.query.city;
  const geocoding = await fetchDirectGeocoding(city as string);
  res.json(geocoding);
};

export const getReverseGeocoding = async (req: Request, res: Response) => {
  const { lat, lon } = req.query;
  const geocoding = await fetchReverseGeocoding(lat as string, lon as string);
  res.json(geocoding);
};
