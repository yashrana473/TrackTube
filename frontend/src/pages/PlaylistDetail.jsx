import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function PlaylistDetail() {
    // grabs the dynamic ID straight from the URL
    const { id } = useParams();
    const navigate = useNavigate();
    const [playlist, setPlaylist] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchPlaylistDetails = async () => {
            try {
                const response = await axios.get(`http://localhost:8000/api/v1/playlists/${id}`, {
                    withCredentials: true
                });
                setPlaylist(response.data.data);
            } catch (err) {
                // If the backend throws a 401 (Unauthorized)
                if (err.response && err.response.status === 401) {
                    navigate('/', { replace: true });
                } else {
                    // Otherwise might just be a database error
                    setError('Failed to load playlists. Please try again later.');
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchPlaylistDetails();
    }, [id, navigate]);

    if (isLoading) return <div className="text-center mt-20 text-gray-500 font-bold animate-pulse">Loading playlist...</div>;
    if (error) return <div className="text-center mt-20 text-red-500 font-bold">{error}</div>;
    if (!playlist) return null;

    // to turn seconds into MM:SS for UI
    const formatDuration = (totalSeconds) => {
        if (!totalSeconds) return "0:00";
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    // Calculate dynamic watched progress based on current state
    const watchedCount = playlist.trackedVideos ? playlist.trackedVideos.filter(video => video.isWatched).length : 0;

    // UI Toggle Function
    const handleToggleWatch = async (videoId, currentWatchedStatus) => {
        // Flip UI state for immediate feedback
        setPlaylist((prevPlaylist) => {
            const updatedVideos = prevPlaylist.trackedVideos.map((video) => {
                if (video._id === videoId) {
                    return { ...video, isWatched: !currentWatchedStatus };
                }
                return video;
            });
            return { ...prevPlaylist, trackedVideos: updatedVideos };
        });

        // Backend update
        try {
            await axios.put(
                `http://localhost:8000/api/v1/playlists/${id}/videos/${videoId}/watch`,
                {},
                { withCredentials: true }
            );
        } catch (err) {
            console.error("Backend update failed, reverting UI state:", err);
            // Rollback UI if backend fails
            setPlaylist((prevPlaylist) => {
                const revertedVideos = prevPlaylist.trackedVideos.map((video) => {
                    if (video._id === videoId) {
                        return { ...video, isWatched: currentWatchedStatus };
                    }
                    return video;
                });
                return { ...prevPlaylist, trackedVideos: revertedVideos };
            });
        }
    };

    const handleDeletePlaylist = async () => {
        // Simple browser confirmation alert before deleting
        const confirmDelete = window.confirm("Are you sure you want to delete this playlist? This cannot be undone.");
        if (!confirmDelete) return;

        try {
            await axios.delete(`http://localhost:8000/api/v1/playlists/${id}`, {
                withCredentials: true
            });
            navigate('/dashboard'); // back to the dashboard on success
        } catch (error) {
            console.error("Failed to delete playlist:", error);
            alert("Failed to delete the playlist. Please try again.");
        }
    };

    // Sum of all the seconds in the playlist
    const totalSeconds = playlist.trackedVideos ? playlist.trackedVideos.reduce((acc, video) => acc + video.durationInSeconds, 0) : 0;

    const totalHours = Math.floor(totalSeconds / 3600);
    const totalMinutes = Math.floor((totalSeconds % 3600) / 60);
    const formattedTotalDuration = totalHours > 0 ? `${totalHours}h ${totalMinutes}m` : `${totalMinutes}m`;

    return (
        <div className="max-w-7xl mx-auto pb-12">
            <Link to="/dashboard" className="text-red-600 hover:text-red-800 font-bold mb-6 inline-block transition-colors">
                &larr; Back to Dashboard
            </Link>

            {/* Playlist Header */}
            <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-zinc-900 mb-2">{playlist.playlistName}</h1>
                    <div className="flex items-center gap-3 text-gray-600 font-medium flex-wrap">
                        <p>{playlist.totalPlaylistVideos} Videos Tracked</p>
                        <span>•</span>
                        {/* The New Total Duration */}
                        <p>Total Time: {formattedTotalDuration}</p> 
                        <span>•</span>
                        <p className="text-green-600">{watchedCount} Watched</p>
                    </div>
                </div>

                {/* Delete Button */}
                <button 
                    onClick={handleDeletePlaylist}
                    className="px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-md font-bold text-sm hover:bg-red-100 transition-colors shrink-0"
                >
                    Delete Playlist
                </button>
            </div>

            {/* Video List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {playlist.trackedVideos && playlist.trackedVideos.length > 0 ? (
                    <ul className="divide-y divide-gray-100">
                        {playlist.trackedVideos.map((video, index) => (
                            <li key={video._id} className="p-4 hover:bg-gray-50 transition-colors flex items-center gap-4 sm:gap-6">

                                {/* Video Index Number */}
                                <span className="text-gray-400 font-bold w-6 text-right hidden sm:block">
                                    {index + 1}
                                </span>

                                {/* Video Thumbnail */}
                                <div className="w-32 sm:w-40 shrink-0 relative rounded-md overflow-hidden bg-gray-200 aspect-video">
                                    {video.youtubeVideoId ? (
                                        <img
                                            src={`https://img.youtube.com/vi/${video.youtubeVideoId}/hqdefault.jpg`}
                                            alt={video.videoTitle}
                                            className="object-cover w-full h-full"
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-gray-400 text-xs">No Image</div>
                                    )}
                                </div>

                                {/* Video Details */}
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-base font-bold text-zinc-900 truncate mb-1" title={video.videoTitle}>
                                        {video.videoTitle}
                                    </h3>
                                    <p className="text-sm text-gray-500">
                                        Duration: {formatDuration(video.durationInSeconds)}
                                    </p>
                                </div>

                                {/* The Action Button */}
                                <button
                                    onClick={() => handleToggleWatch(video._id, video.isWatched)}
                                    className={`shrink-0 px-4 py-2 rounded font-bold text-sm transition-colors ${video.isWatched
                                            ? 'bg-green-100 text-green-700 hover:bg-green-200 border border-green-200'
                                            : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 border border-zinc-200'
                                        }`}
                                >
                                    {video.isWatched ? '✓ Watched' : 'Mark Watched'}
                                </button>

                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="p-12 text-center text-gray-500 font-medium">
                        No videos found in this playlist.
                    </div>
                )}
            </div>
        </div>
    );
}