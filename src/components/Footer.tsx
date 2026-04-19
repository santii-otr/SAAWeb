"use client";

import { ClassValue, clsx } from "clsx";
import * as Color from "color-bits";
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

export default function Footer() {
  const isTablet = useMediaQuery("(max-width: 1024px)");
  const wordmark = isTablet ? "SAA" : "FLY BEYOND";

  return (
    <footer
      id="footer"
      className="relative w-full overflow-hidden border-t border-[color:rgba(0,40,85,0.12)] bg-background"
      style={{
        backgroundImage:
          "radial-gradient(circle at top, rgba(0,86,179,0.08), transparent 34%)",
      }}
    >
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
