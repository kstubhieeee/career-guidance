import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import Footer from '../components/Footer';

// Define API base URL constant
const API_BASE_URL = 'http://localhost:3250';

function RateSession() {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [rating, setRating] = useState(0);
    const [feedback, setFeedback] = useState('');
    const [loading, setLoading] = useState(false);
    const [sessionDetails, setSessionDetails] = useState(null);

    // Get session ID from location state or query params
    const sessionId = location.state?.sessionId || new URLSearchParams(location.search).get('sessionId');
    const fromVideoCall = location.state?.fromVideoCall || false;

    useEffect(() => {
        // Debug session ID
        console.log("RateSession - Session ID:", sessionId);
        console.log("RateSession - Location state:", location.state);

        // If no session ID, redirect to bookings
        if (!sessionId) {
            toast.error("No session ID provided for rating");
            navigate('/my-bookings');
            return;
        }

        // Load session details if not coming directly from video call
        if (!fromVideoCall) {
            fetchSessionDetails();
        }
    }, [sessionId, navigate, fromVideoCall]);

    const fetchSessionDetails = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_BASE_URL}/api/sessions/${sessionId}`, {
                method: 'GET',
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error('Failed to fetch session details');
            }

            const data = await response.json();
            setSessionDetails(data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching session details:", error);
            toast.error("Could not load session details");
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (rating === 0) {
            toast.warning("Please select a rating before submitting");
            return;
        }

        try {
            setLoading(true);
            console.log("Submitting rating for session:", sessionId);

            // Use userId from location state if available (from video call)
            const userIdToUse = location.state?.userId || currentUser._id;
            console.log("Using user ID for rating:", userIdToUse);

            // Use sessionRequestId if available
            const sessionRequestId = location.state?.sessionRequestId || null;
            console.log("Session request ID for rating:", sessionRequestId);

            // Try to submit the rating
            let response = await fetch(`${API_BASE_URL}/api/sessions/${sessionId}/rating`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    rating,
                    feedback,
                    userId: userIdToUse,
                    sessionRequestId: sessionRequestId // Include sessionRequestId in the request
                }),
                credentials: 'include'
            });

            console.log("Rating submission response status:", response.status);

            // If we get a 404 (not found) and we have a roomID from video call, try that as a fallback
            if (response.status === 404 && location.state?.roomID && location.state?.roomID !== sessionId) {
                console.log("Session not found with ID, trying with roomID fallback:", location.state.roomID);

                response = await fetch(`${API_BASE_URL}/api/sessions/${location.state.roomID}/rating`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        rating,
                        feedback,
                        userId: userIdToUse,
                        sessionRequestId: sessionRequestId // Include sessionRequestId in the request
                    }),
                    credentials: 'include'
                });

                console.log("Fallback rating submission response status:", response.status);
            }

            if (!response.ok) {
                const errorData = await response.json().catch(e => {
                    console.error("Error parsing error response:", e);
                    return { message: "Failed to parse error response" };
                });
                console.error("Error data from server:", errorData);
                throw new Error(errorData.message || 'Failed to submit rating');
            }

            toast.success("Thank you for your feedback!");

            // Navigate back to bookings page
            navigate('/my-bookings');
        } catch (error) {
            console.error("Error submitting rating:", error);
            toast.error("Failed to submit rating. Please try again.");
            setLoading(false);
        }
    };

    const renderStars = () => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <button
                    key={i}
                    type="button"
                    onClick={() => setRating(i)}
                    className={`text-3xl transition-colors ${i <= rating ? 'text-yellow-400' : 'text-gray-400 hover:text-yellow-200'
                        }`}
                    aria-label={`Rate ${i} stars`}
                >
                    ★
                </button>
            );
        }
        return stars;
    };

    // Handle user not being logged in
    if (!currentUser) {
        return null; // Will redirect in useEffect
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-darkblue to-gray-900 pt-24">
            <div className="container mx-auto px-4">
                <div className="max-w-2xl mx-auto">
                    <h1 className="text-3xl font-bold text-white mb-8 text-center">Rate Your Session</h1>

                    <div className="bg-secondary-light backdrop-blur-sm border border-gray-700 rounded-lg shadow-xl">
                        <div className="p-6 border-b border-gray-700">
                            <h2 className="text-2xl font-bold text-center text-white flex items-center justify-center gap-2">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                </svg>
                                <span>Your Feedback Matters</span>
                            </h2>
                        </div>

                        <div className="p-6">
                            {fromVideoCall && (
                                <div className="mb-6 p-4 bg-blue-900/20 rounded-lg border border-blue-800">
                                    <p className="text-blue-300">
                                        Thank you for participating in the video call! Please rate your experience with the mentor.
                                        Your feedback helps us improve our platform and helps mentors enhance their guidance.
                                    </p>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-4">
                                    <label className="text-lg font-medium text-white block text-center">
                                        How would you rate this session?
                                    </label>
                                    <div className="flex justify-center gap-2">
                                        {renderStars()}
                                    </div>
                                    {rating > 0 && (
                                        <p className="text-center text-gray-300">
                                            {rating === 1 && "Poor"}
                                            {rating === 2 && "Fair"}
                                            {rating === 3 && "Good"}
                                            {rating === 4 && "Very Good"}
                                            {rating === 5 && "Excellent"}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-200">Additional Feedback (Optional)</label>
                                    <textarea
                                        value={feedback}
                                        onChange={(e) => setFeedback(e.target.value)}
                                        placeholder="Share details about your experience..."
                                        className="w-full bg-gray-700/50 border border-gray-600 text-white placeholder:text-gray-400 p-3 rounded-md min-h-[120px]"
                                    />
                                </div>

                                <div className="pt-4">
                                    <button
                                        type="submit"
                                        disabled={loading || rating === 0}
                                        className={`w-full rounded-md py-3 px-4 text-white font-medium flex items-center justify-center ${loading ? 'bg-gray-600' : rating === 0 ? 'bg-gray-700 cursor-not-allowed' : 'bg-primary hover:bg-primary-dark'
                                            }`}
                                    >
                                        {loading ? (
                                            <>
                                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Submitting...
                                            </>
                                        ) : (
                                            'Submit Rating'
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}

export default RateSession; 