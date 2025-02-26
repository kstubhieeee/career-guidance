import React, { useState, useEffect } from 'react';

function Contact() {
  const [contactData, setContactData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    message: ''
  });
  const [submitStatus, setSubmitStatus] = useState({
    loading: false,
    success: false,
    error: null
  });

  useEffect(() => {
    // Import the data
    import('../data/contactData.json')
      .then(data => {
        setContactData(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error loading contact data:', error);
        setLoading(false);
      });
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitStatus({ loading: true, success: false, error: null });
    
    try {
      const response = await fetch('http://localhost:3250/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send message');
      }

      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        message: ''
      });
      
      setSubmitStatus({ loading: false, success: true, error: null });
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        setSubmitStatus(prev => ({ ...prev, success: false }));
      }, 5000);
      
    } catch (err) {
      console.error('Error submitting form:', err);
      setSubmitStatus({ loading: false, success: false, error: err.message });
    }
  };

  if (loading) {
    return (
      <section id="contact" className="py-20 bg-darkblue">
        <div className="container mx-auto px-4 flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </section>
    );
  }

  if (!contactData) {
    return null;
  }

  return (
    <section id="contact" className="py-20 bg-darkblue">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{contactData.title}</h2>
          <div className="w-20 h-1 bg-primary mx-auto mb-8"></div>
          <p className="text-gray-300 max-w-2xl mx-auto">{contactData.description}</p>
        </div>
        
        <div className="flex flex-col md:flex-row gap-8">
          {/* Contact Information */}
          <div className="w-full md:w-1/3 bg-darkblue-light rounded-lg shadow-md p-8 border border-gray-700">
            <h3 className="text-2xl font-bold mb-6 text-white">Contact Info</h3>
            
            <div className="space-y-6">
              {Object.entries(contactData.contactInfo).map(([key, info]) => (
                <div key={key} className="flex items-start">
                  <div className="text-primary text-xl mr-4">
                    <i className={info.icon}></i>
                  </div>
                  <div>
                    <h4 className="font-bold text-white">{info.title}</h4>
                    <p className="text-gray-300">{info.details}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-8">
              <h4 className="font-bold text-white mb-4">Follow Us</h4>
              <div className="flex space-x-4">
                {contactData.socialMedia.map((social, index) => (
                  <a 
                    key={index}
                    href={social.url} 
                    className="text-gray-300 hover:text-primary transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <i className={`${social.icon} text-xl`}></i>
                  </a>
                ))}
              </div>
            </div>
          </div>
          
          {/* Contact Form */}
          <div className="w-full md:w-2/3 bg-darkblue-light rounded-lg shadow-md p-8 border border-gray-700">
            <h3 className="text-2xl font-bold mb-6 text-white">Send a Message</h3>
            
            {submitStatus.success && (
              <div className="bg-green-500 bg-opacity-20 border border-green-500 text-white p-4 rounded-md mb-6">
                Your message has been sent successfully! We'll get back to you soon.
              </div>
            )}
            
            {submitStatus.error && (
              <div className="bg-red-500 bg-opacity-20 border border-red-500 text-white p-4 rounded-md mb-6">
                {submitStatus.error}
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label htmlFor="firstName" className="block text-white mb-2">First Name</label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-darkblue border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-white"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="lastName" className="block text-white mb-2">Last Name</label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-darkblue border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-white"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-white mb-2">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-darkblue border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-white"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="phone" className="block text-white mb-2">Phone Number</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-darkblue border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-white"
                  />
                </div>
              </div>
              
              <div className="mb-6">
                <label htmlFor="message" className="block text-white mb-2">Your Message</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows="5"
                  className="w-full px-4 py-2 bg-darkblue border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-white"
                  required
                ></textarea>
              </div>
              
              <button
                type="submit"
                disabled={submitStatus.loading}
                className="bg-primary text-white px-6 py-3 rounded-md hover:bg-primary-dark transition-colors disabled:opacity-70"
              >
                {submitStatus.loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending...
                  </span>
                ) : "Send Message"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Contact;