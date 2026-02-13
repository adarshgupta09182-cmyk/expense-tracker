import { motion } from 'framer-motion';

const cardVariants = {
  rest: {
    scale: 1,
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
  },
  hover: {
    scale: 1.02,
    boxShadow: '0 12px 24px rgba(0, 0, 0, 0.15)',
    transition: {
      duration: 0.3,
      ease: 'easeOut'
    }
  }
};

const AnimatedCard = ({ children, className = '', ...props }) => {
  return (
    <motion.div
      className={className}
      variants={cardVariants}
      initial="rest"
      whileHover="hover"
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default AnimatedCard;
