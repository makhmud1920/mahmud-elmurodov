/** ALOQA — forma backend'ga POST qiladi.
 *  Backend'ga `messages` routeri qo'shilgach to'liq ishlaydi.
 *  ESLATMA: React'da <form> emas, onClick handler ishlatamiz. */
import { useState } from "react";
import { api } from "../lib/api";
import Reveal from "./Reveal";
import "./Contact.css";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", content: "" });
  const [status, setStatus] = useState("idle"); // idle | sending | sent | error

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.content) return;
    setStatus("sending");
    try {
      await api.sendMessage(form);
      setStatus("sent");
      setForm({ name: "", email: "", content: "" });
    } catch {
      setStatus("error");
    }
  };

  return (
    <section id="contact" className="section contact">
      <div className="container">
        <Reveal>
          <div className="contact__inner">
            <div className="contact__left">
              <p className="eyebrow">Aloqa</p>
              <h2 className="section-title">Keling, gaplashaylik</h2>
              <p className="contact__text">
                Loyiha, hamkorlik yoki shunchaki savol — yozing. Imkon qadar
                tez javob beraman.
              </p>
              <div className="contact__links">
                <a href="mailto:elmurodovmaxmud8@gmail.com">elmurodovmaxmud8@gmail.com</a>
                <a href="https://t.me/makhmud_1920" target="_blank" rel="noreferrer">Telegram ↗</a>
                <a href="https://github.com/makhmud1920" target="_blank" rel="noreferrer">GitHub ↗</a>
                <a href="https://www.linkedin.com/in/mahmud-elmurodov-bb4051367" target="_blank" rel="noreferrer">LinkedIn ↗</a>
              </div>
            </div>

            <div className="contact__form">
              <input
                type="text" placeholder="Ismingiz"
                value={form.name} onChange={update("name")}
              />
              <input
                type="email" placeholder="Email"
                value={form.email} onChange={update("email")}
              />
              <textarea
                rows="5" placeholder="Xabaringiz..."
                value={form.content} onChange={update("content")}
              />
              <button
                className="btn" onClick={handleSubmit}
                disabled={status === "sending"}
              >
                {status === "sending" ? "Yuborilmoqda..." : "Xabar yuborish"}
              </button>

              {status === "sent" && (
                <p className="contact__status contact__status--ok">
                  ✓ Yuborildi. Rahmat!
                </p>
              )}
              {status === "error" && (
                <p className="contact__status contact__status--err">
                  Yuborib bo'lmadi. Backend'da contact routeri borligini tekshiring.
                </p>
              )}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
