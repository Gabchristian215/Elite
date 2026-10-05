import express from "express";
import { getSealedProducts, saveProducts, getProducts, deleteProduct } from "../controllers/productController.js";
import { requireLogin } from "../middleware/authMiddleware.js";

const appRouter = express.Router();

appRouter.get("/getSealed", requireLogin, getSealedProducts);
appRouter.post("/saveDb", requireLogin, saveProducts);
appRouter.get("/products", requireLogin, getProducts);
appRouter.delete("/products/:tcgPlayerId", requireLogin, deleteProduct);

export default appRouter;
