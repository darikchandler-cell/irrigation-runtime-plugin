import { AlertTriangle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { createPortal } from 'react-dom';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
}

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'warning',
}: ConfirmDialogProps) {
  const colors = {
    danger: { bg: '#FEE2E2', icon: '#DC2626', button: '#DC2626' },
    warning: { bg: '#FEF3C7', icon: '#D97706', button: '#D97706' },
    info: { bg: '#DBEAFE', icon: '#0066CC', button: '#0066CC' },
  };

  const color = colors[variant];

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  // Close on Escape key
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 flex items-center justify-center p-4 pointer-events-none overflow-y-auto"
          style={{ zIndex: 1000002, pointerEvents: 'none' }}
          onKeyDown={handleKeyDown}
        >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 20 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative my-auto"
              style={{ 
                maxHeight: '90vh', 
                overflowY: 'auto',
                zIndex: 1000003,
                pointerEvents: 'auto'
              }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="dialog-title"
              aria-describedby="dialog-description"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                style={{ pointerEvents: 'auto', zIndex: 1000005 }}
                aria-label="Close dialog"
                type="button"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Icon */}
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center mb-4"
                style={{ backgroundColor: color.bg }}
              >
                <AlertTriangle className="w-6 h-6" style={{ color: color.icon }} />
              </div>

              {/* Content */}
              <h2 id="dialog-title" className="text-gray-900 mb-2">
                {title}
              </h2>
              <p id="dialog-description" className="text-gray-600 mb-6">
                {message}
              </p>

              {/* Actions */}
              <div className="flex gap-3" style={{ pointerEvents: 'auto', position: 'relative', zIndex: 1000004 }}>
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                  style={{ pointerEvents: 'auto', position: 'relative', zIndex: 1000005 }}
                  type="button"
                >
                  {cancelText}
                </button>
                <button
                  onClick={handleConfirm}
                  className="flex-1 px-4 py-2.5 text-white rounded-lg transition-all duration-200 cursor-pointer"
                  style={{
                    backgroundColor: color.button,
                    boxShadow: `0 4px 12px ${color.button}40`,
                    pointerEvents: 'auto',
                    position: 'relative',
                    zIndex: 1000005
                  }}
                  type="button"
                >
                  {confirmText}
                </button>
              </div>
            </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  // Render modal to document.body using portal to ensure it appears above everything
  return typeof document !== 'undefined' 
    ? createPortal(modalContent, document.body)
    : null;
}
