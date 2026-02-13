import { motion } from 'framer-motion';
import { skeletonVariants } from '../utils/animations';
import './LoadingSkeleton.css';

export default function LoadingSkeleton({ count = 3, type = 'card' }) {
  if (type === 'card') {
    return (
      <div className="skeleton-container">
        {Array.from({ length: count }).map((_, i) => (
          <motion.div
            key={i}
            className="skeleton-card"
            variants={skeletonVariants}
            animate="animate"
          >
            <div className="skeleton-header"></div>
            <div className="skeleton-line"></div>
            <div className="skeleton-line short"></div>
          </motion.div>
        ))}
      </div>
    );
  }

  if (type === 'table') {
    return (
      <div className="skeleton-table">
        {Array.from({ length: count }).map((_, i) => (
          <motion.div
            key={i}
            className="skeleton-row"
            variants={skeletonVariants}
            animate="animate"
          >
            <div className="skeleton-cell"></div>
            <div className="skeleton-cell"></div>
            <div className="skeleton-cell"></div>
            <div className="skeleton-cell short"></div>
          </motion.div>
        ))}
      </div>
    );
  }

  return null;
}
