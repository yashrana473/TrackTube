import { ApiError } from "./ApiError.js";

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const BASE_URL = "https://www.googleapis.com/youtube/v3";

const fetchYoutubePlaylistData = async (playlistId) => {
    try {
        // Fetch playlist details
        const metaResponse = await fetch(
            `${BASE_URL}/playlists?part=snippet&id=${playlistId}&key=${YOUTUBE_API_KEY}`
        );
        const metaData = await metaResponse.json();

        if (!metaData.items || metaData.items.length === 0) {
            throw new ApiError(404, "YouTube playlist not found or is private.");
        }

        const playlistName = metaData.items[0].snippet.title;

        // Fetch all videos (50 per request)
        let allVideos = [];
        let nextPageToken = "";

        do {
            const url = `${BASE_URL}/playlistItems?part=snippet&maxResults=50&playlistId=${playlistId}&key=${YOUTUBE_API_KEY}&pageToken=${nextPageToken}`;

            const videoResponse = await fetch(url);
            const videoData = await videoResponse.json();

            if (videoData.items) {
                // Convert YouTube's response into our schema
                const formattedVideos = videoData.items.map((item) => ({
                    youtubeVideoId: item.snippet.resourceId.videoId,
                    videoTitle: item.snippet.title,
                    durationInSeconds: 0, // Duration requires another API request
                    isWatched: false,
                    isImportant: false,
                    savedWatchSpeed: 1.0
                }));

                allVideos.push(...formattedVideos);
            }

            // Continue until there are no more pages
            nextPageToken = videoData.nextPageToken || "";

        } while (nextPageToken);

        return {
            playlistName,
            totalVideos: allVideos.length,
            videos: allVideos
        };

    } catch (error) {
        throw new ApiError(
            500,
            error?.message || "Failed to fetch data from YouTube API"
        );
    }
};

export { fetchYoutubePlaylistData };