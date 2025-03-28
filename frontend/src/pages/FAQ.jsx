import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../Contexts/ThemeContext';

const FAQItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className={`mb-6 border ${isDark ? 'border-gray-700' : 'border-gray-200'} rounded-lg overflow-hidden`}>
      <button
        className={`w-full p-4 text-left flex justify-between items-center ${
          isDark ? 'bg-gray-800 hover:bg-gray-750' : 'bg-white hover:bg-gray-50'
        } transition-colors duration-200`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="font-medium text-lg">{question}</span>
        <svg
          className={`w-5 h-5 transition-transform duration-300 ${isOpen ? 'transform rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <motion.div
        initial={false}
        animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden"
      >
        <div className={`p-4 ${isDark ? 'bg-gray-750' : 'bg-gray-50'}`}>
          <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{answer}</p>
        </div>
      </motion.div>
    </div>
  );
};

const FAQ = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const faqs = [
    {
      question: "What is KiitHub?",
      answer: "KiitHub is a campus marketplace exclusively for KIIT University students to buy, sell, and exchange goods within the KIIT community. It creates a trusted environment where students can find textbooks, electronics, furniture, and other items from fellow students."
    },
    {
      question: "Who can use KiitHub?",
      answer: "KiitHub is exclusively for KIIT University students and faculty. You need a valid @kiit.ac.in email address to register and use our platform."
    },
    {
      question: "How do I list an item for sale?",
      answer: "To list an item, log into your account, click on the 'Sell Item' button, fill out the item details including title, description, price, condition, and images. Once submitted, your listing will be reviewed and published shortly."
    },
    {
      question: "Is there a fee for listing items?",
      answer: "No, listing items on KiitHub is completely free. We do not charge any commission or fees for successful sales either. Our platform is a free service to the KIIT community."
    },
    {
      question: "How do payments work?",
      answer: "KiitHub doesn't process payments directly. Buyers and sellers coordinate the payment method between themselves. We recommend meeting in person on campus for exchanges and payments to ensure safety and satisfaction for both parties."
    },
    {
      question: "How does the buying process work?",
      answer: "Browse the listings, find an item you're interested in, and click 'Buy' to express your interest. Our system will notify the seller and share your contact information. You and the seller can then arrange a meeting time and place for the transaction."
    },
    {
      question: "Are the items verified or guaranteed?",
      answer: "While we don't physically inspect items, we require sellers to provide accurate descriptions and images. We encourage buyers to inspect items before completing purchases. If you encounter any issues with misrepresented items, please report them to our support team."
    },
    {
      question: "What should I do if the item I received doesn't match the description?",
      answer: "We recommend inspecting items before completing the transaction. If you've already completed the purchase and the item doesn't match the description, please contact our support team with details and evidence of the discrepancy."
    },
    {
      question: "Can I cancel a purchase after clicking 'Buy'?",
      answer: "Yes, you can cancel a purchase by contacting the seller directly. Since our platform only facilitates the connection between buyers and sellers and doesn't process payments, cancellations should be handled between the two parties."
    },
    {
      question: "How do I contact a seller?",
      answer: "Once you express interest in an item by clicking 'Buy', our system will facilitate an email connection between you and the seller. You'll receive their contact information to arrange the transaction details."
    },
    {
      question: "Are there any prohibited items?",
      answer: "Yes, KiitHub prohibits the sale of illegal items, alcohol, tobacco, weapons, harmful substances, counterfeit goods, and adult content. Academic integrity violations like exam answers or completed assignments are also prohibited. See our Terms & Conditions for a complete list."
    },
    {
      question: "How can I report suspicious activity?",
      answer: "If you notice suspicious activity or inappropriate listings, please use the 'Report' button on the listing or contact our support team directly at support@kiithub.com with details of the issue."
    }
  ];

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'} transition-colors duration-300`}>
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          <h1 className="text-4xl font-bold mb-2 text-center">Frequently Asked Questions</h1>
          <p className={`text-center mb-12 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Find answers to common questions about using the KiitHub marketplace
          </p>

          <div className="mb-10">
            {faqs.map((faq, index) => (
              <FAQItem key={index} question={faq.question} answer={faq.answer} />
            ))}
          </div>

          <div className={`p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
            <h2 className="text-xl font-semibold mb-4">Still have questions?</h2>
            <p className={`mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              If you couldn't find the answer to your question, feel free to contact our support team.
            </p>
            <a
              href="/contact"
              className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-300"
            >
              Contact Support
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default FAQ; 