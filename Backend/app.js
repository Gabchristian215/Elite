import express from "express";
import { rateLimit } from "express-rate-limit";
import helmet from "helmet";
import morgan from "morgan";
import hpp from "hpp"
import route from "./routes/route.js";
import userRoute from "./routes/userRoutes.js";
import appRouter from "./routes/appRouter.js";

const app = express();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    status: "error",
    message: "Too many requests. Please try again later.",
  },
});
// stricter limit for credential endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    status: "error",
    message: "Too many login attempts. Please try again later.",
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
app.use(["/login", "/signup", "/forgotPassword"], authLimiter);

app.use("/", route);
app.use("/", appRouter);
app.use("/", userRoute);

export default app;
