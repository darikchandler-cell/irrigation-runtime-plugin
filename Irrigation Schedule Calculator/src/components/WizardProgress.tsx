import { Check } from 'lucide-react';

interface WizardProgressProps {
  currentStep: number;
}

const steps = [
  { number: 1, label: 'Watering Rules' },
  { number: 2, label: 'Zone Details' },
  { number: 3, label: 'Your Schedule' },
];

export default function WizardProgress({ currentStep }: WizardProgressProps) {
  return (
    <div className="bg-white border-b border-gray-200 py-4 sm:py-6 rounded-lg">
      <div className="max-w-[1200px] mx-auto px-2 sm:px-6 lg:px-8 flex justify-center">
        <div className="flex items-center">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center">
              {/* Step Circle */}
              <div className="flex flex-col items-center">
                <div
                  className={`
                    w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-200
                    ${
                      currentStep > step.number
                        ? 'bg-blue-500 text-white'
                        : currentStep === step.number
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-300 text-gray-600'
                    }
                  `}
                >
                  {currentStep > step.number ? (
                    <Check className="w-4 h-4 sm:w-5 sm:h-5" />
                  ) : (
                    <span className="text-xs sm:text-sm">{step.number}</span>
                  )}
                </div>
                <span
                  className={`
                    mt-1 sm:mt-2 text-[10px] sm:text-xs md:text-sm whitespace-nowrap text-center max-w-[60px] sm:max-w-none
                    ${currentStep >= step.number ? 'text-gray-900' : 'text-gray-500'}
                  `}
                >
                  {step.label}
                </span>
              </div>

              {/* Connecting Line */}
              {index < steps.length - 1 && (
                <div className="w-8 sm:w-16 md:w-24 lg:w-32 h-0.5 mx-2 sm:mx-4 md:mx-6">
                  <div
                    className={`
                      h-full transition-all duration-200
                      ${currentStep > step.number ? 'bg-blue-500' : 'bg-gray-300'}
                    `}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
