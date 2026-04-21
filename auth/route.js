import express from "express"
import { signup } from "./newUser.js"

const route = express.Router();

route.post("/signup", signup);

export default route;
