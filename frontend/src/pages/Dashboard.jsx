import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link ,useNavigate} from 'react-router-dom';

export default function Dashboard() {
    const [playlists, setPlaylists] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchPlaylists = async () => {
            try {
                const response = await axios.get('http://localhost:8000/api/v1/playlists', {
                    withCredentials: true 
                });
                
                setPlaylists(response.data.data);
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

        fetchPlaylists();
    }, [navigate]);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <p className="text-gray-500 font-bold text-xl animate-pulse">Loading your data...</p>
            </div>
        );
    }

    if (error) {
        return <div className="text-red-500 p-4 bg-red-50 rounded-md border border-red-200">{error}</div>;
    }

    return (
        <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-zinc-900 mb-2">Your Dashboard</h1>
            <p className="text-gray-600 text-lg mb-8">Manage and track your YouTube learning progress.</p>
            
            {playlists.length === 0 ? (
                <div className="p-12 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center bg-white shadow-sm">
                    <p className="text-gray-500 font-medium text-lg">No playlists tracked yet. Use the Chrome Extension to add one!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Loop over the playlists and render a card for each one */}
                    {playlists.map((playlist) => (
                        <div key={playlist._id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                            <h3 className="font-bold text-xl text-zinc-900 mb-2 truncate">
                                {playlist.playlistName}
                            </h3>
                            <p className="text-gray-500 mb-4">
                                {playlist.totalPlaylistVideos} Videos
                            </p>
                            <button className="w-full py-2 bg-red-50 text-red-700 font-bold rounded hover:bg-red-100 transition-colors cursor-pointer">
                                <Link 
                                   to={`/dashboard/playlist/${playlist._id}`}
                                   className="block text-center w-full py-2 bg-red-50 text-red-700 font-bold rounded hover:bg-red-100 transition-colors cursor-pointer"
                                >
                                   View Progress
                                </Link>
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}