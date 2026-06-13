/** REZYUME bo'limi — Data Analyst profili (haqiqiy ma'lumotlar). */
import Reveal from "./Reveal";
import "./About.css";

const facts = [
  { k: "Tug'ilgan yil", v: "2005" },
  { k: "Joylashuv", v: "Toshkent, O'zbekiston" },
  { k: "Yo'nalish", v: "Data Analyst" },
  { k: "Ta'lim", v: "TATU — Kompyuter injiniringi (Bakalavr)" },
  { k: "Tillar", v: "O'zbek (ona tili), Ingliz (so'zlashuv)" },
];

export default function About() {
  return (
    <section id="about" className="section about">
      <div className="container">
        <Reveal>
          <p className="eyebrow">Kim men</p>
          <h2 className="section-title">Rezyume</h2>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="about__grid">
            <div className="about__bio">
              <p>
                Men — Toshkentda yashovchi <strong>Data Analyst</strong>.
                Ma'lumotlarni tozalash, tahlil qilish va vizualizatsiya orqali
                ulardan amaliy ma'no chiqaraman — qaror qabul qilishga yordam
                beradigan aniq xulosalar shaklida.
              </p>
              <p>
                Toshkent Axborot Texnologiyalari Universitetining
                <strong> Kompyuter injiniringi</strong> yo'nalishini (bakalavr)
                tugatganman. Asosiy vositalarim — <strong>Python, SQL, Power BI</strong>
                va statistika.
              </p>

              <div className="about__cta">
                <a
                  href="https://github.com/makhmud1920"
                  target="_blank" rel="noreferrer" className="btn"
                >
                  GitHub profil ↗
                </a>
                <a
                  href="https://www.linkedin.com/in/mahmud-elmurodov-bb4051367"
                  target="_blank" rel="noreferrer" className="btn btn-ghost"
                >
                  LinkedIn ↗
                </a>
              </div>
            </div>

            <ul className="about__facts">
              {facts.map((f) => (
                <li key={f.k} className="fact">
                  <span className="fact__k">{f.k}</span>
                  <span className="fact__v">{f.v}</span>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
