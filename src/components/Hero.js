"use client";

import { WebGLShader } from "@/components/ui/web-gl-shader";
import { GooeyText } from "@/components/ui/gooey-text";
export default function Hero() {
  return (
    <section className="relative w-full h-screen overflow-hidden" id="home">
      {/* WebGL shader background */}
      <WebGLShader />

      {/* Content overlay */}
      <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
        <GooeyText texts={["Heading", "Morphing", "Awesome", "Design"]} />
      </div>
    </section>
  );
}
