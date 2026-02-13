import { motion } from 'framer-motion';
import './LoadingSkeleton.css';

export default function LoadingSkeleton({ count = 3, type = 'card' }) {
  // Subtle stagger animation for skeleton items
  const containerVariants = {
    animate: {
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    animate: {
      opacity: 1,
      transition: {
        duration: 0.3
      }
    }
  };

  if (type === 'card') {
    return (
      <motion.div 
        className="skeleton-container"
        variants={containerVariants}
        animate="animate"
      >
        {Array.from({ length: count }).map((_, i) => (
          <motion.div
            key={i}
            className="skeleton-card"
            variants={itemVariants}
          >
            <div className="skeleton-header"></div>
            <div className="skeleton-line"></div>
            <div className="skeleton-line short"></div>
          </motion.div>
        ))}
      </motion.div>
    );
  }

  if (type === 'table') {
    return (
      <motion.div 
        className="skeleton-table"
        variants={containerVariants}
        animate="animate"
      >
        {Array.from({ length: count }).map((_, i) => (
          <motion.div
            key={i}
            className="skeleton-row"
            variants={itemVariants}
          >
            <div className="skeleton-cell"></div>
            <div className="skeleton-cell"></div>
            <div className="skeleton-cell"></div>
            <div className="skeleton-cell short"></div>
          </motion.div>
        ))}
      </motion.div>
    );
  }

  if (type === 'form') {
    return (
      <motion.div 
        className="skeleton-form"
        variants={itemVariants}
        animate="animate"
      >
        <div className="skeleton-input"></div>
        <div className="skeleton-input"></div>
        <div className="skeleton-input"></div>
        <div className="skeleton-button"></div>
      </motion.div>
    );
  }

  if (type === 'chart') {
    return (
      <motion.div 
        className="skeleton-chart"
        variants={itemVariants}
        animate="animate"
      ></motion.div>
    );
  }

  return null;
}
