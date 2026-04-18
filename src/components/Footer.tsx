"use client";

import { ChevronRightIcon, DiscordLogoIcon, GitHubLogoIcon, InstagramLogoIcon, LinkedInLogoIcon, TwitterLogoIcon } from "@radix-ui/react-icons";
import { ClassValue, clsx } from "clsx";
import * as Color from "color-bits";
import { motion } from "framer-motion";
import Link from "next/link";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Custom Hook for Media Query
function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    const listener = () => setMatches(media.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [matches, query]);

  return matches;
}

// Helper function to convert any CSS color to rgba
const getRGBA = (
  cssColor: string,
  fallback: string = "rgba(180, 180, 180, 1)",
): string => {
  if (typeof window === "undefined") return fallback;
  if (!cssColor) return fallback;

  try {
    // Handle CSS variables if they start with var(--)
    if (cssColor.startsWith("var(")) {
      const element = document.createElement("div");
      element.style.color = cssColor;
      document.body.appendChild(element);
      const computedColor = window.getComputedStyle(element).color;
      document.body.removeChild(element);
      return computedColor;
    }
    
    // Use color-bits for parsing
    const c = Color.parse(cssColor);
    return `rgba(${c.r}, ${c.g}, ${c.b}, ${c.a ?? 1})`;
  } catch (e) {
    return fallback;
  }
};

interface FlickeringGridProps {
  squareSize?: number;
  gridGap?: number;
  flickerChance?: number;
  color?: string;
  width?: number;
  height?: number;
  className?: string;
  maxOpacity?: number;
}

