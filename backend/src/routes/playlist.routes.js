import { Router } from "express";
import { importPlaylist,checkPlaylistStatus,getUserPlaylists,getPlaylistById,toggleVideoWatchedStatus } from "../controllers/playlist.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT); 

router.route("/import").post(importPlaylist);
router.route("/check").get(checkPlaylistStatus);
router.route("/").get(getUserPlaylists);
router.route("/:playlistId").get(getPlaylistById);
router.route("/:playlistId/videos/:videoId/watch").put(toggleVideoWatchedStatus);

export default router;