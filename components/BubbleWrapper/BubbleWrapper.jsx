
import { useState, useRef, useLayoutEffect, useEffect } from "react"
import { createPortal } from "react-dom"
import "./BubbleWrapper.css"

/**
 * BubbleWrapper
 *
 * Renders `anchor` inline. On hover a floating card appears around it
 * with optional top / bottom / left / right sections.
 *
 * Layout (all sections):
 *   ┌───────────────┐
 *   │     top       │
 *   ├────┬───────┬──┤
 *   │ L  │anchor │R │
 *   ├────┴───────┴──┤
 *   │    bottom     │
 *   └───────────────┘
 *
 * Props:
 *   anchor   – always-visible inline element (required)
 *   top      – section above the anchor (optional)
 *   bottom   – section below the anchor (optional)
 *   left     – section left of the anchor (optional)
 *   right    – section right of the anchor (optional)
 *   style / className  – applied to the trigger wrapper
 *
 * Note: if anchor contains a controlled input, lift state up so both
 * the trigger copy and the bubble copy share the same value/onChange.
 */
export default function BubbleWrapper({ anchor, top, bottom, left, right, style, className = "" }) {
  const anchorRef  = useRef(null)
  const bubbleRef  = useRef(null)
  const leaveTimer = useRef(null)
  const rmvTimer   = useRef(null)

  const [visible, setVisible] = useState(false)
  const [closing, setClosing] = useState(false)
  const [pos,     setPos]     = useState({ top: -9999, left: -9999 })
  const [origin,  setOrigin]  = useState("50% 50%")
  const [ready,   setReady]   = useState(false)

  // ── Align bubble's anchor-cell with the real anchor before browser paint ──
  // Portal renders off-screen first (-9999,-9999), we measure the anchor-cell's
  // offset within the bubble, then shift the whole bubble so that cell sits
  // exactly over the real anchor. All runs synchronously before paint.
  useLayoutEffect(() => {
    if (!visible || !bubbleRef.current || !anchorRef.current) return

    const aRect = anchorRef.current.getBoundingClientRect()
    const cell  = bubbleRef.current.querySelector(".bw-anchor-cell")
    if (!cell) return

    const cRect = cell.getBoundingClientRect()   // measured at top:-9999 left:-9999
    const bRect = bubbleRef.current.getBoundingClientRect()

    // shift = -9999 + (realAnchor - cellAtStartPos)
    let newTop  = -9999 + (aRect.top  - cRect.top)
    let newLeft = -9999 + (aRect.left - cRect.left)

    // Clamp to viewport so the bubble never hides behind browser edges
    const margin = 8
    newTop  = Math.min(Math.max(newTop,  margin), window.innerHeight - bRect.height - margin)
    newLeft = Math.min(Math.max(newLeft, margin), window.innerWidth  - bRect.width  - margin)

    // scale-origin = anchor-cell centre expressed as % of bubble size
    const ox = ((cRect.left + cRect.width  / 2) - bRect.left) / bRect.width  * 100
    const oy = ((cRect.top  + cRect.height / 2) - bRect.top)  / bRect.height * 100

    // Initial scale: make popup start at the same size as the anchor element
    const sx = (aRect.width  / bRect.width).toFixed(4)
    const sy = (aRect.height / bRect.height).toFixed(4)
    bubbleRef.current.style.setProperty('--bw-sx', sx)
    bubbleRef.current.style.setProperty('--bw-sy', sy)

    setPos({ top: newTop, left: newLeft })
    setOrigin(`${ox.toFixed(1)}% ${oy.toFixed(1)}%`)
    setReady(true)
  }, [visible])

  // ── Focus input inside anchor-cell when bubble becomes ready ──────────────
  useEffect(() => {
    if (!ready || !bubbleRef.current) return
    const el = bubbleRef.current.querySelector(".bw-anchor-cell input, .bw-anchor-cell textarea, .bw-anchor-cell select")
    if (el) el.focus()
  }, [ready])

  // ── Hover handlers ────────────────────────────────────────────────────────
  const handleOpen = () => {
    clearTimeout(leaveTimer.current)
    clearTimeout(rmvTimer.current)
    if (closing) {
      setClosing(false)   // re-entered while closing — cancel exit animation
      return
    }
    if (!visible) {
      setReady(false)
      setPos({ top: -9999, left: -9999 })
      setVisible(true)   // triggers useLayoutEffect → measure → ready
    }
  }

  const handleClose = () => {
    clearTimeout(leaveTimer.current)
    // 60 ms delay so crossing between grid cells doesn't flicker
    leaveTimer.current = setTimeout(() => {
      setClosing(true)
      // remove from DOM after transition finishes
      rmvTimer.current = setTimeout(() => {
        setVisible(false)
        setClosing(false)
        setReady(false)
      }, 200)   // must match CSS transition duration
    }, 60)
  }

  const handleStay = () => {
    clearTimeout(leaveTimer.current)
    clearTimeout(rmvTimer.current)
    if (closing) setClosing(false)
  }

  const showBubble = visible && ready && !closing

  return (
    <>
      <span
        ref={anchorRef}
        className={`bw-trigger${showBubble ? " bw-trigger--open" : ""}${className ? " " + className : ""}`}
        style={style}
        onMouseEnter={handleOpen}
        onMouseLeave={handleClose}
      >
        {anchor}
      </span>

      {visible && createPortal(
        <div
          ref={bubbleRef}
          className={[
            "bw-popup",
            ready   && "bw-popup--ready",
            closing && "bw-popup--closing",
          ].filter(Boolean).join(" ")}
          style={{
            top:  pos.top,
            left: pos.left,
            "--bw-origin": origin,
          }}
          onMouseEnter={handleStay}
          onMouseLeave={handleClose}
        >
          {top    && <div className="bw-cell bw-top">{top}</div>}
          <div className="bw-mid">
            {left   && <div className="bw-cell bw-left">{left}</div>}
            <div className="bw-cell bw-anchor-cell">{anchor}</div>
            {right  && <div className="bw-cell bw-right">{right}</div>}
          </div>
          {bottom && <div className="bw-cell bw-bottom">{bottom}</div>}
        </div>,
        document.body
      )}
    </>
  )
}