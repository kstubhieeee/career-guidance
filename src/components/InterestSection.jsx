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
        // Validate the data structure
        if (data && typeof data === 'object') {
          console.log('Career fields data loaded:', Object.keys(data));
          
          // Check if data is actually a module with a default export
          const careerData = data.default ? data.default : data;
          console.log('Career data structure:', careerData);
          
          setCareerFields(careerData);
          
          // Initialize visibleSections with all fields set to false
          const initialVisibility = {};
          Object.keys(careerData).forEach(field => {
            initialVisibility[field] = false;
          });
          setVisibleSections(initialVisibility);
        } else {
          console.error('Invalid career fields data format:', data);
          // Set empty object to prevent errors
          setCareerFields({});
        }
        setLoading(false);
      })
      .catch(error => {
        console.error('Error loading career fields data:', error);
        setLoading(false);
        // Set empty object to prevent errors
        setCareerFields({});
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
    // Check if field exists and has a careers array
    if (careerFields[field] && careerFields[field].careers && Array.isArray(careerFields[field].careers)) {
      const career = careerFields[field].careers.find(c => c && c.name === careerName);
      if (career) {
        setSelectedCareer({
          ...career,
          fieldName: field,
          fieldColor: careerFields[field].color
        });
        setShowCareerDetails(true);
        
        // Scroll to career details after a short delay to ensure the component is rendered
        setTimeout(() => {
          const careerDetailsElement = document.getElementById('career-details');
          if (careerDetailsElement) {
            careerDetailsElement.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100);
      }
    } else {
      console.error(`Career field ${field} not found or does not have a careers array`);
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
          {/* Career Field Sections with Enhanced Design */}
          {Object.entries(careerFields).map(([field, data]) => (
            <div key={field} className="mb-12">
              <div 
                className="flex justify-between items-center p-6 rounded-xl shadow-lg cursor-pointer transition-all duration-300 border border-gray-700 relative overflow-hidden group"
                onClick={() => toggleSection(field)}
                style={{ 
                  background: `linear-gradient(135deg, rgba(20, 30, 48, 0.9), ${data.color})`,
                }}
              >
                {/* Background pattern for visual interest */}
                <div className="absolute -right-4 -bottom-4 w-32 h-32 rounded-full opacity-20 bg-white transform rotate-45"></div>
                
                <div className="flex items-center z-10">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center mr-4 bg-darkblue bg-opacity-30">
                    {field === 'science' && (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                      </svg>
                    )}
                    {field === 'technology' && (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    )}
                    {field === 'engineering' && (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    )}
                    {field === 'mathematics' && (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.871 4A17.926 17.926 0 003 12c0 2.874.673 5.59 1.871 8m14.13 0a17.926 17.926 0 001.87-8c0-2.874-.673-5.59-1.87-8M9 9h1.246a1 1 0 01.961.725l1.586 5.55a1 1 0 00.961.725H15m1-7h-.08a2 2 0 00-1.519.698L9.6 15.302A2 2 0 018.08 16H8" />
                      </svg>
                    )}
                  </div>
                  <h3 className="text-2xl font-bold text-white capitalize">{data.name}</h3>
                </div>
                
                <div className="flex items-center z-10">
                  <span className="text-sm text-white mr-3 opacity-80">{data.careers && data.careers.length ? data.careers.length : 0} careers</span>
                  <span className="text-white bg-darkblue-dark p-2 rounded-full w-10 h-10 flex items-center justify-center shadow-md transform transition-transform group-hover:scale-110">
                    {visibleSections[field] ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    )}
                  </span>
                </div>
              </div>
              
              {visibleSections[field] && (
                <div className="mt-2 animate-fadeIn">
                  <div className="p-6 bg-darkblue-light rounded-lg shadow-inner border border-gray-700 mb-8 text-gray-300 text-lg leading-relaxed">
                    {data.description}
                  </div>
                  <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                    {data.careers && data.careers.length > 0 ? data.careers.map((career, index) => (
                      <div 
                        key={index}
                        onClick={() => showCareerDetail(field, career.name)}
                        className="bg-darkblue-light rounded-xl overflow-hidden transition-all duration-300 cursor-pointer group hover:shadow-xl hover:shadow-primary/10 border border-gray-700 hover:border-primary flex flex-col"
                      >
                        <div className="p-5 flex-1 flex flex-col">
                          <div className="w-14 h-14 rounded-lg flex items-center justify-center mb-4" 
                            style={{ backgroundColor: data.color }}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <h4 className="text-xl font-bold text-white mb-3">{career.name}</h4>
                          <p className="text-gray-400 text-sm line-clamp-3 mb-4 flex-1">
                            {career.description ? career.description.substring(0, 120) + '...' : 'No description available'}
                          </p>
                        </div>
                        <div className="px-5 py-3 bg-darkblue-dark border-t border-gray-700 flex justify-between items-center">
                          <span className="text-sm text-primary">Avg. Salary: {career.averageSalary && typeof career.averageSalary === 'string' ? career.averageSalary.split(' ')[0] : 'N/A'}</span>
                          <span className="text-white rounded-md px-3 py-1 text-xs font-medium group-hover:bg-primary transition-colors duration-300 flex items-center">
                            Explore
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                          </span>
                        </div>
                      </div>
                    )) : null}
                  </div>
                </div>
              )}
              
              <div className="my-8 border-b border-gray-700/30"></div>
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
                
                <div className="p-6 border-b border-gray-700" style={{ backgroundColor: selectedCareer.fieldColor || 'rgba(75, 85, 99, 0.8)' }}>
                  <h2 className="text-3xl font-bold text-white mb-2">{selectedCareer.name || 'Career Details'}</h2>
                  <p className="text-gray-200">
                    {careerFields[selectedCareer.fieldName] && careerFields[selectedCareer.fieldName].name 
                      ? `${careerFields[selectedCareer.fieldName].name} Field` 
                      : 'Career Field'}
                  </p>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-2">
                      <div className="mb-8">
                        <h3 className="text-white text-xl font-semibold mb-3 border-b border-gray-700 pb-2">Description</h3>
                        <p className="text-gray-300">{selectedCareer.description || 'No description available.'}</p>
                      </div>
                      
                      <div className="mb-8">
                        <h3 className="text-white text-xl font-semibold mb-3 border-b border-gray-700 pb-2">How to Become</h3>
                        <p className="text-gray-300">{selectedCareer.howToBecome || 'Information not available.'}</p>
                      </div>
                      
                      <div className="mb-8">
                        <h3 className="text-white text-xl font-semibold mb-3 border-b border-gray-700 pb-2">After 12th Standard</h3>
                        <p className="text-gray-300">{selectedCareer.afterTwelfth || 'Information not available.'}</p>
                      </div>
                      
                      <div className="mb-8">
                        <h3 className="text-white text-xl font-semibold mb-3 border-b border-gray-700 pb-2">Average Salary</h3>
                        <p className="text-gray-300">{selectedCareer.averageSalary || 'Salary information not available.'}</p>
                      </div>
                      
                      {selectedCareer.certifications && selectedCareer.certifications.length > 0 && (
                        <div className="mb-8">
                          <h3 className="text-white text-xl font-semibold mb-3 border-b border-gray-700 pb-2">Recommended Certifications</h3>
                          <ul className="list-disc pl-5 text-gray-300">
                            {selectedCareer.certifications.map((certification, index) => (
                              <li key={index} className="mb-2">{certification}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {selectedCareer.externalLinks && (
                        <div className="mb-8">
                          <h3 className="text-white text-xl font-semibold mb-3 border-b border-gray-700 pb-2">External Resources</h3>
                          
                          {selectedCareer.externalLinks.articles && selectedCareer.externalLinks.articles.length > 0 && (
                            <div className="mb-4">
                              <h4 className="text-white text-lg font-medium mb-2">Articles</h4>
                              <ul className="space-y-2">
                                {selectedCareer.externalLinks.articles.map((article, index) => (
                                  <li key={index}>
                                    <a 
                                      href={article.url} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="text-primary hover:text-primary-light flex items-center"
                                    >
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                      </svg>
                                      {article.title}
                                    </a>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          
                          {selectedCareer.externalLinks.videos && selectedCareer.externalLinks.videos.length > 0 && (
                            <div>
                              <h4 className="text-white text-lg font-medium mb-2">Videos</h4>
                              <ul className="space-y-2">
                                {selectedCareer.externalLinks.videos.map((video, index) => (
                                  <li key={index}>
                                    <a 
                                      href={video.url} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="text-primary hover:text-primary-light flex items-center"
                                    >
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                      </svg>
                                      {video.title}
                                    </a>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
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