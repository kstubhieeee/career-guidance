import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

function MentorBookingModal({ mentor, onClose, onSuccess }) {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [notes, setNotes] = useState('');
  const [sessionType, setSessionType] = useState('video');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    // Set minimum date to today
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    document.getElementById('session-date').min = formattedDate;
    
    // Add Razorpay script to the document if needed
    if (!window.Razorpay) {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.body.appendChild(script);
      
      return () => {
        // Only remove it if we added it
        if (document.body.contains(script)) {
          document.body.removeChild(script);
        }
      };
    }
  }, []);

  const isFormValid = () => {
    return date && time && sessionType;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Reset error message
    setErrorMessage('');
    
    if (!currentUser) {
      toast.error('Please login to book a session');
      navigate('/login');
      return;
    }
    
    if (!isFormValid()) {
      toast.error('Please fill all required fields');
      return;
    }
    
    setLoading(true);
    
    try {
      const sessionData = {
        mentorId: mentor._id || mentor.id,
        mentorName: mentor.name,
        sessionDate: date,
        sessionTime: time,
        sessionType,
        notes,
        price: mentor.price,
        status: 'pending',
        createdAt: new Date().toISOString()
      };
      
      // Make sure the mentorId is a valid MongoDB ID if sending to API
      if (!/^[0-9a-fA-F]{24}$/.test(sessionData.mentorId)) {
        console.warn('mentorId is not a valid MongoDB ObjectId:', sessionData.mentorId);
        // Since we're using demo data, use a placeholder MongoDB ID format
        sessionData.mentorId = '000000000000000000000000';
      }
      
      // Make sure we have a valid key
      const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_ilZnoyJIDqrWYR';
      
      // For development/testing - simulate payment success if needed
      const simulatePaymentSuccess = !window.Razorpay || !razorpayKey;
      
      if (simulatePaymentSuccess) {
        console.log('Simulating successful payment for testing purposes');
        
        // Simulate successful payment
        const mockPaymentId = 'pay_' + Math.random().toString(36).substring(2, 15);
        
        // Save session booking with payment details
        try {
          // Create the new booking data
          const newBooking = {
            ...sessionData,
            paymentId: mockPaymentId,
            status: 'confirmed',
          };
          
          console.log('Sending booking data to API:', newBooking);
          
          // Send to the backend API
          const bookingResponse = await fetch('http://localhost:3250/api/sessions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(newBooking),
            credentials: 'include'
          });
          
          let errorData;
          try {
            errorData = await bookingResponse.json();
          } catch (parseError) {
            console.error('Error parsing API response:', parseError);
            throw new Error('Failed to parse server response. Please try again later.');
          }
          
          if (!bookingResponse.ok) {
            console.error('API error response:', errorData);
            throw new Error(errorData.message || 'Failed to book session. Please try again.');
          }
          
          console.log('Booking saved successfully:', errorData);
          
          // Show success message
          toast.success('Session booked successfully! (Test Mode)');
          
          // Close modal and refresh mentor list
          onSuccess(errorData.session);
          return;
        } catch (error) {
          console.error('Error in test mode:', error);
          setErrorMessage(error.message || 'Error saving your booking. Please try again later.');
          toast.error(error.message || 'Error saving your booking. Please contact support.');
          setLoading(false);
          return;
        }
      }
      
      if (!razorpayKey) {
        throw new Error('Razorpay key is not configured');
      }
      
      // Initialize Razorpay payment
      const options = {
        key: razorpayKey, // Use the key we confirmed above
        amount: mentor.price * 100, // Razorpay expects amount in smallest currency unit (paise)
        currency: "INR",
        name: "Career Guidant",
        description: `Mentorship Session with ${mentor.name}`,
        image: "https://example.com/logo.png", // Use a generic logo instead of mentor photo which might cause issues
        handler: async function(response) {
          // Payment was successful
          const paymentId = response.razorpay_payment_id;
          
          // Save session booking with payment details
          try {
            // Create the new booking data
            const newBooking = {
              ...sessionData,
              paymentId,
              status: 'confirmed',
            };
            
            console.log('Razorpay payment successful, sending booking data to API:', newBooking);
            
            // Send to the backend API
            const bookingResponse = await fetch('http://localhost:3250/api/sessions', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(newBooking),
              credentials: 'include'
            });
            
            let errorData;
            try {
              errorData = await bookingResponse.json();
            } catch (parseError) {
              console.error('Error parsing API response:', parseError);
              throw new Error('Failed to parse server response. Please try again later.');
            }
            
            if (!bookingResponse.ok) {
              console.error('API error response:', errorData);
              throw new Error(errorData.message || 'Failed to book session. Please try again.');
            }
            
            console.log('Booking saved successfully:', errorData);
            
            // Show success message
            toast.success('Session booked successfully!');
            
            // Close modal and refresh mentor list
            onSuccess(errorData.session);
          } catch (error) {
            console.error('Error saving booking:', error);
            setErrorMessage(error.message || 'Error saving your booking. Please try again later.');
            toast.error(error.message || 'Error saving your booking. Please contact support.');
            setLoading(false);
          }
        },
        prefill: {
          name: `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim(),
          email: currentUser.email || '',
          contact: currentUser.phone || ''
        },
        theme: {
          color: "#6366f1" // Primary color
        },
        modal: {
          ondismiss: function() {
            setLoading(false);
          }
        }
      };
      
      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error('Error initiating payment:', error);
      console.log('Razorpay key used:', razorpayKey);
      console.log('Environment variables:', import.meta.env);
      setErrorMessage(error.message || 'Failed to initiate payment. Please try again.');
      toast.error('Failed to initiate payment. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-darkblue bg-opacity-80 flex items-center justify-center z-50 overflow-y-auto p-4">
      <div className="relative bg-darkblue-light border border-gray-700 rounded-xl shadow-xl max-w-3xl w-full mx-auto p-6 animate-fadeIn">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <div className="flex flex-col md:flex-row gap-8">
          {/* Mentor Info */}
          <div className="md:w-1/3">
            <div className="aspect-square rounded-lg overflow-hidden mb-4">
              <img 
                src={mentor.photo} 
                alt={mentor.name} 
                className="w-full h-full object-cover"
              />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">{mentor.name}</h2>
            <p className="text-gray-300 text-sm mb-2">{mentor.qualification}</p>
            
            <div className="flex items-center mb-4">
              <span className="mr-1 text-yellow-400">★</span>
              <span className="text-white font-semibold">{mentor.rating}</span>
              <span className="text-gray-400 text-sm ml-1">({mentor.sessions || 0} sessions)</span>
            </div>
            
            <div className="text-white font-bold text-xl mb-4">
              ₹{mentor.price}<span className="text-gray-400 font-normal text-sm">/session</span>
            </div>
            
            <div className="bg-darkblue rounded-lg p-4">
              <h3 className="text-primary font-semibold mb-2 text-sm uppercase tracking-wider">Expertise</h3>
              <div className="flex flex-wrap gap-2">
                {mentor.expertise.map((skill, index) => (
                  <span 
                    key={index}
                    className="bg-secondary-dark text-gray-300 px-2 py-1 rounded-full text-xs"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
          
          {/* Booking Form */}
          <div className="md:w-2/3">
            <h3 className="text-2xl font-bold text-white mb-6">Book a Session</h3>
            
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label htmlFor="session-date" className="block text-white text-sm font-medium mb-2">
                    Date *
                  </label>
                  <input
                    id="session-date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full p-3 rounded-lg bg-darkblue border border-gray-600 text-white focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 focus:outline-none"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="session-time" className="block text-white text-sm font-medium mb-2">
                    Time *
                  </label>
                  <select
                    id="session-time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full p-3 rounded-lg bg-darkblue border border-gray-600 text-white focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 focus:outline-none appearance-none"
                    required
                  >
                    <option value="">Select a time</option>
                    <option value="09:00">9:00 AM</option>
                    <option value="10:00">10:00 AM</option>
                    <option value="11:00">11:00 AM</option>
                    <option value="12:00">12:00 PM</option>
                    <option value="13:00">1:00 PM</option>
                    <option value="14:00">2:00 PM</option>
                    <option value="15:00">3:00 PM</option>
                    <option value="16:00">4:00 PM</option>
                    <option value="17:00">5:00 PM</option>
                    <option value="18:00">6:00 PM</option>
                  </select>
                </div>
              </div>
              
              <div className="mb-6">
                <label className="block text-white text-sm font-medium mb-2">
                  Session Type *
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <label className={`p-3 rounded-lg border ${sessionType === 'video' ? 'border-primary bg-primary bg-opacity-10' : 'border-gray-600 bg-darkblue'} cursor-pointer transition-all duration-200`}>
                    <input
                      type="radio"
                      name="session-type"
                      value="video"
                      checked={sessionType === 'video'}
                      onChange={() => setSessionType('video')}
                      className="sr-only"
                    />
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      <div className="text-white">Video Call</div>
                    </div>
                  </label>
                  
                  <label className={`p-3 rounded-lg border ${sessionType === 'audio' ? 'border-primary bg-primary bg-opacity-10' : 'border-gray-600 bg-darkblue'} cursor-pointer transition-all duration-200`}>
                    <input
                      type="radio"
                      name="session-type"
                      value="audio"
                      checked={sessionType === 'audio'}
                      onChange={() => setSessionType('audio')}
                      className="sr-only"
                    />
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <div className="text-white">Audio Call</div>
                    </div>
                  </label>
                  
                  <label className={`p-3 rounded-lg border ${sessionType === 'chat' ? 'border-primary bg-primary bg-opacity-10' : 'border-gray-600 bg-darkblue'} cursor-pointer transition-all duration-200`}>
                    <input
                      type="radio"
                      name="session-type"
                      value="chat"
                      checked={sessionType === 'chat'}
                      onChange={() => setSessionType('chat')}
                      className="sr-only"
                    />
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      <div className="text-white">Chat</div>
                    </div>
                  </label>
                </div>
              </div>
              
              <div className="mb-6">
                <label htmlFor="session-notes" className="block text-white text-sm font-medium mb-2">
                  Notes for Mentor (Optional)
                </label>
                <textarea
                  id="session-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Share what topics you'd like to discuss"
                  className="w-full p-3 rounded-lg bg-darkblue border border-gray-600 text-white focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 focus:outline-none min-h-[100px]"
                ></textarea>
              </div>
              
              <div className="bg-darkblue p-4 rounded-lg border border-gray-700 mb-6">
                <div className="flex justify-between items-center text-white mb-2">
                  <span>Session Fee</span>
                  <span>₹{mentor.price}</span>
                </div>
                <div className="flex justify-between items-center text-white font-bold">
                  <span>Total</span>
                  <span>₹{mentor.price}</span>
                </div>
              </div>
              
              {errorMessage && (
                <div className="mb-4 p-3 bg-red-900 bg-opacity-20 border border-red-500 rounded-lg text-red-400 text-sm">
                  <div className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <span>{errorMessage}</span>
                  </div>
                </div>
              )}
              
              <button
                type="submit"
                disabled={loading || !isFormValid()}
                className="w-full bg-primary hover:bg-primary-dark text-white py-3 px-6 rounded-lg font-semibold transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" width="20" height="20">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  <>Proceed to Pay ₹{mentor.price}</>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MentorBookingModal; 