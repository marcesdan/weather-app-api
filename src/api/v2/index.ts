import express from "express";

const router = express.Router();

router.get("/", (req, res) => {
  res.send("Coming soon 🚀");
});

export default router;
