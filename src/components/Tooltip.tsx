import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  position = 'top',
  className = '',
}) => {
  const [isVisible, setIsVisible] = useState(false);

  // Position styles
  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  const arrowClasses = {
    top: 'top-full left-1/2 -translate-x-1/2 border-t-stone-900 dark:border-t-white',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-stone-900 dark:border-b-white',
    left: 'left-full top-1/2 -translate-y-1/2 border-l-stone-900 dark:border-l-white',
    right: 'right-full top-1/2 -translate-y-1/2 border-r-stone-900 dark:border-r-white',
  };

  return (
    <div 
      className={`relative inline-block ${className}`}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
    >
      {React.isValidElement(children) 
        ? React.cloneElement(children as React.ReactElement<any>, { 'aria-label': content })
        : children}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: position === 'top' ? 4 : position === 'bottom' ? -4 : 0 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: position === 'top' ? 4 : position === 'bottom' ? -4 : 0 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className={`absolute z-[100] px-3 py-1.5 text-xs font-bold text-white dark:text-stone-900 bg-stone-900 dark:bg-white rounded-lg shadow-lg whitespace-nowrap pointer-events-none tracking-wide text-center uppercase font-sans ${positionClasses[position]}`}
            role="tooltip"
          >
            {content}
            <div className={`absolute border-4 border-transparent ${arrowClasses[position]}`} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
