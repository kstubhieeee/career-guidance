import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import VideoCallWrapper from '../components/VideoCallWrapper';
import ZegoVideoCall from '../components/ZegoVideoCall';

// Helper function to generate consistent user IDs
const generateUserID = (roomID, isMentor) => {
    return `${isMentor ? 'mentor' : 'student'}-${roomID}`;
};

function VideoCallActivePage() {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [roomID, setRoomID] = useState('');
    const [userName, setUserName] = useState('');
    const [userID, setUserID] = useState('');
    const [isLoaded, setIsLoaded] = useState(false);
    const [isMentor, setIsMentor] = useState(false);

    // Log authentication and location state for debugging
    console.log("VIDEO CALL ACTIVE: User authenticated:", !!currentUser);
    console.log("VIDEO CALL ACTIVE: User is mentor:", currentUser?.isMentor);
    console.log("VIDEO CALL ACTIVE: Location state:", location.state);

    useEffect(() => {
        // Check if there's auth and location state data
        if (!currentUser) {
            console.log("No current user, redirecting to login");
            navigate('/login');
            return;
        }

        if (!location.state || !location.state.roomID) {
            console.log("No room ID in location state, redirecting to setup");
            navigate('/video-call-setup');
            return;
        }

        // Set all the required state from location
        const { roomID: stateRoomID, userName: stateUserName, isMentor: stateIsMentor, sessionId: stateSessionId } = location.state;
        setRoomID(stateRoomID);
        setIsMentor(stateIsMentor !== undefined ? stateIsMentor : currentUser.isMentor);

        // Store sessionId if available (for later use in rating)
        if (stateSessionId) {
            console.log("Session ID received in VideoCallActive:", stateSessionId);
        } else {
            console.log("No session ID provided, will use roomID as fallback:", stateRoomID);
        }

        // Use provided userName or generate one
        if (stateUserName) {
            setUserName(stateUserName);
        } else {
            setUserName(`${currentUser.firstName} ${currentUser.lastName}`);
        }

        // Generate a stable user ID from room ID and user role
        const generatedUserID = generateUserID(
            stateRoomID,
            stateIsMentor !== undefined ? stateIsMentor : currentUser.isMentor
        );
        setUserID(generatedUserID);

        setIsLoaded(true);

    }, [currentUser, location.state, navigate]);

    // Handle leaving the call
    const handleLeaveCall = () => {
        console.log("Leaving call from room:", roomID);

        // Different navigation based on user role
        if (!isMentor) {
            // For students, redirect to rating page with session details
            const sessionIdToUse = location.state?.sessionId || roomID;
            const sessionRequestIdToUse = location.state?.sessionRequestId || null;
            console.log("Redirecting to rating page with session ID:", sessionIdToUse);
            console.log("Session Request ID for rating:", sessionRequestIdToUse);

            navigate('/rate-session', {
                state: {
                    roomID,
                    fromVideoCall: true,
                    sessionId: sessionIdToUse,
                    sessionRequestId: sessionRequestIdToUse,
                    userId: currentUser?._id
                }
            });
        } else {
            // For mentors, just go back to setup
            navigate('/video-call-setup');
        }
    };

    // If not loaded yet, show loading screen
    if (!isLoaded) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-darkblue to-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-white text-xl">Loading video call...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-darkblue to-gray-900">
            <div className="h-screen">
                <VideoCallWrapper isInCall={true} onLeave={handleLeaveCall}>
                    <ZegoVideoCall
                        roomID={roomID}
                        userID={userID}
                        userName={userName}
                        onCallEnd={handleLeaveCall}
                    />
                </VideoCallWrapper>
            </div>
        </div>
    );
}

export default VideoCallActivePage; 