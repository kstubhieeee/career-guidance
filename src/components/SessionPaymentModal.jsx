import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

const API_BASE_URL = 'http://localhost:3250';

function SessionPaymentModal({ session, onClose, onSuccess, razorpayKeyId }) {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    // Add Razorpay script to the document if needed
    if (!window.Razorpay) {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.body.appendChild(script);

      return () => {
        if (document.body.contains(script)) {
          document.body.removeChild(script);
        }
      };
    }
  }, []);

  const handlePayment = async () => {
    setLoading(true);
    setErrorMessage('');

    try {
      if (!session.price || session.price <= 0) {
        throw new Error('Invalid session price. Please contact support.');
      }

      // Initialize Razorpay payment
      const options = {
        key: razorpayKeyId,
        amount: Math.round(session.price * 100), // Ensure amount is in paise and is a whole number
        currency: "INR",
        name: "Mentor Booking",
        description: `Session with ${session.mentorName}`,
        handler: async function (response) {
          try {
            console.log('Payment successful, updating session:', {
              sessionId: session._id,
              paymentId: response.razorpay_payment_id
            });

            // Update session with payment ID
            const apiResponse = await fetch(`${API_BASE_URL}/api/sessions/${session._id}/payment`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                paymentId: response.razorpay_payment_id
              }),
              credentials: 'include'
            });

            if (!apiResponse.ok) {
              const errorData = await apiResponse.json();
              throw new Error(errorData.message || 'Failed to update session with payment');
            }

            const apiData = await apiResponse.json();
            console.log('Session updated successfully:', apiData);
            toast.success('Payment successful! Session confirmed.');
            onSuccess(apiData.session);
          } catch (error) {
            console.error('Error updating session after payment:', error);
            toast.error(error.message || 'Payment successful but failed to update session. Please contact support.');
          }
        },
        prefill: {
          name: session.studentName,
          email: session.studentEmail
        },
        theme: {
          color: "#4F46E5"
        }
      };

      console.log('Initializing Razorpay payment with options:', {
        amount: options.amount,
        currency: options.currency,
        description: options.description
      });

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.open();

      razorpayInstance.on('payment.failed', function (response) {
        console.error('Payment failed:', response.error);
        toast.error('Payment failed. Please try again.');
        setLoading(false);
      });
    } catch (error) {
      console.error('Error initiating payment:', error);
      setErrorMessage(error.message || 'Error initiating payment. Please try again.');
      toast.error(error.message || 'Error initiating payment. Please contact support.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-darkblue bg-opacity-80 flex items-center justify-center z-50 overflow-y-auto p-4">
      <div className="relative bg-darkblue-light border border-gray-700 rounded-xl shadow-xl max-w-md w-full mx-auto p-6 animate-fadeIn">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h3 className="text-2xl font-bold text-white mb-6">Complete Your Booking</h3>

        <div className="space-y-4 mb-6">
          <div className="bg-darkblue p-4 rounded-lg">
            <h4 className="text-white font-semibold mb-2">Session Details</h4>
            <div className="space-y-2 text-gray-300">
              <p>Mentor: {session.mentorName}</p>
              <p>Date: {new Date(session.sessionDate).toLocaleDateString()}</p>
              <p>Time: {session.sessionTime}</p>
              <p>Type: {session.sessionType}</p>
            </div>
          </div>

          <div className="bg-darkblue p-4 rounded-lg">
            <h4 className="text-white font-semibold mb-2">Payment Details</h4>
            <div className="space-y-2 text-gray-300">
              <div className="flex justify-between">
                <span>Session Fee:</span>
                <span>₹{session.price}</span>
              </div>
              <div className="flex justify-between text-white font-bold">
                <span>Total Amount:</span>
                <span>₹{session.price}</span>
              </div>
            </div>
          </div>

          <div className="space-y-3 mb-6">
            <div>
              <h4 className="text-white text-sm font-medium mb-2">Payment Provider</h4>
              <div className="flex items-center justify-center mt-2">
                <img src="/images/razorpay-logo.svg" alt="Razorpay" className="h-6" />
              </div>
            </div>
          </div>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 bg-red-900 bg-opacity-20 border border-red-500 rounded-lg text-red-400 text-sm">
            {errorMessage}
          </div>
        )}

        <button
          onClick={handlePayment}
          disabled={loading}
          className="w-full bg-primary hover:bg-primary-dark text-white py-3 px-6 rounded-lg font-semibold transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </>
          ) : (
            <>Proceed to Payment</>
          )}
        </button>
      </div>
    </div>
  );
}

export default SessionPaymentModal; 