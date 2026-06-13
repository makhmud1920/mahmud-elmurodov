/** O'RGANISH KUNDALIGI (blog).
 *  Hozircha namuna ma'lumot. Backend'ga `posts` routeri qo'shilgach,
 *  Projects'dagidek api.getPosts() bilan ulaymiz. */
import Reveal from "./Reveal";
import "./Blog.css";

const samplePosts = [
  {
    id: 1,
    title: "SQL window funksiyalarini tushunish",
    tags: "SQL, Tahlil",
    date: "2026-05-20",
    excerpt: "ROW_NUMBER, RANK va LAG/LEAD — guruh ichida tartiblash va taqqoslash.",
  },
  {
    id: 2,
    title: "Bessel tuzatmasi nega n-1?",
    tags: "Statistika",
    date: "2026-05-12",
    excerpt: "Tanlanma dispersiyasida nega n emas, n-1 ga bo'lamiz — intuitiv izoh.",
  },
  {
    id: 3,
    title: "Firibgarlik datasetini SQL bilan tahlil",
    tags: "SQL, Bank",
    date: "2026-04-30",
    excerpt: "Kaggle fraud dataset ustida DB Browser orqali anomaliyalarni izlash.",
  },
];

export default function Blog() {
  return (
    <section id="blog" className="section blog">
      <div className="container">
        <Reveal>
          <p className="eyebrow">Ochiq daftar</p>
          <h2 className="section-title">O'rganish kundaligi</h2>
        </Reveal>

        <div className="blog__list">
          {samplePosts.map((post, i) => (
            <Reveal key={post.id} delay={i * 0.08}>
              <a href={`#post-${post.id}`} className="bpost">
                <div className="bpost__meta">
                  <span className="bpost__date">{post.date}</span>
                  <span className="bpost__tags">{post.tags}</span>
                </div>
                <h3 className="bpost__title">{post.title}</h3>
                <p className="bpost__excerpt">{post.excerpt}</p>
                <span className="bpost__read">O'qish →</span>
              </a>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
