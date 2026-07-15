import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Playlist } from "../models/playlist.models.js";
import { fetchYoutubePlaylistData } from "../utils/youtube.js";

const importPlaylist = asyncHandler(async (req, res) => {
    const { youtubeUrl } = req.body;

    if (!youtubeUrl) {
        throw new ApiError(400, "Please provide a YouTube playlist URL");
    }

    // Extract the playlist ID from the YT URL
    const urlMatch = youtubeUrl.match(/[?&]list=([^#&?]+)/);
    const youtubePlaylistId = urlMatch ? urlMatch[1] : null;

    if (!youtubePlaylistId) {
        throw new ApiError(400, "Invalid YouTube playlist URL");
    }

    // Prevent duplicate tracking for the same user
    const existingTracker = await Playlist.findOne({
        playlistOwnerId: req.user._id,
        youtubePlaylistId
    });

    if (existingTracker) {
        return res.status(409).json({ 
            success: false, 
            message: "You are already tracking this playlist" 
        });
    }

    // Fetch playlist details from YT
    const ytData = await fetchYoutubePlaylistData(youtubePlaylistId);

    // Save the playlist in our database
    const newPlaylistTracker = await Playlist.create({
        playlistOwnerId: req.user._id,
        youtubePlaylistId,
        playlistName: ytData.playlistName,
        totalPlaylistVideos: ytData.totalVideos,
        trackedVideos: ytData.videos
    });

    return res.status(201).json(
        new ApiResponse(
            201,
            newPlaylistTracker,
            "Playlist successfully imported and tracking started."
        )
    );
});

const checkPlaylistStatus = asyncHandler(async (req, res) => {
    const { url } = req.query;

    if (!url) {
        return res.status(400).json({ success: false, message: "URL is required" });
    }

    const urlMatch = url.match(/[?&]list=([^#&?]+)/);
    const youtubePlaylistId = urlMatch ? urlMatch[1] : null;

    if (!youtubePlaylistId) {
        return res.status(400).json({ success: false, message: "Invalid YouTube URL" });
    }

    // Look for any existing record matching the user and playlist ID
    const playlist = await Playlist.findOne({
        playlistOwnerId: req.user._id,
        youtubePlaylistId: youtubePlaylistId
    });

    if (!playlist) {
        return res.status(200).json({ success: true, data: null });
    }

    return res.status(200).json({
        success: true,
        data: {
            name: playlist.playlistName, 
            totalVideos: playlist.totalPlaylistVideos 
        }
    });
});

export { importPlaylist,checkPlaylistStatus };