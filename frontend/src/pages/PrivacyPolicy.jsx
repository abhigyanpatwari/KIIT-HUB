import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../Contexts/ThemeContext';

const PrivacyPolicy = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const Section = ({ title, children }) => (
    <div className="mb-8">
      <h2 className="text-2xl font-semibold mb-4">{title}</h2>
      <div className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
        {children}
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'} transition-colors duration-300`}>
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          <h1 className="text-4xl font-bold mb-2 text-center">Privacy Policy</h1>
          <p className={`text-center mb-12 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Last updated: July 1, 2023
          </p>

          <div className={`p-8 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
            <p className="mb-6">
              This Privacy Policy describes how KiitHub ("we", "us", or "our") collects, uses, and discloses your 
              personal information when you use our campus marketplace service. We are committed to protecting 
              your privacy and ensuring you have a positive experience on our platform.
            </p>

            <Section title="Information We Collect">
              <p className="mb-4">We collect the following types of information:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Account Information:</strong> When you register, we collect your name, KIIT email address, student ID, and password.</li>
                <li><strong>Profile Information:</strong> Additional information you provide such as profile picture, contact number, and campus residence.</li>
                <li><strong>Listing Information:</strong> Details about items you list for sale, including descriptions, images, condition, and price.</li>
                <li><strong>Transaction Information:</strong> Records of your buying and selling activities.</li>
                <li><strong>Communication Data:</strong> Messages exchanged between buyers and sellers through our platform.</li>
                <li><strong>Device Information:</strong> IP address, browser type, operating system, and device identifiers.</li>
                <li><strong>Usage Data:</strong> How you interact with our platform, pages visited, and features used.</li>
              </ul>
            </Section>

            <Section title="How We Use Your Information">
              <p className="mb-4">We use your information for the following purposes:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>To provide and maintain our marketplace service</li>
                <li>To verify your KIIT University affiliation</li>
                <li>To facilitate transactions between buyers and sellers</li>
                <li>To communicate with you about transactions and platform updates</li>
                <li>To personalize your experience and show relevant listings</li>
                <li>To improve our platform and develop new features</li>
                <li>To ensure platform safety and prevent prohibited activities</li>
                <li>To comply with legal obligations</li>
              </ul>
            </Section>

            <Section title="Information Sharing and Disclosure">
              <p className="mb-4">We may share your information in the following circumstances:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Between Users:</strong> When you express interest in an item, we share your contact information with the seller to facilitate the transaction.</li>
                <li><strong>Service Providers:</strong> With third-party vendors who help us operate our platform (e.g., hosting, email services).</li>
                <li><strong>KIIT University:</strong> We may share information with university administrators in cases of policy violations or safety concerns.</li>
                <li><strong>Legal Requirements:</strong> When required by law, court order, or governmental regulation.</li>
                <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets.</li>
              </ul>
              <p className="mt-4">We do not sell your personal information to third parties.</p>
            </Section>

            <Section title="Data Security">
              <p>
                We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, 
                alteration, disclosure, or destruction. However, no method of transmission over the Internet or electronic storage is 100% secure, 
                so we cannot guarantee absolute security. You are responsible for maintaining the confidentiality of your account credentials.
              </p>
            </Section>

            <Section title="Your Rights">
              <p className="mb-4">Depending on your location, you may have the following rights regarding your personal information:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Access and review your personal information</li>
                <li>Correct inaccurate or incomplete information</li>
                <li>Delete your personal information</li>
                <li>Object to or restrict certain processing activities</li>
                <li>Data portability</li>
                <li>Withdraw consent</li>
              </ul>
              <p className="mt-4">
                To exercise these rights, please contact us at privacy@kiithub.com. We will respond to your request within 30 days.
              </p>
            </Section>

            <Section title="Cookies and Tracking Technologies">
              <p>
                We use cookies and similar tracking technologies to enhance your experience on our platform. These technologies 
                help us authenticate users, remember preferences, analyze usage patterns, and provide personalized content. 
                You can control cookies through your browser settings, but blocking certain cookies may impact your experience.
              </p>
            </Section>

            <Section title="Changes to This Privacy Policy">
              <p>
                We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements. 
                We will notify you of any material changes by posting the new Privacy Policy on this page and updating the 
                "Last updated" date. You are advised to review this Privacy Policy periodically for any changes.
              </p>
            </Section>

            <Section title="Contact Us">
              <p>
                If you have any questions or concerns about this Privacy Policy or our data practices, please contact us at:
              </p>
              <p className="mt-4">
                <strong>Email:</strong> privacy@kiithub.com<br />
                <strong>Address:</strong> KiitHub Team, KIIT University, Bhubaneswar, Odisha, India
              </p>
            </Section>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PrivacyPolicy; 