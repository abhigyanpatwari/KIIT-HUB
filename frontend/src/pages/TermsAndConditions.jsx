import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../Contexts/ThemeContext';

const TermsAndConditions = () => {
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
          <h1 className="text-4xl font-bold mb-2 text-center">Terms and Conditions</h1>
          <p className={`text-center mb-12 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Last updated: July 1, 2023
          </p>

          <div className={`p-8 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
            <p className="mb-6">
              Welcome to KiitHub. These Terms and Conditions govern your use of the KiitHub platform and services.
              By accessing or using KiitHub, you agree to be bound by these Terms. If you disagree with any part of the terms, 
              then you may not access the service.
            </p>

            <Section title="1. Eligibility">
              <p className="mb-4">
                KiitHub is exclusively available to KIIT University students and faculty. To use our services:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>You must be a current student or faculty member at KIIT University.</li>
                <li>You must register with a valid @kiit.ac.in email address.</li>
                <li>You must be at least 18 years of age or have parental consent to use the platform.</li>
                <li>You must not have been previously suspended or removed from the platform.</li>
              </ul>
              <p className="mt-4">
                We reserve the right to verify your KIIT University affiliation at any time and terminate accounts that do not meet these requirements.
              </p>
            </Section>

            <Section title="2. User Accounts">
              <p className="mb-4">Regarding your KiitHub account:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>You are responsible for maintaining the confidentiality of your account login information.</li>
                <li>You are responsible for all activities that occur under your account.</li>
                <li>You must notify us immediately of any unauthorized use of your account or any other security breach.</li>
                <li>You may not use another user's account without permission.</li>
                <li>Your account is non-transferable and may not be sold, combined, or otherwise shared with any other person.</li>
              </ul>
            </Section>

            <Section title="3. Marketplace Rules">
              <p className="mb-4">When using the KiitHub marketplace, you agree to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Provide accurate information about items you list for sale.</li>
                <li>Only list items that you legally own and have the right to sell.</li>
                <li>Set fair and reasonable prices for your items.</li>
                <li>Respond promptly to buyer inquiries and purchase requests.</li>
                <li>Honor commitments to buy or sell items once confirmed.</li>
                <li>Meet in safe, public locations on or near campus for transactions.</li>
                <li>Handle payments directly between buyers and sellers (KiitHub does not process payments).</li>
                <li>Report any suspicious activity or policy violations.</li>
              </ul>
            </Section>

            <Section title="4. Prohibited Items">
              <p className="mb-4">The following items are prohibited from being listed or sold on KiitHub:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Illegal items or substances</li>
                <li>Alcohol, tobacco, vaping products, or drugs</li>
                <li>Weapons or dangerous materials</li>
                <li>Counterfeit or stolen items</li>
                <li>Adult content or sexually explicit materials</li>
                <li>Academic integrity violations (exam answers, completed assignments, etc.)</li>
                <li>Personal or financial data</li>
                <li>Livestreaming or recording device services used to violate others' privacy</li>
                <li>Animals or animal products</li>
                <li>Items recalled by manufacturers</li>
                <li>Services that violate university policies</li>
              </ul>
              <p className="mt-4">
                We reserve the right to remove any listing that we deem inappropriate or in violation of these terms.
              </p>
            </Section>

            <Section title="5. User Conduct">
              <p className="mb-4">As a KiitHub user, you agree not to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Harass, intimidate, or threaten other users.</li>
                <li>Post false, misleading, or deceptive content.</li>
                <li>Spam or send unsolicited messages to other users.</li>
                <li>Manipulate prices or engage in fraudulent activities.</li>
                <li>Use the platform for any illegal purpose.</li>
                <li>Attempt to gain unauthorized access to other user accounts or platform systems.</li>
                <li>Interfere with the proper functioning of the platform.</li>
                <li>Create multiple accounts or share account access.</li>
                <li>Scrape, data mine, or otherwise extract data from the platform in an automated manner.</li>
              </ul>
            </Section>

            <Section title="6. Intellectual Property">
              <p className="mb-4">
                The KiitHub platform, including its logo, design, text, graphics, and other content, is owned by KiitHub and protected by intellectual property laws.
                You may not reproduce, distribute, modify, or create derivative works of any platform content without our explicit permission.
              </p>
              <p className="mb-4">
                When you provide content to the platform, such as item descriptions and images, you grant KiitHub a non-exclusive, royalty-free, 
                worldwide license to use, display, and distribute that content in connection with operating and promoting the platform.
              </p>
              <p>
                If you believe your intellectual property rights have been violated on the platform, please contact us at legal@kiithub.com.
              </p>
            </Section>

            <Section title="7. Limitation of Liability">
              <p className="mb-4">
                KiitHub is a platform that connects buyers and sellers. We do not directly participate in transactions between users.
                As such:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>We do not guarantee the quality, safety, or legality of items listed.</li>
                <li>We do not guarantee the truth or accuracy of listings.</li>
                <li>We do not guarantee that a buyer or seller will complete a transaction.</li>
                <li>We do not guarantee the performance or conduct of users.</li>
              </ul>
              <p className="mt-4">
                To the maximum extent permitted by law, KiitHub shall not be liable for any indirect, incidental, special, consequential, 
                or punitive damages, including lost profits, arising out of or in connection with these Terms or your use of the platform.
              </p>
            </Section>

            <Section title="8. Dispute Resolution">
              <p>
                In the event of a dispute between users, we encourage you to first attempt to resolve the issue directly with the other party.
                If that is not possible, please contact our support team at support@kiithub.com. We will make reasonable efforts to help mediate disputes, 
                but we cannot guarantee resolution. Serious violations of our terms may be reported to KIIT University administration or appropriate authorities.
              </p>
            </Section>

            <Section title="9. Termination">
              <p>
                We may suspend or terminate your account at any time for violations of these Terms, inappropriate behavior, fraudulent activity, 
                or for any other reason we deem necessary. Upon termination, your right to use the platform will immediately cease, 
                and we may remove your profile and any content you have posted.
              </p>
            </Section>

            <Section title="10. Changes to Terms">
              <p>
                We may modify these Terms from time to time. We will notify users of significant changes by posting the new Terms on the platform 
                and updating the "Last updated" date. Your continued use of the platform after such modifications constitutes your acceptance 
                of the revised Terms.
              </p>
            </Section>

            <Section title="11. Contact Us">
              <p>
                If you have any questions about these Terms, please contact us at:
              </p>
              <p className="mt-4">
                <strong>Email:</strong> legal@kiithub.com<br />
                <strong>Address:</strong> KiitHub Team, KIIT University, Bhubaneswar, Odisha, India
              </p>
            </Section>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default TermsAndConditions; 