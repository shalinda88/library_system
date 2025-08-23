import { motion } from 'framer-motion';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'white';
}

const LoadingSpinner = ({ 
  size = 'md', 
  color = 'primary' 
}: LoadingSpinnerProps) => {
  // Size mappings
  const sizeMap = {
    sm: 'h-5 w-5',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  // Color mappings
  const colorMap = {
    primary: 'text-blue-600',
    secondary: 'text-purple-600',
    white: 'text-white',
  };

  const spinTransition = {
    repeat: Infinity,
    ease: "linear" as const,
    duration: 1
  };

  return (
    <div className="flex items-center justify-center">
      <motion.div
        data-testid="loading-spinner"
        className={`${sizeMap[size]} ${colorMap[color]} animate-spin`}
        animate={{ rotate: 360 }}
        transition={spinTransition}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          className="w-full h-full"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      </motion.div>
    </div>
  );
};

export default LoadingSpinner;
