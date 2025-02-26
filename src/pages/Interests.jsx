import React from 'react';
import InterestSection from '../components/InterestSection';
import Contact from '../components/Contact';

function Interests() {
  return (
    <div className="bg-darkblue">
      {/* Hero Section */}
      <section className="relative">
        <div className="h-96 overflow-hidden">
          <img 
            src="/src/assets/Images/pexels-photo-2080963.jpeg" 
            alt="Career guidance" 
            className="w-full h-full object-cover opacity-50"
          />
          <div className="absolute inset-0 bg-darkblue bg-opacity-70 flex items-center justify-center">
            <div className="text-center text-white px-4">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Discover Your Career Path</h1>
              <p className="text-xl mb-8 max-w-2xl mx-auto">
                Explore different career fields based on your interests and skills
              </p>
              <a 
                href="#interests" 
                className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark transition-colors shadow-md"
              >
                Explore Careers
              </a>
            </div>
          </div>
        </div>
      </section>
      
      {/* Introduction Section */}
      <section className="py-16 bg-darkblue-light">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-8 text-white">Understanding Your Career Interests</h2>
            <div className="prose prose-lg text-gray-200">
              <p className="mb-4">
                Career interests are your preferences regarding work activities and environment. 
                Identifying your career interest helps you make a well-informed and more strategic 
                decision on your career path.
              </p>
              <p className="mb-4">
                Following your career interest means you are pursuing a career that uses your 
                talents and aligns with your passion and preferences. Understanding and being able 
                to determine your passion helps you find fulfillment and success in your chosen profession.
              </p>
              <p>
                In this webpage we provide tools that will enable you make the right career decisions.
              </p>
            </div>
            
            <div className="mt-12">
              <h2 id="interests" className="text-3xl font-bold text-white">
                Let us know <span className="text-primary">about your interests....</span>
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