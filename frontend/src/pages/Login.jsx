import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    // The "Steering Wheel" hook
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault(); 
        setIsLoading(true);
        setError('');

        try {
            const response = await axios.post('http://localhost:8000/api/v1/users/login', 
                { email, password },
                { withCredentials: true } 
            );

            if (response.data.success) {
                // Steer the user to the dashboard
                navigate('/dashboard');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to login. Check your credentials.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-50">
            <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-lg border border-gray-100">
                
                <h2 className="text-center text-zinc-900 mb-6 text-3xl font-extrabold tracking-tight">
                    Login to CourseSync
                </h2>
                
                {error && (
                    <div className="text-red-700 bg-red-50 border border-red-200 p-3 rounded-md mb-4 text-center text-sm font-medium">
                        {error}
                    </div>
                )}
                
                <form onSubmit={handleLogin} className="flex flex-col gap-4">
                    <input 
                        type="email" 
                        placeholder="Email Address" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="p-3 text-base border border-gray-300 rounded-md focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600"
                    />
                    <input 
                        type="password" 
                        placeholder="Password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="p-3 text-base border border-gray-300 rounded-md focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600"
                    />
                    <button 
                        type="submit" 
                        disabled={isLoading}
                        className="mt-2 p-3 text-base font-bold text-white bg-red-600 rounded-md border-none cursor-pointer transition-colors hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Authenticating...' : 'Log In'}
                    </button>
                </form>

            </div>
        </div>
    );
}