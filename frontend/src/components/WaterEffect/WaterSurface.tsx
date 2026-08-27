import React, { useEffect, useRef, useState } from 'react';
import './WaterSurface.css';

interface LocalRipple {
  x: number;
  y: number;
  r: number;
  maxR: number;
  alpha: number;
  speed: number;
  lineWidth: number;
  hue: number;
}

interface WaterDrop {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  life: number;
  maxLife: number;
}

const WaterSurface: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameIdRef = useRef<number>(0);
  const [isEnabled, setIsEnabled] = useState<boolean>(true);

  const ripplesRef = useRef<LocalRipple[]>([]);
  const dropsRef = useRef<WaterDrop[]>([]);
  const mousePosRef = useRef<{ x: number; y: number; targetX: number; targetY: number; speed: number }>({
    x: -200,
    y: -200,
    targetX: -200,
    targetY: -200,
    speed: 0,
  });
  const isHoveringRef = useRef<boolean>(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !isEnabled) return;

    const ctx = canvas.getContext('2d');
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

    const spawnRipple = (x: number, y: number, isClick = false) => {
      const maxRadius = isClick ? 130 : 75 + Math.random() * 25;
      const baseAlpha = isClick ? 0.42 : 0.26;
      const speed = isClick ? 3.0 : 1.8 + Math.random() * 0.8;

      ripplesRef.current.push({
        x,
        y,
        r: 4,
        maxR: maxRadius,
        alpha: baseAlpha,
        speed,
        lineWidth: isClick ? 2.2 : 1.5,
        hue: 196 + Math.random() * 15,
      });

      if (isClick) {
        setTimeout(() => {
          ripplesRef.current.push({
            x,
            y,
            r: 2,
            maxR: maxRadius * 0.7,
            alpha: baseAlpha * 0.7,
            speed: speed * 0.85,
            lineWidth: 1.4,
            hue: 205,
          });
        }, 80);

        for (let i = 0; i < 5; i++) {
          const angle = Math.random() * Math.PI * 2;
          const v = 1.2 + Math.random() * 2.2;
          dropsRef.current.push({
            x,
            y,
            vx: Math.cos(angle) * v,
            vy: Math.sin(angle) * v,
            size: 1.8 + Math.random() * 1.5,
            alpha: 0.5,
            life: 0,
            maxLife: 26 + Math.random() * 14,
          });
        }
      }
    };

    let lastDisturbTime = 0;

    const handleMouseMove = (e: MouseEvent) => {
      isHoveringRef.current = true;
      const mouse = mousePosRef.current;
      const now = performance.now();

      const dx = e.clientX - mouse.targetX;
      const dy = e.clientY - mouse.targetY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
      mouse.speed = Math.min(dist, 40);

      // Localized water trail directly under mouse
      if (dist > 14 && now - lastDisturbTime > 35) {
        spawnRipple(e.clientX, e.clientY, false);

        if (Math.random() > 0.45) {
          dropsRef.current.push({
            x: e.clientX + (Math.random() - 0.5) * 12,
            y: e.clientY + (Math.random() - 0.5) * 12,
            vx: (Math.random() - 0.5) * 0.8,
            vy: (Math.random() - 0.5) * 0.8 - 0.3,
            size: 1.4 + Math.random() * 1.6,
            alpha: 0.35,
            life: 0,
            maxLife: 22 + Math.random() * 12,
          });
        }
        lastDisturbTime = now;
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      spawnRipple(e.clientX, e.clientY, true);
    };

    const handleMouseLeave = () => {
      isHoveringRef.current = false;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const t = e.touches[0];
        isHoveringRef.current = true;
        mousePosRef.current.targetX = t.clientX;
        mousePosRef.current.targetY = t.clientY;
        spawnRipple(t.clientX, t.clientY, false);
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const t = e.touches[0];
        isHoveringRef.current = true;
        mousePosRef.current.targetX = t.clientX;
        mousePosRef.current.targetY = t.clientY;
        spawnRipple(t.clientX, t.clientY, true);
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mousedown', handleMouseDown, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });

    let lastTime = performance.now();

    const render = (time: number) => {
      const dt = Math.min((time - lastTime) / 16.66, 2.0);
      lastTime = time;

      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      const mouse = mousePosRef.current;
      // Smooth viscous fluid trailing
      mouse.x += (mouse.targetX - mouse.x) * 0.22 * dt;
      mouse.y += (mouse.targetY - mouse.y) * 0.22 * dt;
      mouse.speed *= 0.92;

      // 1. Draw localized Liquid Water Lens directly around the mouse cursor
      if (isHoveringRef.current && mouse.x > 0 && mouse.y > 0) {
        const lensRadius = 85 + Math.min(mouse.speed * 1.5, 30);
        const grad = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, lensRadius);
        grad.addColorStop(0, 'rgba(56, 189, 248, 0.22)');
        grad.addColorStop(0.45, 'rgba(14, 165, 233, 0.12)');
        grad.addColorStop(0.8, 'rgba(56, 189, 248, 0.04)');
        grad.addColorStop(1, 'rgba(56, 189, 248, 0)');

        ctx.save();
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, lensRadius, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();

        // Inner glowing water droplet center
        const coreGrad = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 22);
        coreGrad.addColorStop(0, 'rgba(255, 255, 255, 0.45)');
        coreGrad.addColorStop(0.5, 'rgba(56, 189, 248, 0.25)');
        coreGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 22, 0, Math.PI * 2);
        ctx.fillStyle = coreGrad;
        ctx.fill();
        ctx.restore();
      }

      // 2. Render localized expanding fluid ripples
      const nextRipples: LocalRipple[] = [];
      for (let i = 0; i < ripplesRef.current.length; i++) {
        const r = ripplesRef.current[i];
        r.r += r.speed * dt;
        const progress = r.r / r.maxR;
        r.alpha = (1 - progress) * (r.alpha * 0.98);

        if (r.alpha > 0.008 && r.r < r.maxR) {
          ctx.save();
          ctx.beginPath();
          ctx.arc(r.x, r.y, r.r, 0, Math.PI * 2);
          ctx.strokeStyle = `hsla(${r.hue}, 88%, 62%, ${r.alpha})`;
          ctx.lineWidth = r.lineWidth * (1 - progress * 0.5);
          ctx.stroke();

          // Soft secondary refraction edge
          if (r.r > 8) {
            ctx.beginPath();
            ctx.arc(r.x, r.y, r.r * 0.72, 0, Math.PI * 2);
            ctx.strokeStyle = `hsla(${r.hue + 12}, 92%, 78%, ${r.alpha * 0.4})`;
            ctx.lineWidth = r.lineWidth * 0.55;
            ctx.stroke();
          }

          ctx.restore();
          nextRipples.push(r);
        }
      }
      ripplesRef.current = nextRipples;

      // 3. Render soft micro droplets
      const nextDrops: WaterDrop[] = [];
      for (let i = 0; i < dropsRef.current.length; i++) {
        const d = dropsRef.current[i];
        d.x += d.vx * dt;
        d.y += d.vy * dt;
        d.vx *= 0.94;
        d.vy *= 0.94;
        d.life += dt;
        const lifeRatio = d.life / d.maxLife;
        const alpha = d.alpha * (1 - lifeRatio);

        if (d.life < d.maxLife && alpha > 0.01) {
          ctx.save();
          ctx.beginPath();
          ctx.arc(d.x, d.y, d.size * (1 - lifeRatio * 0.25), 0, Math.PI * 2);
          ctx.fillStyle = `rgba(56, 189, 248, ${alpha})`;
          ctx.shadowColor = 'rgba(56, 189, 248, 0.6)';
          ctx.shadowBlur = 4;
          ctx.fill();
          ctx.restore();
          nextDrops.push(d);
        }
      }
      dropsRef.current = nextDrops;

      animFrameIdRef.current = requestAnimationFrame(render);
    };

    animFrameIdRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseleave', handleMouseLeave);
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
          title={isEnabled ? 'Water Cursor Motion: Active (Click to pause)' : 'Water Cursor Motion: Paused (Click to activate)'}
        >
          <span className="water-icon">💧</span>
          <span className="water-label">{isEnabled ? 'Water Cursor' : 'Calm Mode'}</span>
        </button>
      </div>
    </>
  );
};

export default WaterSurface;
