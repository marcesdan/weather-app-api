import { Request, Response } from "express";
import { fetchIpApiData } from "../../../services/ip-api-service";
const ip = require("ip");

const isProd = process.env.NODE_ENV === "production";

/**
 * Dado que SSL no está disponible gratuitamente en la API, y eso hace que en producción
 * falle el llamado desde el cliente. Se hace un proxy request a traves de este endpoint.
 *
 * Sin embargo, esto puede fallar si el cliente está bajo un proxy, o tiene algún mecanismo para
 * ocultar su IP. También falla en local, por eso se hardcodea cuando NODE_ENV es distinto de "production".
 * @param req - The request object.
 * @param res - The response object.
 */
export const getIpData = async (req: Request, res: Response) => {
  const ipAddr = isProd ? req.ip : "204.157.202.220";
  if (ip.isPrivate(ipAddr)) {
    res.status(400).json({ error: "Public IP address is required" });
    return;
  }
  const { data, ok, status, problem, error } = await fetchIpApiData(ipAddr);
  if (ok) res.json(data);
  else res.status(status).json({ problem, error });
};
