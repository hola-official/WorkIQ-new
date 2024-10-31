import Navbar from "./components/Navbar";
import HeroSection from "./components/HeroSection";
import Footer from "@/components/Footer";
import About from "./components/About";
import Features from "./components/Features";
import Contact from "./components/Contact";
import HowItWorks from "./components/HowItWorks";
import Pricing from "./components/Pricing";

const Home = () => {
  return (
    <section className="min-h-screen bg-gray-200">
      <Navbar />
      <div className="px-4">
        <HeroSection />
        <About />
        <Features />
        <HowItWorks />
        <Pricing />
        <Contact />
        <Footer />
      </div>
    </section>
  );
};

export default Home;
