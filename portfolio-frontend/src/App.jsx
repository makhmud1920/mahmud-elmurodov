import { Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Home from "./pages/Home";
import PostPage from "./pages/PostPage";
import Admin from "./pages/Admin";

export default function App() {
  return (
    <>
      <Header />
      <main className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/mavzu/:slug" element={<PostPage />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </main>
      <footer className="footer">
        <div className="container">
          © {new Date().getFullYear()} Mahmud Elmurodov · O'rganish daftari
        </div>
      </footer>
    </>
  );
}
