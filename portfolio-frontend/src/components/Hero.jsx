/** HERO — saytning birinchi ekrani.
 *  3D fon endi global (butun saytda), bu yerda faqat kontent + nozik kirish animatsiyasi. */
import { motion } from "framer-motion";
import "./Hero.css";

const ease = [0.22, 1, 0.36, 1];

export default function Hero() {
  return (
    <header id="top" className="hero">
      {/* matn o'qilishini yaxshilash uchun lokal gradient */}
      <div className="hero__overlay" />

      <div className="container hero__content">
        <motion.p
          className="hero__tag"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease }}
        >
          Ma'lumotlar tahlilchisi → ML muhandisi
        </motion.p>

        <motion.h1
          className="hero__name"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease, delay: 0.08 }}
        >
          Mahmud<br />Elmurodov
        </motion.h1>

        <motion.p
          className="hero__sub"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease, delay: 0.2 }}
        >
          Python, SQL, Power BI va statistika bilan ma'lumotlardan ma'no
          chiqaraman. O'rganganlarim va loyihalarim — shu yerda.
        </motion.p>

        <motion.div
          className="hero__cta"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease, delay: 0.32 }}
        >
          <a href="#projects" className="btn">Loyihalarni ko'rish</a>
          <a href="#contact" className="btn btn-ghost">Bog'lanish</a>
        </motion.div>
      </div>

      <a href="#about" className="hero__scroll" aria-label="Pastga">
        <span /> scroll
      </a>
    </header>
  );
}
