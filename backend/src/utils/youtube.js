import { ApiError } from "./ApiError.js";
import { parse, toSeconds } from 'iso8601-duration';

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

            if (videoData.items && videoData.items.length > 0) {

                // Extract all the Video IDs from this page
                const videoIds = videoData.items
                    .map((item) => item.snippet.resourceId.videoId)
                    .join(",");

                // Fetch the durations for these video
                const detailsResponse = await fetch(
                    `${BASE_URL}/videos?part=contentDetails&id=${videoIds}&key=${YOUTUBE_API_KEY}`
                );
                const detailsData = await detailsResponse.json();

                // Map of VideoID -> Duration for instant lookup
                const durationMap = {};
                if (detailsData.items) {
                    detailsData.items.forEach((video) => {
                        durationMap[video.id] = toSeconds(parse(video.contentDetails.duration));
                    });
                }

                // Adding into our schema
                const formattedVideos = videoData.items.map((item) => {
                    const videoId = item.snippet.resourceId.videoId;
                    return {
                        youtubeVideoId: videoId,
                        videoTitle: item.snippet.title,
                        durationInSeconds: durationMap[videoId] || 0,
                        isWatched: false,
                        isImportant: false,
                        savedWatchSpeed: 1.0
                    };
                });

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