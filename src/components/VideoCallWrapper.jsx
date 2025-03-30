import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function VideoCallWrapper({ children, isInCall, onLeave }) {
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const isMentor = currentUser?.isMentor;

    // Handle user leaving the call
    const handleLeave = () => {
        if (typeof onLeave === 'function') {
            onLeave();
        } else {
            navigate(-1);
        }
    };

    return (
        <div className="relative h-full">
            {/* Main video container */}
            <div className="w-full h-full">
                {children}
            </div>

            {/* Header overlay */}
            <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/70 to-transparent p-4 flex justify-between items-center z-10">
                <div className="flex items-center">
                    <svg className="w-6 h-6 text-white mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <span className="text-white font-semibold">
                        Career Guidance Video Session
                        {isMentor ?
                            <span className="ml-2 bg-blue-600 text-white text-xs px-2 py-0.5 rounded">Mentor</span> :
                            <span className="ml-2 bg-green-600 text-white text-xs px-2 py-0.5 rounded">Student</span>
                        }
                    </span>
                </div>

                {/* Only show leave button when not in the Zego UI (which has its own leave button) */}
                {!isInCall && (
                    <button
                        onClick={handleLeave}
                        className="flex items-center justify-center bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-md transition-colors"
                    >
                        <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Leave Call
                    </button>
                )}
            </div>
        </div>
    );
}

export default VideoCallWrapper; 