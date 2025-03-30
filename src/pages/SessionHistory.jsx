import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast, Toaster } from 'react-hot-toast';
import Footer from '../components/Footer';

function SessionHistory() {
  const { currentUser } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const navigate = useNavigate();

  // New state for rescheduling
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');

  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      try {
        if (!currentUser) {
          setBookings([]);
          setLoading(false);
          return;
        }

        // Fetch bookings from the API
        const response = await fetch('http://localhost:3250/api/sessions', {
          method: 'GET',
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error('Failed to fetch session history');
        }

        const data = await response.json();
        setBookings(data.sessions);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching bookings:', error);
        toast.error('Failed to load your session history');
        setLoading(false);
      }
    };

    fetchBookings();
  }, [currentUser]);

  const handleReschedule = (booking) => {
    setSelectedBooking(booking);
    // Set initial values for the form
    setNewDate('');
    setNewTime('');
    setShowRescheduleModal(true);
  };

  const submitReschedule = async () => {
    if (!newDate || !newTime) {
      toast.error('Please select both date and time');
      return;
    }

    try {
      // Update the booking via API
      const response = await fetch(`http://localhost:3250/api/sessions/${selectedBooking._id}`, {
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
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to reschedule session');
      }

      // Refresh the bookings list
      const bookingsResponse = await fetch('http://localhost:3250/api/sessions', {
        method: 'GET',
        credentials: 'include'
      });

      if (!bookingsResponse.ok) {
        throw new Error('Failed to refresh sessions');
      }

      const bookingsData = await bookingsResponse.json();
      setBookings(bookingsData.sessions);

      // Close modal and show success message
      setShowRescheduleModal(false);
      toast.success('Session rescheduled successfully');
    } catch (error) {
      console.error('Error rescheduling session:', error);
      toast.error('Failed to reschedule session: ' + error.message);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    // Convert 24-hour format to 12-hour format
    const [hours, minutes] = timeString.split(':');
    const hourInt = parseInt(hours, 10);
    const period = hourInt >= 12 ? 'PM' : 'AM';
    const hour12 = hourInt % 12 || 12;
    return `${hour12}:${minutes} ${period}`;
  };

  const getSessionTypeIcon = (type) => {
    switch (type) {
      case 'video':
        return (
          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Video
          </span>
        );
      case 'audio':
        return (
          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            Audio
          </span>
        );
      case 'chat':
        return (
          <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            Chat
          </span>
        );
      default:
        return null;
    }
  };

  const getStatusBadge = (status, paymentId) => {
    // First check payment status
    if (paymentId && paymentId !== 'pending') {
      if (status === 'confirmed') {
        return <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Confirmed
        </span>;
      }
      if (status === 'completed') {
        return <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">Completed</span>;
      }
    }

    // Then check session status
    switch (status) {
      case 'confirmed':
        return <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">Confirmed</span>;
      case 'accepted':
        return paymentId && paymentId !== 'pending'
          ? <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">Confirmed</span>
          : <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">Payment Required</span>;
      case 'rescheduled':
        return <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">Rescheduled</span>;
      case 'completed':
        return <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">Completed</span>;
      case 'cancelled':
        return <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs">Cancelled</span>;
      default:
        return <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs">Pending</span>;
    }
  };

  return (
    <div className="bg-darkblue min-h-screen pt-24 pb-12">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-white mb-8 text-center">Session History</h1>

        {loading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : bookings.length === 0 ? (
          <div className="bg-secondary-light rounded-lg shadow-xl p-8 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-2xl font-bold text-white mb-2">No sessions found</h2>
            <p className="text-gray-300 mb-6">You haven't booked any mentorship sessions yet</p>
            <Link to="/find-mentors" className="bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-lg inline-block transition-colors font-semibold">
              Find a Mentor
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {bookings.map((booking) => (
              <div key={booking._id} className="bg-secondary-light rounded-lg shadow-xl overflow-hidden">
                <div className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                    <div className="flex items-center mb-4 md:mb-0">
                      <h2 className="text-xl font-bold text-white mr-3">Session with {booking.mentorName}</h2>
                      {getStatusBadge(booking.status, booking.paymentId)}
                    </div>
                    <div className="text-gray-300 text-sm">
                      Booked on {formatDate(booking.createdAt)}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="bg-secondary-dark rounded-lg p-4">
                      <h3 className="text-white text-sm font-semibold mb-3">Session Details</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Date:</span>
                          <span className="text-white">{formatDate(booking.sessionDate)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Time:</span>
                          <span className="text-white">{formatTime(booking.sessionTime)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Session Type:</span>
                          <span>{getSessionTypeIcon(booking.sessionType)}</span>
                        </div>
                        {booking.notes && (
                          <div className="pt-2">
                            <span className="text-gray-400 block mb-1">Notes:</span>
                            <p className="text-white text-sm bg-secondary p-2 rounded">{booking.notes}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="bg-secondary-dark rounded-lg p-4">
                      <h3 className="text-white text-sm font-semibold mb-3">Payment Details</h3>

                      {booking.paymentId && booking.paymentId !== 'pending' ? (
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Transaction ID:</span>
                            <span className="text-white text-sm truncate max-w-[200px]" title={booking.paymentId}>
                              {booking.paymentId}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Amount Paid:</span>
                            <span className="text-white font-semibold">₹{booking.price}</span>
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
                      ) : (
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Amount:</span>
                            <span className="text-white font-semibold">₹{booking.price}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Status:</span>
                            <span className="text-yellow-400">
                              {booking.status === 'accepted' ? 'Payment Required' : 'Pending'}
                            </span>
                          </div>
                          {booking.status === 'accepted' && (
                            <div className="mt-2 pt-2 border-t border-gray-700">
                              <button
                                onClick={() => navigate(`/session-payment?sessionId=${booking._id}`)}
                                className="w-full bg-primary hover:bg-primary-dark text-white py-1 px-3 rounded text-sm transition-colors"
                              >
                                Pay Now
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2 border-t border-gray-700">
                    {/* Show Join Session button only for paid/confirmed sessions that aren't completed or cancelled */}
                    {booking.paymentId && booking.paymentId !== 'pending' &&
                      booking.status !== 'completed' && booking.status !== 'cancelled' && (
                        <button
                          className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center"
                          onClick={() => {/* Join session logic */ }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          Join Session
                        </button>
                      )}

                    {/* Only show Pay button for accepted sessions without payment */}
                    {booking.status === 'accepted' && (!booking.paymentId || booking.paymentId === 'pending') && (
                      <button
                        className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center"
                        onClick={() => navigate(`/session-payment?sessionId=${booking._id}`)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                        Make Payment
                      </button>
                    )}

                    {/* Only show Reschedule button for confirmed/paid sessions */}
                    {booking.paymentId && booking.paymentId !== 'pending' &&
                      booking.status !== 'completed' && booking.status !== 'cancelled' && (
                        <button
                          className="bg-secondary hover:bg-secondary-dark text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center"
                          onClick={() => handleReschedule(booking)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          Reschedule
                        </button>
                      )}

                    {/* Show rate session button for completed sessions */}
                    {booking.status === 'completed' && !booking.rating && (
                      <button
                        className="bg-secondary hover:bg-secondary-dark text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center"
                        onClick={() => {/* Rating logic */ }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                        Rate Session
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reschedule Modal */}
      {showRescheduleModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-secondary-light rounded-lg shadow-xl max-w-md w-full p-6 animate-fadeIn">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">Reschedule Session</h3>
              <button
                onClick={() => setShowRescheduleModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mb-4">
              <p className="text-gray-300 mb-4">Current session with {selectedBooking.mentorName} is scheduled for {formatDate(selectedBooking.sessionDate)} at {formatTime(selectedBooking.sessionTime)}.</p>

              <div className="grid grid-cols-1 gap-4 mb-4">
                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    New Date
                  </label>
                  <input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full p-3 rounded-lg bg-darkblue border border-gray-600 text-white focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 focus:outline-none"
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>

                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    New Time
                  </label>
                  <select
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full p-3 rounded-lg bg-darkblue border border-gray-600 text-white focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 focus:outline-none appearance-none"
                    required
                  >
                    <option value="">Select a time</option>
                    <option value="09:00">9:00 AM</option>
                    <option value="10:00">10:00 AM</option>
                    <option value="11:00">11:00 AM</option>
                    <option value="12:00">12:00 PM</option>
                    <option value="13:00">1:00 PM</option>
                    <option value="14:00">2:00 PM</option>
                    <option value="15:00">3:00 PM</option>
                    <option value="16:00">4:00 PM</option>
                    <option value="17:00">5:00 PM</option>
                    <option value="18:00">6:00 PM</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowRescheduleModal(false)}
                className="px-4 py-2 text-white rounded-lg border border-gray-600 hover:bg-secondary-dark transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={submitReschedule}
                className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg transition-colors"
              >
                Confirm Reschedule
              </button>
            </div>
          </div>
        </div>
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
    </div>
  );
}

export default SessionHistory; 