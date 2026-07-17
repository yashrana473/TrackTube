import { Link } from 'react-router-dom';

export default function NotFound() {
    return (
        <div className="flex flex-col justify-center items-center min-h-screen bg-gray-50 p-4 text-center">
            <h1 className="text-6xl font-extrabold text-red-600 mb-4">404</h1>
            <h2 className="text-2xl font-bold text-zinc-900 mb-2">Page Not Found</h2>
            <p className="text-gray-500 mb-8">Oops! The page you are looking for doesn't exist or has been moved.</p>
            <Link 
                to="/dashboard" 
                className="px-6 py-3 bg-red-600 text-white font-bold rounded-md hover:bg-red-700 transition-colors"
            >
                Return to Dashboard
            </Link>
        </div>
    );
}