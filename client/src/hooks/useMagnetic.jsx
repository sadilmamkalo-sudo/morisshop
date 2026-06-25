import { useRef, useCallback } from 'react';
import { motion } from 'framer-motion';

export default function Magnetic({ children, strength = 0.3 }) {
  const ref = useRef(null);

  const handleMouse = useCallback((e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) * strength;
    const y = (e.clientY - rect.top - rect.height / 2) * strength;
    ref.current.style.transform = `translate(${x}px, ${y}px)`;
  }, [strength]);

  const reset = useCallback(() => {
    if (!ref.current) return;
    ref.current.style.transform = 'translate(0px, 0px)';
  }, []);

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      style={{ transition: 'transform 0.3s cubic-bezier(0.33, 1, 0.68, 1)' }}
    >
      {children}
    </motion.div>
  );
}
