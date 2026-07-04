import mongoose, { Schema } from "mongoose";

// Schema for each video stored within a tracked playlist
const loggedVideoSchema = new Schema({
    youtubeVideoId: {
        type: String,
        required: true
    },
    videoTitle: {
        type: String,
        required: true
    },
    durationInSeconds: {
        type: Number,
        required: true
    },
    isWatched: {
        type: Boolean,
        default: false
    },
    isImportant: {
        type: Boolean,
        default: false
    },
    savedWatchSpeed: {
        type: Number,
        default: 1.0
    }
});

const playlistTrackingSchema = new Schema(
    {
        playlistOwnerId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        youtubePlaylistId: {
            type: String,
            required: true
        },
        playlistName: {
            type: String,
            required: true
        },
        totalPlaylistVideos: {
            type: Number,
            required: true
        },
        // Embedded documents for quick access to a playlist's videos
        trackedVideos: [loggedVideoSchema]
    },
    { timestamps: true } 
);

// Ensure a user cannot track the same YT playlist more than once
playlistTrackingSchema.index(
    { playlistOwnerId: 1, youtubePlaylistId: 1 },
    { unique: true }
);

export const Playlist = mongoose.model("Playlist", playlistTrackingSchema);