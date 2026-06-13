/** Yuqori navigatsiya — scroll bo'lganda foni qoraytadi */
import { useState, useEffect } from "react";
import "./Navbar.css";

const links = [
  { href: "#about", label: "Rezyume" },
  { href: "#skills", label: "Ko'nikmalar" },
  { href: "#projects", label: "Loyihalar" },
  { href: "#blog", label: "Kundalik" },
  { href: "#contact", label: "Aloqa" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav className={`nav ${scrolled ? "nav--scrolled" : ""}`}>
      <div className="container nav__inner">
        <a href="#top" className="nav__logo">
          MAHMUD<span>.dev</span>
        </a>

        <button
          className="nav__burger"
          onClick={() => setOpen(!open)}
          aria-label="Menyu"
        >
          <span /><span /><span />
        </button>

        <ul className={`nav__links ${open ? "nav__links--open" : ""}`}>
          {links.map((l) => (
            <li key={l.href}>
              <a href={l.href} onClick={() => setOpen(false)}>{l.label}</a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
