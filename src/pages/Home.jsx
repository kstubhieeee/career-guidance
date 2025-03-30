import React from 'react';
import Hero from '../components/Hero';
import About from '../components/About';
import Contact from '../components/Contact';
import Footer from '../components/Footer';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <div>
      <Hero />
      <div className="container mx-auto py-8 text-center">
        <Link to="/find-mentors" className="bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-lg text-lg font-semibold transition-colors inline-block">
          Find Mentors Now
        </Link>
      </div>
      <About />
      <Contact />
      <Footer />
    </div>
  );
}

export default Home;