import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * This component is kept for backward compatibility.
 * It redirects to either the setup page or directly to the active call page
 * depending on whether location state with roomID is provided.
 */
const VideoCall = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        console.log("Legacy VideoCall: Redirecting to new video call pages");

        // If we have location state with roomID, redirect to the active page
        if (location.state?.roomID) {
            navigate('/video-call-active', {
                state: location.state
            });
        } else {
            // Otherwise redirect to the setup page
            navigate('/video-call-setup');
        }
    }, [navigate, location.state]);

    return (
        <div className="min-h-screen bg-gradient-to-b from-darkblue to-gray-900 flex items-center justify-center">
            <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-white text-xl">Redirecting to video call...</p>
            </div>
        </div>
    );
};

export default VideoCall;
