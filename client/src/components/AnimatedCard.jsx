import { motion } from 'framer-motion';
import { cardVariants } from '../utils/animations';

export default function AnimatedCard({ children, className = '', ...props }) {
  return (
    <motion.div
      className={className}
      variants={cardVariants}
      initial="initial"
      whileHover="hover"
      {...props}
    >
      {children}
    </motion.div>
  );
}
