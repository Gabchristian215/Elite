import express from "express"
import { signup, login, forgotPassword, resetPassword} from "../controllers/authController.js"

const route = express.Router();

route.post("/signup", signup);
route.post('/login', login);

route.post('/forgotPassword', forgotPassword);
route.patch('/resetPassword/:token', resetPassword);


export default route;
