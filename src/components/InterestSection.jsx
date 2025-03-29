import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function InterestSection() {
  const [careerFields, setCareerFields] = useState({});
  const [loading, setLoading] = useState(true);
  const [visibleSections, setVisibleSections] = useState({});
  const [selectedCareer, setSelectedCareer] = useState(null);
  const [showCareerDetails, setShowCareerDetails] = useState(false);

  useEffect(() => {
    // Import the data
    import('../data/careerFields.json')
      .then(data => {
        setCareerFields(data);
        // Initialize visibleSections with all fields set to false
        const initialVisibility = {};
        Object.keys(data).forEach(field => {
          initialVisibility[field] = false;
        });
        setVisibleSections(initialVisibility);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error loading career fields data:', error);
        setLoading(false);
      });
  }, []);

  const toggleSection = (section) => {
    if (showCareerDetails) {
      setShowCareerDetails(false);
      setSelectedCareer(null);
    }
    
    setVisibleSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const showCareerDetail = (field, careerName) => {
    const career = careerFields[field].careers.find(c => c.name === careerName);
    if (career) {
      setSelectedCareer({
        ...career,
        fieldName: field,
        fieldColor: careerFields[field].color
      });
      setShowCareerDetails(true);
      
      // Scroll to career details after a short delay to ensure the component is rendered
      setTimeout(() => {
        document.getElementById('career-details').scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  const closeCareerDetails = () => {
    setShowCareerDetails(false);
    setSelectedCareer(null);
  };

  if (loading) {
    return (
      <section className="py-16 bg-darkblue">
        <div className="container mx-auto px-4 flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </section>
    );
  }

  if (Object.keys(careerFields).length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-darkblue">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          {/* Career Field Sections */}
          {Object.entries(careerFields).map(([field, data]) => (
            <div key={field} className="mb-6">
              <div 
                className="flex justify-between items-center bg-darkblue-light p-5 rounded-lg shadow-lg cursor-pointer hover:bg-opacity-90 transition-colors border border-gray-700"
                onClick={() => toggleSection(field)}
                style={{ 
                  background: `linear-gradient(to right, rgba(30, 58, 95, 0.8), ${data.color})`,
                }}
              >
                <h3 className="text-2xl font-bold text-white capitalize">{data.name}</h3>
                <span className="text-white bg-darkblue-dark p-2 rounded-full w-8 h-8 flex items-center justify-center">
                  {visibleSections[field] ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  )}
                </span>
              </div>
              
              {visibleSections[field] && (
                <div>
                  <div className="p-4 bg-darkblue-light rounded-lg mt-1 mb-5 text-gray-300">
                    {data.description}
                  </div>
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {data.careers.map((career, index) => (
                      <div 
                        key={index}
                        onClick={() => showCareerDetail(field, career.name)}
                        className="bg-darkblue-light rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transform transition-transform hover:scale-105 hover:shadow-lg border border-gray-700 hover:border-primary"
                        style={{ minHeight: '120px' }}
                      >
                        <div className="w-12 h-12 rounded-full bg-opacity-30 flex items-center justify-center mb-3" 
                          style={{ backgroundColor: data.color }}>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <h4 className="text-lg font-semibold text-white">{career.name}</h4>
                        <div className="mt-2 text-xs text-primary-light">Click for details</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <hr className="my-6 border-gray-700" />
            </div>
          ))}
          
          {/* Career Detail Modal */}
          {showCareerDetails && selectedCareer && (
            <div id="career-details" className="mt-8 bg-darkblue-light rounded-xl shadow-2xl border border-gray-700 overflow-hidden">
              <div className="relative">
                <div className="absolute top-4 right-4 z-10">
                  <button 
                    onClick={closeCareerDetails}
                    className="bg-darkblue-dark hover:bg-darkblue text-white p-2 rounded-full transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="p-6 border-b border-gray-700" style={{ backgroundColor: selectedCareer.fieldColor }}>
                  <h2 className="text-3xl font-bold text-white mb-2">{selectedCareer.name}</h2>
                  <p className="text-gray-200">{careerFields[selectedCareer.fieldName].name} Field</p>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-2">
                      <div className="mb-8">
                        <h3 className="text-white text-xl font-semibold mb-3 border-b border-gray-700 pb-2">Description</h3>
                        <p className="text-gray-300">{selectedCareer.description}</p>
                      </div>
                      
                      <div className="mb-8">
                        <h3 className="text-white text-xl font-semibold mb-3 border-b border-gray-700 pb-2">How to Become</h3>
                        <p className="text-gray-300">{selectedCareer.howToBecome}</p>
                      </div>
                      
                      <div className="mb-8">
                        <h3 className="text-white text-xl font-semibold mb-3 border-b border-gray-700 pb-2">After 12th Standard</h3>
                        <p className="text-gray-300">{selectedCareer.afterTwelfth}</p>
                      </div>
                      
                      <div className="mb-8">
                        <h3 className="text-white text-xl font-semibold mb-3 border-b border-gray-700 pb-2">Average Salary</h3>
                        <p className="text-gray-300">{selectedCareer.averageSalary}</p>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-white text-xl font-semibold mb-3 border-b border-gray-700 pb-2">Top Colleges in India</h3>
                      {selectedCareer.topColleges && selectedCareer.topColleges.map((college, index) => (
                        <div key={index} className="mb-4 bg-darkblue rounded-lg p-4 hover:bg-darkblue-dark transition-colors">
                          <h4 className="text-white font-medium">{college.name}</h4>
                          <p className="text-gray-400 text-sm">{college.location}</p>
                          <a 
                            href={college.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-primary hover:text-primary-light text-sm mt-1 inline-block"
                          >
                            Visit Website
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="mt-6 flex justify-end">
                    <Link
                      to={selectedCareer.path}
                      className="bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-lg transition-colors flex items-center"
                    >
                      <span>Take Assessment</span>
                      <svg className="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default InterestSection;