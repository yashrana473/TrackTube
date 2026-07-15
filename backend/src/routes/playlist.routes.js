import { Router } from "express";
import { importPlaylist,checkPlaylistStatus } from "../controllers/playlist.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT); 

router.route("/import").post(importPlaylist);
router.route("/check").get(checkPlaylistStatus);

export default router;