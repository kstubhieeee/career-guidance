import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast, Toaster } from 'react-hot-toast';
import MentorRatingModal from '../components/MentorRatingModal';
import Footer from '../components/Footer';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3250';

const statusBadgeClasses = {
  pending: 'bg-blue-900 bg-opacity-20 text-blue-400 border-blue-500',
  accepted: 'bg-yellow-900 bg-opacity-20 text-yellow-400 border-yellow-500',
  confirmed: 'bg-green-900 bg-opacity-40 text-green-400 border-green-500 font-semibold',
  completed: 'bg-green-900 bg-opacity-20 text-green-400 border-green-500',
  cancelled: 'bg-red-900 bg-opacity-20 text-red-400 border-red-500',
  rescheduled: 'bg-purple-900 bg-opacity-20 text-purple-400 border-purple-500',
  rejected: 'bg-red-900 bg-opacity-20 text-red-400 border-red-500',
  default: 'bg-gray-900 bg-opacity-20 text-gray-400 border-gray-500'
};

const sessionTypeIcons = {
  video: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  ),
  audio: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
  ),
  chat: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  )
};

function MyBookings() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingToRate, setBookingToRate] = useState(null);
  const [mentors, setMentors] = useState({});
  const [activeTab, setActiveTab] = useState('confirmed');

  useEffect(() => {
    const handlePaymentSuccess = () => {
      if (location.state?.paymentSuccess) {
        toast.success('Payment successful! Your session is now confirmed.');

        // Set the active tab to confirmed to show the newly confirmed session
        setActiveTab('confirmed');

        if (location.state.session) {
          setBookings(prev =>
            prev.map(booking =>
              booking._id === location.state.session._id ? {
                ...location.state.session,
                isConfirmed: true,
                displayStatus: 'Confirmed'
              } : booking
            )
          );
        }

        window.history.replaceState({}, document.title);
      }
    };

    const fetchBookings = async () => {
      try {
        if (!currentUser) {
          setBookings([]);
          setLoading(false);
          return;
        }

        const [sessionsResponse, requestsResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/api/sessions`, {
            method: 'GET',
            credentials: 'include'
          }),
          fetch(`${API_BASE_URL}/api/session-requests`, {
            method: 'GET',
            credentials: 'include'
          })
        ]);

        if (!sessionsResponse.ok || !requestsResponse.ok) {
          const sessionsError = await sessionsResponse.json().catch(() => null);
          const requestsError = await requestsResponse.json().catch(() => null);
          throw new Error(
            sessionsError?.message || requestsError?.message ||
            'Failed to fetch booking data'
          );
        }

        const [sessionsData, requestsData] = await Promise.all([
          sessionsResponse.json(),
          requestsResponse.json()
        ]);

        const sessions = sessionsData.sessions || [];
        const sessionRequests = requestsData.sessionRequests || [];

        // Process bookings data
        const processedBookings = processBookings(sessions, sessionRequests);
        setBookings(processedBookings);

        // Fetch mentor details if needed
        await fetchMentorDetails(processedBookings);
      } catch (error) {
        console.error('Error fetching bookings:', error);
        toast.error(error.message || 'Failed to load your bookings');
      } finally {
        setLoading(false);
      }
    };

    handlePaymentSuccess();
    fetchBookings();
  }, [currentUser, location.state]);

  const processBookings = (sessions, sessionRequests) => {
    // Combine sessions and requests, marking their source
    const allBookings = [
      ...sessions.map(session => ({ ...session, source: 'session' })),
      ...sessionRequests.map(request => ({ ...request, source: 'request' }))
    ];

    // Sort by date, most recent first
    allBookings.sort((a, b) => {
      // Use createdAt as the fallback if sessionDate is the same or missing
      const dateA = new Date(a.sessionDate || a.createdAt);
      const dateB = new Date(b.sessionDate || b.createdAt);
      return dateB - dateA;
    });

    // Add derived fields
    return allBookings.map(booking => {
      // A session is confirmed ONLY when both:
      // 1. Status is 'accepted' or 'confirmed'
      // 2. Has a valid paymentId (not null/undefined/pending)
      const isConfirmed =
        (booking.status === 'confirmed' || booking.status === 'accepted') &&
        (booking.paymentId && booking.paymentId !== 'pending');

      // Determine proper display status
      let displayStatus;
      if (booking.displayStatus) {
        displayStatus = booking.displayStatus;
      } else if (booking.derivedStatus === 'payment_required') {
        displayStatus = 'Payment Required';
      } else if (booking.status === 'completed') {
        displayStatus = 'Completed';
      } else if (booking.status === 'cancelled') {
        displayStatus = 'Cancelled';
      } else if (booking.status === 'pending') {
        displayStatus = 'Pending Approval';
      } else if (booking.status === 'accepted' && (!booking.paymentId || booking.paymentId === 'pending')) {
        displayStatus = 'Payment Required';
      } else if (isConfirmed) {
        displayStatus = 'Confirmed';
      } else if (booking.status === 'rescheduled') {
        displayStatus = 'Rescheduled';
      } else if (booking.status === 'approved') {
        displayStatus = 'Approved';
      } else if (booking.status === 'rejected') {
        displayStatus = 'Rejected';
      } else {
        displayStatus = 'Unknown Status';
      }

      return {
        ...booking,
        isConfirmed,
        displayStatus
      };
    });
  };

  const fetchMentorDetails = async (bookings) => {
    const mentorIds = bookings
      .filter(booking => ['accepted', 'confirmed', 'pending'].includes(booking.status))
      .map(booking => booking.mentorId)
      .filter((id, index, self) => self.indexOf(id) === index);

    if (mentorIds.length === 0) return;

    const mentorDetails = {};

    try {
      await Promise.all(mentorIds.map(async (mentorId) => {
        try {
          const response = await fetch(`${API_BASE_URL}/api/mentors/${mentorId}`, {
            method: 'GET',
            credentials: 'include'
          });

          if (response.ok) {
            const data = await response.json();
            mentorDetails[mentorId] = data.mentor;
          }
        } catch (error) {
          console.error(`Failed to fetch mentor details for ID ${mentorId}:`, error);
        }
      }));

      setMentors(mentorDetails);
    } catch (error) {
      console.error('Error fetching mentor details:', error);
    }
  };

  const handleRateSession = (booking) => {
    setBookingToRate(booking);
  };

  const handleRatingSubmit = async (bookingId, rating, feedback) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/sessions/${bookingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          rating,
          feedback,
          status: 'completed'
        }),
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to update session rating');
      }

      // Refresh the bookings
      const updatedResponse = await fetch(`${API_BASE_URL}/api/sessions`, {
        method: 'GET',
        credentials: 'include'
      });

      if (!updatedResponse.ok) {
        throw new Error('Failed to refresh bookings');
      }

      const data = await updatedResponse.json();
      setBookings(data.sessions);
      setBookingToRate(null);
      toast.success('Rating submitted successfully!');
    } catch (error) {
      console.error('Error submitting rating:', error);
      toast.error('Failed to submit rating');
    }
  };

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
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes} ${ampm}`;
  };

  const getStatusBadgeClass = (status) => {
    return statusBadgeClasses[status] || statusBadgeClasses.default;
  };

  const getSessionTypeIcon = (type) => {
    return sessionTypeIcons[type] || null;
  };

  const handleReschedule = async (bookingId, newDate, newTime) => {
    if (!newDate || !newTime) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/sessions/${bookingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sessionDate: newDate,
          sessionTime: newTime,
          status: 'rescheduled'
        }),
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to reschedule session');
      }

      // Refresh the bookings
      const updatedResponse = await fetch(`${API_BASE_URL}/api/sessions`, {
        method: 'GET',
        credentials: 'include'
      });

      if (!updatedResponse.ok) {
        throw new Error('Failed to refresh bookings');
      }

      const data = await updatedResponse.json();
      setBookings(data.sessions);
      toast.success('Session rescheduled successfully!');
    } catch (error) {
      console.error('Error rescheduling session:', error);
      toast.error('Failed to reschedule session');
    }
  };

  const handlePayment = (booking) => {
    navigate('/session-payment', {
      state: {
        session: {
          ...booking,
          price: mentors[booking.mentorId]?.price || booking.price
        }
      }
    });
  };

  const getMentorInfo = (booking) => {
    if (!['accepted', 'confirmed', 'pending'].includes(booking.status) || !mentors[booking.mentorId]) {
      return null;
    }

    const mentor = mentors[booking.mentorId];
    return (
      <div className="bg-darkblue p-4 rounded-lg mb-4">
        <h3 className="text-white font-medium mb-2">Mentor Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-gray-400">Full Name:</span>
            <span className="text-white ml-2">{mentor.firstName} {mentor.lastName}</span>
          </div>
          <div>
            <span className="text-gray-400">Qualification:</span>
            <span className="text-white ml-2">{mentor.qualification}</span>
          </div>
          <div>
            <span className="text-gray-400">Experience:</span>
            <span className="text-white ml-2">{mentor.experience} years</span>
          </div>
          <div>
            <span className="text-gray-400">Session Fee:</span>
            <span className="text-white ml-2 font-bold">₹{mentor.price}</span>
          </div>
          {mentor.rating > 0 && (
            <div>
              <span className="text-gray-400">Rating:</span>
              <span className="text-yellow-400 ml-2">
                {Array.from({ length: 5 }).map((_, index) => (
                  <span key={index} className={index < mentor.rating ? 'text-yellow-400' : 'text-gray-600'}>★</span>
                ))}
                <span className="text-white ml-1">({mentor.rating}/5)</span>
              </span>
            </div>
          )}
        </div>
      </div>
    );
  };

  const isSessionConfirmed = (booking) => {
    return booking.isConfirmed === true;
  };

  const filteredBookings = bookings.filter(booking => {
    if (activeTab === 'all') return true;
    if (activeTab === 'confirmed') return booking.isConfirmed;
    if (activeTab === 'pending') return booking.status === 'pending';
    if (activeTab === 'accepted') return booking.status === 'accepted' && !booking.isConfirmed;
    if (activeTab === 'rejected') return booking.status === 'rejected';
    return true;
  });

  return (
    <>
      <div className="min-h-screen bg-darkblue py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-white mb-2">My Mentor Sessions</h1>
            <p className="text-gray-300 mb-8">View and manage your mentorship sessions</p>

            {loading ? (
              <div className="bg-darkblue-light rounded-xl border border-gray-700 p-8 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mb-4"></div>
                <p className="text-white">Loading your sessions...</p>
              </div>
            ) : bookings.length === 0 ? (
              <div className="bg-darkblue-light rounded-xl border border-gray-700 p-8 text-center">
                <div className="mx-auto w-16 h-16 mb-4 text-gray-500">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 14v6m-3-3h6M6 10h2a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2zm10 0h2a2 2 0 002-2V6a2 2 0 00-2-2h-2a2 2 0 00-2 2v2a2 2 0 002 2zM6 20h2a2 2 0 002-2v-2a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2z" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-white mb-2">No sessions booked yet</h2>
                <p className="text-gray-400 mb-6">Connect with experienced mentors to start your learning journey</p>
                <Link to="/find-mentors" className="inline-block bg-primary hover:bg-primary-dark text-white py-2 px-6 rounded-lg transition-colors">
                  Find Mentors
                </Link>
              </div>
            ) : (
              <>
                {/* Tabs */}
                <div className="flex border-b border-gray-700 mb-6 overflow-x-auto">
                  {['all', 'confirmed', 'accepted', 'pending', 'rejected'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${activeTab === tab
                        ? 'text-primary border-b-2 border-primary'
                        : 'text-gray-400 hover:text-white'
                        }`}
                    >
                      {tab === 'all'
                        ? 'All Sessions'
                        : tab === 'confirmed'
                          ? 'Confirmed'
                          : tab.charAt(0).toUpperCase() + tab.slice(1)
                      }
                    </button>
                  ))}
                </div>

                <div className="space-y-6">
                  {filteredBookings.map((booking) => (
                    <div key={booking._id || booking.paymentId} className={`bg-darkblue-light rounded-xl border ${isSessionConfirmed(booking)
                      ? 'border-green-500 bg-green-900 bg-opacity-10'
                      : 'border-gray-700'
                      } overflow-hidden`}>
                      <div className="p-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                          <h2 className="text-xl font-semibold text-white mb-2 md:mb-0">
                            Session with {booking.mentorName}
                          </h2>
                          <div className={`px-3 py-1 rounded-full text-xs font-medium inline-flex items-center border ${isSessionConfirmed(booking)
                            ? statusBadgeClasses.confirmed
                            : booking.derivedStatus === 'payment_required'
                              ? 'bg-yellow-500 bg-opacity-20 text-yellow-400 border-yellow-500'
                              : getStatusBadgeClass(booking.status)
                            }`}>
                            {isSessionConfirmed(booking) && (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                            {booking.displayStatus}
                          </div>
                        </div>

                        {/* Show different messages based on session status */}
                        {isSessionConfirmed(booking) && (
                          <div className="mt-4 mb-2 text-center">
                            <p className="text-green-400 text-sm">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline-block mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              This session is confirmed and ready to attend
                            </p>
                          </div>
                        )}

                        {booking.status === 'accepted' && !isSessionConfirmed(booking) && (
                          <div className="mt-4 mb-2 text-center">
                            <p className="text-yellow-400 text-sm">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline-block mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              Payment required to confirm this session
                            </p>
                          </div>
                        )}

                        {getMentorInfo(booking)}

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                          <div>
                            <div className="text-gray-400 text-sm mb-1">Date</div>
                            <div className="text-white font-medium">{formatSessionDate(booking.sessionDate)}</div>
                          </div>
                          <div>
                            <div className="text-gray-400 text-sm mb-1">Time</div>
                            <div className="text-white font-medium">{formatSessionTime(booking.sessionTime)}</div>
                          </div>
                          <div>
                            <div className="text-gray-400 text-sm mb-1">Session Type</div>
                            <div className="text-white font-medium flex items-center">
                              <span className="mr-2 text-primary">{getSessionTypeIcon(booking.sessionType)}</span>
                              <span className="capitalize">{booking.sessionType}</span>
                            </div>
                          </div>
                        </div>

                        {booking.notes && (
                          <div className="bg-darkblue p-4 rounded-lg mb-6">
                            <div className="text-gray-400 text-sm mb-1">Notes</div>
                            <div className="text-white">{booking.notes}</div>
                          </div>
                        )}

                        {/* Only show payment details section for confirmed sessions */}
                        {isSessionConfirmed(booking) && booking.paymentId && booking.paymentId !== 'pending' && (
                          <div className="bg-darkblue p-4 rounded-lg mb-6 border border-green-800 border-opacity-30">
                            <h4 className="text-white text-sm font-semibold mb-3 flex items-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              Payment Details
                            </h4>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-gray-400">Transaction ID:</span>
                                <span className="text-white text-sm truncate max-w-[200px]" title={booking.paymentId}>
                                  {booking.paymentId}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-400">Amount Paid:</span>
                                <span className="text-white font-semibold">
                                  ₹{booking.price || (mentors[booking.mentorId]?.price || 0)}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-400">Payment Method:</span>
                                <span className="text-white">Razorpay</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-400">Status:</span>
                                <span className="text-green-400">Paid</span>
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center pt-4 border-t border-gray-700">
                          <div>
                            <div className="text-gray-400 text-sm mb-1">Amount</div>
                            <div className="flex items-center">
                              <span className="text-white font-bold text-xl">
                                {(booking.status === 'accepted' || booking.status === 'pending') && mentors[booking.mentorId]
                                  ? `₹${mentors[booking.mentorId].price}`
                                  : `₹${booking.price || 0}`}
                              </span>
                              {isSessionConfirmed(booking) && (
                                <span className="ml-2 px-2 py-1 bg-green-500 bg-opacity-20 text-green-400 text-xs rounded-md border border-green-500">
                                  Paid
                                </span>
                              )}
                              {booking.status === 'accepted' && !isSessionConfirmed(booking) && (
                                <span className="ml-2 px-2 py-1 bg-yellow-500 bg-opacity-20 text-yellow-400 text-xs rounded-md border border-yellow-500">
                                  Payment Required
                                </span>
                              )}
                              {booking.status === 'pending' && (
                                <span className="ml-2 px-2 py-1 bg-blue-500 bg-opacity-20 text-blue-400 text-xs rounded-md border border-blue-500">
                                  Approval Pending
                                </span>
                              )}
                              {booking.status === 'approved' && (
                                <span className="ml-2 px-2 py-1 bg-green-500 bg-opacity-20 text-green-400 text-xs rounded-md border border-green-500">
                                  Approved by Mentor
                                </span>
                              )}
                              {booking.status === 'rejected' && (
                                <span className="ml-2 px-2 py-1 bg-red-500 bg-opacity-20 text-red-400 text-xs rounded-md border border-red-500">
                                  Rejected by Mentor
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="mt-4 md:mt-0 flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2">
                            {/* Payment required - show Pay Now button */}
                            {booking.status === 'accepted' && !isSessionConfirmed(booking) && (
                              <button
                                onClick={() => handlePayment(booking)}
                                className="inline-block bg-primary hover:bg-primary-dark text-white py-2 px-4 rounded-lg transition-colors text-center"
                              >
                                Pay Now
                              </button>
                            )}

                            {/* Confirmed session - show Join Session button */}
                            {isSessionConfirmed(booking) && (
                              <a
                                href="#"
                                className="inline-block bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors text-center font-medium"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline-block mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                                Join Session
                              </a>
                            )}

                            {/* Reschedule button - only for confirmed/paid sessions */}
                            {isSessionConfirmed(booking) && (
                              <button
                                onClick={() => {
                                  const newDate = prompt('Enter new date (YYYY-MM-DD)');
                                  const newTime = prompt('Enter new time (HH:MM)');
                                  if (newDate && newTime) {
                                    handleReschedule(booking._id, newDate, newTime);
                                  }
                                }}
                                className="inline-block bg-darkblue hover:bg-darkblue-dark text-white py-2 px-4 rounded-lg border border-gray-600 transition-colors text-center"
                              >
                                Reschedule
                              </button>
                            )}

                            {/* Rate session button - show for confirmed/completed sessions without rating */}
                            {isSessionConfirmed(booking) && !booking.rating && (
                              <button
                                onClick={() => handleRateSession(booking)}
                                className="inline-block bg-darkblue hover:bg-darkblue-dark text-white py-2 px-4 rounded-lg border border-gray-600 transition-colors"
                              >
                                Rate Session
                              </button>
                            )}

                            {/* Special status indicators */}
                            {booking.status === 'approved' && (
                              <div className="inline-flex items-center bg-green-500 bg-opacity-20 text-green-400 py-2 px-4 rounded-lg border border-green-500">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Approved by Mentor
                              </div>
                            )}

                            {booking.status === 'rejected' && (
                              <div className="inline-flex items-center bg-red-500 bg-opacity-20 text-red-400 py-2 px-4 rounded-lg border border-red-500">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                Rejected by Mentor
                              </div>
                            )}

                            {booking.rating && (
                              <div className="flex items-center bg-darkblue py-2 px-4 rounded-lg border border-gray-600">
                                <div className="text-yellow-400 flex">
                                  {Array.from({ length: 5 }).map((_, index) => (
                                    <span key={index} className={index < booking.rating ? 'text-yellow-400' : 'text-gray-600'}>★</span>
                                  ))}
                                </div>
                                <span className="ml-2 text-gray-300">Your Rating</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {bookingToRate && (
        <MentorRatingModal
          booking={bookingToRate}
          onClose={() => setBookingToRate(null)}
          onSubmit={(rating, feedback) => handleRatingSubmit(bookingToRate._id, rating, feedback)}
        />
      )}

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
    </>
  );
}

export default MyBookings;