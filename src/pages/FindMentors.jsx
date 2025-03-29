import React, { useState, useEffect } from 'react';
import mentorData from '../data/mentors.json';

function FindMentors() {
  const [mentors, setMentors] = useState([]);
  const [filteredMentors, setFilteredMentors] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [priceFilter, setPriceFilter] = useState('all');

  useEffect(() => {
    // Load mentor data
    setMentors(mentorData);
    setFilteredMentors(mentorData);
  }, []);

  useEffect(() => {
    // Filter mentors based on search term and price filter
    let results = mentors;
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      results = results.filter(mentor => 
        mentor.name.toLowerCase().includes(term) || 
        mentor.expertise.some(skill => skill.toLowerCase().includes(term)) ||
        mentor.qualification.toLowerCase().includes(term)
      );
    }
    
    // Apply price filter
    if (priceFilter !== 'all') {
      const [min, max] = priceFilter.split('-').map(Number);
      if (max) {
        results = results.filter(mentor => mentor.price >= min && mentor.price <= max);
      } else {
        results = results.filter(mentor => mentor.price >= min);
      }
    }
    
    setFilteredMentors(results);
  }, [searchTerm, priceFilter, mentors]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handlePriceFilter = (e) => {
    setPriceFilter(e.target.value);
  };

  // Default placeholder image for all mentors
  const defaultImage = "https://via.placeholder.com/400x250?text=Mentor";

  console.log("Rendering FindMentors with", filteredMentors.length, "mentors");

  return (
    <div className="bg-darkblue min-h-screen py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-white mb-2 text-center">Find Your Perfect Mentor</h1>
        <p className="text-gray-300 text-center mb-10 max-w-2xl mx-auto">Connect with experienced professionals who can guide you through your career journey</p>
        
        {/* Search and Filter Section */}
        <div className="bg-gradient-to-r from-secondary to-secondary-light p-6 rounded-xl shadow-xl mb-12 max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search by name, expertise, or qualification..."
                className="w-full p-4 pl-10 rounded-lg bg-secondary-dark text-white border border-gray-600 focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 focus:outline-none transition-all"
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>
            
            <div className="md:w-56">
              <select
                className="w-full p-4 rounded-lg bg-secondary-dark text-white border border-gray-600 focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 focus:outline-none transition-all appearance-none"
                value={priceFilter}
                onChange={handlePriceFilter}
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23ffffff'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1.5em 1.5em', paddingRight: '3rem' }}
              >
                <option value="all">All Prices</option>
                <option value="0-60">Under $60</option>
                <option value="60-80">$60 - $80</option>
                <option value="80-100">$80 - $100</option>
                <option value="100">$100+</option>
              </select>
            </div>
          </div>
        </div>
        
        {/* Mentors List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredMentors.length > 0 ? (
            filteredMentors.map(mentor => (
              <div key={mentor.id} className="bg-gradient-to-b from-secondary-light to-secondary rounded-2xl overflow-hidden shadow-2xl transform transition duration-300 hover:scale-105 hover:shadow-primary/20 flex flex-col h-full">
                <div className="relative h-64 overflow-hidden">
                  <img 
                    src={mentor.photo} 
                    alt={mentor.name}
                    className="object-cover w-full h-full transition-transform duration-700 hover:scale-110"
                  />
                  <div className="absolute top-4 right-4 flex items-center bg-primary text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
                    <span className="mr-1">★</span>
                    {mentor.rating}
                  </div>
                </div>
                
                <div className="p-6 flex-grow flex flex-col">
                  <h2 className="text-2xl font-bold text-white mb-2">{mentor.name}</h2>
                  <p className="text-gray-300 mb-4 text-sm">{mentor.qualification}</p>
                  
                  <div className="mb-5">
                    <h3 className="text-primary font-semibold mb-2 text-sm uppercase tracking-wider">Expertise</h3>
                    <div className="flex flex-wrap gap-2">
                      {mentor.expertise.map((skill, index) => (
                        <span 
                          key={index}
                          className="bg-secondary-dark text-gray-300 px-3 py-1 rounded-full text-xs"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <h3 className="text-primary font-semibold mb-1 text-sm uppercase tracking-wider">Experience</h3>
                    <p className="text-gray-300 text-sm">{mentor.experience}</p>
                  </div>
                  
                  <div className="mt-auto">
                    <div className="flex justify-between items-center pt-4 border-t border-gray-700">
                      <div className="text-white font-bold text-xl">
                        ${mentor.price}<span className="text-gray-400 font-normal text-sm">/session</span>
                      </div>
                      <button className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg transition-colors font-semibold shadow-md hover:shadow-lg flex items-center">
                        <span>Book Session</span>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center text-white py-16">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 2a10 10 0 110 20 10 10 0 010-20z" />
              </svg>
              <h2 className="text-2xl font-bold mb-2">No mentors found</h2>
              <p className="text-gray-400">Try adjusting your search criteria</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default FindMentors; 