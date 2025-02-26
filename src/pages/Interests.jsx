import React, { useState, useEffect } from 'react';
import InterestSection from '../components/InterestSection';
import Contact from '../components/Contact';

function Interests() {
  const [interestsData, setInterestsData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Import the data
    import('../data/interestsData.json')
      .then(data => {
        setInterestsData(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error loading interests data:', error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="bg-darkblue min-h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!interestsData) {
    return null;
  }

  return (
    <div className="bg-darkblue">
      {/* Hero Section */}
      <section className="relative">
        <div className="h-96 overflow-hidden">
          <img 
            src={interestsData.hero.backgroundImage} 
            alt="Career guidance" 
            className="w-full h-full object-cover opacity-50"
          />
          <div className="absolute inset-0 bg-darkblue bg-opacity-70 flex items-center justify-center">
            <div className="text-center text-white px-4">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">{interestsData.hero.title}</h1>
              <p className="text-xl mb-8 max-w-2xl mx-auto">
                {interestsData.hero.description}
              </p>
              <a 
                href={interestsData.hero.buttonLink} 
                className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark transition-colors shadow-md"
              >
                {interestsData.hero.buttonText}
              </a>
            </div>
          </div>
        </div>
      </section>
      
      {/* Introduction Section */}
      <section className="py-16 bg-darkblue-light">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-8 text-white">{interestsData.introduction.title}</h2>
            <div className="prose prose-lg text-gray-200">
              {interestsData.introduction.paragraphs.map((paragraph, index) => (
                <p key={index} className="mb-4">
                  {paragraph}
                </p>
              ))}
            </div>
            
            <div className="mt-12">
              <h2 id="interests" className="text-3xl font-bold text-white" 
                  dangerouslySetInnerHTML={{ __html: interestsData.introduction.sectionTitle }}>
              </h2>
            </div>
          </div>
        </div>
      </section>
      
      <InterestSection />
      <Contact />
    </div>
  );
}

export default Interests;