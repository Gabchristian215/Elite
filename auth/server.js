import express from "express";
import route from "./route.js";

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.use("/auth", route);

app.listen(port, () => {
  console.log(`server is running on ${port}`);
});
