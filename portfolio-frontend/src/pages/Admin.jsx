/** ADMIN — login + mavzularni boshqarish (qo'shish/tahrirlash/o'chirish).
 *  Faqat siz uchun. Backend cookie + CSRF bilan himoyalaydi. */
import { useEffect, useState } from "react";
import { api } from "../lib/api";
import "./Admin.css";

const EMPTY = { id: null, title: "", tags: "", content: "", is_published: true };

export default function Admin() {
  const [auth, setAuth] = useState("checking"); // checking | out | {username}
  const [creds, setCreds] = useState({ username: "", password: "" });
  const [err, setErr] = useState("");

  const [posts, setPosts] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  // tizimga kirganmi?
  useEffect(() => {
    api.me().then((u) => setAuth(u)).catch(() => setAuth("out"));
  }, []);

  // kirgan bo'lsa — mavzularni yuklash
  useEffect(() => {
    if (auth && auth !== "out" && auth !== "checking") loadPosts();
  }, [auth]);

  const loadPosts = () => api.adminPosts().then(setPosts).catch(() => {});

  const doLogin = async (e) => {
    e.preventDefault();
    setErr("");
    try {
      const u = await api.login(creds.username, creds.password);
      setAuth(u);
    } catch (e) {
      setErr(e.message || "Kirish muvaffaqiyatsiz");
    }
  };

  const doLogout = async () => {
    try { await api.logout(); } catch { /* ignore */ }
    setAuth("out");
    setPosts([]);
  };

  const save = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) return;
    setSaving(true);
    setMsg("");
    try {
      const data = {
        title: form.title,
        tags: form.tags,
        content: form.content,
        is_published: form.is_published,
      };
      if (form.id) await api.updatePost(form.id, data);
      else await api.createPost(data);
      setForm(EMPTY);
      setMsg("✓ Saqlandi");
      loadPosts();
    } catch (e) {
      setMsg("Xato: " + e.message);
    } finally {
      setSaving(false);
    }
  };

  const edit = (p) => {
    setForm({ id: p.id, title: p.title, tags: p.tags || "", content: p.content, is_published: p.is_published });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const remove = async (p) => {
    if (!confirm(`"${p.title}" o'chirilsinmi?`)) return;
    try { await api.deletePost(p.id); loadPosts(); } catch (e) { alert(e.message); }
  };

  // --- LOGIN EKRANI ---
  if (auth === "checking") return <p className="muted">Tekshirilmoqda…</p>;

  if (auth === "out") {
    return (
      <div className="admin-login">
        <h1>Admin kirish</h1>
        <form onSubmit={doLogin}>
          <input
            placeholder="Login" value={creds.username}
            onChange={(e) => setCreds({ ...creds, username: e.target.value })}
          />
          <input
            type="password" placeholder="Parol" value={creds.password}
            onChange={(e) => setCreds({ ...creds, password: e.target.value })}
          />
          <button className="btn" type="submit">Kirish</button>
          {err && <p className="form-err">{err}</p>}
        </form>
      </div>
    );
  }

  // --- BOSHQARUV PANELI ---
  return (
    <div className="admin">
      <div className="admin__top">
        <h1>{form.id ? "Mavzuni tahrirlash" : "Yangi mavzu"}</h1>
        <button className="btn-text" onClick={doLogout}>Chiqish ({auth.username})</button>
      </div>

      <form className="admin-form" onSubmit={save}>
        <input
          placeholder="Sarlavha" value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />
        <input
          placeholder="Teglar (vergul bilan: SQL, Tahlil)" value={form.tags}
          onChange={(e) => setForm({ ...form, tags: e.target.value })}
        />
        <textarea
          rows="14" placeholder="Matn (Markdown: # sarlavha, **qalin**, ```kod```, - ro'yxat)"
          value={form.content}
          onChange={(e) => setForm({ ...form, content: e.target.value })}
        />
        <label className="admin-check">
          <input
            type="checkbox" checked={form.is_published}
            onChange={(e) => setForm({ ...form, is_published: e.target.checked })}
          />
          Chop etilsin (belgilanmasa — qoralama)
        </label>
        <div className="admin-form__actions">
          <button className="btn" type="submit" disabled={saving}>
            {saving ? "Saqlanmoqda…" : form.id ? "Yangilash" : "Qo'shish"}
          </button>
          {form.id && (
            <button type="button" className="btn-text" onClick={() => setForm(EMPTY)}>
              Bekor qilish
            </button>
          )}
          {msg && <span className="admin-msg">{msg}</span>}
        </div>
      </form>

      <h2 className="admin__listtitle">Barcha mavzular ({posts.length})</h2>
      <ul className="admin-list">
        {posts.map((p) => (
          <li key={p.id}>
            <div>
              <strong>{p.title}</strong>
              {!p.is_published && <span className="draft-badge">qoralama</span>}
              <div className="admin-list__slug">/{p.slug}</div>
            </div>
            <div className="admin-list__actions">
              <button className="btn-text" onClick={() => edit(p)}>Tahrir</button>
              <button className="btn-text danger" onClick={() => remove(p)}>O'chirish</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
