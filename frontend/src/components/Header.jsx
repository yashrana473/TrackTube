import { useNavigate } from 'react-router-dom';

export default function Header() {
    const navigate = useNavigate();

    const handleLogout = () => {
        // Future backend logout call goes here
        navigate('/');
    };

    return (
        <nav className="flex justify-between items-center px-8 py-4 bg-zinc-900 text-white shadow-md">
            <h2 className="m-0 text-red-600 font-bold text-2xl tracking-tight">
                TrackTube
            </h2>
            <button 
                onClick={handleLogout}
                className="px-4 py-2 bg-transparent text-white border border-white rounded font-bold transition-colors hover:bg-white hover:text-zinc-900 cursor-pointer"
            >
                Logout
            </button>
        </nav>
    );
}