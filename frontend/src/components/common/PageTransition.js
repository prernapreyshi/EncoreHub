import React from 'react';
import { motion } from 'framer-motion';

// Variants shared across all page transitions.
// Kept deliberately subtle — a light fade + 12px vertical slide.
// Fast (0.25s) so it never feels sluggish on navigate.
const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: -8 },
};

const pageTransition = {
  duration: 0.25,
  ease: 'easeOut',
};

/**
 * Wrap any page component's root element with this to get a consistent
 * enter/exit animation.  Usage:
 *
 *   const MyPage = () => (
 *     <PageTransition>
 *       <div className="...">...</div>
 *     </PageTransition>
 *   );
 */
const PageTransition = ({ children, className = '' }) => (
  <motion.div
    variants={pageVariants}
    initial="initial"
    animate="animate"
    exit="exit"
    transition={pageTransition}
    className={className}
  >
    {children}
  </motion.div>
);

export default PageTransition;
