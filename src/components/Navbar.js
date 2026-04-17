"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, useSpring, AnimatePresence } from "framer-motion";

const NAV_LINKS = [
  { label: "Home", id: "home", href: "#home" },
  { label: "About", id: "about", href: "#about" },
  { label: "Fleet", id: "fleet", href: "#fleet" },
  { label: "Contact", id: "contact", href: "#contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const [mobileOpen, setMobileOpen] = useState(false);

  // Scroll detection
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Active section detection
  useEffect(() => {
    const ids = NAV_LINKS.map(l => l.id);
    const observers = ids.map(id => {
      const el = document.getElementById(id);
      if (!el) return null;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveSection(id); },
        { threshold: 0.4 }
      );
      obs.observe(el);
      return obs;
    });
    return () => observers.forEach(o => o?.disconnect());
  }, []);

  // Mobile body lock
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  return (
    <>
      <div
        style={{
          position: "fixed",
          top: scrolled ? "20px" : "32px",
          left: 0,
          right: 0,
          zIndex: 1000,
          display: "flex",
          justifyContent: "center",
          pointerEvents: "none",
          transition: "top 0.4s cubic-bezier(0.4,0,0.2,1)",
        }}
      >
        <PillNav scrolled={scrolled} activeSection={activeSection} onMobileOpen={() => setMobileOpen(true)} />
      </div>

      {/* Mobile overlay */}
      <div
        className={`mobile-menu-overlay ${mobileOpen ? "active" : ""}`}
        onClick={() => setMobileOpen(false)}
      />

      {/* Mobile drawer */}
      <div className={`mobile-menu ${mobileOpen ? "active" : ""}`}>
        <div className="mobile-menu-header">
          <span className="navbar-logo-name">Menu</span>
          <button className="mobile-menu-close" onClick={() => setMobileOpen(false)} aria-label="Close menu">
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <ul className="mobile-menu-links">
          {NAV_LINKS.map((link) => (
            <li key={link.id}>
              <a href={link.href} onClick={() => setMobileOpen(false)}>{link.label}</a>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

function PillNav({ scrolled, activeSection, onMobileOpen }) {
  // Spring for width: expanded from user code is ~580, top state will be a bit longer (720)
  const pillWidth = useSpring(scrolled ? 580 : 720, { stiffness: 140, damping: 22, mass: 1 });

  useEffect(() => {
    pillWidth.set(scrolled ? 580 : 720);
  }, [scrolled, pillWidth]);

  return (
    <motion.nav
      className="relative rounded-full"
      style={{
        width: pillWidth,
        height: '56px',
        pointerEvents: 'auto',
        background: `
          linear-gradient(135deg, 
            #fcfcfd 0%, 
            #f8f8fa 15%, 
            #f3f4f6 30%, 
            #eeeff2 45%, 
            #e9eaed 60%, 
            #e4e5e8 75%, 
            #dee0e3 90%, 
            #e2e3e6 100%
          )
        `,
        boxShadow: `
          0 2px 4px rgba(0, 0, 0, 0.08),
          0 6px 12px rgba(0, 0, 0, 0.12),
          0 12px 24px rgba(0, 0, 0, 0.14),
          0 24px 48px rgba(0, 0, 0, 0.10),
          inset 0 2px 2px rgba(255, 255, 255, 0.8),
          inset 0 -3px 8px rgba(0, 0, 0, 0.12),
          inset 3px 3px 8px rgba(0, 0, 0, 0.10),
          inset -3px 3px 8px rgba(0, 0, 0, 0.09),
          inset 0 -1px 2px rgba(0, 0, 0, 0.08)
        `,
        overflow: 'hidden',
        transition: 'box-shadow 0.3s ease-out',
      }}
    >
      {/* Primary top edge ridge - ultra bright */}
      <div 
        className="absolute inset-x-0 top-0 rounded-t-full pointer-events-none"
        style={{
          height: '2px',
          background: 'linear-gradient(90deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.95) 5%, rgba(255, 255, 255, 1) 15%, rgba(255, 255, 255, 1) 85%, rgba(255, 255, 255, 0.95) 95%, rgba(255, 255, 255, 0) 100%)',
          filter: 'blur(0.3px)',
        }}
      />
      
      {/* Top hemisphere light catch */}
      <div 
        className="absolute inset-x-0 top-0 rounded-full pointer-events-none"
        style={{
          height: '55%',
          background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.45) 0%, rgba(255, 255, 255, 0.25) 30%, rgba(255, 255, 255, 0.10) 60%, rgba(255, 255, 255, 0) 100%)',
        }}
      />
      
      {/* Directional light - top left */}
      <div 
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.40) 0%, rgba(255, 255, 255, 0.20) 20%, rgba(255, 255, 255, 0.08) 40%, rgba(255, 255, 255, 0) 65%)',
        }}
      />
      
      {/* Premium gloss reflection - main */}
      <div 
        className="absolute rounded-full pointer-events-none"
        style={{
          left: '18%',
          top: '16%',
          width: '140px',
          height: '14px',
          background: 'radial-gradient(ellipse at center, rgba(255, 255, 255, 0.70) 0%, rgba(255, 255, 255, 0.35) 40%, rgba(255, 255, 255, 0.10) 70%, rgba(255, 255, 255, 0) 100%)',
          filter: 'blur(4px)',
          transform: 'rotate(-12deg)',
        }}
      />
      
      {/* Secondary gloss accent */}
      <div 
        className="absolute rounded-full pointer-events-none"
        style={{
          right: '22%',
          top: '20%',
          width: '80px',
          height: '10px',
          background: 'radial-gradient(ellipse at center, rgba(255, 255, 255, 0.50) 0%, rgba(255, 255, 255, 0.15) 60%, rgba(255, 255, 255, 0) 100%)',
          filter: 'blur(3px)',
          transform: 'rotate(8deg)',
        }}
      />
      
      {/* Left edge illumination */}
      <div 
        className="absolute inset-y-0 left-0 rounded-l-full pointer-events-none"
        style={{
          width: '35%',
          background: 'linear-gradient(90deg, rgba(255, 255, 255, 0.20) 0%, rgba(255, 255, 255, 0.10) 40%, rgba(255, 255, 255, 0.03) 70%, rgba(255, 255, 255, 0) 100%)',
        }}
      />
      
      {/* Right edge shadow */}
      <div 
        className="absolute inset-y-0 right-0 rounded-r-full pointer-events-none"
        style={{
          width: '35%',
          background: 'linear-gradient(270deg, rgba(0, 0, 0, 0.10) 0%, rgba(0, 0, 0, 0.05) 40%, rgba(0, 0, 0, 0.02) 70%, rgba(0, 0, 0, 0) 100%)',
        }}
      />
      
      {/* Bottom curvature - deep shadow */}
      <div 
        className="absolute inset-x-0 bottom-0 rounded-b-full pointer-events-none"
        style={{
          height: '50%',
          background: 'linear-gradient(0deg, rgba(0, 0, 0, 0.14) 0%, rgba(0, 0, 0, 0.08) 25%, rgba(0, 0, 0, 0.03) 50%, rgba(0, 0, 0, 0) 100%)',
        }}
      />

      {/* Bottom edge contact shadow */}
      <div 
        className="absolute inset-x-0 bottom-0 rounded-b-full pointer-events-none"
        style={{
          height: '20%',
          background: 'linear-gradient(0deg, rgba(0, 0, 0, 0.20) 0%, rgba(0, 0, 0, 0) 100%)',
          filter: 'blur(2px)',
        }}
      />

      {/* Inner diffuse glow */}
      <div 
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          boxShadow: 'inset 0 0 40px rgba(255, 255, 255, 0.22)',
          opacity: 0.7,
        }}
      />
      
      {/* Micro edge definition */}
      <div 
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          boxShadow: 'inset 0 0 0 0.5px rgba(0, 0, 0, 0.10)',
        }}
      />

      {/* Navigation items container */}
      <div 
        className="relative z-10 h-full flex items-center justify-center px-6"
        style={{
          fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "SF Pro", Poppins, sans-serif',
        }}
      >
        <div className="flex items-center justify-evenly w-full">
          {NAV_LINKS.map((item) => {
            const isActive = item.id === activeSection;
            
            return (
              <motion.a
                key={item.id}
                href={item.href}
                initial={false}
                className="relative cursor-pointer transition-all duration-200"
                style={{
                  fontSize: isActive ? '15.5px' : '15px',
                  fontWeight: isActive ? 680 : 510,
                  color: isActive ? '#1a1a1a' : '#656565',
                  textDecoration: 'none',
                  letterSpacing: '0.45px',
                  background: 'transparent',
                  border: 'none',
                  padding: '10px 16px',
                  outline: 'none',
                  whiteSpace: 'nowrap',
                  WebkitFontSmoothing: 'antialiased',
                  MozOsxFontSmoothing: 'grayscale',
                  transform: isActive ? 'translateY(-1.5px)' : 'translateY(0)',
                  textShadow: isActive 
                    ? `
                      0 1px 0 rgba(0, 0, 0, 0.35),
                      0 -1px 0 rgba(255, 255, 255, 0.8),
                      1px 1px 0 rgba(0, 0, 0, 0.18),
                      -1px 1px 0 rgba(0, 0, 0, 0.15)
                    `
                    : `
                      0 1px 0 rgba(0, 0, 0, 0.22),
                      0 -1px 0 rgba(255, 255, 255, 0.65),
                      1px 1px 0 rgba(0, 0, 0, 0.12),
                      -1px 1px 0 rgba(0, 0, 0, 0.10)
                    `,
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.color = '#3a3a3a';
                    e.currentTarget.style.transform = 'translateY(-0.5px)';
                    e.currentTarget.style.textShadow = `
                      0 1px 0 rgba(0, 0, 0, 0.28),
                      0 -1px 0 rgba(255, 255, 255, 0.72),
                      1px 1px 0 rgba(0, 0, 0, 0.15),
                      -1px 1px 0 rgba(0, 0, 0, 0.12)
                    `;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.color = '#656565';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.textShadow = `
                      0 1px 0 rgba(0, 0, 0, 0.22),
                      0 -1px 0 rgba(255, 255, 255, 0.65),
                      1px 1px 0 rgba(0, 0, 0, 0.12),
                      -1px 1px 0 rgba(0, 0, 0, 0.10)
                    `;
                  }
                }}
              >
                {item.label}
              </motion.a>
            )
          })}
        </div>
      </div>
    </motion.nav>
  );
}
