"use client";

import { ChevronRightIcon } from "@radix-ui/react-icons";
import { ClassValue, clsx } from "clsx";
import * as Color from "color-bits";
import Link from "next/link";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    const updateMatch = () => setMatches(media.matches);

    updateMatch();
    media.addEventListener("change", updateMatch);

    return () => media.removeEventListener("change", updateMatch);
  }, [query]);

  return matches;
}

const getRGBA = (
  cssColor: string,
  fallback: string = "rgba(180, 180, 180, 1)",
): string => {
  if (typeof window === "undefined") return fallback;
  if (!cssColor) return fallback;

  try {
    if (cssColor.startsWith("var(")) {
      const element = document.createElement("div");
      element.style.color = cssColor;
      document.body.appendChild(element);
      const computedColor = window.getComputedStyle(element).color;
      document.body.removeChild(element);
      return computedColor;
    }

    const color = Color.parse(cssColor);
    return `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a ?? 1})`;
  } catch {
    return fallback;
  }
};

const colorWithOpacity = (color: string, opacity: number): string => {
  const match = color.match(
    /rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*[\d.]+)?\s*\)/i,
  );

  if (!match) return color;

  const [, r, g, b] = match;
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

interface FlickeringGridProps extends React.HTMLAttributes<HTMLDivElement> {
  squareSize?: number;
  gridGap?: number;
  flickerChance?: number;
  color?: string;
  width?: number;
  height?: number;
  className?: string;
  maxOpacity?: number;
  text?: string;
  fontSize?: number;
  fontWeight?: number | string;
}

const FlickeringGrid: React.FC<FlickeringGridProps> = ({
  squareSize = 2,
  gridGap = 3,
  flickerChance = 0.08,
  color = "rgb(180, 180, 180)",
  width,
  height,
  className,
  maxOpacity = 0.22,
  text = "",
  fontSize = 120,
  fontWeight = 700,
  ...props
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

  const memoizedColor = useMemo(() => getRGBA(color), [color]);

  const setupCanvas = useCallback(
    (canvas: HTMLCanvasElement, logicalWidth: number, logicalHeight: number) => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = logicalWidth * dpr;
      canvas.height = logicalHeight * dpr;
      canvas.style.width = `${logicalWidth}px`;
      canvas.style.height = `${logicalHeight}px`;

      const cols = Math.ceil(logicalWidth / (squareSize + gridGap));
      const rows = Math.ceil(logicalHeight / (squareSize + gridGap));
      const squares = new Float32Array(cols * rows);
      const textMask = new Uint8Array(cols * rows);

      for (let index = 0; index < squares.length; index += 1) {
        squares[index] = Math.random() * maxOpacity;
      }

      if (text) {
        const maskCanvas = document.createElement("canvas");
        maskCanvas.width = logicalWidth * dpr;
        maskCanvas.height = logicalHeight * dpr;

        const maskContext = maskCanvas.getContext("2d", {
          willReadFrequently: true,
        });

        if (maskContext) {
          maskContext.scale(dpr, dpr);
          maskContext.fillStyle = "#ffffff";
          maskContext.font = `${fontWeight} ${fontSize}px Inter, system-ui, sans-serif`;
          maskContext.textAlign = "center";
          maskContext.textBaseline = "middle";
          maskContext.fillText(text, logicalWidth / 2, logicalHeight / 2);

          const pixels = maskContext.getImageData(
            0,
            0,
            maskCanvas.width,
            maskCanvas.height,
          ).data;

          for (let col = 0; col < cols; col += 1) {
            for (let row = 0; row < rows; row += 1) {
              const x =
                Math.min(
                  maskCanvas.width - 1,
                  Math.floor(
                    (col * (squareSize + gridGap) + squareSize / 2) * dpr,
                  ),
                ) || 0;
              const y =
                Math.min(
                  maskCanvas.height - 1,
                  Math.floor(
                    (row * (squareSize + gridGap) + squareSize / 2) * dpr,
                  ),
                ) || 0;
              const alphaIndex = (y * maskCanvas.width + x) * 4 + 3;
              textMask[col * rows + row] = pixels[alphaIndex] > 0 ? 1 : 0;
            }
          }
        }
      }

      return { cols, rows, squares, textMask, dpr };
    },
    [fontSize, fontWeight, gridGap, maxOpacity, squareSize, text],
  );

  const drawGrid = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      cols: number,
      rows: number,
      squares: Float32Array,
      textMask: Uint8Array,
      dpr: number,
      canvasWidth: number,
      canvasHeight: number,
    ) => {
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);

      for (let col = 0; col < cols; col += 1) {
        for (let row = 0; row < rows; row += 1) {
          const index = col * rows + row;
          const x = col * (squareSize + gridGap) * dpr;
          const y = row * (squareSize + gridGap) * dpr;
          const size = squareSize * dpr;
          const opacity = squares[index];
          const finalOpacity = textMask[index]
            ? Math.min(0.82, opacity + 0.42)
            : opacity;

          ctx.fillStyle = colorWithOpacity(memoizedColor, finalOpacity);
          ctx.fillRect(x, y, size, size);
        }
      }
    },
    [gridGap, memoizedColor, squareSize],
  );

  const updateSquares = useCallback(
    (squares: Float32Array, deltaTime: number) => {
      for (let index = 0; index < squares.length; index += 1) {
        if (Math.random() < flickerChance * deltaTime * 60) {
          squares[index] = Math.random() * maxOpacity;
        }
      }
    },
    [flickerChance, maxOpacity],
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver(() => {
      setCanvasSize({
        width: width || container.clientWidth,
        height: height || container.clientHeight,
      });
    });

    resizeObserver.observe(container);
    setCanvasSize({
      width: width || container.clientWidth,
      height: height || container.clientHeight,
    });

    return () => resizeObserver.disconnect();
  }, [height, width]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsInView(entry.isIntersecting),
      { threshold: 0.1 },
    );

    observer.observe(canvas);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !canvasSize.width || !canvasSize.height || !isInView) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    const grid = setupCanvas(canvas, canvasSize.width, canvasSize.height);
    let animationFrameId = 0;
    let lastTime = 0;

    const animate = (time: number) => {
      const deltaTime = lastTime ? (time - lastTime) / 1000 : 1 / 60;
      lastTime = time;

      updateSquares(grid.squares, deltaTime);
      drawGrid(
        context,
        grid.cols,
        grid.rows,
        grid.squares,
        grid.textMask,
        grid.dpr,
        canvas.width,
        canvas.height,
      );

      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrameId);
  }, [canvasSize, drawGrid, isInView, setupCanvas, updateSquares]);

  return (
    <div
      ref={containerRef}
      className={cn("h-full w-full", className)}
      {...props}
    >
      <canvas ref={canvasRef} className="pointer-events-none h-full w-full" />
    </div>
  );
};

