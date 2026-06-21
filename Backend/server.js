import 'dotenv/config';
import app from "./app.js";
import { startServices } from "./api.js";

const port = process.env.PORT || 3000;

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
