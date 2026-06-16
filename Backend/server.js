import 'dotenv/config';
import express from "express";
import route from "./routes/route.js";
import apiRouter, { startServices } from "./api.js";

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.use("/", route);
app.use(apiRouter);

startServices()
  .then(() => {
    app.listen(port, () => {
      console.log(`server is running on ${port}`);
    });
  })
  .catch(error => {
    console.error("Startup failed:", error);
    process.exit(1);
  });
