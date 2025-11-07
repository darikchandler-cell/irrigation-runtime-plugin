import { Droplet, ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';

const LOGO_URL = 'https://bigirrigation.com/wp-content/uploads/2022/10/bigirrigation.com-Big-Irrigation-Supply-Main-Logo.svg';

interface HeaderProps {
  onBack?: () => void;
  showBackButton?: boolean;
  onLogoClick?: () => void;
}

export default function Header({ onBack, showBackButton, onLogoClick }: HeaderProps) {
  return (
    <motion.div
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="bg-white border-b shadow-sm rounded-b-lg"
      style={{ borderColor: '#0066CC20' }}
    >
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-center sm:justify-between">
          <div className="flex items-center gap-3">
            {showBackButton && onBack && (
              <button
                onClick={onBack}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Go back"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
            )}
            <div className="flex items-center gap-3">
              <button
                onClick={onLogoClick}
                className="group cursor-pointer transition-opacity hover:opacity-80 flex items-center gap-2"
                aria-label="Return to home"
              >
                <img 
                  src={LOGO_URL} 
                  alt="Big Irrigation" 
                  className="h-10 w-auto"
                  style={{ maxWidth: '200px', height: '40px', objectFit: 'contain' }}
                  onError={(e) => {
                    console.error('Logo failed to load:', LOGO_URL);
                    // Fallback to text if image fails
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <p className="text-xs text-gray-500 group-hover:text-blue-600 transition-colors">Smart Irrigation Calculator</p>
              </button>
            </div>
          </div>
          <div className="hidden sm:block text-right">
            <p className="text-sm text-gray-600">
              <a 
                href="https://bigirrigation.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-blue-900 transition-colors"
              >
                bigirrigation.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
