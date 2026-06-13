/** MAVZU SAHIFASI — to'liq matn (Markdown render). */
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { api } from "../lib/api";
import "./PostPage.css";

function fmtDate(iso) {
  return new Date(iso).toLocaleDateString("uz-UZ", {
    year: "numeric", month: "long", day: "numeric",
  });
}

export default function PostPage() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    setStatus("loading");
    api.getPost(slug)
      .then((data) => { setPost(data); setStatus("ready"); })
      .catch(() => setStatus("error"));
  }, [slug]);

  if (status === "loading") return <p className="muted">Yuklanmoqda…</p>;
  if (status === "error" || !post)
    return (
      <div className="post">
        <p className="muted">Mavzu topilmadi.</p>
        <Link to="/" className="back-link">← Bosh sahifa</Link>
      </div>
    );

  return (
    <article className="post">
      <Link to="/" className="back-link">← Barcha mavzular</Link>
      <div className="post__meta">
        <span>{fmtDate(post.created_at)}</span>
        {post.tags && <span className="post__tags">{post.tags}</span>}
      </div>
      <h1 className="post__title">{post.title}</h1>
      <div className="post__body">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content}</ReactMarkdown>
      </div>
    </article>
  );
}
