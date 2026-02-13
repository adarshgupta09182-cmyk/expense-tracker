import { motion } from 'framer-motion';
import { buttonVariants } from '../utils/animations';

export default function AnimatedButton({
  children,
  onClick,
  className = '',
  disabled = false,
  type = 'button',
  ...props
}) {
  return (
    <motion.button
      className={className}
      onClick={onClick}
      disabled={disabled}
      type={type}
      variants={buttonVariants}
      initial="initial"
      whileHover={!disabled ? 'hover' : 'initial'}
      whileTap={!disabled ? 'tap' : 'initial'}
      {...props}
    >
      {children}
    </motion.button>
  );
}
