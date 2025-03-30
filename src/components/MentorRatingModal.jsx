import React, { useState } from 'react';
import { toast } from 'react-hot-toast';

function MentorRatingModal({ booking, onClose, onSubmit }) {
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (rating < 1) {
      toast.error('Please select a rating');
      return;
    }

    setSubmitting(true);

    try {
      // Call the onSubmit function which now handles the API call in the parent component
      await onSubmit(rating, feedback);
      toast.success('Thank you for your feedback!');
    } catch (error) {
      console.error('Error submitting rating:', error);
      toast.error('Failed to submit rating. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-darkblue bg-opacity-80 flex items-center justify-center z-50 p-4">
      <div className="bg-darkblue-light border border-gray-700 rounded-xl shadow-xl max-w-md w-full mx-auto p-6 animate-fadeIn">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-white">Rate Your Session</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-6">
          <p className="text-gray-300 mb-2">Session with <span className="text-white font-medium">{booking.mentorName}</span></p>
          <p className="text-gray-300 text-sm">
            {new Date(booking.sessionDate).toLocaleDateString()} at {booking.sessionTime}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-white text-sm font-medium mb-3">
              How would you rate your session?
            </label>
            <div className="flex justify-center mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="text-3xl px-1 focus:outline-none"
                >
                  <span className={star <= rating ? 'text-yellow-400' : 'text-gray-600'}>★</span>
                </button>
              ))}
            </div>
            <div className="text-center text-sm text-gray-400 mb-4">
              {rating === 1 && 'Poor'}
              {rating === 2 && 'Fair'}
              {rating === 3 && 'Good'}
              {rating === 4 && 'Very Good'}
              {rating === 5 && 'Excellent'}
            </div>
          </div>

          <div className="mb-6">
            <label htmlFor="feedback" className="block text-white text-sm font-medium mb-2">
              Your Feedback (Optional)
            </label>
            <textarea
              id="feedback"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Share your experience with this mentor..."
              className="w-full p-3 rounded-lg bg-darkblue border border-gray-600 text-white focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 focus:outline-none min-h-[100px]"
            ></textarea>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-primary hover:bg-primary-dark text-white py-3 px-6 rounded-lg font-semibold transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {submitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Submitting...
              </>
            ) : (
              'Submit Rating'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default MentorRatingModal; 