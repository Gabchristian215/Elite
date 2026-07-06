import express from "express";
import { getSealed, saveData } from "../api.js";
import { requireLogin } from "../middleware/authMiddleware.js";

const appRouter = express.Router();

appRouter.get("/getSealed", requireLogin, async (req, res) => {
  try {
    const { set, limit = "5" } = req.query;
    if (!set) {
      return res.status(400).json({ error: "set query param is required" });
    }
    const product = await getSealed(set, limit);
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message || "failed to fetch data" });
  }
});

appRouter.post("/saveDb", requireLogin, async (req, res) => {
  try {
    const { set, limit = "5" } = req.body || {};

    if (!set) {
      return res.status(400).json({ error: "set is required" });
    }
    const product = await getSealed(set, limit);
    const productWithSetSlug = product.map(item => ({ ...item, setSlug: set }));

    if (!Array.isArray(productWithSetSlug) || productWithSetSlug.length === 0) {
      return res.status(400).json({ error: "No products found to save" });
    }
    await saveData(productWithSetSlug);
    res.status(200).json({ message: "saved to Database" });
  } catch(error) {
    res.status(500).json({ error: error.message || "cannot save to Database" });
  }
});

export default appRouter;
