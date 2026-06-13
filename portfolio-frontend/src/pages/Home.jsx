/** BOSH SAHIFA — o'rganilgan mavzular ro'yxati (backend'dan). */
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import "./Home.css";

function excerpt(md, n = 160) {
  // markdown belgilarini olib tashlab, qisqa parcha
  const plain = md
    .replace(/[#>*_`~\-]/g, " ")
    .replace(/\[(.*?)\]\(.*?\)/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
  return plain.length > n ? plain.slice(0, n) + "…" : plain;
}

function fmtDate(iso) {
  return new Date(iso).toLocaleDateString("uz-UZ", {
    year: "numeric", month: "long", day: "numeric",
  });
}

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    api.listPosts()
      .then((data) => { setPosts(data); setStatus("ready"); })
      .catch(() => setStatus("error"));
  }, []);

  return (
    <div className="home">
      <div className="home__intro">
        <h1>O'rganish daftari</h1>
        <p>
          Bu yerda o'rganayotgan mavzularimni yozib boraman — SQL, statistika,
          ma'lumotlar tahlili va boshqalar. Kim xohlasa, o'qib o'rganishi mumkin.
        </p>
      </div>

      {status === "loading" && <p className="muted">Yuklanmoqda…</p>}
      {status === "error" && (
        <p className="muted">Mavzularni yuklab bo'lmadi. Keyinroq urinib ko'ring.</p>
      )}
      {status === "ready" && posts.length === 0 && (
        <p className="muted">Hali mavzu qo'shilmagan. Tez orada paydo bo'ladi.</p>
      )}

      <ul className="post-list">
        {posts.map((p) => (
          <li key={p.id}>
            <Link to={`/mavzu/${p.slug}`} className="post-card">
              <div className="post-card__meta">
                <span>{fmtDate(p.created_at)}</span>
                {p.tags && <span className="post-card__tags">{p.tags}</span>}
              </div>
              <h2>{p.title}</h2>
              <p>{excerpt(p.content)}</p>
              <span className="post-card__read">O'qish →</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
