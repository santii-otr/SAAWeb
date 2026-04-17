"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Fleet from "@/components/Fleet";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import ScrollReveal from "@/components/ScrollReveal";


// Dynamically import the shader animation (client-only, requires WebGL)
const ShaderAnimation = dynamic(
  () => import("@/components/ui/shader-animation").then((mod) => mod.ShaderAnimation),
  { ssr: false }
);

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);


  useEffect(() => {
    // Lock body scroll while the loading animation is active
    document.body.style.overflow = "hidden";

    // Show the shader loading animation for ~3 seconds, then fade out
    const timer = setTimeout(() => {
      setFadeOut(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  // After the fade-out transition ends, unmount the loader and unlock page
  const handleTransitionEnd = () => {
    if (fadeOut) {
      setLoading(false);
      document.body.style.overflow = "";
    }
  };

  return (
    <>
      {/* Loading screen — shader animation */}
      {loading && (
        <div
          className="fixed inset-0 z-[9999]"
          style={{
            background: "#000",
            opacity: fadeOut ? 0 : 1,
            transition: "opacity 0.8s ease-in-out",
          }}
          onTransitionEnd={handleTransitionEnd}
        >
          <ShaderAnimation />
        </div>
      )}

      {/* Main site content — hidden and locked while loading */}
      <div
        style={{
          pointerEvents: loading ? "none" : "auto",
          userSelect: loading ? "none" : "auto",
        }}
      >
        <Navbar />
        <Hero />

        <ScrollReveal>
          <About />
        </ScrollReveal>

        <ScrollReveal>
          <Fleet />
        </ScrollReveal>

        <ScrollReveal>
          <Contact />
        </ScrollReveal>

        <Footer />

      </div>
    </>
  );
}
