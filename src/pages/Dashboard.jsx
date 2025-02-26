import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

function Dashboard() {
  const { currentUser, getAssessments } = useAuth();
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAssessments = async () => {
      try {
        const data = await getAssessments();
        setAssessments(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAssessments();
  }, [getAssessments]);

  // Get the latest assessment
  const latestAssessment = assessments.length > 0 ? assessments[0] : null;

  // Prepare chart data for the latest assessment
  const pieChartData = latestAssessment ? {
    labels: ['Science', 'Technology', 'Engineering', 'Mathematics'],
    datasets: [
      {
        label: 'Latest Assessment Score',
        data: [
          latestAssessment.scores.Science,
          latestAssessment.scores.Technology,
          latestAssessment.scores.Engineering,
          latestAssessment.scores.Mathematics
        ],
        backgroundColor: [
          'rgba(255, 99, 132, 0.8)',
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 206, 86, 0.8)',
          'rgba(75, 192, 192, 0.8)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
        ],
        borderWidth: 1,
      },
    ],
  } : null;

  // Prepare chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: 'white',
          font: {
            size: 14
          }
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.raw || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = Math.round((value / total) * 100);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Get recommended career field color
  const getFieldColor = (field) => {
    switch(field) {
      case 'Science': return 'rgba(255, 99, 132, 0.8)';
      case 'Technology': return 'rgba(54, 162, 235, 0.8)';
      case 'Engineering': return 'rgba(255, 206, 86, 0.8)';
      case 'Mathematics': return 'rgba(75, 192, 192, 0.8)';
      default: return 'rgba(153, 102, 255, 0.8)';
    }
  };

  return (
    <div className="min-h-screen bg-darkblue py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="bg-darkblue-light rounded-lg shadow-md p-6 mb-8 border border-gray-700">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Welcome, {currentUser.firstName}!</h1>
                <p className="text-gray-300">Manage your career assessment journey</p>
              </div>
              <div className="mt-4 md:mt-0">
                <Link to="/mcq" className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark transition-colors shadow-md">
                  <i className="fas fa-clipboard-check mr-2"></i> Take New Assessment
                </Link>
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
                {/* User Info Card */}
                <div className="bg-darkblue-light rounded-lg shadow-md p-6 border border-gray-700">
                  <div className="flex items-center mb-6">
                    <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-white text-2xl font-bold mr-4">
                      {currentUser.firstName.charAt(0)}{currentUser.lastName.charAt(0)}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">{currentUser.firstName} {currentUser.lastName}</h2>
                      <p className="text-gray-300">{currentUser.email}</p>
                    </div>
                  </div>
                  <div className="border-t border-gray-700 pt-4">
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-300">Assessments Taken:</span>
                      <span className="text-white font-bold">{assessments.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Last Assessment:</span>
                      <span className="text-white font-bold">
                        {assessments.length > 0 ? formatDate(assessments[0].completedAt) : 'None'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Latest Assessment Card */}
                <div className="bg-darkblue-light rounded-lg shadow-md p-6 border border-gray-700 md:col-span-2">
                  <h2 className="text-xl font-bold text-white mb-4">Latest Assessment Results</h2>
                  
                  {latestAssessment ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="h-64 relative">
                        <Pie data={pieChartData} options={chartOptions} />
                      </div>
                      <div>
                        <div className="mb-4">
                          <h3 className="text-lg font-semibold text-white mb-2">Recommended Field</h3>
                          <div className="flex items-center">
                            <div 
                              className="w-4 h-4 rounded-full mr-2" 
                              style={{ backgroundColor: getFieldColor(latestAssessment.recommendedField) }}
                            ></div>
                            <span className="text-primary text-xl font-bold">{latestAssessment.recommendedField}</span>
                          </div>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-white mb-2">Score Breakdown</h3>
                          <div className="space-y-2">
                            {Object.entries(latestAssessment.scores).map(([field, score]) => (
                              <div key={field} className="flex justify-between items-center">
                                <span className="text-gray-300">{field}</span>
                                <span className="text-white font-bold">{score}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="mt-4">
                          <p className="text-gray-300 text-sm">
                            Completed on {formatDate(latestAssessment.completedAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-gray-300 mb-4">You haven't taken any assessments yet.</p>
                      <Link to="/mcq" className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark transition-colors">
                        Take Your First Assessment
                      </Link>
                    </div>
                  )}
                </div>
              </div>

              {/* Assessment History */}
              <div className="bg-darkblue-light rounded-lg shadow-md p-6 border border-gray-700">
                <h2 className="text-xl font-bold text-white mb-4">Assessment History</h2>
                
                {assessments.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-white">
                      <thead>
                        <tr className="border-b border-gray-700">
                          <th className="py-3 px-4 text-left">Date</th>
                          <th className="py-3 px-4 text-left">Recommended Field</th>
                          <th className="py-3 px-4 text-left">Science</th>
                          <th className="py-3 px-4 text-left">Technology</th>
                          <th className="py-3 px-4 text-left">Engineering</th>
                          <th className="py-3 px-4 text-left">Mathematics</th>
                        </tr>
                      </thead>
                      <tbody>
                        {assessments.map((assessment, index) => (
                          <tr key={index} className="border-b border-gray-700 hover:bg-darkblue-dark">
                            <td className="py-3 px-4">{formatDate(assessment.completedAt)}</td>
                            <td className="py-3 px-4">
                              <div className="flex items-center">
                                <div 
                                  className="w-3 h-3 rounded-full mr-2" 
                                  style={{ backgroundColor: getFieldColor(assessment.recommendedField) }}
                                ></div>
                                {assessment.recommendedField}
                              </div>
                            </td>
                            <td className="py-3 px-4">{assessment.scores.Science}</td>
                            <td className="py-3 px-4">{assessment.scores.Technology}</td>
                            <td className="py-3 px-4">{assessment.scores.Engineering}</td>
                            <td className="py-3 px-4">{assessment.scores.Mathematics}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-300">No assessment history available.</p>
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

export default Dashboard;