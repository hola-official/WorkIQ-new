import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutGrid, X, User } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const [hasScrolled, setHasScrolled] = useState(false);
  const navigate = useNavigate();
  const navRef = useRef(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);

    const handleScroll = () => {
      const scrollTop = window.pageYOffset;
      if (scrollTop > 50) {
        setHasScrolled(true);
      } else {
        setHasScrolled(false);
      }

      if (hasScrolled) {
        const sections = [
          "home",
          "how-it-works",
          "about",
          "features",
          "pricing",
        ];
        const currentSection = sections.find((section) => {
          const element = document.getElementById(section);
          if (element) {
            const rect = element.getBoundingClientRect();
            return rect.top <= 100 && rect.bottom >= 100;
          }
          return false;
        });
        setActiveSection(currentSection || "");
      }
    };

    const handleOutsideClick = (event) => {
      if (navRef.current && !navRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      window.removeEventListener("resize", checkMobile);
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [hasScrolled]);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleSmoothScroll = (event, targetId) => {
    event.preventDefault();
    const targetSection = document.getElementById(targetId);
    if (targetSection) {
      targetSection.scrollIntoView({ behavior: "smooth" });
    }
    setIsOpen(false);
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 },
  };

  return (
    <motion.nav
      ref={navRef}
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`fixed w-full p-4 md:py-4 z-50 transition-all duration-300 ${
        hasScrolled ? "bg-transparent" : "bg-transparent"
      }`}
    >
      <div className="mx-auto px-4">
        <div
          className={`flex items-center justify-between h-16 px-4 ${
            hasScrolled
              ? "bg-white rounded-3xl shadow-lg bg-opacity-60 backdrop-blur"
              : ""
          }`}
        >
          <div className="flex items-center space-x-4">
            <motion.div
              className={`text-2xl font-bold text-blue-600  flex items-center cursor-pointer`}
              whileHover={{ scale: 1.05 }}
              onClick={scrollToTop}
            >
              <img
                src="/assets/images/WorkIqshort.png"
                alt="WorkIQ"
                className={!isMobile ? "hidden" : " h-16"}
              />
              <span className={isMobile ? "hidden" : ""} {...fadeIn}>
                WorkIQ
              </span>
            </motion.div>
          </div>
          {!isMobile && (
            <div className="flex items-center space-x-4">
              <NavItem
                href="#about"
                isActive={hasScrolled && activeSection === "about"}
                onClick={(e) => handleSmoothScroll(e, "about")}
                hasScrolled={hasScrolled}
              >
                About
              </NavItem>
              <NavItem
                href="#features"
                isActive={hasScrolled && activeSection === "features"}
                onClick={(e) => handleSmoothScroll(e, "features")}
                hasScrolled={hasScrolled}
              >
                Features
              </NavItem>
              <NavItem
                href="#how-it-works"
                isActive={hasScrolled && activeSection === "how-it-works"}
                onClick={(e) => handleSmoothScroll(e, "how-it-works")}
                hasScrolled={hasScrolled}
              >
                How It Works
              </NavItem>
              <NavItem
                href="#pricing"
                isActive={hasScrolled && activeSection === "pricing"}
                onClick={(e) => handleSmoothScroll(e, "pricing")}
                hasScrolled={hasScrolled}
              >
                Pricing
              </NavItem>
              <div onClick={() => navigate("/auth")} className="cursor-pointer">
                <NavItem
                  // href={"/auth"}
                  className={
                    "bg-blue-600 hover:bg-blue-700 text-white text-lg font-bold py-3 px-8 rounded-2xl inline-flex items-center transition-colors duration-300"
                  }
                  isActive={hasScrolled && activeSection === "login"}
                  onClick={(e) => handleSmoothScroll(e, "login")}
                  // hasScrolled={hasScrolled}
                >
                  Login
                </NavItem>
              </div>
            </div>
          )}
          {isMobile && (
            <button
              onClick={toggleMenu}
              className={`${
                hasScrolled ? "text-blue-600 hover:text-blue-800" : ""
              } focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md`}
              aria-label={isOpen ? "Close menu" : "Open menu"}
              aria-expanded={isOpen}
            >
              {isOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <LayoutGrid className="w-6 h-6" />
              )}
            </button>
          )}
        </div>
        <AnimatePresence>
          {isMobile && isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className={`pb-4 items-center ${
                hasScrolled ? "bg-white" : "bg-gray-800"
              } rounded-3xl shadow-lg px-4 mt-2`}
            >
              <div onClick={() => navigate("/auth")} className="cursor-pointer">
                <NavItem
                  isActive={hasScrolled && activeSection === "login"}
                  onClick={(e) => handleSmoothScroll(e, "login")}
                  hasScrolled={hasScrolled}
                >
                  <User size={20} className="mr-2" />
                  Login
                </NavItem>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
}

function NavItem({
  href,
  children,
  isActive,
  onClick,
  hasScrolled,
  className,
}) {
  return (
    <motion.a
      href={href}
      className={`flex items-center py-2 px-4 rounded-3xl transition-colors ${className} ${
        hasScrolled
          ? isActive
            ? "bg-blue-100 text-slate-700"
            : "text-slate-700 hover:bg-blue-50"
          : ""
      }`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
    >
      {children}
    </motion.a>
  );
}
