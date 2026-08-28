"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

/**
 * A mesh of points that springs away from the cursor, used as a section
 * background.
 *
 * Adapted from the reference component, and the differences are the point:
 *
 * 1. **It fills its section, not the window.** The original sized itself to
 *    `window.innerWidth/Height` and painted an opaque near-black rectangle.
 *    Here the canvas is transparent and measured with a `ResizeObserver`
 *    against its own box, so the section keeps its own background — white or
 *    paper — and the mesh sits on top of it.
 * 2. **Brand colours, and no hex readouts.** Points are `ink-900` at low
 *    alpha, the cursor accent is `brand-500`. The floating `AF:2C` labels the
 *    original drew next to each nearby node are gone: the user asked for the
 *    effect without them, and coordinates over marketing copy read as noise.
 * 3. **It stops when it is not being looked at.** An `IntersectionObserver`
 *    cancels the frame loop while the section is off-screen. The original ran
 *    its loop, and its O(n²) link pass, forever.
 * 4. **`prefers-reduced-motion` paints one static frame and stops.** The site
 *    flattens every other animation under that query (CLAUDE.md §6) and an
 *    unstoppable physics loop would be the one exception.
 *
 * The alphas are deliberately low — links at 0.09 and resting points at 0.13.
 * At the original strength the mesh competed with the copy on top of it, which
 * is the one thing a background may not do.
 *
 * It is `aria-hidden` and `pointer-events-none`: it is decoration, it must
 * never intercept a click meant for the copy above it, and there is nothing
 * here for a screen reader to say.
 */
export function ConstellationGrid({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const parent = canvas?.parentElement;
    if (!canvas || !parent) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    type Node = {
      x: number;
      y: number;
      vx: number;
      vy: number;
      baseX: number;
      baseY: number;
      radius: number;
      pulse: number;
    };

    let nodes: Node[] = [];
    let width = 0;
    let height = 0;
    let frame = 0;
    let visible = false;
    let last = performance.now();

    // Off-canvas until the pointer actually enters the section.
    const mouse = { x: -9999, y: -9999, prevX: -9999, prevY: -9999, radius: 200 };

    const SPACING = 58;
    const MAX_LINK = 78;
    const MAX_LINK_SQ = MAX_LINK * MAX_LINK;
    const SPRING = 18;
    const DAMPING = 0.82;

    const build = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = parent.getBoundingClientRect();
      width = Math.ceil(rect.width);
      height = Math.ceil(rect.height);
      // Only the backing store is set here. The element's *layout* size comes
      // from CSS (`size-full` inside an inset-0 parent), never from JS: if the
      // observer is late — and it is, on a tab that is not compositing — a
      // pinned pixel width leaves the canvas wider than its section and the
      // page scrolls sideways. Caught at 320px, where it stayed 1425 wide.
      canvas.width = Math.max(1, Math.round(width * dpr));
      canvas.height = Math.max(1, Math.round(height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      nodes = [];
      for (let x = 0; x <= width + SPACING; x += SPACING) {
        for (let y = 0; y <= height + SPACING; y += SPACING) {
          nodes.push({
            x,
            y,
            vx: 0,
            vy: 0,
            baseX: x,
            baseY: y,
            // Deterministic jitter: a seeded wobble rather than Math.random(),
            // so a resize does not reshuffle the whole field.
            radius: 1.2 + (((x * 31 + y * 17) % 10) / 10) * 1.1,
            pulse: ((x + y) % 628) / 100,
          });
        }
      }
    };

    const draw = (dt: number) => {
      ctx.clearRect(0, 0, width, height);

      const speed = Math.hypot(mouse.x - mouse.prevX, mouse.y - mouse.prevY);
      mouse.prevX = mouse.x;
      mouse.prevY = mouse.y;

      for (const n of nodes) {
        n.pulse += dt * 2;

        const dx = mouse.x - n.x;
        const dy = mouse.y - n.y;
        const dist = Math.hypot(dx, dy);

        if (dist < mouse.radius && dist > 0) {
          const force = (1 - dist / mouse.radius) * (900 + speed * 40);
          n.vx -= (dx / dist) * force * dt;
          n.vy -= (dy / dist) * force * dt;
        }

        n.vx += (n.baseX - n.x) * SPRING * dt;
        n.vy += (n.baseY - n.y) * SPRING * dt;
        n.vx *= DAMPING;
        n.vy *= DAMPING;
        n.x += n.vx * dt * 60;
        n.y += n.vy * dt * 60;
      }

      // Links. Only the neighbours that can possibly be in range are tested:
      // the nodes are generated column by column, so a node's candidates are
      // the next few in the array, not all of them.
      const perColumn = Math.floor(height / SPACING) + 2;
      const reach = perColumn + 2;
      ctx.lineWidth = 0.7;
      for (let i = 0; i < nodes.length; i += 1) {
        const a = nodes[i]!;
        for (let j = i + 1; j < Math.min(i + reach, nodes.length); j += 1) {
          const b = nodes[j]!;
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 >= MAX_LINK_SQ) continue;
          const alpha = (1 - Math.sqrt(d2) / MAX_LINK) * 0.09;
          ctx.strokeStyle = `rgba(26, 29, 35, ${alpha})`;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }

      for (const n of nodes) {
        const dist = Math.hypot(mouse.x - n.x, mouse.y - n.y);
        const near = dist < mouse.radius;
        const alpha = near ? 0.7 : 0.13 + Math.sin(n.pulse) * 0.05;
        ctx.fillStyle = near
          ? `rgba(255, 122, 0, ${alpha})`
          : `rgba(26, 29, 35, ${alpha})`;
        const r = near ? n.radius * 2 : n.radius + Math.sin(n.pulse) * 0.3;
        ctx.beginPath();
        ctx.arc(n.x, n.y, Math.max(0.5, r), 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const loop = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      draw(dt);
      frame = requestAnimationFrame(loop);
    };

    const start = () => {
      if (frame || reduced) return;
      last = performance.now();
      frame = requestAnimationFrame(loop);
    };
    const stop = () => {
      if (!frame) return;
      cancelAnimationFrame(frame);
      frame = 0;
    };

    const onPointerMove = (event: PointerEvent) => {
      const rect = parent.getBoundingClientRect();
      mouse.x = event.clientX - rect.left;
      mouse.y = event.clientY - rect.top;
    };
    const onPointerLeave = () => {
      mouse.x = -9999;
      mouse.y = -9999;
    };

    build();
    draw(0);

    const resizeObserver = new ResizeObserver(() => {
      build();
      if (reduced || !visible) draw(0);
    });
    resizeObserver.observe(parent);

    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        visible = Boolean(entry?.isIntersecting);
        if (visible) start();
        else stop();
      },
      { rootMargin: "120px" },
    );
    intersectionObserver.observe(parent);

    if (!reduced) {
      parent.addEventListener("pointermove", onPointerMove);
      parent.addEventListener("pointerleave", onPointerLeave);
    }

    return () => {
      stop();
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      parent.removeEventListener("pointermove", onPointerMove);
      parent.removeEventListener("pointerleave", onPointerLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 -z-10 size-full", className)}
    />
  );
}
