import { CheckCircle2, X, Droplet, Mail } from 'lucide-react';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface EmailConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function EmailConfirmationModal({ isOpen, onClose }: EmailConfirmationModalProps) {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setAnimate(true);
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative overflow-hidden"
          >
            {/* Big Irrigation Header */}
            <div className="absolute top-0 left-0 right-0 h-2" style={{ background: 'linear-gradient(90deg, #0066CC, #00A859)' }} />

            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Success Icon with Big Irrigation Branding */}
            <div className="flex justify-center mb-6 mt-4">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, type: 'spring' }}
                className="relative"
              >
                <div className="w-24 h-24 rounded-full flex items-center justify-center shadow-xl"
                     style={{ background: 'linear-gradient(135deg, #0066CC, #00A859)' }}>
                  <Mail className="w-12 h-12 text-white" />
                </div>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5, type: 'spring' }}
                  className="absolute -bottom-2 -right-2 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center border-4 border-white shadow-lg"
                >
                  <CheckCircle2 className="w-6 h-6 text-white" />
                </motion.div>
              </motion.div>
            </div>

            {/* Big Irrigation Logo Small */}
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-6 h-6 rounded-full flex items-center justify-center"
                   style={{ background: 'linear-gradient(135deg, #0066CC, #00A859)' }}>
                <Droplet className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm" style={{ color: '#0066CC' }}>Big Irrigation</span>
            </div>

            {/* Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-center mb-6"
            >
              <h2 className="text-gray-900 mb-3">Schedule Sent!</h2>
              <p className="text-gray-700 mb-2">
                Your irrigation schedule has been sent to your email
              </p>
              <p className="text-sm text-gray-500 mb-4">
                Check your spam folder if you don't see it within a few minutes
              </p>
              
              {/* What's Included */}
              <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-4 mt-4 text-left">
                <p className="text-sm mb-2" style={{ color: '#0066CC' }}>
                  <strong>Your email includes:</strong>
                </p>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>✓ Complete watering schedule</li>
                  <li>✓ Zone-by-zone programming instructions</li>
                  <li>✓ Water savings calculations</li>
                  <li>✓ Downloadable PDF report</li>
                  <li>✓ Weather adjustment recommendations</li>
                </ul>
              </div>
            </motion.div>

            {/* Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-3"
            >
              <button
                onClick={onClose}
                className="w-full h-12 px-6 text-white rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                style={{ background: 'linear-gradient(135deg, #0066CC, #00A859)' }}
              >
                Done
              </button>
              <button
                onClick={() => {
                  // In a real app, this would trigger resend logic
                  alert('Email resent!');
                }}
                className="w-full text-sm hover:text-gray-900 transition-colors"
                style={{ color: '#0066CC' }}
              >
                Resend Email
              </button>
            </motion.div>

            {/* Footer */}
            <p className="text-xs text-center text-gray-400 mt-6">
              Questions? Visit{' '}
              <a href="https://bigirrigation.com" className="underline" style={{ color: '#0066CC' }}>
                bigirrigation.com
              </a>
            </p>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
