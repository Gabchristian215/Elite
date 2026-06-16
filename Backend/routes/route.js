import express from "express"
import { signup, login, forgotPassword, resetPassword, updatePassword} from "../controllers/authController.js"
import { requireLogin, restrictTo } from "../middleware/authMiddleware.js";

const route = express.Router();

route.post("/signup", signup);
route.post('/login', login);

route.post('/forgotPassword', forgotPassword);
route.patch('/resetPassword/:token', resetPassword);
route.patch('/updatePassword', requireLogin, updatePassword)


export default route;
