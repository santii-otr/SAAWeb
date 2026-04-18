"use client";

import React, { useRef, useState, useCallback, useEffect } from "react";

function GlassFilter() {
  return (
    <svg className="hidden" style={{ position: "absolute", width: 0, height: 0 }}>
      <defs>
        <filter id="container-glass" x="0%" y="0%" width="100%" height="100%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.05 0.05" numOctaves="1" seed="1" result="turbulence" />
          <feGaussianBlur in="turbulence" stdDeviation="2" result="blurredNoise" />
          <feDisplacementMap in="SourceGraphic" in2="blurredNoise" scale="70" xChannelSelector="R" yChannelSelector="B" result="displaced" />
          <feGaussianBlur in="displaced" stdDeviation="4" result="finalBlur" />
          <feComposite in="finalBlur" in2="finalBlur" operator="over" />
        </filter>
      </defs>
    </svg>
  );
}

export function StarryButton({ children = "Click me", onClick }) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const starsRef = useRef([]);
  const mouseRef = useRef({ x: -999, y: -999 });
  const [size, setSize] = useState({ w: 300, h: 60 });

  const starsCount = 36;
  const starsSize = 1.1;
  const starsOpacity = 0.7;
  const movementSpeed = 0.12;
  const mouseInfluence = 70;
  const gravityStrength = 60;
  const glowIntensity = 11;

  const initStars = useCallback((w, h) => {
    starsRef.current = Array.from({ length: starsCount }).map(() => {
      const angle = Math.random() * Math.PI * 2;
      const speed = movementSpeed * (0.5 + Math.random() * 0.5);
      return {
        x: Math.random() * w,
        y: Math.random() * h,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * starsSize + 0.5,
        opacity: starsOpacity,
        baseOpacity: starsOpacity,
        mass: Math.random() * 0.5 + 0.5,
        glowMultiplier: 1,
        glowVelocity: 0,
      };
    });
  }, []);

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const rect = container.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
    setSize({ w: rect.width, h: rect.height });
    if (starsRef.current.length === 0) initStars(rect.width, rect.height);
    else starsRef.current.forEach(p => { p.x = Math.random() * rect.width; p.y = Math.random() * rect.height; });
  }, [initStars]);

  useEffect(() => {
    resizeCanvas();
    const ro = new ResizeObserver(resizeCanvas);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [resizeCanvas]);

  const handleMouseMove = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }, []);

  const handleMouseLeave = useCallback(() => {
    mouseRef.current = { x: -999, y: -999 };
  }, []);

  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = size.w;
    const h = size.h;
    const mouse = mouseRef.current;

    starsRef.current.forEach(p => {
      const dx = mouse.x - p.x;
      const dy = mouse.y - p.y;
      const dist = Math.hypot(dx, dy);

      if (dist < mouseInfluence && dist > 0) {
        const force = (mouseInfluence - dist) / mouseInfluence;
        const nx = dx / dist;
        const ny = dy / dist;
        const g = force * (gravityStrength * 0.001);
        p.vx += nx * g;
        p.vy += ny * g;
        p.opacity = Math.min(1, p.baseOpacity + force * 0.4);
        const targetGlow = 1 + force * 2.5;
        p.glowMultiplier += (targetGlow - p.glowMultiplier) * 0.15;
      } else {
        p.opacity = Math.max(p.baseOpacity * 0.3, p.opacity - 0.02);
        p.glowMultiplier = Math.max(1, p.glowMultiplier + (1 - p.glowMultiplier) * 0.08);
      }

      p.x += p.vx;
      p.y += p.vy;
      p.vx += (Math.random() - 0.5) * 0.001;
      p.vy += (Math.random() - 0.5) * 0.001;
      p.vx *= 0.999;
      p.vy *= 0.999;

      if (p.x < 0) p.x = w;
      if (p.x > w) p.x = 0;
      if (p.y < 0) p.y = h;
      if (p.y > h) p.y = 0;
    });

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    starsRef.current.forEach(p => {
      ctx.save();
      ctx.shadowColor = "rgba(255,255,255,1)";
      ctx.shadowBlur = glowIntensity * (p.glowMultiplier || 1) * 2;
      ctx.globalAlpha = p.opacity;
      ctx.fillStyle = "rgba(255,255,255,1)";
      ctx.beginPath();
      ctx.arc(p.x * dpr, p.y * dpr, p.size * dpr, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    animRef.current = requestAnimationFrame(animate);
  }, [size]);

  useEffect(() => {
    if (animRef.current) cancelAnimationFrame(animRef.current);
    animRef.current = requestAnimationFrame(animate);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [animate]);

  return (
    <button
      ref={containerRef}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 2rem",
        height: "3rem",
        borderRadius: "9999px",
        border: "none",
        cursor: "pointer",
        overflow: "hidden",
        background: "transparent",
        minWidth: "160px",
      }}
    >
      {/* Dark background */}
      <div style={{
        position: "absolute", inset: 0, borderRadius: "9999px",
        background: "linear-gradient(135deg, #0a0a1a 0%, #1a1a3e 50%, #0a0a1a 100%)",
      }} />

      {/* Star canvas */}
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute", inset: 0,
          borderRadius: "9999px",
          pointerEvents: "none",
        }}
      />

      {/* Liquid glass overlay */}
      <div
        style={{
          position: "absolute", inset: 0, borderRadius: "9999px",
          backdropFilter: 'url("#container-glass")',
          opacity: 0.5,
          zIndex: 1,
        }}
      />

      {/* Glass shadow ring */}
      <div style={{
        position: "absolute", inset: 0, borderRadius: "9999px",
        boxShadow: `
          inset 3px 3px 0.5px -3px rgba(0,0,0,0.9),
          inset -3px -3px 0.5px -3px rgba(0,0,0,0.85),
          inset 1px 1px 1px -0.5px rgba(0,0,0,0.6),
          inset -1px -1px 1px -0.5px rgba(0,0,0,0.6),
          inset 0 0 6px 6px rgba(0,0,0,0.18),
          0 0 12px rgba(255,255,255,0.08),
          0 2px 8px rgba(0,0,0,0.4)
        `,
        zIndex: 2,
      }} />

      {/* Border glow */}
      <div style={{
        position: "absolute", inset: 0, borderRadius: "9999px",
        border: "1px solid rgba(255,255,255,0.15)",
        zIndex: 3,
      }} />

      {/* Label */}
      <span style={{
        position: "relative", zIndex: 4,
        color: "rgba(255,255,255,0.92)",
        fontSize: "0.875rem",
        fontWeight: 500,
        letterSpacing: "0.04em",
        userSelect: "none",
        textShadow: "0 0 12px rgba(255,255,255,0.4)",
      }}>
        {children}
      </span>

      <GlassFilter />
    </button>
  );
}