const FlickeringGrid: React.FC<FlickeringGridProps> = ({
  squareSize = 4,
  gridGap = 6,
  flickerChance = 0.3,
  color = "rgb(180, 180, 180)",
  width,
  height,
  className,
  maxOpacity = 0.3,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

  const memoizedColor = useMemo(() => getRGBA(color), [color]);

  const setupCanvas = useCallback(
    (canvas: HTMLCanvasElement, width: number, height: number) => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.scale(dpr, dpr);
      return { ctx, cols: Math.floor(width / (squareSize + gridGap)), rows: Math.floor(height / (squareSize + gridGap)) };
    },
    [squareSize, gridGap],
  );

  useEffect(() => {
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setCanvasSize({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const width = canvasSize.width || container.clientWidth;
    const height = canvasSize.height || container.clientHeight;
    const { ctx, cols, rows } = setupCanvas(canvas, width, height);
    if (!ctx) return;

    let animationFrameId: number;
    const gridPartiallyFilledOpacities = new Float32Array(cols * rows);

    for (let i = 0; i < gridPartiallyFilledOpacities.length; i++) {
        gridPartiallyFilledOpacities[i] = Math.random() * maxOpacity;
    }

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const index = i * rows + j;
          if (Math.random() < flickerChance) {
            gridPartiallyFilledOpacities[index] = Math.random() * maxOpacity;
          }

          const opacity = gridPartiallyFilledOpacities[index];
          ctx.fillStyle = memoizedColor.replace(/[\d.]+\)$/g, `${opacity})`);
          ctx.fillRect(
            i * (squareSize + gridGap),
            j * (squareSize + gridGap),
            squareSize,
            squareSize,
          );
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => cancelAnimationFrame(animationFrameId);
  }, [canvasSize, setupCanvas, flickerChance, memoizedColor, squareSize, gridGap, maxOpacity]);

  return (
    <div ref={containerRef} className={cn("w-full h-full", className)}>
      <canvas ref={canvasRef} />
    </div>
  );
};

const Icons = {
  SOC2: () => (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="20" cy="20" r="20" fill="currentColor" fillOpacity="0.1" />
        <path d="M20 10C14.48 10 10 14.48 10 20C10 25.52 14.48 30 20 30C25.52 30 30 25.52 30 20C30 14.48 25.52 10 20 10ZM20 28C15.58 28 12 24.42 12 20C12 15.58 15.58 12 20 12C24.42 12 28 15.58 28 20C28 24.42 24.42 28 20 28Z" fill="currentColor" />
        <path d="M23 18H17V22H23V18Z" fill="currentColor" />
    </svg>
  ),
  HIPAA: () => (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="20" cy="20" r="20" fill="currentColor" fillOpacity="0.1" />
        <path d="M25 15H15V25H25V15Z" fill="currentColor" />
        <path d="M20 10V30M10 20H30" stroke="currentColor" strokeWidth="2" />
    </svg>
  ),
  GDPR: () => (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="20" cy="20" r="20" fill="currentColor" fillOpacity="0.1" />
        <path d="M26 14H14V26H26V14Z" stroke="currentColor" strokeWidth="2" />
        <circle cx="20" cy="20" r="3" fill="currentColor" />
    </svg>
  ),
};

const siteConfig = {
  name: "SAA",
  description: "Advanced technological solutions for modern business operations.",
  footerNav: [
    {
      title: "Product",
      items: [
        { title: "Features", href: "#" },
        { title: "Pricing", href: "#" },
        { title: "Security", href: "#" },
        { title: "Roadmap", href: "#" },
      ],
    },
    {
      title: "Company",
      items: [
        { title: "About Us", href: "#" },
        { title: "Careers", href: "#" },
        { title: "Blog", href: "#" },
        { title: "News", href: "#" },
      ],
    },
    {
      title: "Resources",
      items: [
        { title: "Documentation", href: "#" },
        { title: "Support", href: "#" },
        { title: "Legal", href: "#" },
        { title: "Privacy", href: "#" },
      ],
    },
    {
      title: "Social",
      items: [
        { title: "Twitter", href: "#", icon: <TwitterLogoIcon /> },
        { title: "GitHub", href: "#", icon: <GitHubLogoIcon /> },
        { title: "LinkedIn", href: "#", icon: <LinkedInLogoIcon /> },
        { title: "Discord", href: "#", icon: <DiscordLogoIcon /> },
      ],
    },
  ],
};

export default function Footer() {
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  return (
    <footer className="relative w-full overflow-hidden border-t border-saa-navy/20 bg-background pt-16 pb-8">
      {/* Background Flickering Grid */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-20 dark:opacity-40">
        <FlickeringGrid
          color="var(--saa-navy)"
          maxOpacity={0.2}
          flickerChance={0.1}
          squareSize={3}
          gridGap={6}
        />
      </div>

      <div className="container relative z-10 mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-8">
          {/* Brand Info */}
          <div className="flex flex-col gap-6">
            <Link href="/" className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-xl bg-saa-navy p-2 flex items-center justify-center shadow-lg shadow-saa-navy/20">
                <span className="text-xl font-bold text-white leading-none">S</span>
              </div>
              <span className="text-2xl font-bold tracking-tight text-saa-navy dark:text-saa-white">
                {siteConfig.name}
              </span>
            </Link>
            <p className="max-w-xs text-muted-foreground leading-relaxed">
              {siteConfig.description}
            </p>
            <div className="flex gap-4">
              <div className="flex flex-col items-center gap-1 group">
                <div className="text-muted-foreground group-hover:text-saa-navy transition-colors">
                  <Icons.SOC2 />
                </div>
                <span className="text-[10px] uppercase tracking-tighter text-muted-foreground font-semibold">SOC2</span>
              </div>
              <div className="flex flex-col items-center gap-1 group">
                <div className="text-muted-foreground group-hover:text-saa-navy transition-colors">
                  <Icons.HIPAA />
                </div>
                <span className="text-[10px] uppercase tracking-tighter text-muted-foreground font-semibold">HIPAA</span>
              </div>
              <div className="flex flex-col items-center gap-1 group">
                <div className="text-muted-foreground group-hover:text-saa-navy transition-colors">
                  <Icons.GDPR />
                </div>
                <span className="text-[10px] uppercase tracking-tighter text-muted-foreground font-semibold">GDPR Compliant</span>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4 lg:gap-4">
            {siteConfig.footerNav.map((column) => (
              <div key={column.title} className="flex flex-col gap-4">
                <h3 className="text-sm font-bold uppercase tracking-widest text-saa-navy dark:text-saa-gold">
                  {column.title}
                </h3>
                <ul className="flex flex-col gap-3">
                  {column.items.map((item) => (
                    <li key={item.title}>
                      <Link
                        href={item.href}
                        className="group flex items-center gap-1 text-sm text-muted-foreground transition-all hover:text-saa-navy dark:hover:text-saa-gold-light"
                      >
                        {item.icon && <span className="h-4 w-4">{item.icon}</span>}
                        <span>{item.title}</span>
                        <ChevronRightIcon className="h-3 w-3 translate-x-[-4px] opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 border-t border-saa-navy/10 pt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} {siteConfig.name} Inc. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link href="#" className="text-xs text-muted-foreground hover:text-saa-navy transition-colors">
              Privacy Policy
            </Link>
            <Link href="#" className="text-xs text-muted-foreground hover:text-saa-navy transition-colors">
              Terms of Service
            </Link>
            <Link href="#" className="text-xs text-muted-foreground hover:text-saa-navy transition-colors">
              Cookie Settings
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
