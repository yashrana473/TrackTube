import { useState, useEffect } from 'react';
import { useParams, Link ,useNavigate} from 'react-router-dom';
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
    }, [id,navigate]);

    if (isLoading) return <div className="text-center mt-20 text-gray-500 font-bold animate-pulse">Loading playlist...</div>;
    if (error) return <div className="text-center mt-20 text-red-500 font-bold">{error}</div>;
    if (!playlist) return null;

    return (
        <div className="max-w-7xl mx-auto">
            <Link to="/dashboard" className="text-red-600 hover:text-red-800 font-bold mb-6 inline-block">
                &larr; Back to Dashboard
            </Link>

            <h1 className="text-3xl font-bold text-zinc-900 mb-2">{playlist.playlistName}</h1>
            <p className="text-gray-600 text-lg mb-8">
                {playlist.trackedVideos.length} Videos Tracked
            </p>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                <p className="text-gray-500 text-center">For video list UI</p>
            </div>
        </div>
    );
}