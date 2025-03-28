import React from "react";
import { motion } from "framer-motion";
import { useTheme } from "../Contexts/ThemeContext";

const RefundPolicy = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const Section = ({ title, children }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-8"
    >
      <h2 className={`text-2xl font-bold mb-4 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>{title}</h2>
      <div className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{children}</div>
    </motion.div>
  );

  return (
    <div className={`py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7 }}
      >
        <h1 className={`text-4xl font-extrabold text-center mb-12 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Refund Policy
        </h1>

        <div className="max-w-4xl mx-auto">
          <Section title="Peer-to-Peer Transactions">
            <p className="mb-4">
              KiitHub operates as a platform connecting buyers and sellers within the KIIT University community. All transactions are conducted directly between users, and KiitHub does not process payments or handle physical goods.
            </p>
            <p>
              As such, refunds must be arranged directly between the buyer and seller involved in the transaction. KiitHub encourages users to resolve refund issues amicably and in accordance with the guidelines provided below.
            </p>
          </Section>

          <Section title="Recommended Refund Guidelines">
            <p className="mb-4">While KiitHub does not directly process refunds, we recommend sellers consider refunds under the following circumstances:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Item Condition:</strong> If an item's condition was significantly misrepresented in the listing.</li>
              <li><strong>Non-delivery:</strong> If a seller fails to deliver the item as agreed.</li>
              <li><strong>Damaged Items:</strong> If an item is damaged during the exchange process (subject to proof).</li>
              <li><strong>Counterfeit Items:</strong> If an item is proven to be counterfeit or significantly different from what was advertised.</li>
              <li><strong>Functionality Issues:</strong> If electronic or mechanical items fail to function as described within 48 hours of purchase.</li>
            </ul>
          </Section>

          <Section title="Dispute Resolution Process">
            <p className="mb-4">If a dispute arises regarding a transaction, users should follow these steps:</p>
            <ol className="list-decimal pl-5 space-y-2">
              <li><strong>Direct Communication:</strong> First, buyers should contact the seller directly through the KiitHub messaging system to explain the issue and request a refund.</li>
              <li><strong>Documentation:</strong> Both parties should maintain records of their communication and, if applicable, photos of the item in question.</li>
              <li><strong>KiitHub Mediation:</strong> If the parties cannot reach an agreement, either party may request mediation by contacting KiitHub support. While we cannot force a refund, we can facilitate communication and suggest fair resolutions.</li>
              <li><strong>University Resources:</strong> As a last resort, disputes may be referred to relevant university authorities if they involve serious issues of misconduct by a community member.</li>
            </ol>
          </Section>

          <Section title="Best Practices">
            <p className="mb-4">To avoid disputes, we recommend:</p>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-blue-300' : 'text-blue-500'}`}>For Sellers:</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Provide accurate and detailed descriptions of items</li>
                  <li>Include clear photos showing any defects or wear</li>
                  <li>Be transparent about an item's history and condition</li>
                  <li>Respond promptly to buyer inquiries</li>
                </ul>
              </div>
              <div>
                <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-blue-300' : 'text-blue-500'}`}>For Buyers:</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Ask questions before agreeing to purchase</li>
                  <li>Inspect items thoroughly at the time of exchange</li>
                  <li>Test functionality of electronic items if possible</li>
                  <li>Complete exchanges in public campus locations</li>
                </ul>
              </div>
            </div>
          </Section>

          <Section title="Safety and Fraud Prevention">
            <p className="mb-4">
              KiitHub takes fraud very seriously. Any user found engaging in fraudulent activity may have their account suspended or terminated. This includes listing counterfeit goods, misrepresenting items, or failing to deliver purchased items.
            </p>
            <p>
              We encourage users to report suspicious activity through our reporting system.
            </p>
          </Section>

          <Section title="Prohibited Transactions">
            <p>
              Please note that sales of prohibited items as outlined in our Terms & Conditions are not eligible for mediation through KiitHub. These include illegal items, counterfeit goods, weapons, explicit content, and other prohibited categories.
            </p>
          </Section>

          <Section title="Exceptions and Special Circumstances">
            <p>
              KiitHub reserves the right to intervene in disputes that involve potential violations of our Terms & Conditions, university policies, or applicable laws. In such cases, we may suspend or terminate user accounts at our discretion.
            </p>
          </Section>

          <Section title="Contact Us">
            <p>
              If you have questions about our Refund Policy or need assistance with a dispute, please contact our support team at kiithub16@gmail.com or through the contact form on our website.
            </p>
          </Section>
        </div>
      </motion.div>
    </div>
  );
};

export default RefundPolicy; 