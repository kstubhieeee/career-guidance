import React from 'react';
import { Link } from 'react-router-dom';

function About() {
  return (
    <section id="about" className="py-20 bg-darkblue-light">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">WHO WE ARE</h2>
          <div className="w-20 h-1 bg-primary mx-auto mb-8"></div>
        </div>
        
        <div className="max-w-3xl mx-auto text-center mb-12">
          <p className="text-xl text-gray-200 leading-relaxed mb-8">
            We are <span className="text-primary font-bold">Guidant</span>, a career guidance platform dedicated to helping students make informed decisions about their future. Our mission is to provide comprehensive career information, personalized assessments, and expert guidance to help you choose the right career path.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4">
            <div className="w-full md:w-1/3 p-4">
              <div className="bg-darkblue rounded-lg shadow-md p-6 h-full hover:shadow-lg transition-shadow border border-gray-700">
                <div className="text-primary text-4xl mb-4">
                  <i className="fas fa-search"></i>
                </div>
                <h3 className="text-xl font-bold mb-2 text-white">Discover</h3>
                <p className="text-gray-300">Explore various career options based on your interests and skills</p>
              </div>
            </div>
            
            <div className="w-full md:w-1/3 p-4">
              <div className="bg-darkblue rounded-lg shadow-md p-6 h-full hover:shadow-lg transition-shadow border border-gray-700">
                <div className="text-primary text-4xl mb-4">
                  <i className="fas fa-clipboard-check"></i>
                </div>
                <h3 className="text-xl font-bold mb-2 text-white">Assess</h3>
                <p className="text-gray-300">Take personalized assessments to understand your strengths</p>
              </div>
            </div>
            
            <div className="w-full md:w-1/3 p-4">
              <div className="bg-darkblue rounded-lg shadow-md p-6 h-full hover:shadow-lg transition-shadow border border-gray-700">
                <div className="text-primary text-4xl mb-4">
                  <i className="fas fa-graduation-cap"></i>
                </div>
                <h3 className="text-xl font-bold mb-2 text-white">Succeed</h3>
                <p className="text-gray-300">Get guidance on educational paths and career development</p>
              </div>
            </div>
          </div>
          
          <div className="mt-12">
            <Link to="/interests" className="bg-primary text-white px-8 py-3 rounded-lg hover:bg-primary-dark transition-colors shadow-md text-lg">
              Let's Begin
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default About;