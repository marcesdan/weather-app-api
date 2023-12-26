import { Request, Response } from "express";
import { fetchIpApiData } from "../../../services/ip-api-service";

const isDev = process.env.NODE_ENV === "development";

export const getIpData = async (req: Request, res: Response) => {
  // dado que no funcionaría en local, se hardcodea con una ip conocida
  const ip = isDev ? "204.157.202.220" : req.ip;
  const data = await fetchIpApiData(ip);
  res.json(data);
};
