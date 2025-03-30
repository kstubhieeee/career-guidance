import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast, Toaster } from 'react-hot-toast';
import Footer from '../components/Footer';

const API_BASE_URL = 'http://localhost:3250';

function SessionPayment() {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [mentor, setMentor] = useState(null);
    const [agreementChecked, setAgreementChecked] = useState(false);
    const [razorpayKeyId] = useState(import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_ilZnoyJIDqrWYR');
    const [scriptLoaded, setScriptLoaded] = useState(false);
    const scriptRef = useRef(null);

    // Get session data from location state or fetch from API
    useEffect(() => {
        const fetchSessionData = async () => {
            try {
                setLoading(true);

                // Check if we have the session data in the location state
                if (location.state?.session) {
                    setSession(location.state.session);

                    // Fetch mentor details
                    if (location.state.session.mentorId) {
                        await fetchMentorDetails(location.state.session.mentorId);
                    }

                    setLoading(false);
                    return;
                }

                // If no session data in state, get the session ID from URL parameters
                const searchParams = new URLSearchParams(location.search);
                const sessionId = searchParams.get('sessionId');

                if (!sessionId) {
                    setErrorMessage('No session specified for payment.');
                    setLoading(false);
                    return;
                }

                // Fetch the session data from API
                const response = await fetch(`${API_BASE_URL}/api/sessions/${sessionId}`, {
                    method: 'GET',
                    credentials: 'include'
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch session details');
                }

                const data = await response.json();
                setSession(data.session);

                // Fetch mentor details if mentorId exists
                if (data.session.mentorId) {
                    await fetchMentorDetails(data.session.mentorId);
                }
            } catch (error) {
                console.error('Error fetching session data:', error);
                setErrorMessage(error.message || 'Failed to load session details');
                toast.error('Failed to load session details');
            } finally {
                setLoading(false);
            }
        };

        // Function to fetch mentor details
        const fetchMentorDetails = async (mentorId) => {
            try {
                const mentorResponse = await fetch(`${API_BASE_URL}/api/mentors/${mentorId}`, {
                    method: 'GET',
                    credentials: 'include'
                });

                if (mentorResponse.ok) {
                    const mentorData = await mentorResponse.json();
                    setMentor(mentorData.mentor);
                } else {
                    console.error('Failed to fetch mentor details');
                }
            } catch (error) {
                console.error('Error fetching mentor details:', error);
            }
        };

        fetchSessionData();
    }, [location]);

    // Fix Razorpay script loading with better error handling
    useEffect(() => {
        const loadRazorpayScript = () => {
            // Check if Razorpay is already loaded
            if (window.Razorpay) {
                console.log('Razorpay already available');
                setScriptLoaded(true);
                return;
            }

            // Don't try to load script again if we already have a reference
            if (scriptRef.current) {
                return;
            }

            console.log('Loading Razorpay script...');
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.async = true;

            script.onload = () => {
                console.log('Razorpay script loaded successfully');
                setScriptLoaded(true);
            };

            script.onerror = () => {
                console.error('Failed to load Razorpay script');
                setErrorMessage('Failed to load payment gateway. Please try again later.');
                // Remove the script reference so we can try again
                scriptRef.current = null;
            };

            document.body.appendChild(script);
            scriptRef.current = script;
        };

        loadRazorpayScript();

        // Cleanup function
        return () => {
            if (scriptRef.current && document.body.contains(scriptRef.current)) {
                document.body.removeChild(scriptRef.current);
            }
        };
    }, []);

    const formatSessionDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString(undefined, {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatSessionTime = (timeString) => {
        // Convert 24-hour format to 12-hour format
        const [hours, minutes] = timeString.split(':');
        const hour = parseInt(hours, 10);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const formattedHour = hour % 12 || 12;
        return `${formattedHour}:${minutes} ${ampm}`;
    };

    // Fix handlePayment function to properly handle errors
    const handlePayment = async () => {
        if (!agreementChecked) {
            toast.error('Please agree to the terms and conditions before proceeding.');
            return;
        }

        // Check if script is loaded and razorpay is available
        if (!window.Razorpay) {
            // Try to load the script again
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.async = true;
            document.body.appendChild(script);

            toast.error('Payment gateway is not loaded yet. Please try again in a moment.');
            return;
        }

        setProcessing(true);
        setErrorMessage('');

        try {
            if (!session) {
                throw new Error('Session details not available. Please try again.');
            }

            const sessionPrice = session.price || (mentor ? mentor.price : 0);

            if (!sessionPrice || sessionPrice <= 0) {
                throw new Error('Invalid session price. Please contact support.');
            }

            // Add proper error handling for the logo image
            const logoUrl = '/images/razorpay-logo.svg';
            console.log('Using logo URL:', logoUrl);

            // Initialize Razorpay payment
            const options = {
                key: razorpayKeyId,
                amount: Math.round(sessionPrice * 100), // Convert to paise (smallest Indian currency unit)
                currency: "INR",
                name: "Career Guidant",
                description: `Session with ${session.mentorName}`,
                image: logoUrl,
                handler: async function (response) {
                    try {
                        console.log('Payment successful, updating session:', {
                            sessionId: session._id,
                            paymentId: response.razorpay_payment_id
                        });

                        // Update session with payment ID
                        const apiResponse = await fetch(`${API_BASE_URL}/api/sessions/${session._id}/payment`, {
                            method: 'PUT',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                paymentId: response.razorpay_payment_id
                            }),
                            credentials: 'include'
                        });

                        if (!apiResponse.ok) {
                            const errorData = await apiResponse.json().catch(() => ({}));
                            throw new Error(errorData.message || 'Failed to update session with payment');
                        }

                        const apiData = await apiResponse.json();
                        console.log('Session updated successfully:', apiData);
                        toast.success('Payment successful! Session confirmed.');

                        // Navigate to My Bookings page after successful payment
                        setTimeout(() => {
                            navigate('/my-bookings', {
                                state: { paymentSuccess: true, session: apiData.session }
                            });
                        }, 1500);
                    } catch (error) {
                        console.error('Error updating session after payment:', error);
                        setErrorMessage(error.message || 'Payment successful but failed to update session. Please contact support.');
                        // Even if we have an error, we should navigate back to bookings since the payment was successful
                        setTimeout(() => {
                            navigate('/my-bookings', {
                                state: { paymentSuccess: true }
                            });
                        }, 3000);
                        setProcessing(false);
                    }
                },
                prefill: {
                    name: currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : '',
                    email: currentUser ? currentUser.email : ''
                },
                theme: {
                    color: "#4F46E5"
                },
                modal: {
                    ondismiss: function () {
                        setProcessing(false);
                    }
                }
            };

            console.log("Creating Razorpay instance with options:", options);
            const razorpayInstance = new window.Razorpay(options);
            console.log("Razorpay instance created successfully");
            razorpayInstance.open();

            razorpayInstance.on('payment.failed', function (response) {
                console.error('Payment failed:', response.error);
                setErrorMessage('Payment failed. Please try again or contact support.');
                setProcessing(false);
            });
        } catch (error) {
            console.error('Error initiating payment:', error);
            setErrorMessage(error.message || 'Error initiating payment. Please try again.');
            toast.error(error.message || 'Error initiating payment. Please contact support.');
            setProcessing(false);
        }
    };

    const handleCancel = () => {
        navigate('/my-bookings');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-darkblue py-12 flex justify-center items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!session) {
        return (
            <div className="min-h-screen bg-darkblue py-12">
                <div className="container mx-auto px-4">
                    <div className="max-w-2xl mx-auto bg-darkblue-light rounded-xl border border-gray-700 p-8">
                        <div className="text-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-red-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <h2 className="text-2xl font-bold text-white mb-4">Session Not Found</h2>
                            <p className="text-gray-300 mb-6">{errorMessage || 'The session you are trying to pay for could not be found.'}</p>
                            <button
                                onClick={() => navigate('/my-bookings')}
                                className="bg-primary hover:bg-primary-dark text-white py-2 px-6 rounded-lg transition-colors"
                            >
                                Go Back to My Bookings
                            </button>
                        </div>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-darkblue py-12">
            <div className="container mx-auto px-4">
                <div className="max-w-2xl mx-auto">
                    <h1 className="text-3xl font-bold text-white mb-8 text-center">Complete Your Payment</h1>

                    <div className="bg-darkblue-light border border-gray-700 rounded-xl overflow-hidden mb-8">
                        <div className="p-6">
                            <div className="mb-6">
                                <h2 className="text-xl font-semibold text-white mb-4">Session Details</h2>
                                <div className="bg-darkblue p-4 rounded-lg mb-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <div className="text-gray-400 text-sm mb-1">Mentor</div>
                                            <div className="text-white font-medium">{session.mentorName}</div>
                                        </div>
                                        <div>
                                            <div className="text-gray-400 text-sm mb-1">Session Type</div>
                                            <div className="text-white font-medium capitalize">{session.sessionType}</div>
                                        </div>
                                        <div>
                                            <div className="text-gray-400 text-sm mb-1">Date</div>
                                            <div className="text-white font-medium">{formatSessionDate(session.sessionDate)}</div>
                                        </div>
                                        <div>
                                            <div className="text-gray-400 text-sm mb-1">Time</div>
                                            <div className="text-white font-medium">{formatSessionTime(session.sessionTime)}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mb-6">
                                <h2 className="text-xl font-semibold text-white mb-4">Payment Summary</h2>
                                <div className="bg-darkblue p-4 rounded-lg">
                                    <div className="flex justify-between mb-2">
                                        <span className="text-gray-300">Session Fee</span>
                                        <span className="text-white font-medium">₹{session.price || (mentor ? mentor.price : 0)}</span>
                                    </div>
                                    <div className="flex justify-between font-semibold border-t border-gray-700 pt-2 mt-2">
                                        <span className="text-gray-300">Total Amount</span>
                                        <span className="text-primary text-xl">₹{session.price || (mentor ? mentor.price : 0)}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="mb-6">
                                <h2 className="text-xl font-semibold text-white mb-4">Payment Method</h2>
                                <div className="bg-darkblue p-4 rounded-lg flex items-center justify-center">
                                    <img
                                        src="/images/razorpay-logo.svg"
                                        alt="Razorpay"
                                        className="h-8"
                                        style={{ maxWidth: '200px' }}
                                    />
                                </div>
                            </div>

                            <div className="flex items-start mb-6">
                                <input
                                    type="checkbox"
                                    id="agreement"
                                    checked={agreementChecked}
                                    onChange={(e) => setAgreementChecked(e.target.checked)}
                                    className="mt-1 mr-3"
                                />
                                <label htmlFor="agreement" className="text-gray-300 text-sm">
                                    I agree to the <a href="#" className="text-primary hover:underline">Terms & Conditions</a> and understand that this payment is secure and processed via Razorpay. The session will be confirmed after successful payment.
                                </label>
                            </div>

                            {errorMessage && (
                                <div className="bg-red-900 bg-opacity-20 border border-red-500 text-red-400 p-4 rounded-lg mb-6">
                                    {errorMessage}
                                </div>
                            )}

                            {!scriptLoaded && (
                                <div className="bg-yellow-900 bg-opacity-20 border border-yellow-500 text-yellow-400 p-4 rounded-lg mb-6">
                                    Loading payment gateway... Please wait.
                                </div>
                            )}

                            <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-3">
                                <button
                                    onClick={handlePayment}
                                    disabled={processing || !scriptLoaded}
                                    className="flex-1 bg-primary hover:bg-primary-dark disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-3 rounded-lg font-semibold transition-colors flex items-center justify-center"
                                >
                                    {processing ? (
                                        <>
                                            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-3"></div>
                                            Processing...
                                        </>
                                    ) : (
                                        `Pay Now - ₹${session.price || (mentor ? mentor.price : 0)}`
                                    )}
                                </button>
                                <button
                                    onClick={handleCancel}
                                    disabled={processing}
                                    className="flex-1 bg-transparent border border-gray-600 hover:border-gray-400 text-white py-3 rounded-lg font-semibold transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="text-center text-gray-400 text-xs mb-8">
                        <p>Your payment is secure and encrypted. We do not store your card details.</p>
                        <p className="mt-2">If you have any issues with payment, please contact our support team.</p>
                    </div>
                </div>
            </div>
            <Toaster
                position="top-center"
                toastOptions={{
                    style: {
                        background: '#333',
                        color: '#fff',
                        borderRadius: '8px'
                    },
                }}
            />
            <Footer />
        </div>
    );
}

export default SessionPayment; 