type ComplianceIconProps = {
  className?: string;
};

const Icons = {
  Soc2: ({ className }: ComplianceIconProps) => (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <circle cx="20" cy="20" r="20" fill="currentColor" fillOpacity="0.1" />
      <path
        d="M20 10C14.48 10 10 14.48 10 20C10 25.52 14.48 30 20 30C25.52 30 30 25.52 30 20C30 14.48 25.52 10 20 10ZM20 28C15.58 28 12 24.42 12 20C12 15.58 15.58 12 20 12C24.42 12 28 15.58 28 20C28 24.42 24.42 28 20 28Z"
        fill="currentColor"
      />
      <path d="M23 18H17V22H23V18Z" fill="currentColor" />
    </svg>
  ),
  Hipaa: ({ className }: ComplianceIconProps) => (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <circle cx="20" cy="20" r="20" fill="currentColor" fillOpacity="0.1" />
      <path d="M25 15H15V25H25V15Z" fill="currentColor" />
      <path
        d="M20 10V30M10 20H30"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  ),
  Gdpr: ({ className }: ComplianceIconProps) => (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <circle cx="20" cy="20" r="20" fill="currentColor" fillOpacity="0.1" />
      <path d="M26 14H14V26H26V14Z" stroke="currentColor" strokeWidth="2" />
      <circle cx="20" cy="20" r="3" fill="currentColor" />
    </svg>
  ),
};

type FooterLink = {
  id: number;
  title: string;
  url: string;
  external?: boolean;
};

const siteConfig = {
  name: "SAA",
  eyebrow: "Private aviation",
  description:
    "Advanced technological solutions for modern business operations, crafted to make every itinerary feel smooth, discreet, and precisely coordinated.",
  compliance: [
    { label: "SOC 2", icon: Icons.Soc2 },
    { label: "HIPAA", icon: Icons.Hipaa },
    { label: "GDPR", icon: Icons.Gdpr },
  ],
  footerLinks: [
    {
      title: "Navigate",
      links: [
        { id: 1, title: "Home", url: "#home" },
        { id: 2, title: "About", url: "#about" },
        { id: 3, title: "Fleet", url: "#fleet" },
        { id: 4, title: "Contact", url: "#contact" },
      ],
    },
    {
      title: "Experience",
      links: [
        { id: 5, title: "Private Charters", url: "#fleet" },
        { id: 6, title: "Flight Planning", url: "#contact" },
        { id: 7, title: "Concierge Support", url: "#contact" },
        { id: 8, title: "Client Access", url: "#contact" },
      ],
    },
    {
      title: "Connect",
      links: [
        {
          id: 9,
          title: "Discord Server",
          url: "https://discord.gg/zG3nPd9vU6",
          external: true,
        },
        { id: 10, title: "Journey Briefing", url: "#contact" },
        { id: 11, title: "Partnerships", url: "#contact" },
        { id: 12, title: "Start Planning", url: "#contact" },
      ],
    },
  ] as { title: string; links: FooterLink[] }[],
  legalLinks: [
    { id: 13, title: "Privacy Policy", url: "#" },
    { id: 14, title: "Terms of Service", url: "#" },
    { id: 15, title: "Cookie Settings", url: "#" },
  ] as FooterLink[],
};

