import React from 'react';
import { Link } from 'react-router-dom';

function Hero() {
  return (
    <section className="bg-darkblue py-20">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-3/5 mb-10 md:mb-0">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight text-white">
              Tomorrow Looks Better Because We're{' '}
              <span className="text-primary">Here to Help You </span>
              Choose Your Career Track.
            </h1>
            <p className="text-gray-300 mb-8 text-lg">
              Discover your perfect career path with personalized guidance and expert resources.
            </p>
            <div className="flex space-x-4">
              <a href="#about" className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark transition-colors shadow-md">
                Learn More
              </a>
              <Link to="/interests" className="bg-transparent text-white border border-white px-6 py-3 rounded-lg hover:bg-darkblue-light transition-colors shadow-md">
                Explore Careers
              </Link>
            </div>
          </div>
          <div className="md:w-2/5">
            <div className="bg-darkblue-light p-6 rounded-lg shadow-lg transform rotate-3 hover:rotate-0 transition-transform duration-300">
              <img 
                src="/src/assets/stem.png" 
                alt="Career guidance" 
                className="rounded-lg"
              />
            </div>
          </div>
        </div>
        <div className="text-center mt-16 animate-bounce">
          <a href="#about" className="inline-block">
            <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}

export default Hero;