import Background3D from "./components/Background3D";
import RobotCompanion from "./components/RobotCompanion";
import FlyingBot from "./components/FlyingBot";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import About from "./components/About";
import Skills from "./components/Skills";
import Projects from "./components/Projects";
import Blog from "./components/Blog";
import Contact from "./components/Contact";
import Footer from "./components/Footer";

export default function App() {
  return (
    <>
      {/* Butun sayt ortida turadigan doimiy 3D fon */}
      <Background3D />
      {/* Sayt pastida yuradigan 3D robot hamroh */}
      <RobotCompanion />
      {/* Butun ekran bo'ylab uchadigan skaut-dron */}
      <FlyingBot />

      <Navbar />
      <Hero />
      <main>
        <About />
        <Skills />
        <Projects />
        <Blog />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
