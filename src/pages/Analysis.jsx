import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import { useAuth } from '../context/AuthContext';
import { useAssessment } from '../context/AssessmentContext.jsx';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

function Analysis() {
    const { currentUser } = useAuth();
    const {
        scores,
        showResults,
        aiAnalysis,
        error,
        isGeneratingAnalysis,
        resetAssessment
    } = useAssessment();

    // If user hasn't completed the assessment, redirect to MCQ page
    if (!showResults) {
        return <Navigate to="/mcq" />;
    }

    // Prepare chart data
    const chartData = {
        labels: ['Science', 'Technology', 'Engineering', 'Mathematics'],
        datasets: [
            {
                label: 'Career Assessment Score',
                data: [scores.Science, scores.Technology, scores.Engineering, scores.Mathematics],
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
    };

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
                    label: function (context) {
                        const label = context.label || '';
                        const value = context.raw || 0;
                        const total = context.dataset.data.reduce((a, b) => a + b, 0);
                        const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
                        return `${label}: ${value} points (${percentage}%)`;
                    }
                }
            }
        }
    };

    const getCategoryColor = (category) => {
        switch (category) {
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
                <div className="max-w-4xl mx-auto bg-darkblue-light rounded-xl shadow-md overflow-hidden border border-gray-700">
                    <div className="p-6 bg-darkblue border-b border-gray-700">
                        <h1 className="text-2xl font-bold text-white">Assessment Results</h1>
                    </div>

                    <div className="p-6">
                        <div className="text-center py-8">
                            <h2 className="text-3xl font-bold text-white mb-6">Your Career Assessment Results</h2>

                            {isGeneratingAnalysis && (
                                <div className="bg-blue-500 bg-opacity-20 border border-blue-500 text-white p-3 rounded-md mb-6">
                                    <div className="flex items-center justify-center">
                                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-3"></div>
                                        <p>AI is analyzing your results...</p>
                                    </div>
                                </div>
                            )}

                            {error && (
                                <div className="bg-red-500 bg-opacity-20 border border-red-500 text-white p-3 rounded-md mb-6">
                                    <p>{error}</p>
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                                {/* Pie Chart */}
                                <div className="bg-darkblue p-6 rounded-lg border border-gray-700">
                                    <h3 className="text-xl font-bold text-white mb-4">Score Distribution</h3>
                                    <div className="h-64 relative">
                                        <Pie data={chartData} options={chartOptions} />
                                    </div>
                                </div>

                                {/* Score Details */}
                                <div className="bg-darkblue p-6 rounded-lg border border-gray-700">
                                    <h3 className="text-xl font-bold text-white mb-4">Your STEM Scores</h3>
                                    <div className="space-y-4">
                                        {Object.entries(scores).map(([field, score]) => {
                                            const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);
                                            const percentage = totalScore > 0 ? Math.round((score / totalScore) * 100) : 0;
                                            const bgColor = getCategoryColor(field);

                                            return (
                                                <div key={field} className="text-left">
                                                    <div className="flex justify-between mb-1">
                                                        <span className="text-white font-medium">{field}</span>
                                                        <span className="text-white">{score} points ({percentage}%)</span>
                                                    </div>
                                                    <div className="w-full bg-gray-700 rounded-full h-2.5">
                                                        <div
                                                            className="h-2.5 rounded-full"
                                                            style={{ width: `${percentage}%`, backgroundColor: bgColor }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            {aiAnalysis && (
                                <>
                                    <div className="bg-darkblue p-6 rounded-lg border border-gray-700 mb-8">
                                        <div className="flex items-center justify-center mb-4">
                                            <div className="w-16 h-16 rounded-full mr-4" style={{ backgroundColor: getCategoryColor(aiAnalysis.primaryField) }}></div>
                                            <h3 className="text-2xl font-bold text-primary">
                                                Primary Field: {aiAnalysis.primaryField}
                                                {aiAnalysis.secondaryField && (
                                                    <span className="block text-lg text-gray-300 mt-1">
                                                        Secondary Field: {aiAnalysis.secondaryField}
                                                    </span>
                                                )}
                                            </h3>
                                        </div>

                                        <p className="text-gray-300 mb-6 text-lg text-left">
                                            {aiAnalysis.analysis}
                                        </p>

                                        {aiAnalysis.skillsToFocus && (
                                            <div className="text-left">
                                                <h4 className="text-xl font-semibold text-white mb-3">Skills to Develop:</h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {aiAnalysis.skillsToFocus.map((skill, index) => (
                                                        <span key={index} className="bg-primary bg-opacity-20 text-primary px-3 py-2 rounded-full text-sm font-medium">
                                                            {skill}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {aiAnalysis.recommendedWorkEnvironments && (
                                            <div className="text-left mt-6">
                                                <h4 className="text-xl font-semibold text-white mb-3">Recommended Work Environments:</h4>
                                                <ul className="list-disc pl-5 text-gray-300 space-y-2">
                                                    {aiAnalysis.recommendedWorkEnvironments.map((environment, index) => (
                                                        <li key={index}>{environment}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}

                            <div className="flex flex-col md:flex-row justify-center space-y-4 md:space-y-0 md:space-x-4">
                                <button
                                    onClick={resetAssessment}
                                    className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark transition-colors transform hover:scale-105 duration-300"
                                >
                                    <i className="fas fa-redo mr-2"></i> Retake Assessment
                                </button>
                                <Link
                                    to="/dashboard"
                                    className="bg-darkblue-dark text-white px-6 py-3 rounded-lg border border-gray-700 hover:bg-darkblue transition-colors transform hover:scale-105 duration-300"
                                >
                                    <i className="fas fa-chart-bar mr-2"></i> View Dashboard
                                </Link>
                                <Link
                                    to="/find-mentors"
                                    className="bg-darkblue-dark text-white px-6 py-3 rounded-lg border border-gray-700 hover:bg-darkblue transition-colors transform hover:scale-105 duration-300"
                                >
                                    <i className="fas fa-users mr-2"></i> Find Mentors
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Analysis;
