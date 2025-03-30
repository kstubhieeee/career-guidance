import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast, Toaster } from 'react-hot-toast';
import Footer from '../components/Footer';

// API base URL constant
const API_BASE_URL = 'http://localhost:3250';

function MenteeRequests() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState([]);
  const [error, setError] = useState(null);
  const [processingRequest, setProcessingRequest] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');

  // Fetch session requests when component mounts
  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    if (!currentUser.isMentor) {
      navigate('/');
      toast.error('Only mentors can access this page');
      return;
    }

    fetchSessionRequests();
  }, [currentUser, navigate]);

  // Function to fetch session requests
  const fetchSessionRequests = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/mentor/session-requests`, {
        method: 'GET',
        credentials: 'include'
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to fetch session requests');
      }

      const data = await response.json();
      setRequests(data.sessionRequests || []);
    } catch (err) {
      console.error('Error fetching session requests:', err);
      setError(err.message || 'Failed to load session requests. Please try again.');
      toast.error(err.message || 'Failed to load session requests');
    } finally {
      setLoading(false);
    }
  };

  // Filter requests based on active filter
  const filteredRequests = requests.filter(request => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'pending') return request.status === 'pending';
    if (activeFilter === 'accepted') return request.status === 'accepted';
    if (activeFilter === 'rejected') return request.status === 'rejected';
    return true;
  });

  // Function to handle request status update
  const handleStatusUpdate = async (requestId, status) => {
    setProcessingRequest(requestId);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/session-requests/${requestId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status }),
        credentials: 'include'
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || `Failed to ${status} the session request`);
      }

      // Update the request status in the UI
      setRequests(requests.map(request =>
        request._id === requestId ? { ...request, status, paymentStatus: status === 'accepted' ? 'pending' : request.paymentStatus } : request
      ));

      // Show success message
      toast.success(`Session request ${status === 'accepted' ? 'accepted' : 'rejected'} successfully`);

      // Refresh the data to get the latest status from server
      setTimeout(() => {
        fetchSessionRequests();
      }, 1000); // Refresh after 1 second to get updated server data
    } catch (err) {
      console.error(`Error ${status} session request:`, err);
      toast.error(err.message || `Failed to ${status} the session request`);
      setError(err.message || `Failed to ${status} the session request. Please try again.`);
    } finally {
      setProcessingRequest(null);
    }
  };

  // Function to format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Format time from 24h to 12h format
  const formatTime = (timeString) => {
    if (!timeString) return '';

    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;

    return `${hour12}:${minutes || '00'} ${ampm}`;
  };

  return (
    <div className="min-h-screen bg-darkblue">
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-white mb-2">Mentee Requests</h1>
        <p className="text-gray-300 mb-8">Manage your session requests from students</p>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="bg-red-500 bg-opacity-20 text-white p-4 rounded-lg border border-red-500">
            <p>{error}</p>
            <button
              onClick={fetchSessionRequests}
              className="mt-4 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
            >
              Try Again
            </button>
          </div>
        ) : requests.length === 0 ? (
          <div className="bg-darkblue-light p-8 rounded-lg text-center">
            <svg className="w-16 h-16 mx-auto text-gray-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
            <h2 className="text-xl font-semibold text-white mb-2">No Session Requests Yet</h2>
            <p className="text-gray-400">
              When students request sessions with you, they will appear here.
            </p>
          </div>
        ) : (
          <>
            {/* Filter tabs */}
            <div className="flex border-b border-gray-700 mb-6 overflow-x-auto">
              {['all', 'pending', 'accepted', 'rejected'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${activeFilter === filter
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-gray-400 hover:text-white'
                    }`}
                >
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </button>
              ))}
            </div>

            {filteredRequests.length > 0 ? (
              <div className="space-y-6">
                {filteredRequests.map(request => (
                  <div
                    key={request._id}
                    className={`bg-darkblue-light p-6 rounded-lg border ${request.status === 'pending' ? 'border-yellow-600' :
                      request.status === 'accepted' ? 'border-green-600' :
                        request.status === 'rejected' ? 'border-red-600' :
                          'border-gray-600'
                      }`}
                  >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-white mb-1">
                          Session with {request.studentName}
                        </h3>
                        <p className="text-gray-300 text-sm">
                          Request received on {formatDate(request.createdAt)}
                        </p>
                      </div>

                      <div className="mt-2 md:mt-0">
                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${request.status === 'pending' ? 'bg-yellow-500 bg-opacity-20 text-yellow-300' :
                          request.status === 'accepted' ? 'bg-green-500 bg-opacity-20 text-green-300' :
                            request.status === 'rejected' ? 'bg-red-500 bg-opacity-20 text-red-300' :
                              'bg-gray-500 bg-opacity-20 text-gray-300'
                          }`}>
                          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                      <div>
                        <h4 className="text-primary text-sm font-medium mb-1">Date & Time</h4>
                        <p className="text-white">
                          {formatDate(request.sessionDate)} at {formatTime(request.sessionTime)}
                        </p>
                      </div>

                      <div>
                        <h4 className="text-primary text-sm font-medium mb-1">Session Type</h4>
                        <p className="text-white capitalize">{request.sessionType}</p>
                      </div>

                      <div>
                        <h4 className="text-primary text-sm font-medium mb-1">Student Name</h4>
                        <p className="text-white">{request.studentName}</p>
                      </div>
                    </div>

                    {request.notes && (
                      <div className="mb-4">
                        <h4 className="text-primary text-sm font-medium mb-1">Notes</h4>
                        <p className="text-white bg-darkblue p-3 rounded border border-gray-700">
                          {request.notes}
                        </p>
                      </div>
                    )}

                    {request.status === 'pending' && (
                      <div className="flex flex-col sm:flex-row gap-3 mt-4">
                        <button
                          onClick={() => handleStatusUpdate(request._id, 'accepted')}
                          disabled={processingRequest === request._id}
                          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                          {processingRequest === request._id ? (
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          ) : (
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"></path>
                            </svg>
                          )}
                          Accept Request
                        </button>

                        <button
                          onClick={() => handleStatusUpdate(request._id, 'rejected')}
                          disabled={processingRequest === request._id}
                          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                          {processingRequest === request._id ? (
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          ) : (
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                          )}
                          Decline Request
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-darkblue-light p-8 rounded-lg text-center">
                <svg className="w-16 h-16 mx-auto text-gray-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <h2 className="text-xl font-semibold text-white mb-2">No {activeFilter} requests found</h2>
                <p className="text-gray-400 mb-4">
                  {activeFilter === 'pending' && "You don't have any pending session requests waiting for your action."}
                  {activeFilter === 'accepted' && "You don't have any accepted session requests."}
                  {activeFilter === 'rejected' && "You don't have any rejected session requests."}
                  {activeFilter === 'all' && "No session requests match the current filter."}
                </p>
              </div>
            )}
          </>
        )}
      </div>
      <Footer />
      <Toaster position="bottom-center" />
    </div>
  );
}

export default MenteeRequests; 