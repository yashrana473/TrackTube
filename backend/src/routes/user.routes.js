import { Router } from "express";
import { registerUser,loginUser } from "../controllers/user.controller.js";

const router = Router();

// /api/v1/users/register
router.route("/register").post(registerUser);
router.route("/login").post(loginUser);

export default router;