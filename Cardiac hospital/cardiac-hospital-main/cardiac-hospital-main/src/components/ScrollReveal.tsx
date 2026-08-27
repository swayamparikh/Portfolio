import { ReactNode, Key } from 'react';
import { motion, useReducedMotion } from 'motion/react';

interface ScrollRevealProps {
  children: ReactNode;
  key?: Key | string | number | null;
  delay?: number;
  duration?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  distance?: number;
  className?: string;
  id?: string;
}

export function ScrollReveal({
  children,
  delay = 0,
  duration = 0.5,
  direction = 'up',
  distance = 30,
  className = '',
  id
}: ScrollRevealProps) {
  const shouldReduceMotion = useReducedMotion();

  // If user requests reduced motion at OS level (accessibility), bypass translation animations
  if (shouldReduceMotion) {
    return (
      <motion.div
        id={id}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration, delay }}
        className={className}
      >
        {children}
      </motion.div>
    );
  }

  const getDirectionalStyles = () => {
    switch (direction) {
      case 'up':
        return { y: distance };
      case 'down':
        return { y: -distance };
      case 'left':
        return { x: distance };
      case 'right':
        return { x: -distance };
      case 'none':
      default:
        return {};
    }
  };

  return (
    <motion.div
      id={id}
      initial={{
        opacity: 0,
        ...getDirectionalStyles()
      }}
      whileInView={{
        opacity: 1,
        x: 0,
        y: 0
      }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{
        duration,
        delay,
        ease: [0.25, 1, 0.5, 1] // Custom cubic-bezier for a soft, professional elastic finish
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
