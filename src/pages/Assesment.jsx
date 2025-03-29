import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Footer from "../components/Footer";

function Assesment() {
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const navigate = useNavigate();

  const handleStartAssessment = () => {
    navigate("/mcq");
  };

  return (
    <>
      <div className="min-h-screen bg-darkblue py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="bg-darkblue-light rounded-xl shadow-md overflow-hidden border border-gray-700 mb-8">
              <div className="p-6 md:p-10">
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-6 text-center">
                  Career Assessment
                </h1>

                {!showDisclaimer ? (
                  <div className="text-center">
                    <div className="mb-8">
                      <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-12 w-12 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                      <p className="text-xl text-white mb-4">
                        Are you ready to discover your ideal career path?
                      </p>
                      <p className="text-gray-300 mb-8">
                        This assessment will help identify your strengths and
                        interests in Science, Technology, Engineering, and
                        Mathematics fields, providing personalized career
                        recommendations.
                      </p>
                    </div>

                    <div className="space-y-4">
                      <button
                        onClick={() => setShowDisclaimer(true)}
                        className="w-full md:w-auto bg-primary hover:bg-primary-dark text-white font-bold py-3 px-8 rounded-lg transition-colors shadow-lg hover:shadow-xl transform hover:scale-105 duration-300"
                      >
                        Take Assessment
                      </button>
                      <div className="block md:hidden my-2">or</div>
                      <Link
                        to="/"
                        className="w-full md:w-auto inline-block bg-darkblue hover:bg-darkblue-dark text-white font-bold py-3 px-8 rounded-lg border border-gray-600 transition-colors shadow-lg hover:shadow-xl transform hover:scale-105 duration-300 md:ml-4"
                      >
                        Return Home
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="bg-secondary-dark p-6 rounded-lg border border-gray-600 mb-8">
                      <h2 className="text-2xl font-bold text-white mb-4">
                        Assessment Disclaimer
                      </h2>
                      <div className="space-y-4 text-gray-300">
                        <p>
                          <strong className="text-primary">Purpose:</strong> This
                          assessment is designed to provide general career
                          guidance based on your interests and preferences in
                          STEM fields.
                        </p>
                        <p>
                          <strong className="text-primary">Limitations:</strong>{" "}
                          The results are suggestions only and should not be
                          considered definitive career advice. Many factors
                          influence career success beyond what this assessment
                          measures.
                        </p>
                        <p>
                          <strong className="text-primary">Privacy:</strong> Your
                          responses will be stored securely in your profile to
                          provide personalized recommendations. We do not share
                          this information with third parties.
                        </p>
                        <p>
                          <strong className="text-primary">Time Required:</strong>{" "}
                          The assessment takes approximately 5-10 minutes to
                          complete. Please answer honestly for the most accurate
                          results.
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col md:flex-row justify-center items-center space-y-4 md:space-y-0 md:space-x-4">
                      <button
                        onClick={handleStartAssessment}
                        className="w-full md:w-auto bg-primary hover:bg-primary-dark text-white font-bold py-3 px-8 rounded-lg transition-colors shadow-lg hover:shadow-xl transform hover:scale-105 duration-300 flex items-center justify-center"
                      >
                        <span>Start Assessment</span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 ml-2"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={() => setShowDisclaimer(false)}
                        className="w-full md:w-auto bg-darkblue hover:bg-darkblue-dark text-white font-bold py-3 px-8 rounded-lg border border-gray-600 transition-colors shadow-lg hover:shadow-xl transform hover:scale-105 duration-300"
                      >
                        Go Back
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-darkblue-light rounded-xl shadow-md overflow-hidden border border-gray-700">
              <div className="p-6">
                <h2 className="text-2xl font-bold text-white mb-4">
                  Why Take This Assessment?
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-darkblue p-5 rounded-lg border border-gray-700">
                    <div className="w-12 h-12 bg-primary bg-opacity-20 rounded-full flex items-center justify-center mb-4">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 text-primary"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-white font-bold text-lg mb-2">
                      Discover Your Strengths
                    </h3>
                    <p className="text-gray-300">
                      Identify which STEM areas align with your natural talents
                      and interests.
                    </p>
                  </div>

                  <div className="bg-darkblue p-5 rounded-lg border border-gray-700">
                    <div className="w-12 h-12 bg-primary bg-opacity-20 rounded-full flex items-center justify-center mb-4">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 text-primary"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-white font-bold text-lg mb-2">
                      Get Personalized Recommendations
                    </h3>
                    <p className="text-gray-300">
                      Receive tailored career suggestions based on your unique
                      profile.
                    </p>
                  </div>

                  <div className="bg-darkblue p-5 rounded-lg border border-gray-700">
                    <div className="w-12 h-12 bg-primary bg-opacity-20 rounded-full flex items-center justify-center mb-4">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 text-primary"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-white font-bold text-lg mb-2">
                      Connect With Mentors
                    </h3>
                    <p className="text-gray-300">
                      Find mentors in your recommended fields who can guide your
                      career journey.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default Assesment;
