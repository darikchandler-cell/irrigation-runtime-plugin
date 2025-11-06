import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'privacy' | 'terms';
}

export default function LegalModal({ isOpen, onClose, type }: LegalModalProps) {
  if (!isOpen) return null;

  const content = type === 'privacy' ? privacyContent : termsContent;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 20 }}
            className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
              <h2 className="text-gray-900">{content.title}</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
                aria-label="Close"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto flex-1 min-h-0">
              <div className="prose prose-sm max-w-none">
                <p className="text-sm text-gray-500 mb-6">
                  Effective Date: {content.effectiveDate}
                </p>

                {content.sections.map((section, index) => (
                  <div key={index} className="mb-6">
                    <h3 className="text-gray-900 mb-3">{section.heading}</h3>
                    {section.paragraphs.map((paragraph, pIndex) => (
                      <p key={pIndex} className="text-sm text-gray-600 mb-3">
                        {paragraph}
                      </p>
                    ))}
                    {section.list && (
                      <ul className="list-disc pl-5 mb-3">
                        {section.list.map((item, lIndex) => (
                          <li key={lIndex} className="text-sm text-gray-600 mb-1">
                            {item}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 flex-shrink-0">
              <button
                onClick={onClose}
                className="h-11 px-6 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

const privacyContent = {
  title: 'Privacy Policy',
  effectiveDate: 'October 24, 2025',
  sections: [
    {
      heading: '1. Introduction',
      paragraphs: [
        'This Privacy Policy explains how we collect, use, and protect your information when you use our Irrigation Schedule Calculator ("Service"). We are committed to protecting your privacy and being transparent about our data practices.',
      ],
    },
    {
      heading: '2. Information We Collect',
      paragraphs: [
        'We collect minimal information necessary to provide you with the irrigation schedule service:',
      ],
      list: [
        'Email Address: Collected only when you request to receive your irrigation schedule via email',
        'Property Location: Address or ZIP code you provide to calculate weather-based watering recommendations',
        'Irrigation Data: Zone configurations, plant types, soil types, and other irrigation-related information you input',
        'Usage Data: Basic analytics about how you use the calculator (page views, features used)',
      ],
    },
    {
      heading: '3. How We Use Your Information',
      paragraphs: [
        'Your information is used solely for the following purposes:',
      ],
      list: [
        'To generate and deliver your personalized irrigation schedule',
        'To send you the PDF schedule and related information via email',
        'To improve our Service and user experience',
        'To provide weather-based watering recommendations for your location',
      ],
    },
    {
      heading: '4. Data Storage and Security',
      paragraphs: [
        'Your data is stored securely in your WordPress database. We implement appropriate technical and organizational measures to protect your information from unauthorized access, alteration, or destruction.',
        'We do not sell, rent, or share your personal information with third parties for marketing purposes.',
      ],
    },
    {
      heading: '5. Third-Party Services',
      paragraphs: [
        'We use the following third-party services to provide our functionality:',
      ],
      list: [
        'OpenWeatherMap API: To retrieve weather data for your location',
        'Google Places API: To help autocomplete addresses (optional)',
        'Email Service Provider: To send your irrigation schedule (if configured by site administrator)',
      ],
      paragraphs: [
        'These services have their own privacy policies and we encourage you to review them.',
      ],
    },
    {
      heading: '6. Cookies and Tracking',
      paragraphs: [
        'We use local browser storage to save your calculator progress and preferences. This data stays on your device and is not transmitted to our servers unless you choose to submit your information.',
      ],
    },
    {
      heading: '7. Your Rights',
      paragraphs: [
        'You have the following rights regarding your personal data:',
      ],
      list: [
        'Access: Request a copy of your data',
        'Correction: Request corrections to inaccurate data',
        'Deletion: Request deletion of your data',
        'Objection: Object to processing of your data',
      ],
      paragraphs: [
        'To exercise these rights, please contact the website administrator.',
      ],
    },
    {
      heading: '8. Data Retention',
      paragraphs: [
        'We retain your email and schedule data for as long as necessary to provide the Service. You may request deletion of your data at any time.',
      ],
    },
    {
      heading: '9. Children\'s Privacy',
      paragraphs: [
        'Our Service is not intended for use by children under 13 years of age. We do not knowingly collect personal information from children.',
      ],
    },
    {
      heading: '10. Changes to This Policy',
      paragraphs: [
        'We may update this Privacy Policy from time to time. We will notify you of any changes by updating the "Effective Date" at the top of this policy.',
      ],
    },
    {
      heading: '11. Contact Information',
      paragraphs: [
        'If you have questions about this Privacy Policy or our data practices, please contact the website administrator or visit our website for more information.',
      ],
    },
  ],
};

const termsContent = {
  title: 'Terms of Service',
  effectiveDate: 'October 24, 2025',
  sections: [
    {
      heading: '1. Acceptance of Terms',
      paragraphs: [
        'By accessing and using the Irrigation Schedule Calculator ("Service"), you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service.',
      ],
    },
    {
      heading: '2. Description of Service',
      paragraphs: [
        'The Irrigation Schedule Calculator is a free tool that helps you create customized watering schedules for irrigation systems. The Service provides recommendations based on plant types, soil conditions, local weather data, and watering restrictions.',
      ],
    },
    {
      heading: '3. Use of Service',
      paragraphs: [
        'You agree to use the Service only for lawful purposes and in accordance with these Terms. You agree not to:',
      ],
      list: [
        'Use the Service in any way that violates applicable laws or regulations',
        'Attempt to gain unauthorized access to the Service or its related systems',
        'Interfere with or disrupt the Service or servers',
        'Use automated tools to access the Service without permission',
      ],
    },
    {
      heading: '4. Professional Guidance Disclaimer',
      paragraphs: [
        'IMPORTANT: The irrigation schedules and recommendations provided by this Service are for informational and guidance purposes only. They do not constitute professional irrigation advice, landscaping consultation, or horticultural expertise.',
        'You should always:',
      ],
      list: [
        'Monitor your landscape and irrigation system regularly',
        'Adjust watering based on actual soil moisture and plant health',
        'Consult with licensed irrigation professionals for system design and installation',
        'Consider local water restrictions and regulations',
        'Inspect your system for leaks, broken heads, or other issues',
      ],
    },
    {
      heading: '5. No Warranties',
      paragraphs: [
        'The Service is provided "AS IS" and "AS AVAILABLE" without warranties of any kind, either express or implied, including but not limited to:',
      ],
      list: [
        'Accuracy of watering calculations or recommendations',
        'Availability or uninterrupted access to the Service',
        'Fitness for a particular purpose',
        'Results or outcomes from using the Service',
      ],
    },
    {
      heading: '6. Limitation of Liability',
      paragraphs: [
        'TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES RESULTING FROM:',
      ],
      list: [
        'Your use or inability to use the Service',
        'Damage to plants, lawns, or landscapes',
        'Excessive water usage or water bills',
        'System malfunctions or failures',
        'Errors in calculations or recommendations',
        'Any other matter relating to the Service',
      ],
    },
    {
      heading: '7. Weather Data and Accuracy',
      paragraphs: [
        'Weather data is provided by third-party APIs and may not be 100% accurate. We are not responsible for inaccuracies in weather forecasts or historical data. You should verify weather conditions and adjust watering accordingly.',
      ],
    },
    {
      heading: '8. User Responsibility',
      paragraphs: [
        'You are solely responsible for:',
      ],
      list: [
        'Monitoring your irrigation system and landscape health',
        'Making adjustments to watering schedules as needed',
        'Complying with local watering restrictions and regulations',
        'Ensuring proper system installation and maintenance',
        'Preventing water waste and runoff',
      ],
    },
    {
      heading: '9. Intellectual Property',
      paragraphs: [
        'The Service, including all content, features, and functionality, is owned by us or our licensors and is protected by copyright, trademark, and other intellectual property laws.',
      ],
    },
    {
      heading: '10. Email Communications',
      paragraphs: [
        'By providing your email address, you consent to receive your irrigation schedule and related service communications. You may opt out of future communications by contacting us.',
      ],
    },
    {
      heading: '11. Modifications to Service',
      paragraphs: [
        'We reserve the right to modify, suspend, or discontinue the Service at any time without notice. We will not be liable to you or any third party for any modification, suspension, or discontinuance of the Service.',
      ],
    },
    {
      heading: '12. Changes to Terms',
      paragraphs: [
        'We may revise these Terms at any time by updating this page. Your continued use of the Service after changes are posted constitutes your acceptance of the revised Terms.',
      ],
    },
    {
      heading: '13. Governing Law',
      paragraphs: [
        'These Terms shall be governed by and construed in accordance with applicable laws, without regard to conflict of law principles.',
      ],
    },
    {
      heading: '14. Severability',
      paragraphs: [
        'If any provision of these Terms is found to be unenforceable or invalid, that provision will be limited or eliminated to the minimum extent necessary so that the Terms will otherwise remain in full force and effect.',
      ],
    },
    {
      heading: '15. Contact Information',
      paragraphs: [
        'If you have any questions about these Terms of Service, please contact the website administrator.',
      ],
    },
  ],
};
