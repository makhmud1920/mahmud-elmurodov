import { Link, NavLink } from "react-router-dom";
import "./Header.css";

export default function Header() {
  return (
    <header className="site-header">
      <div className="container site-header__inner">
        <Link to="/" className="site-logo">
          O'rganish daftari
        </Link>
        <nav className="site-nav">
          <NavLink to="/" end>Bosh sahifa</NavLink>
          <NavLink to="/admin">Admin</NavLink>
        </nav>
      </div>
    </header>
  );
}
