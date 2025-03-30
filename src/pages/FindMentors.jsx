import React, { useState, useEffect } from 'react';
import Footer from '../components/Footer';
import MentorBookingModal from '../components/MentorBookingModal';
import { toast, Toaster } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function FindMentors() {
  const [mentors, setMentors] = useState([]);
  const [filteredMentors, setFilteredMentors] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [priceFilter, setPriceFilter] = useState('all');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser } = useAuth();

  // Add state for environment variables
  const [envVars] = useState({
    razorpayKeyId: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_ilZnoyJIDqrWYR'
  });

  const navigate = useNavigate();

  // Fallback image - base64 encoded simple placeholder (light gray with person icon)
  const fallbackImageBase64 = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjUwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjUwMCIgZmlsbD0iIzM0NDk2NCIvPjxjaXJjbGUgY3g9IjIwMCIgY3k9IjE3MCIgcj0iNzAiIGZpbGw9IiM2NTc3OWEiLz48cmVjdCB4PSIxMDAiIHk9IjI3MCIgd2lkdGg9IjIwMCIgaGVpZ2h0PSIxNTAiIHJ4PSI1MCIgZmlsbD0iIzY1Nzc5YSIvPjx0ZXh0IHg9IjIwMCIgeT0iNDUwIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5NZW50b3I8L3RleHQ+PC9zdmc+';

  useEffect(() => {
    // Fetch mentors from the API
    const fetchMentors = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch('http://localhost:3250/api/mentors');
        
        if (!response.ok) {
          throw new Error('Failed to fetch mentors');
        }
        
        const data = await response.json();
        
        // Process mentor data
        const processedMentors = data.mentors.map(mentor => ({
          ...mentor,
          photo: mentor.photoUrl || fallbackImageBase64,
          id: mentor._id
        }));
        
        setMentors(processedMentors);
        setFilteredMentors(processedMentors);
      } catch (err) {
        console.error('Error fetching mentors:', err);
        setError('Failed to load mentors. Please try again later.');
        
        // If API fails, use fallback data from localStorage if available
        const savedMentors = localStorage.getItem('mentors');
        if (savedMentors) {
          const parsedMentors = JSON.parse(savedMentors);
          setMentors(parsedMentors);
          setFilteredMentors(parsedMentors);
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchMentors();
  }, []);

  useEffect(() => {
    // Filter mentors based on search term, price filter, and rating filter
    let results = mentors;

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      results = results.filter(mentor =>
        mentor.firstName.toLowerCase().includes(term) ||
        mentor.lastName.toLowerCase().includes(term) ||
        `${mentor.firstName} ${mentor.lastName}`.toLowerCase().includes(term) ||
        (mentor.expertise && mentor.expertise.some(skill => skill.toLowerCase().includes(term))) ||
        (mentor.qualification && mentor.qualification.toLowerCase().includes(term))
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

    // Apply rating filter
    if (ratingFilter !== 'all') {
      const minRating = parseFloat(ratingFilter);
      results = results.filter(mentor => mentor.rating >= minRating);
    }

    setFilteredMentors(results);
  }, [searchTerm, priceFilter, ratingFilter, mentors]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handlePriceFilter = (e) => {
    setPriceFilter(e.target.value);
  };

  const handleRatingFilter = (e) => {
    setRatingFilter(e.target.value);
  };

  const handleBookSession = (mentor) => {
    if (!currentUser) {
      toast.error('Please log in to book a session with a mentor');
      navigate('/login');
      return;
    }

    setSelectedMentor(mentor);
  };

  const handleBookingSuccess = (booking) => {
    setSelectedMentor(null);
    toast.success(
      <div>
        Session request sent to {booking.mentorName}!
        <button
          onClick={() => navigate('/my-bookings')}
          className="ml-2 underline text-primary-light hover:text-primary"
        >
          View Requests
        </button>
      </div>
    );
  };

  const closeBookingModal = () => {
    setSelectedMentor(null);
  };

  return (
    <div className="bg-darkblue min-h-screen">
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-white mb-8 text-center">Find Your Mentor</h1>
        
        <div className="bg-darkblue-light p-6 rounded-lg shadow-lg mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="search" className="block text-white mb-2">Search Mentors</label>
              <input
                type="text"
                id="search"
                placeholder="Search by name, expertise or qualification"
                value={searchTerm}
                onChange={handleSearch}
                className="w-full p-2 bg-darkblue border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-primary focus:border-primary"
              />
            </div>
            
            <div>
              <label htmlFor="price" className="block text-white mb-2">Price Range</label>
              <select
                id="price"
                value={priceFilter}
                onChange={handlePriceFilter}
                className="w-full p-2 bg-darkblue border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-primary focus:border-primary"
              >
                <option value="all">All Prices</option>
                <option value="10-30">$10 - $30</option>
                <option value="30-50">$30 - $50</option>
                <option value="50-100">$50 - $100</option>
                <option value="100">$100+</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="rating" className="block text-white mb-2">Minimum Rating</label>
              <select
                id="rating"
                value={ratingFilter}
                onChange={handleRatingFilter}
                className="w-full p-2 bg-darkblue border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-primary focus:border-primary"
              >
                <option value="all">All Ratings</option>
                <option value="4.5">4.5+ Stars</option>
                <option value="4">4+ Stars</option>
                <option value="3.5">3.5+ Stars</option>
                <option value="3">3+ Stars</option>
              </select>
            </div>
          </div>
        </div>
        
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary mx-auto"></div>
            <p className="text-white mt-4">Loading mentors...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="bg-red-500 bg-opacity-20 border border-red-500 text-white p-4 rounded-md max-w-md mx-auto">
              <p>{error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="mt-4 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : filteredMentors.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-white text-xl">No mentors found matching your criteria.</p>
            <button 
              onClick={() => {
                setSearchTerm('');
                setPriceFilter('all');
                setRatingFilter('all');
              }}
              className="mt-4 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredMentors.map(mentor => (
              <div key={mentor.id} className="bg-darkblue-light rounded-xl overflow-hidden shadow-lg border border-gray-700 hover:border-primary transition-all duration-300 transform hover:-translate-y-1">
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={mentor.photo} 
                    alt={`${mentor.firstName} ${mentor.lastName}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = fallbackImageBase64;
                    }}
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-darkblue-dark to-transparent h-24"></div>
                  <div className="absolute top-2 right-2 bg-primary text-white px-2 py-1 rounded text-sm">
                    ${mentor.price}/session
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-white">{mentor.firstName} {mentor.lastName}</h3>
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                      </svg>
                      <span className="text-white ml-1">{mentor.rating.toFixed(1)}</span>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-300 mb-4">{mentor.qualification}</p>
                  
                  <div className="mb-4">
                    <h4 className="text-white font-medium mb-2">Expertise</h4>
                    <div className="flex flex-wrap gap-2">
                      {mentor.expertise && mentor.expertise.map((skill, index) => (
                        <span key={index} className="bg-secondary-dark text-white px-2 py-1 rounded-full text-xs">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <h4 className="text-white font-medium mb-2">About</h4>
                    <p className="text-sm text-gray-300 line-clamp-3">{mentor.bio}</p>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300 text-sm">
                      {mentor.sessionsCompleted} {mentor.sessionsCompleted === 1 ? 'session' : 'sessions'} completed
                    </span>
                    <button 
                      onClick={() => handleBookSession(mentor)}
                      className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark transition-colors"
                    >
                      Book Session
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {selectedMentor && (
        <MentorBookingModal
          mentor={selectedMentor}
          onClose={() => setSelectedMentor(null)}
          onSuccess={handleBookingSuccess}
          razorpayKeyId={envVars.razorpayKeyId}
        />
      )}
      
      <Footer />
      <Toaster position="bottom-center" />
    </div>
  );
}

export default FindMentors; 