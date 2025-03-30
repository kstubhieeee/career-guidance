import React, { useRef, useState, useEffect } from 'react';

// ZegoCloud configuration
const ZEGO_CONFIG = {
    appID: 374148232,
    serverSecret: '0396d009929be4ab3974e91803b3ff72',
    serverUrl: 'wss://webliveroom374148232-api.coolzcloud.com/ws',
    appSign: 'b8fa473bdd748f98e35087e9e797521f2ccce8bbe470a4dea6dccefea8b4f9e6',
    callbackSecret: 'b8fa473bdd748f98e35087e9e797521f'
};

function ZegoVideoCall({ roomID, userID, userName, onCallEnd }) {
    const containerRef = useRef(null);
    const [isJoined, setIsJoined] = useState(false);
    const [isPreJoinView, setIsPreJoinView] = useState(true);
    const zegoInstanceRef = useRef(null);
    const [error, setError] = useState(null);
    const [permissionError, setPermissionError] = useState(null);
    const mediaStreamRef = useRef(null);

    // Normalize the roomID to ensure it's valid for Zego
    const normalizedRoomID = roomID?.replace(/[^a-zA-Z0-9]/g, '') || roomID;

    // Debug info
    console.log("ZEGO: Attempting to join room:", normalizedRoomID);
    console.log("ZEGO: With user ID:", userID);
    console.log("ZEGO: With user name:", userName);

    const stopAllTracks = () => {
        if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach(track => {
                track.stop();
            });
            mediaStreamRef.current = null;
        }
    };

    useEffect(() => {
        if (!containerRef.current || !roomID || !userID || !userName) {
            console.log("ZEGO: Missing required parameters or container ref");
            return;
        }

        let mounted = true;
        let cleanupPromise = null;

        const checkPermissions = async () => {
            try {
                // Check camera permission
                const cameraStream = await navigator.mediaDevices.getUserMedia({ video: true });
                cameraStream.getTracks().forEach(track => track.stop());

                // Check microphone permission
                const micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
                micStream.getTracks().forEach(track => track.stop());

                return true;
            } catch (error) {
                if (mounted) {
                    const errorMessage = error.name === 'NotAllowedError'
                        ? 'Please allow camera and microphone access to join the call'
                        : 'Failed to access camera or microphone';

                    console.error("ZEGO: Permission error -", errorMessage);
                    setPermissionError(errorMessage);
                }
                return false;
            }
        };

        const initializeZego = async () => {
            try {
                // Check permissions first
                const hasPermissions = await checkPermissions();
                if (!hasPermissions) return;

                console.log("ZEGO: Permissions granted, proceeding to initialize");

                // Dynamically import ZegoUIKitPrebuilt
                const { ZegoUIKitPrebuilt } = await import('@zegocloud/zego-uikit-prebuilt');
                console.log("ZEGO: SDK imported successfully");

                // Clean up existing instance if any
                if (zegoInstanceRef.current) {
                    try {
                        console.log("ZEGO: Cleaning up existing instance");
                        await zegoInstanceRef.current.destroy();
                    } catch (error) {
                        console.error('ZEGO: Error destroying previous instance:', error);
                    }
                }

                console.log("ZEGO: Generating token");
                const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
                    ZEGO_CONFIG.appID,
                    ZEGO_CONFIG.serverSecret,
                    normalizedRoomID,
                    userID,
                    userName
                );

                console.log("ZEGO: Token generated successfully");
                const zp = ZegoUIKitPrebuilt.create(kitToken);
                zegoInstanceRef.current = zp;

                if (!mounted) return;

                console.log("ZEGO: Joining room");
                await zp.joinRoom({
                    container: containerRef.current,
                    scenario: {
                        mode: ZegoUIKitPrebuilt.OneONoneCall,
                        config: {
                            turnOnMicrophoneWhenJoining: true,
                            turnOnCameraWhenJoining: true,
                            showMyMicrophoneUnmutedIndicator: true,
                            showMyCameraUnmutedIndicator: true,
                            showMyMicrophoneMutedIndicator: true,
                            showMyCameraMutedIndicator: true,
                            showAudioVideoSettingsButton: true,
                            showScreenSharingButton: true,
                            showTextChat: true,
                            showUserList: true,
                            maxUsers: 2,
                            layout: 'Grid',
                            showLayoutButton: true,
                            showNonVideoUser: true,
                            showOnlyAudioUser: true,
                            showPinButton: true,
                            showSpeaker: true,
                            showMicrophoneButton: true,
                            showCameraButton: true,
                            showEndCallButton: true,
                            showToggleMicButton: true,
                            showToggleCameraButton: true,
                            showLeaveButton: true,
                        },
                    },
                    showPreJoinView: true,
                    onJoinRoom: () => {
                        if (mounted) {
                            console.log("ZEGO: Successfully joined room");
                            setIsJoined(true);
                            setIsPreJoinView(false);
                            setError(null);
                            setPermissionError(null);
                        }
                    },
                    onLeaveRoom: () => {
                        if (mounted) {
                            console.log("ZEGO: Left room");
                            setIsJoined(false);
                            setIsPreJoinView(true);
                            stopAllTracks();
                            if (onCallEnd) onCallEnd();
                        }
                    },
                    onPreJoinViewReady: () => {
                        if (mounted) {
                            console.log("ZEGO: Pre-join view ready");
                            setIsPreJoinView(true);
                        }
                    },
                });

                console.log("ZEGO: joinRoom called successfully");
            } catch (error) {
                console.error('ZEGO: Error joining room:', error);
                if (mounted) {
                    setIsJoined(false);
                    setIsPreJoinView(true);
                    setError(`Failed to join room: ${error.message || 'Unknown error'}`);
                    stopAllTracks();
                }
            }
        };

        initializeZego();

        return () => {
            console.log("ZEGO: Running cleanup function");
            mounted = false;
            stopAllTracks();
            if (zegoInstanceRef.current) {
                try {
                    cleanupPromise = zegoInstanceRef.current.destroy();
                    if (cleanupPromise) {
                        cleanupPromise.catch((error) => {
                            console.error('ZEGO: Error during cleanup:', error);
                        });
                    }
                } catch (error) {
                    console.error('ZEGO: Error during cleanup:', error);
                }
            }
        };
    }, [roomID, userID, userName, normalizedRoomID, onCallEnd]);

    return (
        <div className="relative w-full h-full bg-gray-900">
            <div ref={containerRef} className="w-full h-full" />

            {/* Error and loading states */}
            {(!isJoined && !isPreJoinView) || permissionError ? (
                <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-gray-900/80 backdrop-blur-sm z-20">
                    <div className="bg-gray-800 p-6 rounded-lg shadow-lg max-w-md text-center">
                        {permissionError ? (
                            <div className="text-red-500 space-y-4">
                                <div className="flex items-center justify-center gap-2">
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <p className="text-xl">{permissionError}</p>
                                </div>
                                <button
                                    onClick={() => window.location.reload()}
                                    className="px-6 py-3 bg-red-600 text-white rounded-md flex items-center gap-2 mx-auto hover:bg-red-700 transition-colors"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                    Retry With Camera & Microphone Access
                                </button>
                            </div>
                        ) : error ? (
                            <div className="text-red-500 space-y-4">
                                <div className="flex items-center justify-center gap-2">
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <p className="text-xl">Error: {error}</p>
                                </div>
                                <button
                                    onClick={() => window.location.reload()}
                                    className="px-6 py-3 bg-red-600 text-white rounded-md flex items-center gap-2 mx-auto hover:bg-red-700 transition-colors"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                    Retry
                                </button>
                            </div>
                        ) : (
                            <div className="text-white space-y-4">
                                <div className="flex items-center justify-center gap-3">
                                    <svg className="w-8 h-8 animate-spin text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                    <span className="text-xl">Connecting to video call...</span>
                                </div>
                                <p className="text-gray-400">Please wait while we set up your call</p>
                            </div>
                        )}
                    </div>
                </div>
            ) : null}
        </div>
    );
}

export default ZegoVideoCall; 