import 'dotenv/config';
<<<<<<< HEAD
import app from "./app.js";
import { startServices } from "./api.js";
import connectDB from "./config/db.js";
=======
import express from "express";
import route from "./routes/route.js";
import userRoute from "./routes/userRoutes.js"
import appRouter from "./routes/appRouter.js";
import { startServices } from "./api.js";
>>>>>>> cca3e7d (Move app routes into router file)

const port = process.env.PORT || 3000;

<<<<<<< HEAD
Promise.all([connectDB(), startServices()])
=======
app.use(express.json());

app.use("/", route);
app.use(appRouter);
app.use('/', userRoute)

startServices()
>>>>>>> cca3e7d (Move app routes into router file)
  .then(() => {
    app.listen(port, () => {
      console.log(`server is running on ${port}`);
    });
  })
  .catch(error => {
    console.error("Startup failed:", error);
    process.exit(1);
  });
