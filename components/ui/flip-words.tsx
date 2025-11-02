"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export const FlipWords = ({
  words,
  duration = 3000,
  className,
}: {
  words: string[];
  duration?: number;
  className?: string;
}) => {
  const [currentWord, setCurrentWord] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWord((prev) => (prev + 1) % words.length);
    }, duration);

    return () => clearInterval(interval);
  }, [words.length, duration]);

  // Find the longest word to set consistent width
  const maxWidth = Math.max(...words.map(word => word.length));

  return (
    <span className={`relative inline-block ${className}`} style={{ minWidth: `${maxWidth * 0.6}em`, display: 'inline-block' }}>
      <AnimatePresence mode="wait">
        <motion.span
          key={currentWord}
          initial={{ opacity: 0, y: 5, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -5, scale: 0.8 }}
          transition={{
            duration: 0.3,
            ease: "easeInOut",
          }}
          className="inline-block"
          style={{
            transformStyle: "preserve-3d",
          }}
        >
          {words[currentWord]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
};