export default function Footer() {
  const isTablet = useMediaQuery("(max-width: 1024px)");
  const wordmark = isTablet ? siteConfig.name : "FLY BEYOND";

  return (
    <footer
      id="footer"
      className="relative w-full overflow-hidden border-t border-[color:rgba(0,40,85,0.12)] bg-background"
      style={{
        backgroundImage:
          "radial-gradient(circle at top, rgba(0,86,179,0.08), transparent 34%)",
      }}
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-12 px-6 pb-10 pt-16 lg:flex-row lg:items-start lg:justify-between lg:px-8">
        <div className="flex max-w-sm flex-col gap-6">
          <Link href="/" className="flex items-center gap-3">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-[1.1rem]"
              style={{
                background:
                  "linear-gradient(135deg, var(--saa-navy), var(--saa-blue))",
                boxShadow: "0 16px 36px rgba(0, 40, 85, 0.18)",
              }}
            >
              <span className="text-lg font-bold leading-none text-white">S</span>
            </div>

            <div className="flex flex-col">
              <span className="text-lg font-semibold tracking-[0.18em] text-[var(--saa-navy)]">
                {siteConfig.name}
              </span>
              <span className="text-[0.68rem] uppercase tracking-[0.32em] text-[var(--saa-gold)]">
                {siteConfig.eyebrow}
              </span>
            </div>
          </Link>

          <p className="max-w-xs text-sm leading-7 text-[var(--saa-text-light)]">
            {siteConfig.description}
          </p>

          <div className="flex flex-wrap gap-3">
            {siteConfig.compliance.map(({ label, icon: Icon }) => (
              <div
                key={label}
                className="flex items-center gap-2 rounded-full border border-[color:rgba(0,40,85,0.10)] bg-white/85 px-3 py-2 shadow-[0_12px_32px_rgba(0,40,85,0.06)]"
              >
                <Icon className="h-5 w-5 text-[var(--saa-navy)]" />
                <span className="text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-[var(--saa-text-muted)]">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid flex-1 grid-cols-1 gap-10 sm:grid-cols-3 lg:max-w-2xl lg:pt-2">
          {siteConfig.footerLinks.map((column) => (
            <ul key={column.title} className="flex flex-col gap-3">
              <li className="mb-2 text-xs font-semibold uppercase tracking-[0.24em] text-[var(--saa-navy)]">
                {column.title}
              </li>

              {column.links.map((link) => (
                <li key={link.id}>
                  <Link
                    href={link.url}
                    target={link.external ? "_blank" : undefined}
                    rel={link.external ? "noreferrer" : undefined}
                    className="group inline-flex items-center gap-2 text-[15px] text-[var(--saa-text-light)] transition-colors duration-300 hover:text-[var(--saa-navy)]"
                  >
                    <span>{link.title}</span>
                    <span className="flex h-4 w-4 items-center justify-center rounded border border-[color:rgba(0,40,85,0.14)] bg-white/80 opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100">
                      <ChevronRightIcon className="h-3 w-3" />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>

      <div className="mx-auto flex max-w-6xl flex-col gap-4 border-t border-[color:rgba(0,40,85,0.10)] px-6 py-6 text-xs text-[var(--saa-text-muted)] sm:flex-row sm:items-center sm:justify-between lg:px-8">
        <p>
          &copy; {new Date().getFullYear()} {siteConfig.name}. Elevated journeys,
          thoughtfully coordinated.
        </p>

        <div className="flex flex-wrap gap-5">
          {siteConfig.legalLinks.map((link) => (
            <Link
              key={link.id}
              href={link.url}
              className="transition-colors duration-300 hover:text-[var(--saa-navy)]"
            >
              {link.title}
            </Link>
          ))}
        </div>
      </div>

      <div className="relative mt-10 h-48 md:h-64 lg:h-72">
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-24 bg-gradient-to-b from-background via-background/80 to-transparent" />
        <div className="absolute inset-x-6 inset-y-0 md:inset-x-8">
          <FlickeringGrid
            text={wordmark}
            fontSize={isTablet ? 74 : 132}
            fontWeight={700}
            className="h-full w-full"
            squareSize={2}
            gridGap={isTablet ? 3 : 4}
            color="var(--saa-navy)"
            maxOpacity={0.22}
            flickerChance={0.06}
          />
        </div>
      </div>
    </footer>
  );
}
