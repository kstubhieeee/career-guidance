import React, { useState, useEffect } from 'react';
import InterestSection from '../components/InterestSection';
import Contact from '../components/Contact';
import Footer from '../components/Footer';

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
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-10 w-10 rounded-full bg-darkblue"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!interestsData) {
    return null;
  }

  return (
    <div className="bg-darkblue font-sans">
      {/* Hero Section with improved visual styling */}
      <section className="relative">
        <div className="h-[500px] overflow-hidden">
          <img 
            src={interestsData.hero.backgroundImage} 
            alt="Career guidance" 
            className="w-full h-full object-cover opacity-40 transform scale-105 filter blur-sm"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-darkblue/80 via-darkblue/70 to-darkblue flex items-center justify-center">
            <div className="text-center text-white px-4 max-w-4xl mx-auto">
              <h1 className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary-light to-primary">
                {interestsData.hero.title}
              </h1>
              <p className="text-xl md:text-2xl mb-10 max-w-3xl mx-auto font-light leading-relaxed">
                {interestsData.hero.description}
              </p>
              <a 
                href={interestsData.hero.buttonLink} 
                className="bg-primary text-white px-8 py-4 rounded-full hover:bg-primary-dark transition-all duration-300 shadow-lg transform hover:scale-105 font-medium text-lg inline-flex items-center"
              >
                {interestsData.hero.buttonText}
                <svg className="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </section>
      
      {/* Introduction Section with improved typography */}
      <section className="py-20 bg-darkblue-light relative">
        <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-darkblue to-darkblue-light"></div>
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-10 text-white relative inline-block">
              {interestsData.introduction.title}
              <span className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-20 h-1 bg-primary rounded-full"></span>
            </h2>
            <div className="prose prose-lg text-gray-200 max-w-full">
              {interestsData.introduction.paragraphs.map((paragraph, index) => (
                <p key={index} className="mb-6 text-xl leading-relaxed font-light">
                  {paragraph}
                </p>
              ))}
            </div>
            
            <div className="mt-16">
              <h2 id="interests" 
                  className="text-4xl font-extrabold text-white mb-6 leading-tight" 
                  dangerouslySetInnerHTML={{ __html: interestsData.introduction.sectionTitle }}>
              </h2>
              <p className="text-gray-300 text-lg mb-6">Click on a field below to explore careers that might interest you</p>
            </div>
          </div>
        </div>
      </section>
      
      <InterestSection />
      <Contact />
      <Footer />
    </div>
  );
}

export default Interests;