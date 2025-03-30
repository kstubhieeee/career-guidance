import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Footer from '../components/Footer';

// Helper function to generate a random room ID
const generateRoomID = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
};

function VideoCallSetupPage() {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [roomID, setRoomID] = useState('');
    const [userName, setUserName] = useState('');
    const [previousPage, setPreviousPage] = useState('');
    const isMentor = currentUser?.isMentor;

    useEffect(() => {
        // If user isn't authenticated, redirect to login
        if (!currentUser) {
            navigate('/login');
            return;
        }

        // Set initial user name from current user
        const name = `${currentUser.firstName} ${currentUser.lastName}`;
        setUserName(name);

        // If the location state has a roomID (from a session) and user is mentor, use it
        if (location.state?.roomID && currentUser?.isMentor) {
            setRoomID(location.state.roomID);
        }

        // Store the previous page if available in state
        if (location.state?.from) {
            setPreviousPage(location.state.from);
        } else if (document.referrer) {
            // Use referrer as fallback
            const referrer = document.referrer;
            // Extract path from full URL
            const url = new URL(referrer);
            if (url.origin === window.location.origin) {
                setPreviousPage(url.pathname);
            }
        }
    }, [currentUser, navigate, location.state]);

    const handleCreateRoom = useCallback(() => {
        const newRoomID = generateRoomID();
        setRoomID(newRoomID);
    }, []);

    const handleJoinCall = useCallback((e) => {
        e.preventDefault();
        if (roomID && userName) {
            // Navigate to the active call page with the necessary information
            console.log("Starting video call with sessionId:", location.state?.sessionId || roomID);
            console.log("Session Request ID:", location.state?.sessionRequestId || null);

            navigate('/video-call-active', {
                state: {
                    roomID,
                    userName,
                    isMentor: currentUser?.isMentor,
                    fromSetup: true,
                    sessionId: location.state?.sessionId || roomID,
                    sessionRequestId: location.state?.sessionRequestId || null
                }
            });
        }
    }, [roomID, userName, navigate, currentUser, location.state]);

    const handleBack = useCallback(() => {
        if (previousPage) {
            navigate(previousPage);
        } else {
            // Default fallback routes based on user role
            if (isMentor) {
                navigate('/mentee-requests');
            } else {
                navigate('/my-bookings');
            }
        }
    }, [navigate, previousPage, isMentor]);

    // Handle case when user isn't authenticated
    if (!currentUser) {
        return null; // Will redirect in useEffect
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-darkblue to-gray-900 pt-24">
            <div className="container mx-auto px-4">
                <div className="max-w-2xl mx-auto">
                    <h1 className="text-3xl font-bold text-white mb-8 text-center">Video Call Setup</h1>

                    <div className="bg-secondary-light backdrop-blur-sm border border-gray-700 rounded-lg shadow-xl">
                        <div className="p-6 border-b border-gray-700">
                            <h2 className="text-2xl font-bold text-center text-white flex items-center justify-center gap-2">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                                <span>Prepare Your Call {isMentor ? ' (Mentor)' : ' (Student)'}</span>
                            </h2>
                        </div>
                        <div className="p-6">
                            <form onSubmit={handleJoinCall} className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-200">Room ID</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={roomID}
                                            onChange={(e) => setRoomID(e.target.value)}
                                            placeholder="Enter Room ID"
                                            className="flex-1 bg-gray-700/50 border border-gray-600 text-white placeholder:text-gray-400 p-2 rounded-md"
                                            required
                                        />
                                        {isMentor && (
                                            <button
                                                type="button"
                                                onClick={handleCreateRoom}
                                                className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-md transition-colors"
                                            >
                                                Create
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-200">Your Name</label>
                                    <input
                                        type="text"
                                        value={userName}
                                        onChange={(e) => setUserName(e.target.value)}
                                        placeholder="Enter your name"
                                        className="w-full bg-gray-700/50 border border-gray-600 text-white placeholder:text-gray-400 p-2 rounded-md"
                                        required
                                    />
                                </div>

                                {roomID && isMentor && (
                                    <div className="mt-4 p-4 bg-blue-900/20 rounded-lg border border-blue-800">
                                        <p className="text-sm text-blue-300 flex items-center gap-2">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                            </svg>
                                            Share this Room ID with others to join: <span className="font-bold">{roomID}</span>
                                        </p>
                                    </div>
                                )}

                                <div className="mt-6 pt-6 border-t border-gray-700">
                                    <div className="grid grid-cols-2 gap-4">
                                        <button
                                            type="button"
                                            onClick={handleBack}
                                            className="bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-md transition-colors flex items-center justify-center"
                                        >
                                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                            </svg>
                                            Back
                                        </button>

                                        <button
                                            type="submit"
                                            className="bg-primary hover:bg-primary-dark text-white py-2 px-4 rounded-md transition-colors flex items-center justify-center"
                                            disabled={!roomID}
                                        >
                                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            Start Call
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>

                </div>
            </div>

        </div>
    );
}

export default VideoCallSetupPage; 