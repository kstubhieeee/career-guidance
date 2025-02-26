import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function MentorDashboard() {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [students, setStudents] = useState([]);
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    
    setStudents([
      { id: 1, name: 'Karan Banerjee', email: 'karanprince85@gmail.com', field: 'Technology', lastActive: '2023-05-15T10:30:00' },
      { id: 2, name: 'Dyuti Agarwal', email: 'dyuti@example.com', field: 'Science', lastActive: '2023-05-14T14:45:00' },
      { id: 3, name: 'Faiz Moulavi', email: 'mike@example.com', field: 'Engineering', lastActive: '2023-05-13T09:15:00' },
      { id: 4, name: 'Sneha Choudhary', email: 'mike@example.com', field: 'Engineering', lastActive: '2023-05-13T09:15:00' }
    ]);

    setSessions([
      { id: 1, studentName: 'Karan Banerjee', date: '2023-05-20T15:00:00', status: 'upcoming', topic: 'Career in Software Development' },
      { id: 2, studentName: 'Dyuti Agarwal', date: '2023-05-18T11:30:00', status: 'upcoming', topic: 'Research Opportunities in Biology' },
      { id: 3, studentName: 'Faiz Moulavi', date: '2023-05-10T13:00:00', status: 'completed', topic: 'Mechanical Engineering Career Paths' },
      { id: 4, studentName: 'Sneha Choudhary', date: '2023-05-10T13:00:00', status: 'completed', topic: 'Mechanical Engineering Career Paths' },
    ]);
  }, []);

  
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (!currentUser || !currentUser.isMentor) {
    return (
      <div className="min-h-screen bg-darkblue py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto bg-darkblue-light rounded-lg shadow-md p-8 border border-gray-700">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-4">Access Denied</h2>
              <p className="text-gray-300 mb-6">You need to be logged in as a mentor to access this page.</p>
              <Link to="/login" className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark transition-colors">
                Go to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-darkblue py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="bg-darkblue-light rounded-lg shadow-md p-6 mb-8 border border-gray-700">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Welcome, Mentor {currentUser.firstName}!</h1>
                <p className="text-gray-300">Manage your mentoring sessions and student interactions</p>
              </div>
              <div className="mt-4 md:mt-0">
                <button className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark transition-colors shadow-md">
                  <i className="fas fa-calendar-plus mr-2"></i> Schedule New Session
                </button>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : error ? (
            <div className="bg-red-500 bg-opacity-20 border border-red-500 text-white p-4 rounded-lg mb-8">
              <p>{error}</p>
            </div>
          ) : (
            <>
              {/* Dashboard Content */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                {/* Mentor Info Card */}
                <div className="bg-darkblue-light rounded-lg shadow-md p-6 border border-gray-700">
                  <div className="flex items-center mb-6">
                    <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-white text-2xl font-bold mr-4">
                      {currentUser.firstName?.charAt(0)}{currentUser.lastName?.charAt(0)}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">{currentUser.firstName} {currentUser.lastName}</h2>
                      <p className="text-gray-300">{currentUser.email}</p>
                    </div>
                  </div>
                  <div className="border-t border-gray-700 pt-4">
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-300">Specialization:</span>
                      <span className="text-white font-bold">{currentUser.specialization || "Technology"}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-300">Experience:</span>
                      <span className="text-white font-bold">{currentUser.experience || "5"} years</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Students:</span>
                      <span className="text-white font-bold">{students.length}</span>
                    </div>
                  </div>
                  <div className="mt-6">
                    <button className="w-full bg-darkblue text-white px-4 py-2 rounded border border-gray-600 hover:bg-darkblue-dark transition-colors">
                      <i className="fas fa-user-edit mr-2"></i> Edit Profile
                    </button>
                  </div>
                </div>

                {/* Upcoming Sessions Card */}
                <div className="bg-darkblue-light rounded-lg shadow-md p-6 border border-gray-700 md:col-span-2">
                  <h2 className="text-xl font-bold text-white mb-4">Upcoming Sessions</h2>
                  
                  {sessions.filter(s => s.status === 'upcoming').length > 0 ? (
                    <div className="space-y-4">
                      {sessions
                        .filter(session => session.status === 'upcoming')
                        .slice(0, 3)
                        .map(session => (
                          <div key={session.id} className="bg-darkblue p-4 rounded-lg border border-gray-700 hover:border-primary transition-colors">
                            <div className="flex justify-between items-center">
                              <div>
                                <h3 className="font-semibold text-white">{session.topic}</h3>
                                <p className="text-gray-300 text-sm">With {session.studentName}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-primary font-medium">{formatDate(session.date)}</p>
                                <div className="flex mt-2 space-x-2">
                                  <button className="bg-primary text-white px-3 py-1 rounded text-xs hover:bg-primary-dark transition-colors">
                                    Join
                                  </button>
                                  <button className="bg-darkblue-dark text-white px-3 py-1 rounded text-xs border border-gray-600 hover:bg-darkblue transition-colors">
                                    Reschedule
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      
                      {sessions.filter(s => s.status === 'upcoming').length > 3 && (
                        <div className="text-center mt-2">
                          <button className="text-primary hover:text-primary-light transition-colors text-sm">
                            View all sessions <i className="fas fa-arrow-right ml-1"></i>
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-300 mb-4">You don't have any upcoming sessions.</p>
                      <button className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors">
                        Schedule a Session
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Students List */}
              <div className="bg-darkblue-light rounded-lg shadow-md p-6 border border-gray-700 mb-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-white">Your Students</h2>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search students..."
                      className="px-4 py-2 bg-darkblue border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <i className="fas fa-search absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                  </div>
                </div>
                
                {students.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-white">
                      <thead>
                        <tr className="border-b border-gray-700">
                          <th className="py-3 px-4 text-left">Name</th>
                          <th className="py-3 px-4 text-left">Email</th>
                          <th className="py-3 px-4 text-left">Field</th>
                          <th className="py-3 px-4 text-left">Last Active</th>
                          <th className="py-3 px-4 text-left">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {students.map(student => (
                          <tr key={student.id} className="border-b border-gray-700 hover:bg-darkblue-dark">
                            <td className="py-3 px-4">{student.name}</td>
                            <td className="py-3 px-4">{student.email}</td>
                            <td className="py-3 px-4">{student.field}</td>
                            <td className="py-3 px-4">{formatDate(student.lastActive)}</td>
                            <td className="py-3 px-4">
                              <div className="flex space-x-2">
                                <button className="bg-primary text-white px-3 py-1 rounded text-xs hover:bg-primary-dark transition-colors">
                                  Message
                                </button>
                                <button className="bg-darkblue-dark text-white px-3 py-1 rounded text-xs border border-gray-600 hover:bg-darkblue transition-colors">
                                  Schedule
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-300">You don't have any students yet.</p>
                  </div>
                )}
              </div>

              {/* Session History */}
              <div className="bg-darkblue-light rounded-lg shadow-md p-6 border border-gray-700">
                <h2 className="text-xl font-bold text-white mb-6">Session History</h2>
                
                {sessions.filter(s => s.status === 'completed').length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-white">
                      <thead>
                        <tr className="border-b border-gray-700">
                          <th className="py-3 px-4 text-left">Student</th>
                          <th className="py-3 px-4 text-left">Topic</th>
                          <th className="py-3 px-4 text-left">Date</th>
                          <th className="py-3 px-4 text-left">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sessions
                          .filter(session => session.status === 'completed')
                          .map(session => (
                            <tr key={session.id} className="border-b border-gray-700 hover:bg-darkblue-dark">
                              <td className="py-3 px-4">{session.studentName}</td>
                              <td className="py-3 px-4">{session.topic}</td>
                              <td className="py-3 px-4">{formatDate(session.date)}</td>
                              <td className="py-3 px-4">
                                <button className="bg-darkblue-dark text-white px-3 py-1 rounded text-xs border border-gray-600 hover:bg-darkblue transition-colors">
                                  View Notes
                                </button>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-300">No completed sessions yet.</p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default MentorDashboard;