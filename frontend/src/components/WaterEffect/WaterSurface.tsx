import React, { useEffect, useRef, useState } from 'react';
import './WaterSurface.css';

interface Ripple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  speed: number;
  lineWidth: number;
  hue: number;
}

interface Droplet {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  life: number;
  maxLife: number;
  hue: number;
}

const WaterSurface: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ripplesRef = useRef<Ripple[]>([]);
  const dropletsRef = useRef<Droplet[]>([]);
  const lastMousePosRef = useRef<{ x: number; y: number }>({ x: -100, y: -100 });
  const animFrameIdRef = useRef<number>(0);
  const [isEnabled, setIsEnabled] = useState<boolean>(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !isEnabled) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const handleResize = () => {
      if (!canvas) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.scale(dpr, dpr);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    const addRipple = (x: number, y: number, isClick = false) => {
      const maxR = isClick ? 85 : 48 + Math.random() * 20;
      const baseAlpha = isClick ? 0.38 : 0.22;
      const baseSpeed = isClick ? 2.2 : 1.4 + Math.random() * 0.6;
      const hue = 195 + Math.random() * 20; // tranquil cyan / sky-blue

      ripplesRef.current.push({
        x,
        y,
        radius: 2,
        maxRadius: maxR,
        alpha: baseAlpha,
        speed: baseSpeed,
        lineWidth: isClick ? 2.5 : 1.8,
        hue,
      });

      if (isClick) {
        // secondary echo ripple for realistic water reflection
        setTimeout(() => {
          ripplesRef.current.push({
            x,
            y,
            radius: 1,
            maxRadius: maxR * 0.75,
            alpha: baseAlpha * 0.7,
            speed: baseSpeed * 0.85,
            lineWidth: 1.5,
            hue: hue + 10,
          });
        }, 120);

        // Add micro water droplets on click
        for (let i = 0; i < 6; i++) {
          const angle = Math.random() * Math.PI * 2;
          const velocity = 1.2 + Math.random() * 2.5;
          dropletsRef.current.push({
            x,
            y,
            vx: Math.cos(angle) * velocity,
            vy: Math.sin(angle) * velocity,
            radius: 1.5 + Math.random() * 2,
            alpha: 0.45,
            life: 0,
            maxLife: 35 + Math.random() * 20,
            hue: 190 + Math.random() * 25,
          });
        }
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      const { clientX: x, clientY: y } = e;
      const last = lastMousePosRef.current;
      const dx = x - last.x;
      const dy = y - last.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Spawn soft ripples when mouse moves continuously
      if (dist > 18) {
        addRipple(x, y, false);

        // Spawn gentle ambient water mist trail
        if (Math.random() > 0.4) {
          dropletsRef.current.push({
            x: x + (Math.random() - 0.5) * 8,
            y: y + (Math.random() - 0.5) * 8,
            vx: (Math.random() - 0.5) * 0.6,
            vy: (Math.random() - 0.5) * 0.6 - 0.2,
            radius: 1.2 + Math.random() * 1.8,
            alpha: 0.3,
            life: 0,
            maxLife: 28 + Math.random() * 15,
            hue: 195 + Math.random() * 20,
          });
        }

        lastMousePosRef.current = { x, y };
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      addRipple(e.clientX, e.clientY, true);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        const last = lastMousePosRef.current;
        const dx = touch.clientX - last.x;
        const dy = touch.clientY - last.y;
        if (Math.sqrt(dx * dx + dy * dy) > 22) {
          addRipple(touch.clientX, touch.clientY, false);
          lastMousePosRef.current = { x: touch.clientX, y: touch.clientY };
        }
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        addRipple(touch.clientX, touch.clientY, true);
        lastMousePosRef.current = { x: touch.clientX, y: touch.clientY };
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mousedown', handleMouseDown, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });

    let lastTime = performance.now();

    const render = (time: number) => {
      const dt = Math.min((time - lastTime) / 16.66, 2.0);
      lastTime = time;

      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      // Render & update ripples
      const activeRipples: Ripple[] = [];
      for (let i = 0; i < ripplesRef.current.length; i++) {
        const r = ripplesRef.current[i];
        r.radius += r.speed * dt;
        const progress = r.radius / r.maxRadius;
        r.alpha = Math.max(0, (1 - progress) * (r.alpha * 0.98));

        if (r.alpha > 0.005 && r.radius < r.maxRadius) {
          ctx.save();
          ctx.beginPath();
          ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);

          // Outer shimmering wave ring
          ctx.strokeStyle = `hsla(${r.hue}, 85%, 62%, ${r.alpha})`;
          ctx.lineWidth = r.lineWidth * (1 - progress * 0.4);
          ctx.stroke();

          // Soft inner water glow
          if (r.radius > 6) {
            ctx.beginPath();
            ctx.arc(r.x, r.y, r.radius * 0.65, 0, Math.PI * 2);
            ctx.strokeStyle = `hsla(${r.hue + 15}, 90%, 75%, ${r.alpha * 0.45})`;
            ctx.lineWidth = r.lineWidth * 0.6;
            ctx.stroke();
          }

          ctx.restore();
          activeRipples.push(r);
        }
      }
      ripplesRef.current = activeRipples;

      // Render & update droplets
      const activeDroplets: Droplet[] = [];
      for (let i = 0; i < dropletsRef.current.length; i++) {
        const d = dropletsRef.current[i];
        d.x += d.vx * dt;
        d.y += d.vy * dt;
        d.vx *= 0.94;
        d.vy *= 0.94;
        d.life += dt;
        const lifeRatio = d.life / d.maxLife;
        const alpha = Math.max(0, d.alpha * (1 - lifeRatio));

        if (d.life < d.maxLife && alpha > 0.01) {
          ctx.save();
          ctx.beginPath();
          ctx.arc(d.x, d.y, d.radius * (1 - lifeRatio * 0.3), 0, Math.PI * 2);
          ctx.fillStyle = `hsla(${d.hue}, 80%, 65%, ${alpha})`;
          ctx.shadowColor = `hsla(${d.hue}, 90%, 65%, ${alpha * 0.7})`;
          ctx.shadowBlur = 4;
          ctx.fill();
          ctx.restore();
          activeDroplets.push(d);
        }
      }
      dropletsRef.current = activeDroplets;

      animFrameIdRef.current = requestAnimationFrame(render);
    };

    animFrameIdRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchstart', handleTouchStart);
      cancelAnimationFrame(animFrameIdRef.current);
    };
  }, [isEnabled]);

  return (
    <>
      <canvas
        ref={canvasRef}
        className={`water-surface-canvas ${isEnabled ? 'active' : 'disabled'}`}
        aria-hidden="true"
      />
      <div className="water-surface-floating-toggle">
        <button
          type="button"
          className={`water-toggle-btn ${isEnabled ? 'water-on' : 'water-off'}`}
          onClick={() => setIsEnabled(!isEnabled)}
          title={isEnabled ? 'Water Surface Ripples: Active (Click to toggle)' : 'Water Surface Ripples: Paused (Click to activate)'}
        >
          <span className="water-icon">{isEnabled ? '🌊' : '💧'}</span>
          <span className="water-label">{isEnabled ? 'Water Mode' : 'Calm Mode'}</span>
        </button>
      </div>
    </>
  );
};

export default WaterSurface;
