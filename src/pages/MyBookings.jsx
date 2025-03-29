import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast, Toaster } from 'react-hot-toast';
import MentorRatingModal from '../components/MentorRatingModal';
import Footer from '../components/Footer';

function MyBookings() {
  const { currentUser } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingToRate, setBookingToRate] = useState(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        if (!currentUser) {
          setBookings([]);
          setLoading(false);
          return;
        }

        const response = await fetch('http://localhost:3250/api/sessions', {
          method: 'GET',
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error('Failed to fetch bookings');
        }

        const data = await response.json();
        setBookings(data.sessions);
      } catch (error) {
        console.error('Error fetching bookings:', error);
        toast.error('Failed to load your bookings');
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [currentUser]);

  const handleRateSession = (booking) => {
    setBookingToRate(booking);
  };

  const handleRatingSubmit = async (bookingId, rating, feedback) => {
    try {
      const response = await fetch(`http://localhost:3250/api/sessions/${bookingId}`, {
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
      const updatedResponse = await fetch('http://localhost:3250/api/sessions', {
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
    // Convert 24-hour format to 12-hour format
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes} ${ampm}`;
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-500 bg-opacity-20 text-green-400 border-green-500';
      case 'completed':
        return 'bg-blue-500 bg-opacity-20 text-blue-400 border-blue-500';
      case 'cancelled':
        return 'bg-red-500 bg-opacity-20 text-red-400 border-red-500';
      case 'rescheduled':
        return 'bg-yellow-500 bg-opacity-20 text-yellow-400 border-yellow-500';
      default:
        return 'bg-yellow-500 bg-opacity-20 text-yellow-400 border-yellow-500';
    }
  };

  const getSessionTypeIcon = (type) => {
    switch (type) {
      case 'video':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        );
      case 'audio':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
        );
      case 'chat':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        );
      default:
        return null;
    }
  };

  const handleReschedule = async (bookingId, newDate, newTime) => {
    try {
      const response = await fetch(`http://localhost:3250/api/sessions/${bookingId}`, {
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
      const updatedResponse = await fetch('http://localhost:3250/api/sessions', {
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
              <div className="space-y-6">
                {bookings.map((booking) => (
                  <div key={booking._id || booking.paymentId} className="bg-darkblue-light rounded-xl border border-gray-700 overflow-hidden">
                    <div className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold text-white mb-2 md:mb-0">
                          Session with {booking.mentorName}
                        </h2>
                        <div className={`px-3 py-1 rounded-full text-xs font-medium inline-flex items-center border ${getStatusBadgeClass(booking.status)}`}>
                          {booking.status === 'confirmed' && 'Upcoming'}
                          {booking.status === 'completed' && 'Completed'}
                          {booking.status === 'cancelled' && 'Cancelled'}
                          {booking.status === 'pending' && 'Pending'}
                          {booking.status === 'rescheduled' && 'Rescheduled'}
                        </div>
                      </div>
                      
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
                      
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center pt-4 border-t border-gray-700">
                        <div>
                          <div className="text-gray-400 text-sm mb-1">Amount Paid</div>
                          <div className="text-white font-bold text-xl">₹{booking.price}</div>
                        </div>
                        
                        <div className="mt-4 md:mt-0 flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2">
                          {booking.status === 'confirmed' && (
                            <a
                              href="#"
                              className="inline-block bg-primary hover:bg-primary-dark text-white py-2 px-4 rounded-lg transition-colors text-center"
                            >
                              Join Session
                            </a>
                          )}
                          
                          {booking.status === 'confirmed' && (
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
                          
                          {(booking.status === 'completed' || booking.status === 'confirmed') && !booking.rating && (
                            <button
                              onClick={() => handleRateSession(booking)}
                              className="inline-block bg-darkblue hover:bg-darkblue-dark text-white py-2 px-4 rounded-lg border border-gray-600 transition-colors"
                            >
                              Rate Session
                            </button>
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