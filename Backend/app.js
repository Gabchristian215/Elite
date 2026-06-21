import express from "express";
import { rateLimit } from "express-rate-limit";
import helmet from "helmet";
import morgan from "morgan";
import hpp from "hpp"
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
app.use(helmet());

//loginng in development
if(process.env.NODE_ENV === "development"){
  app.use(morgan("dev"));
}
app.use(express.json({limit: "10kb"}));
app.use(hpp());


app.use(limiter);

app.use("/", route);
app.use("/", apiRouter, limiter);
app.use("/", userRoute);

export default app;
