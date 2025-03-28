import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../Contexts/ThemeContext';

const BecomePartner = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const [formData, setFormData] = useState({
    businessName: '',
    contactName: '',
    email: '',
    phone: '',
    businessType: '',
    partnershipType: '',
    description: ''
  });
  
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real application, you would send this data to your backend
    console.log('Partnership application submitted:', formData);
    setIsSubmitted(true);
    // Reset form after submission
    setFormData({
      businessName: '',
      contactName: '',
      email: '',
      phone: '',
      businessType: '',
      partnershipType: '',
      description: ''
    });
  };
  
  const partnershipBenefits = [
    {
      title: "Expanded Reach",
      description: "Connect with thousands of KIIT students directly through our platform.",
      icon: (
        <svg className="w-12 h-12 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
        </svg>
      )
    },
    {
      title: "Targeted Marketing",
      description: "Offer exclusive deals and promotions to a verified student audience.",
      icon: (
        <svg className="w-12 h-12 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
        </svg>
      )
    },
    {
      title: "Brand Recognition",
      description: "Build brand loyalty with students early in their consumer journey.",
      icon: (
        <svg className="w-12 h-12 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      )
    },
    {
      title: "Insights & Feedback",
      description: "Gain valuable insights into student preferences and needs.",
      icon: (
        <svg className="w-12 h-12 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    }
  ];
  
  const partnershipTypes = [
    {
      title: "Exclusive Discounts",
      description: "Offer special discounts or promotions exclusively for KiitHub users."
    },
    {
      title: "Featured Listings",
      description: "Get premium placement for your products or services on our platform."
    },
    {
      title: "Event Sponsorship",
      description: "Sponsor KiitHub events and gain visibility among the student community."
    },
    {
      title: "Branded Content",
      description: "Create sponsored content that resonates with our student audience."
    },
    {
      title: "Custom Integration",
      description: "Integrate your services directly into the KiitHub platform."
    }
  ];

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'} transition-colors duration-300`}>
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-5xl mx-auto"
        >
          <h1 className="text-4xl font-bold mb-2 text-center">Become a KiitHub Partner</h1>
          <p className={`text-center mb-12 ${isDark ? 'text-gray-400' : 'text-gray-600'} max-w-3xl mx-auto`}>
            Connect with KIIT University's student community and grow your business through strategic partnerships with KiitHub.
          </p>

          {/* Benefits Section */}
          <section className="mb-16">
            <h2 className="text-2xl font-semibold mb-8 text-center">Why Partner With Us?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {partnershipBenefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className={`p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-md flex flex-col items-center text-center`}
                >
                  <div className="mb-4">{benefit.icon}</div>
                  <h3 className="text-xl font-semibold mb-2">{benefit.title}</h3>
                  <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{benefit.description}</p>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Partnership Types */}
          <section className="mb-16">
            <h2 className="text-2xl font-semibold mb-8 text-center">Partnership Opportunities</h2>
            <div className={`p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {partnershipTypes.map((type, index) => (
                  <div key={index} className={`p-4 rounded-lg ${isDark ? 'bg-gray-750 border border-gray-700' : 'bg-gray-50 border border-gray-200'}`}>
                    <h3 className="text-lg font-semibold mb-2">{type.title}</h3>
                    <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'} text-sm`}>{type.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Application Form */}
          <section className="mb-16">
            <h2 className="text-2xl font-semibold mb-8 text-center">Apply to Partner With Us</h2>
            <div className={`p-8 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
              {isSubmitted ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-8"
                >
                  <svg className="w-16 h-16 text-green-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="text-2xl font-semibold mb-2">Application Submitted!</h3>
                  <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'} mb-4`}>
                    Thank you for your interest in partnering with KiitHub. Our team will review your application and get back to you within 3-5 business days.
                  </p>
                  <button
                    onClick={() => setIsSubmitted(false)}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-300"
                  >
                    Submit Another Application
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className={`block mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Business Name *
                      </label>
                      <input
                        type="text"
                        name="businessName"
                        value={formData.businessName}
                        onChange={handleChange}
                        required
                        className={`w-full p-3 rounded-lg ${
                          isDark
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-gray-50 border-gray-300 text-gray-900'
                        } border focus:ring-2 focus:ring-indigo-500 transition-colors duration-300`}
                      />
                    </div>
                    <div>
                      <label className={`block mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Contact Person's Name *
                      </label>
                      <input
                        type="text"
                        name="contactName"
                        value={formData.contactName}
                        onChange={handleChange}
                        required
                        className={`w-full p-3 rounded-lg ${
                          isDark
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-gray-50 border-gray-300 text-gray-900'
                        } border focus:ring-2 focus:ring-indigo-500 transition-colors duration-300`}
                      />
                    </div>
                    <div>
                      <label className={`block mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Email Address *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className={`w-full p-3 rounded-lg ${
                          isDark
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-gray-50 border-gray-300 text-gray-900'
                        } border focus:ring-2 focus:ring-indigo-500 transition-colors duration-300`}
                      />
                    </div>
                    <div>
                      <label className={`block mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        className={`w-full p-3 rounded-lg ${
                          isDark
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-gray-50 border-gray-300 text-gray-900'
                        } border focus:ring-2 focus:ring-indigo-500 transition-colors duration-300`}
                      />
                    </div>
                    <div>
                      <label className={`block mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Business Type *
                      </label>
                      <select
                        name="businessType"
                        value={formData.businessType}
                        onChange={handleChange}
                        required
                        className={`w-full p-3 rounded-lg ${
                          isDark
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-gray-50 border-gray-300 text-gray-900'
                        } border focus:ring-2 focus:ring-indigo-500 transition-colors duration-300`}
                      >
                        <option value="">Select business type</option>
                        <option value="retail">Retail Store</option>
                        <option value="restaurant">Restaurant/Café</option>
                        <option value="service">Service Provider</option>
                        <option value="tech">Technology</option>
                        <option value="education">Education</option>
                        <option value="entertainment">Entertainment</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className={`block mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Partnership Type *
                      </label>
                      <select
                        name="partnershipType"
                        value={formData.partnershipType}
                        onChange={handleChange}
                        required
                        className={`w-full p-3 rounded-lg ${
                          isDark
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-gray-50 border-gray-300 text-gray-900'
                        } border focus:ring-2 focus:ring-indigo-500 transition-colors duration-300`}
                      >
                        <option value="">Select partnership type</option>
                        <option value="discounts">Exclusive Discounts</option>
                        <option value="featured">Featured Listings</option>
                        <option value="sponsorship">Event Sponsorship</option>
                        <option value="content">Branded Content</option>
                        <option value="integration">Custom Integration</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>
                  <div className="mb-6">
                    <label className={`block mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      How would you like to partner with KiitHub? *
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      required
                      rows={5}
                      className={`w-full p-3 rounded-lg ${
                        isDark
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-gray-50 border-gray-300 text-gray-900'
                      } border focus:ring-2 focus:ring-indigo-500 transition-colors duration-300`}
                      placeholder="Please describe your partnership idea, what you offer, and how it benefits KIIT students..."
                    />
                  </div>
                  <div className="text-center">
                    <button
                      type="submit"
                      className="px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-300 font-medium"
                    >
                      Submit Application
                    </button>
                  </div>
                </form>
              )}
            </div>
          </section>

          {/* FAQ Section */}
          <section>
            <h2 className="text-2xl font-semibold mb-8 text-center">Frequently Asked Questions</h2>
            <div className={`p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
              <div className="space-y-4">
                <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-750 border border-gray-700' : 'bg-gray-50 border border-gray-200'}`}>
                  <h3 className="text-lg font-semibold mb-2">How long does the application process take?</h3>
                  <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    Our team reviews all partnership applications within 3-5 business days. If your application is approved, we'll schedule a call to discuss next steps.
                  </p>
                </div>
                <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-750 border border-gray-700' : 'bg-gray-50 border border-gray-200'}`}>
                  <h3 className="text-lg font-semibold mb-2">Is there a cost to become a partner?</h3>
                  <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    Partnership costs vary depending on the type of collaboration. Some partnerships are based on providing exclusive discounts to students, while others may involve financial arrangements. We'll discuss all details during our initial consultation.
                  </p>
                </div>
                <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-750 border border-gray-700' : 'bg-gray-50 border border-gray-200'}`}>
                  <h3 className="text-lg font-semibold mb-2">How do you measure partnership success?</h3>
                  <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    We provide partners with regular reports on student engagement, including metrics like click-through rates, redemption of offers, and user feedback. We work with each partner to establish specific KPIs for their unique goals.
                  </p>
                </div>
                <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-750 border border-gray-700' : 'bg-gray-50 border border-gray-200'}`}>
                  <h3 className="text-lg font-semibold mb-2">What makes a successful KiitHub partner?</h3>
                  <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    The most successful partners offer genuine value to KIIT students, whether through exceptional products, unique services, or exclusive discounts. We look for partners who are interested in building lasting relationships with the student community.
                  </p>
                </div>
              </div>
            </div>
          </section>

        </motion.div>
      </div>
    </div>
  );
};

export default BecomePartner; 