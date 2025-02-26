import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function Hero() {
  const [heroData, setHeroData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Import the data
    import('../data/heroData.json')
      .then(data => {
        setHeroData(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error loading hero data:', error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <section className="bg-darkblue py-20">
        <div className="container mx-auto px-4 flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </section>
    );
  }

  if (!heroData) {
    return null;
  }

  return (
    <section className="bg-darkblue py-20">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-3/5 mb-10 md:mb-0">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight text-white"
                dangerouslySetInnerHTML={{ __html: heroData.title }}>
            </h1>
            <p className="text-gray-300 mb-8 text-lg">
              {heroData.subtitle}
            </p>
            <div className="flex space-x-4">
              {heroData.buttons.map((button, index) => (
                button.link.startsWith('#') ? (
                  <a 
                    key={index}
                    href={button.link} 
                    className={`${button.primary 
                      ? 'bg-primary text-white hover:bg-primary-dark' 
                      : 'bg-transparent text-white border border-white hover:bg-darkblue-light'} 
                      px-6 py-3 rounded-lg transition-colors shadow-md`}
                  >
                    {button.text}
                  </a>
                ) : (
                  <Link 
                    key={index}
                    to={button.link} 
                    className={`${button.primary 
                      ? 'bg-primary text-white hover:bg-primary-dark' 
                      : 'bg-transparent text-white border border-white hover:bg-darkblue-light'} 
                      px-6 py-3 rounded-lg transition-colors shadow-md`}
                  >
                    {button.text}
                  </Link>
                )
              ))}
            </div>
          </div>
          <div className="md:w-2/5">
            <div className="bg-darkblue-light p-6 rounded-lg shadow-lg transform rotate-3 hover:rotate-0 transition-transform duration-300">
              <img 
                src={heroData.image} 
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