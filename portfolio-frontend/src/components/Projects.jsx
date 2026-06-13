/** LOYIHALAR — backend API'dan yuklanadi (real, dinamik ma'lumot).
 *  3 holat: yuklanmoqda / xato / ma'lumot bor. */
import { useEffect, useState } from "react";
import { api } from "../lib/api";
import Reveal from "./Reveal";
import "./Projects.css";

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [status, setStatus] = useState("loading"); // loading | error | ready

  useEffect(() => {
    api
      .getProjects()
      .then((data) => {
        setProjects(data);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  }, []);

  return (
    <section id="projects" className="section projects">
      <div className="container">
        <Reveal>
          <p className="eyebrow">Qurganlarim</p>
          <h2 className="section-title">Loyihalar</h2>
        </Reveal>

        {status === "loading" && (
          <p className="projects__msg">Yuklanmoqda...</p>
        )}

        {status === "error" && (
          <p className="projects__msg projects__msg--error">
            Loyihalarni yuklab bo'lmadi. Backend ishga tushganini tekshiring
            va sahifani yangilang.
          </p>
        )}

        {status === "ready" && projects.length === 0 && (
          <p className="projects__msg">
            Hali loyiha qo'shilmagan. Admin paneldan birinchi loyihangizni qo'shing.
          </p>
        )}

        <div className="projects__grid">
          {projects.map((p, i) => (
            <Reveal key={p.id} delay={i * 0.08}>
              <article className="pcard">
                {p.is_featured && <span className="pcard__badge">★ Tanlangan</span>}
                <h3 className="pcard__title">{p.title}</h3>
                <p className="pcard__desc">{p.description}</p>

                <div className="pcard__tech">
                  {p.tech_stack.split(",").map((t) => (
                    <span key={t} className="pcard__tag">{t.trim()}</span>
                  ))}
                </div>

                <div className="pcard__links">
                  {p.github_url && (
                    <a href={p.github_url} target="_blank" rel="noreferrer">GitHub ↗</a>
                  )}
                  {p.live_url && (
                    <a href={p.live_url} target="_blank" rel="noreferrer">Sayt ↗</a>
                  )}
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
