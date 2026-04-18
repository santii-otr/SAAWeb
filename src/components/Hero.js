"use client";

import { WebGLShader } from "@/components/ui/web-gl-shader";
import { MorphingText } from "@/components/ui/gooey-text";
export default function Hero() {
  return (
    <section className="relative w-full h-screen overflow-hidden isolate" id="home">
      {/* WebGL shader background */}
      <WebGLShader />

      {/* Content overlay */}
      <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none mix-blend-difference">
        <MorphingText texts={["Fly", "Explore", "Discover", "Travel"]} />
      </div>
    </section>
  );
}
