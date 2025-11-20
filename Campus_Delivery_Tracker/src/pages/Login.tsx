import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

// Package Box icon (SVG from Lucide) to replace the truck
const PackageBoxIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/>
        <path d="m3.3 7 8.7 5 8.7-5"/>
        <path d="M12 22V12"/>
    </svg>
);

// Custom Input Component with Label
interface InputProps {
    label: string;
    type: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const AuthInput: React.FC<InputProps> = ({ label, type, value, onChange }) => (
    <div className="mb-5">
        <label className="text-sm font-medium text-gray-700 mb-1 block">{label}</label>
        <input
            type={type}
            value={value}
            onChange={onChange}
            className="w-full p-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600 transition duration-150 shadow-inner placeholder-gray-400"
        />
    </div>
);

const Login: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');

    const { login, register } = useAuth();
    const navigate = useNavigate();

    const isLogin = activeTab === 'login';

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            if (isLogin) {
                await login(email, password);
            } else {
                if (password !== confirmPassword) {
                    setError('Passwords do not match');
                    return;
                }
                await register(email, password, name);
            }
            navigate('/dashboard');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        }
    };

    return (
        // Full screen background matching the design
        <div className="min-h-screen bg-indigo-700 flex flex-col items-center p-4 font-sans">
            {/* Header / Logo Section */}
            <div className="text-center pt-24 pb-32 w-full">
                <div className="w-20 h-20 mx-auto mb-6 bg-white rounded-2xl flex items-center justify-center shadow-xl">
                    <PackageBoxIcon className="w-10 h-10 text-indigo-600" />
                </div>

                <h1 className="text-4xl font-extrabold text-white tracking-tight leading-tight mb-2">Campus Delivery</h1>
                <p className="text-white text-opacity-80 text-lg font-medium">Track your packages with ease</p>
            </div>

            {/* Authentication Form Card */}
            <div className="bg-white p-6 md:p-8 rounded-3xl shadow-2xl w-full max-w-sm mx-auto -mt-16 relative z-10">
                {/* Tab Switcher (Segmented Control style) */}
                <div className="bg-gray-100 p-1 rounded-xl mb-8 flex shadow-inner">
                    <button
                        onClick={() => setActiveTab('login')}
                        className={`flex-1 py-3 text-base font-semibold rounded-xl transition duration-300 ${
                            isLogin
                                ? 'bg-indigo-600 text-white shadow-md'
                                : 'text-gray-600 bg-transparent hover:text-indigo-600'
                        }`}
                    >
                        Login
                    </button>
                    <button
                        onClick={() => setActiveTab('signup')}
                        className={`flex-1 py-3 text-base font-semibold rounded-xl transition duration-300 ${
                            !isLogin
                                ? 'bg-indigo-600 text-white shadow-md'
                                : 'text-gray-600 bg-transparent hover:text-indigo-600'
                        }`}
                    >
                        Sign Up
                    </button>
                </div>

                <form onSubmit={handleFormSubmit}>
                    {!isLogin && (
                        <AuthInput label="Full name" type="text" value={name} onChange={(e) => setName(e.target.value)} />
                    )}

                    <AuthInput label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />

                    <AuthInput label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />

                    {!isLogin && (
                        <AuthInput label="Confirm Password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                    )}

                    {error && (
                        <div className="mb-4 text-sm text-red-600">{error}</div>
                    )}

                    <button type="submit" className="w-full mt-4 py-4 bg-indigo-600 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-700 transition duration-300 text-lg">
                        {isLogin ? 'Login' : 'Sign Up'}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-gray-500">
                    <strong>Demo Credentials:</strong>
                    <div className="mt-2">Student: student@campus.edu / student123</div>
                    <div>Personnel: personnel@campus.edu / personnel123</div>
                    <div>Admin: admin@campus.edu / admin123</div>
                </div>
            </div>

            {/* Copyright Footer */}
            <div className="flex-grow flex items-end pb-8">
                <p className="text-white text-opacity-60 text-sm">Campus Delivery Tracker © 2024</p>
            </div>
        </div>
    );
};

export default Login;
