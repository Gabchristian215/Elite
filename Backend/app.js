import express from "express";
import { rateLimit } from "express-rate-limit";
import route from "./routes/route.js";
import userRoute from "./routes/userRoutes.js";
import apiRouter from "./api.js";

const app = express();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 3,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    status: "error",
    message: "Too many requests. Please try again later.",
  },
});

app.use(express.json());
app.use(limiter);

app.use("/", route);
app.use("/", apiRouter, limiter);
app.use("/", userRoute);

export default app;
