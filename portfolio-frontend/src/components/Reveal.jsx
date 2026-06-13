/** Scroll-reveal o'rovchi — bo'lim ko'rinishga kelganda yumshoq paydo bo'ladi.
 *  Har bir bo'lim kontentini shu bilan o'raymiz. */
import { motion } from "framer-motion";

const ease = [0.22, 1, 0.36, 1];

export default function Reveal({ children, delay = 0, y = 28, className }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-90px" }}
      transition={{ duration: 0.7, ease, delay }}
    >
      {children}
    </motion.div>
  );
}
