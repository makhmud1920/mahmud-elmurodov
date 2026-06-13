/** KO'NIKMALAR — Data Analyst arsenali, ko'rinishga kelganda to'ladigan barlar. */
import { useEffect, useRef, useState } from "react";
import Reveal from "./Reveal";
import "./Skills.css";

const skills = [
  { name: "Python", level: 85, cat: "Dasturlash" },
  { name: "SQL", level: 88, cat: "Ma'lumotlar bazasi" },
  { name: "Power BI", level: 82, cat: "Vizualizatsiya" },
  { name: "Statistika", level: 80, cat: "Tahlil" },
  { name: "Pandas", level: 83, cat: "Python kutubxonasi" },
];

export default function Skills() {
  const [visible, setVisible] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && setVisible(true),
      { threshold: 0.3 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <section id="skills" className="section skills" ref={ref}>
      <div className="container">
        <Reveal>
          <p className="eyebrow">Texnik arsenal</p>
          <h2 className="section-title">Ko'nikmalar</h2>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="skills__grid">
            {skills.map((s) => (
              <div key={s.name} className="skill">
                <div className="skill__head">
                  <span className="skill__name">{s.name}</span>
                  <span className="skill__cat">{s.cat}</span>
                </div>
                <div className="skill__track">
                  <div
                    className="skill__fill"
                    style={{ width: visible ? `${s.level}%` : "0%" }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
