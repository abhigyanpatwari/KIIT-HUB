import React, { useState } from 'react';
const backendUrl = "http://localhost:5001";

const ContactUs = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    message: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
    
    // Clear error when user starts typing again
    if (error) setError('');
  };

  const validateEmail = (email) => {
    // Basic email validation
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      return false;
    }
    
    // Consider allowing kiit.ac.in emails as preferred but not required
    // const domain = email.split('@')[1];
    // if (domain !== 'kiit.ac.in') {
    //   return false;
    // }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate the form
    if (!formData.fullName || !formData.email || !formData.message) {
      setError('Please fill in all required fields');
      return;
    }

    // Validate email format
    if (!validateEmail(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    // Reset error state and set loading
    setError('');
    setLoading(true);

    try {
      // Send the data to the backend API
      const response = await fetch(`${backendUrl}/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json().catch(e => ({ message: "Server error" }));
        throw new Error(data.message || `Error: ${response.status}`);
      }

      const data = await response.json();
      console.log('Form submitted successfully:', data);
      setSubmitted(true);
      setLoading(false);
      setRetryCount(0);
      
      // Reset form after successful submission
      setTimeout(() => {
        setSubmitted(false);
        setFormData({
          fullName: '',
          email: '',
          phone: '',
          message: '',
        });
      }, 5000); // Give user more time to see the success message
    } catch (err) {
      console.error('Error submitting form:', err);
      
      // Implement a retry mechanism
      if (retryCount < 2) {
        setError(`Having trouble connecting. Retrying... (${retryCount + 1}/2)`);
        setRetryCount(prev => prev + 1);
        
        // Wait 2 seconds and retry
        setTimeout(() => {
          handleSubmit(e);
        }, 2000);
      } else {
        setError('Unable to send your message. Please try again later or contact us directly at kiithub16@gmail.com');
        setLoading(false);
        setRetryCount(0);
      }
    }
  };

  return (
    <div className="bg-gray-900 min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-800 to-gray-900 opacity-90"></div>

      {/* Contact Card with Floating Animation */}
      <div className="relative max-w-5xl w-full p-8 bg-gray-800 text-white shadow-2xl rounded-2xl transform transition-all duration-700 ease-in-out animate-floatUpDown hover:animate-floatSideToSide">
        <div className="grid md:grid-cols-2">
          {/* Contact Information Section */}
          <div className="bg-yellow-500 p-10 flex flex-col justify-center rounded-l-2xl">
            <h2 className="text-4xl font-extrabold text-gray-900 mb-6 animate-pulse">
              Contact Us
            </h2>
            <p className="text-lg text-gray-900 mb-6">
              Have questions? We'd love to hear from you. Send us a message, and we'll respond as soon as possible.
            </p>

            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <span className="text-gray-900 flex items-center gap-2">
                  📧 <span className="font-semibold">kiithub16@gmail.com</span>
                </span>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-gray-900 flex items-center gap-2">
                  📞 <span className="font-semibold">+91 7717758900</span>
                </span>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-gray-900 flex items-center gap-2">
                  📍{" "}
                  <span className="font-bold italic">
                    Kalinga Institute of Industrial Technology, (available for campus students only).
                  </span>
                </span>
              </div>
            </div>
          </div>

          {/* Contact Form Section */}
          <div className="p-10">
            {submitted ? (
              <div className="text-center text-green-400 space-y-4 animate-fadeIn">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-24 w-24 mx-auto text-green-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <h3 className="text-2xl font-bold">Message Sent Successfully!</h3>
                <p>Thank you for contacting us, {formData.fullName}.</p>
                <p className="text-sm">We've also sent a confirmation to your email at {formData.email}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6 animate-slideIn">
                {error && (
                  <div className="bg-red-500 bg-opacity-20 border border-red-400 text-red-300 px-4 py-3 rounded">
                    <p>{error}</p>
                  </div>
                )}
                
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-300">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    id="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-white shadow-sm focus:border-yellow-500 focus:ring focus:ring-yellow-200 transition duration-300"
                    disabled={loading}
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-white shadow-sm focus:border-yellow-500 focus:ring focus:ring-yellow-200 transition duration-300"
                    disabled={loading}
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-300">
                    Phone Number (Optional)
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    id="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-white shadow-sm focus:border-yellow-500 focus:ring focus:ring-yellow-200 transition duration-300"
                    disabled={loading}
                  />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-300">
                    Your Message *
                  </label>
                  <textarea
                    name="message"
                    id="message"
                    rows={4}
                    value={formData.message}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-white shadow-sm focus:border-yellow-500 focus:ring focus:ring-yellow-200 transition duration-300"
                    disabled={loading}
                  />
                </div>
                <div>
                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full ${loading ? 'bg-yellow-400' : 'bg-yellow-500 hover:bg-yellow-600'} text-gray-900 font-bold py-3 px-4 rounded-lg transition duration-300 transform ${!loading && 'hover:scale-105'} focus:outline-none focus:ring-2 focus:ring-yellow-300 flex justify-center items-center`}
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {retryCount > 0 ? 'Retrying...' : 'Sending...'}
                      </>
                    ) : (
                      'Send Message'
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Animations */}
      <style>
        {`
        @keyframes floatUpDown {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .animate-floatUpDown {
          animation: floatUpDown 3s infinite ease-in-out;
        }

        @keyframes floatSideToSide {
          0%, 100% { transform: translateX(0px); }
          50% { transform: translateX(10px); }
        }
        .hover\\:animate-floatSideToSide:hover {
          animation: floatSideToSide 1.5s infinite ease-in-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out forwards;
        }

        @keyframes slideIn {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-slideIn {
          animation: slideIn 0.6s ease-out forwards;
        }
        `}
      </style>
    </div>
  );
};

export default ContactUs;
