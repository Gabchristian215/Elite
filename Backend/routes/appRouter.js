import express from "express";
import { getSealed, normalizeProduct, saveData } from "../controllers/appController.js";
import { requireLogin } from "../middleware/authMiddleware.js";
import Product from "../models/productSchema.js";

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
    const {
      set,
      limit = "5",
      products,
      selectedProducts,
      selectedProductIds,
      productIds,
      tcgPlayerIds
    } = req.body || {};

    if (!set) {
      return res.status(400).json({ error: "set is required" });
    }

    const explicitlySelectedProducts = products ?? selectedProducts;
    let productsToSave = [];

    if (Array.isArray(explicitlySelectedProducts)) {
      productsToSave = explicitlySelectedProducts
        .filter(item => item && typeof item === "object")
        .map(item => normalizeProduct(item, set));
    } else if (Array.isArray(tcgPlayerIds ?? selectedProductIds ?? productIds)) {
      const selectedIds = new Set(
        (tcgPlayerIds ?? selectedProductIds ?? productIds).map(id => String(id))
      );
      const fetchedProducts = await getSealed(set, limit);
      productsToSave = fetchedProducts
        .filter(item => selectedIds.has(String(item.tcgPlayerId)))
        .map(item => normalizeProduct(item, set));
    } else {
      return res.status(400).json({
        error: "products, selectedProducts, tcgPlayerIds, selectedProductIds, or productIds is required"
      });
    }

    productsToSave = productsToSave.filter(item => item.tcgPlayerId && item.price != null);

    if (productsToSave.length === 0) {
      return res.status(400).json({ error: "No selected products found to save" });
    }

    await saveData(productsToSave);
    res.status(200).json({
      message: "saved to Database",
      savedCount: productsToSave.length
    });
  } catch(error) {
    res.status(500).json({ error: error.message || "cannot save to Database" });
  }
});

appRouter.get("/products", requireLogin, async (req, res) => {
  try {
    const products = await Product.find().sort({ updatedAt: -1 }).lean();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message || "failed to load products" });
  }
});

appRouter.delete("/products/:tcgPlayerId", requireLogin, async (req, res) => {
  try {
    const result = await Product.deleteMany({ tcgPlayerId: String(req.params.tcgPlayerId) });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ error: error.message || "failed to remove product" });
  }
});

export default appRouter;
