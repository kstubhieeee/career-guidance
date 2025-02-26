import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function InterestSection() {
  const [careerFields, setCareerFields] = useState({});
  const [loading, setLoading] = useState(true);
  const [visibleSections, setVisibleSections] = useState({});

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
    setVisibleSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
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
        <div className="max-w-4xl mx-auto">
          {Object.entries(careerFields).map(([field, data]) => (
            <div key={field} className="mb-6">
              <div 
                className="flex justify-between items-center bg-darkblue-light p-4 rounded-lg shadow-sm cursor-pointer hover:bg-darkblue-dark transition-colors border border-gray-700"
                onClick={() => toggleSection(field)}
              >
                <h3 className="text-xl font-bold text-white capitalize">{field}</h3>
                <span className="text-primary">
                  {visibleSections[field] ? (
                    <i className="fas fa-chevron-up"></i>
                  ) : (
                    <i className="fas fa-chevron-down"></i>
                  )}
                </span>
              </div>
              
              {visibleSections[field] && (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-darkblue-dark rounded-lg shadow-inner">
                  {data.careers.map((career, index) => (
                    <Link 
                      key={index}
                      to={career.path}
                      className="bg-darkblue border border-gray-700 rounded-lg p-4 text-center text-white hover:bg-primary hover:text-white transition-colors shadow-sm hover:shadow-md"
                    >
                      {career.name}
                    </Link>
                  ))}
                </div>
              )}
              
              <hr className="my-6 border-gray-700" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default InterestSection;