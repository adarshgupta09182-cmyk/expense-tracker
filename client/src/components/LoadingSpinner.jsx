import { motion } from 'framer-motion';
import './LoadingSpinner.css';

const LoadingSpinner = ({ size = 'md', fullScreen = false }) => {
  const sizeMap = {
    sm: 24,
    md: 40,
    lg: 60
  };

  const spinnerSize = sizeMap[size];

  if (fullScreen) {
    return (
      <div className="loading-fullscreen">
        <motion.div
          className="spinner"
          style={{ width: spinnerSize, height: spinnerSize }}
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <div className="spinner-ring"></div>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      className="spinner"
      style={{ width: spinnerSize, height: spinnerSize }}
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
    >
      <div className="spinner-ring"></div>
    </motion.div>
  );
};

export default LoadingSpinner;
