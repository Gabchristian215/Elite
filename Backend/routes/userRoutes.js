import express from "express"
import { getMe, getAllUsers, getUser, updateMe, deleteMe, updateUser, deleteUser} from "../controllers/userController.js"
import { requireLogin, restrictTo } from "../middleware/authMiddleware.js";





const userRoute = express.Router();

userRoute.get('/me', requireLogin, getMe);
userRoute.patch('/updateMe', requireLogin, updateMe);
userRoute.delete("/deleteMe", requireLogin, deleteMe);

// Admin routes
userRoute
  .route("/")
  .get(requireLogin, restrictTo("admin"), getAllUsers);

userRoute
  .route("/:id")
  .get(requireLogin, restrictTo("admin"), getUser)
  .patch(requireLogin, restrictTo("admin"), updateUser)
  .delete(requireLogin, restrictTo("admin"), deleteUser);










export default userRoute;