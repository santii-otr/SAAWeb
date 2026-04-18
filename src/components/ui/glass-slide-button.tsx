"use client"

import React, { useRef, useState, useCallback } from "react"

interface GlassSlideButtonProps {
  href: string
  label?: string
  onBeforeNavigate?: () => void
  className?: string
}

const HANDLE_SIZE = 52
const TRACK_WIDTH = 280
const MAX_DRAG    = TRACK_WIDTH - HANDLE_SIZE - 8
const THRESHOLD   = 0.88

const PaperPlane = ({ size = 20 }: { size?: number }) => (
  <svg viewBox="0 0 32 32" width={size} height={size} fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 15L29 3L20 29L14 18L2 15Z" fill="currentColor" fillOpacity={0.9} />
    <path d="M14 18L20 12" stroke="rgba(255,255,255,0.5)" strokeWidth="1.2" strokeLinecap="round" />
    <path d="M14 18L16 25" stroke="rgba(255,255,255,0.35)" strokeWidth="1" strokeLinecap="round" />
  </svg>
)

const CheckIcon = ({ size = 18 }: { size?: number }) => (
  <svg viewBox="0 0 20 20" width={size} height={size} fill="none" stroke="currentColor"
    strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
    <polyline points="4,10 8,14 16,6" />
  </svg>
)

export function GlassSlideButton({
  href,
  label = "Join now",
  onBeforeNavigate,
  className = "",
}: GlassSlideButtonProps) {
  const handleRef      = useRef<HTMLDivElement>(null)
  const dragging       = useRef(false)
  const pointerOriginX = useRef(0)
  const handleX        = useRef(0)

  const [dragProgress, setDragProgress] = useState(0)
  const [done, setDone] = useState(false)

  const applyX = useCallback((x: number) => {
    const clamped = Math.max(0, Math.min(x, MAX_DRAG))
    handleX.current = clamped
    if (handleRef.current) {
      handleRef.current.style.transform = `translateX(${clamped}px)`
    }
    setDragProgress(clamped / MAX_DRAG)
  }, [])

  const snapBack = useCallback(() => {
    const from = handleX.current
    const t0   = performance.now()
    const tick = (now: number) => {
      const el   = Math.min((now - t0) / 320, 1)
      const ease = 1 - Math.pow(1 - el, 3)
      applyX(from * (1 - ease))
      if (el < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [applyX])

  const snapToEnd = useCallback(() => {
    const from = handleX.current
    const t0   = performance.now()
    const tick = (now: number) => {
      const el   = Math.min((now - t0) / 200, 1)
      const ease = 1 - Math.pow(1 - el, 4)
      applyX(from + (MAX_DRAG - from) * ease)
      if (el < 1) {
        requestAnimationFrame(tick)
      } else {
        setDone(true)
        onBeforeNavigate?.()
        setTimeout(() => { if (href !== "DO NOT CHANGE") window.location.href = href }, 600)
      }
    }
    requestAnimationFrame(tick)
  }, [applyX, href, onBeforeNavigate])

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    if (done) return
    dragging.current = true
    pointerOriginX.current = e.clientX - handleX.current
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    e.preventDefault()
  }, [done])

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging.current || done) return
    applyX(e.clientX - pointerOriginX.current)
    e.preventDefault()
  }, [done, applyX])

  const onPointerUp = useCallback(() => {
    if (!dragging.current || done) return
    dragging.current = false
    if (handleX.current / MAX_DRAG >= THRESHOLD) snapToEnd()
    else snapBack()
  }, [done, snapToEnd, snapBack])

  const fillWidth    = HANDLE_SIZE + handleX.current
  const labelOpacity = Math.max(0, 1 - dragProgress * 2.8)

  return (
    <div className={`gsbtn-root ${className}`}>
      <div className="gsbtn-track">

        <div className="gsbtn-fill" style={{ width: done ? TRACK_WIDTH : fillWidth }} />

        <span className="gsbtn-label" style={{ opacity: done ? 0 : labelOpacity }}>
          {label}
        </span>

        <div
          ref={handleRef}
          className={`gsbtn-handle${done ? " gsbtn-handle--done" : ""}`}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          {done ? <CheckIcon /> : <PaperPlane size={18} />}
        </div>

      </div>

      <style>{`
        .gsbtn-root {
          display: inline-flex;
          align-items: center;
        }

        .gsbtn-track {
          position: relative;
          width: ${TRACK_WIDTH}px;
          height: ${HANDLE_SIZE + 8}px;
          border-radius: 999px;
          display: flex;
          align-items: center;
          background: rgba(255,255,255,0.07);
          border: 1px solid rgba(255,255,255,0.18);
          backdrop-filter: blur(10px) saturate(150%);
          -webkit-backdrop-filter: blur(10px) saturate(150%);
          overflow: hidden;
          user-select: none;
          -webkit-user-select: none;
          box-shadow:
            inset 0 1px 1px rgba(255,255,255,0.22),
            inset 0 -1px 1px rgba(0,0,0,0.05),
            0 4px 24px rgba(80,80,200,0.10);
        }

        .gsbtn-fill {
          position: absolute;
          left: 0; top: 0; bottom: 0;
          border-radius: 999px;
          background: linear-gradient(
            90deg,
            rgba(110,120,240,0.18) 0%,
            rgba(130,140,255,0.36) 100%
          );
          transition: width 0.04s linear;
          pointer-events: none;
        }

        .gsbtn-label {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13.5px;
          font-weight: 500;
          letter-spacing: 0.05em;
          color: rgba(255,255,255,0.72);
          pointer-events: none;
          transition: opacity 0.15s;
        }

        .gsbtn-handle {
          position: absolute;
          left: 4px;
          top: 4px;
          width: ${HANDLE_SIZE}px;
          height: ${HANDLE_SIZE}px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: grab;
          z-index: 10;
          touch-action: none;
          background: rgba(255,255,255,0.22);
          border: 1px solid rgba(255,255,255,0.42);
          backdrop-filter: blur(16px) saturate(180%);
          -webkit-backdrop-filter: blur(16px) saturate(180%);
          box-shadow:
            inset 0 1.5px 1.5px rgba(255,255,255,0.65),
            inset 0 -1px 1px rgba(0,0,0,0.06),
            0 4px 18px rgba(80,80,200,0.18);
          color: rgba(255,255,255,0.90);
          will-change: transform;
          transition: box-shadow 0.12s;
        }

        .gsbtn-handle:active {
          cursor: grabbing;
          box-shadow:
            inset 0 1px 1px rgba(255,255,255,0.5),
            0 2px 8px rgba(80,80,200,0.10);
        }

        .gsbtn-handle--done {
          cursor: default;
          background: rgba(80,200,140,0.25);
          border-color: rgba(80,200,140,0.5);
          box-shadow:
            inset 0 1.5px 1px rgba(255,255,255,0.5),
            0 4px 16px rgba(40,180,100,0.2);
          color: #5EC98A;
          transform: translateX(${MAX_DRAG}px) !important;
        }
      `}</style>
    </div>
  )
}

export default GlassSlideButton
