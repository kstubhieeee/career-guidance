import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

function About() {
  const [aboutData, setAboutData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Import the data
    import('../data/aboutData.json')
      .then(data => {
        setAboutData(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error loading about data:', error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <section id="about" className="py-20 bg-darkblue-light">
        <div className="container mx-auto px-4 flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </section>
    );
  }

  if (!aboutData) {
    return null;
  }

  return (
    <section id="about" className="py-20 bg-darkblue-light">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{aboutData.title}</h2>
          <div className="w-20 h-1 bg-primary mx-auto mb-8"></div>
        </div>
        
        <div className="max-w-3xl mx-auto text-center mb-12">
          <p className="text-xl text-gray-200 leading-relaxed mb-8" 
             dangerouslySetInnerHTML={{ __html: aboutData.description }}>
          </p>
          
          <div className="flex flex-wrap justify-center gap-4">
            {aboutData.features.map((feature, index) => (
              <div key={index} className="w-full md:w-1/3 p-4">
                <div className="bg-darkblue rounded-lg shadow-md p-6 h-full hover:shadow-lg transition-shadow border border-gray-700">
                  <div className="text-primary text-4xl mb-4">
                    <i className={feature.icon}></i>
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-white">{feature.title}</h3>
                  <p className="text-gray-300">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-12">
            <Link to={aboutData.buttonLink} className="bg-primary text-white px-8 py-3 rounded-lg hover:bg-primary-dark transition-colors shadow-md text-lg">
              {aboutData.buttonText}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default About;