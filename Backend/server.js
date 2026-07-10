import 'dotenv/config';
import app from "./app.js";
import { startServices } from "./api.js";
import connectDB from "./config/db.js";

const port = process.env.PORT || 3000;

connectDB()
  .then(() => startServices())
  .then(() => {
    app.listen(port, () => {
      console.log(`server is running on ${port}`);
    });
  })
  .catch(error => {
    console.error("Startup failed:", error);
    process.exit(1);
  });
