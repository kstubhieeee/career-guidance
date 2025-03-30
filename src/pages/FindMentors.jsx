import React, { useState, useEffect } from 'react';
import mentorData from '../data/mentors.json';
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
  const { currentUser } = useAuth();

  // Add state for environment variables
  const [envVars] = useState({
    razorpayKeyId: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_ilZnoyJIDqrWYR'
  });

  const navigate = useNavigate();

  // Fallback image - base64 encoded simple placeholder (light gray with person icon)
  const fallbackImageBase64 = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjUwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjUwMCIgZmlsbD0iIzM0NDk2NCIvPjxjaXJjbGUgY3g9IjIwMCIgY3k9IjE3MCIgcj0iNzAiIGZpbGw9IiM2NTc3OWEiLz48cmVjdCB4PSIxMDAiIHk9IjI3MCIgd2lkdGg9IjIwMCIgaGVpZ2h0PSIxNTAiIHJ4PSI1MCIgZmlsbD0iIzY1Nzc5YSIvPjx0ZXh0IHg9IjIwMCIgeT0iNDUwIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5NZW50b3I8L3RleHQ+PC9zdmc+';

  // Professional headshot images from Unsplash
  const professionalPhotos = {
    men: [
      'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=870&q=80', // Man with glasses
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=774&q=80', // Man with white shirt
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=774&q=80', // Smiling man
      'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=774&q=80', // Professional man
      'https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=774&q=80', // Businessman with briefcase
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=870&q=80', // Man in glasses
      'https://images.unsplash.com/photo-1531891437562-4301cf35b7e4?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=764&q=80', // Young professional man
      'https://images.unsplash.com/photo-1564564321837-a57b7070ac4f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1176&q=80', // Man in suit
      'https://images.unsplash.com/photo-1566492031773-4f4e44671857?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=774&q=80', // Asian man professional
      'https://images.unsplash.com/photo-1514222709107-a180c68d72b4?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=898&q=80', // Man with beard
      'https://images.unsplash.com/photo-1544348817-5f2cf14b88c8?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=774&q=80', // Middle-aged professional man
      'https://images.unsplash.com/photo-1624561172888-ac93c696e10c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=778&q=80' // Black man in glasses
    ],
    women: [
      'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=774&q=80', // Professional woman
      'https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=761&q=80', // Smiling woman
      'https://images.unsplash.com/photo-1598550880863-4e8aa3d0edb4?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=774&q=80', // Professional Asian woman
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=776&q=80', // Woman portrait
      'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=774&q=80', // Woman in blue
      'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80', // Professional woman smiling
      'https://images.unsplash.com/photo-1548142813-c348350df52b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=778&q=80', // Woman with red hair
      'https://images.unsplash.com/photo-1601288496920-b6154fe3626a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=774&q=80', // Professional Black woman
      'https://images.unsplash.com/photo-1619525594029-b405f61a4461?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=774&q=80', // Woman with curly hair
      'https://images.unsplash.com/photo-1581403341630-a6e0b9d2d257?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=774&q=80', // Professional woman in suit
      'https://images.unsplash.com/photo-1589156229687-496a31ad1d1f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=772&q=80', // Woman in blue background
      'https://images.unsplash.com/photo-1618835962148-cf177563c6c0?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=774&q=80' // Woman with glasses
    ]
  };

  // Specific mentor image mapping
  const mentorSpecificImages = {
    "Thomas Wilson": "https://images.unsplash.com/photo-1545167622-3a6ac756afa4?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=712&q=80", // Professional mature man
    "Daniel Lee": "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1148&q=80", // Asian man smiling
    "Omar Hassan": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=774&q=80", // Middle Eastern man
    "Raj Patel": "https://images.unsplash.com/photo-1563833717765-00462801314e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=774&q=80", // Indian man with glasses
    "Sophia Williams": "https://images.unsplash.com/photo-1534751516642-a1af1ef26a56?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=778&q=80", // Professional woman smiling
    "Carlos Mendoza": "https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80", // Latino professional man
    "Dr. Sarah Johnson": "https://images.unsplash.com/photo-1594824476967-48c8b964273f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=774&q=80", // Professional female doctor with stethoscope
  };

  useEffect(() => {
    // Load mentor data and add professional photo URLs
    const mentorsWithPhotos = mentorData.map(mentor => {
      try {
        // Check if this mentor has a specific image assigned
        if (mentorSpecificImages[mentor.name]) {
          const imageUrl = mentorSpecificImages[mentor.name];
          // Add image size parameters to URL for optimization
          const optimizedImageUrl = imageUrl.includes('unsplash.com') ?
            `${imageUrl}&auto=format&fit=crop&w=600&h=800&q=80&crop=faces,center` :
            imageUrl;

          return {
            ...mentor,
            photo: optimizedImageUrl
          };
        }

        // Fallback to gender-based selection for other mentors
        const isMale = mentor.name.includes('Dr.') && !mentor.name.includes('Amelia') ||
          mentor.name.includes('Michael') ||
          mentor.name.includes('James') ||
          mentor.name.includes('David');

        const gender = isMale ? 'men' : 'women';

        // Use mentor ID modulo the array length to get a consistent image for each mentor
        const photoIndex = (mentor.id - 1) % professionalPhotos[gender].length;
        const imageUrl = professionalPhotos[gender][photoIndex];

        // Add image size parameters to URL for optimization
        const optimizedImageUrl = imageUrl.includes('unsplash.com') ?
          `${imageUrl}&auto=format&fit=crop&w=600&h=800&q=80&crop=faces,center` :
          imageUrl;

        return {
          ...mentor,
          photo: optimizedImageUrl
        };
      } catch (e) {
        console.error("Error selecting photo for mentor", mentor.id, e);
        return {
          ...mentor,
          photo: fallbackImageBase64
        };
      }
    });

    // Save mentors to localStorage for rating system to use
    localStorage.setItem('mentors', JSON.stringify(mentorsWithPhotos));

    setMentors(mentorsWithPhotos);
    setFilteredMentors(mentorsWithPhotos);
  }, []);

  useEffect(() => {
    // Filter mentors based on search term, price filter, and rating filter
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
    // Load Razorpay script if not already loaded
    if (!window.Razorpay) {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.body.appendChild(script);
    }
  };

  const handleBookingSuccess = (booking) => {
    setSelectedMentor(null);
    toast.success(
      <div>
        Booking confirmed with {booking.mentorName}!
        <button
          onClick={() => navigate('/my-bookings')}
          className="ml-2 underline text-primary-light hover:text-primary"
        >
          View Bookings
        </button>
      </div>
    );
  };

  const closeBookingModal = () => {
    setSelectedMentor(null);
  };

  return (
    <>
      <div className={`bg-darkblue min-h-screen py-12 ${selectedMentor ? 'blur-sm pointer-events-none overflow-hidden' : ''}`}>
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-white mb-2 text-center">Find Your Perfect Mentor</h1>
          <p className="text-gray-300 text-center mb-10 max-w-2xl mx-auto">Connect with experienced professionals who can guide you through your career journey</p>

          {/* Search and Filter Section */}
          <div className="bg-gradient-to-r from-secondary to-secondary-light p-6 rounded-xl shadow-xl mb-12 max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
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
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-white text-sm font-medium mb-2">Price Range</label>
                <select
                  className="w-full p-3 rounded-lg bg-secondary-dark text-white border border-gray-600 focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 focus:outline-none transition-all appearance-none"
                  value={priceFilter}
                  onChange={handlePriceFilter}
                  style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23ffffff'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1.5em 1.5em', paddingRight: '3rem' }}
                >
                  <option value="all">All Prices</option>
                  <option value="0-60">Under ₹60</option>
                  <option value="60-80">₹60 - ₹80</option>
                  <option value="80-100">₹80 - ₹100</option>
                  <option value="100">₹100+</option>
                </select>
              </div>

              <div>
                <label className="block text-white text-sm font-medium mb-2">Minimum Rating</label>
                <select
                  className="w-full p-3 rounded-lg bg-secondary-dark text-white border border-gray-600 focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 focus:outline-none transition-all appearance-none"
                  value={ratingFilter}
                  onChange={handleRatingFilter}
                  style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23ffffff'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1.5em 1.5em', paddingRight: '3rem' }}
                >
                  <option value="all">Any Rating</option>
                  <option value="4.8">4.8 & Above</option>
                  <option value="4.5">4.5 & Above</option>
                  <option value="4.0">4.0 & Above</option>
                  <option value="3.5">3.5 & Above</option>
                </select>
              </div>
            </div>
          </div>

          {/* Mentors List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredMentors.length > 0 ? (
              filteredMentors.map(mentor => (
                <div key={mentor.id} className="bg-gradient-to-b from-secondary-light to-secondary rounded-2xl overflow-hidden shadow-2xl transform transition duration-300 hover:scale-105 hover:shadow-primary/20 flex flex-col h-full">
                  <div className="relative h-72 md:h-80 overflow-hidden bg-gray-800 group">
                    <div className="absolute inset-0 bg-gray-900/20 z-10 group-hover:opacity-0 transition-opacity duration-300"></div>
                    <img
                      src={mentor.photo}
                      alt={mentor.name}
                      className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110 object-center"
                      loading="lazy"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = fallbackImageBase64;
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
                    <div className="absolute top-4 right-4 flex items-center bg-primary text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg z-10">
                      <span className="mr-1">★</span>
                      {mentor.rating}
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
                      <h2 className="text-2xl font-bold text-white mb-1 drop-shadow-md">{mentor.name}</h2>
                      <p className="text-gray-200 text-sm drop-shadow-md">{mentor.qualification}</p>
                    </div>
                  </div>

                  <div className="p-6 flex-grow flex flex-col">
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
                          ₹{mentor.price}<span className="text-gray-400 font-normal text-sm">/session</span>
                        </div>
                        <button
                          onClick={() => handleBookSession(mentor)}
                          className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg transition-colors font-semibold shadow-md hover:shadow-lg flex items-center"
                        >
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

      {/* Booking Modal */}
      {selectedMentor && (
        <MentorBookingModal
          mentor={selectedMentor}
          onClose={closeBookingModal}
          onSuccess={handleBookingSuccess}
        />
      )}

      {/* Toast notifications */}
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: '#333',
            color: '#fff',
            borderRadius: '8px'
          },
          success: {
            iconTheme: {
              primary: '#6366f1',
              secondary: '#fff',
            },
          },
        }}
      />

      <Footer />
    </>
  );
}

export default FindMentors; 