import "./Footer.css";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <span className="footer__logo">MAHMUD<span>.dev</span></span>
        <span className="footer__copy">
          © {new Date().getFullYear()} · React · FastAPI · PostgreSQL bilan qurilgan
        </span>
      </div>
    </footer>
  );
}
