import { motion } from 'framer-motion';
import { useState } from 'react';
import './AnimatedButton.css';

const buttonVariants = {
  rest: {
    scale: 1
  },
  tap: {
    scale: 0.95,
    transition: {
      duration: 0.1
    }
  },
  hover: {
    scale: 1.02,
    transition: {
      duration: 0.2
    }
  }
};

const AnimatedButton = ({ 
  children, 
  onClick, 
  className = '', 
  disabled = false,
  type = 'button',
  ...props 
}) => {
  const [ripples, setRipples] = useState([]);

  const handleClick = (e) => {
    if (disabled) return;

    // Create ripple effect
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const ripple = { x, y, id: Date.now() };

    setRipples([ripple]);
    setTimeout(() => setRipples([]), 600);

    // Call the original onClick handler
    if (onClick) onClick(e);
  };

  return (
    <motion.button
      type={type}
      className={`animated-button ${className}`}
      variants={buttonVariants}
      initial="rest"
      whileHover={!disabled ? 'hover' : 'rest'}
      whileTap={!disabled ? 'tap' : 'rest'}
      onClick={handleClick}
      disabled={disabled}
      {...props}
    >
      {/* Ripple effects */}
      {ripples.map(ripple => (
        <motion.span
          key={ripple.id}
          className="ripple"
          style={{
            left: ripple.x,
            top: ripple.y
          }}
          initial={{ scale: 0, opacity: 1 }}
          animate={{ scale: 4, opacity: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      ))}
      
      {children}
    </motion.button>
  );
};

export default AnimatedButton;
