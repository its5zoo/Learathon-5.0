import React, { useEffect, useRef, useState } from 'react';
import './WaterSurface.css';

const WaterSurface: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameIdRef = useRef<number>(0);
  const [isEnabled, setIsEnabled] = useState<boolean>(true);
  const [intensity, setIntensity] = useState<'calm' | 'deep'>('deep');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !isEnabled) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Grid resolution for fast, silky-smooth 60 FPS 2D Wave physics
    const scale = 3;
    let gridWidth = Math.floor(window.innerWidth / scale);
    let gridHeight = Math.floor(window.innerHeight / scale);
    let totalPixels = gridWidth * gridHeight;

    let buffer1 = new Float32Array(totalPixels);
    let buffer2 = new Float32Array(totalPixels);

    // Offscreen canvas for fast image rendering
    const offscreen = document.createElement('canvas');
    offscreen.width = gridWidth;
    offscreen.height = gridHeight;
    const offCtx = offscreen.getContext('2d');
    if (!offCtx) return;

    let imgData = offCtx.createImageData(gridWidth, gridHeight);
    let data32 = new Uint32Array(imgData.data.buffer);

    const handleResize = () => {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      gridWidth = Math.floor(window.innerWidth / scale);
      gridHeight = Math.floor(window.innerHeight / scale);
      totalPixels = gridWidth * gridHeight;

      buffer1 = new Float32Array(totalPixels);
      buffer2 = new Float32Array(totalPixels);

      offscreen.width = gridWidth;
      offscreen.height = gridHeight;
      imgData = offCtx.createImageData(gridWidth, gridHeight);
      data32 = new Uint32Array(imgData.data.buffer);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    // Add water disturbance (wave injection)
    const disturb = (screenX: number, screenY: number, radius = 6, force = 180) => {
      const gx = Math.floor((screenX / window.innerWidth) * gridWidth);
      const gy = Math.floor((screenY / window.innerHeight) * gridHeight);

      for (let dy = -radius; dy <= radius; dy++) {
        const ny = gy + dy;
        if (ny <= 1 || ny >= gridHeight - 2) continue;
        const row = ny * gridWidth;

        for (let dx = -radius; dx <= radius; dx++) {
          const nx = gx + dx;
          if (nx <= 1 || nx >= gridWidth - 2) continue;

          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist <= radius) {
            const weight = Math.cos((dist / radius) * (Math.PI / 2));
            buffer1[row + nx] += force * weight;
          }
        }
      }
    };

    let lastX = -100;
    let lastY = -100;

    const handleMouseMove = (e: MouseEvent) => {
      const { clientX: x, clientY: y } = e;
      const dx = x - lastX;
      const dy = y - lastY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist > 6) {
        // Continuous hydrodynamic water trail
        const steps = Math.min(Math.floor(dist / 6), 6);
        for (let i = 1; i <= steps; i++) {
          const ix = lastX + (dx * i) / steps;
          const iy = lastY + (dy * i) / steps;
          disturb(ix, iy, intensity === 'deep' ? 7 : 5, intensity === 'deep' ? 140 : 90);
        }
        lastX = x;
        lastY = y;
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      disturb(e.clientX, e.clientY, 14, 450);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        const dx = touch.clientX - lastX;
        const dy = touch.clientY - lastY;
        if (Math.sqrt(dx * dx + dy * dy) > 8) {
          disturb(touch.clientX, touch.clientY, 8, 200);
          lastX = touch.clientX;
          lastY = touch.clientY;
        }
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        disturb(touch.clientX, touch.clientY, 16, 500);
        lastX = touch.clientX;
        lastY = touch.clientY;
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mousedown', handleMouseDown, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });

    // Ambient gentle water swell (natural breathing lake motion)
    let ambientTimer = 0;

    const render = () => {
      ambientTimer += 0.03;

      // Soft natural water swell on edges/center every few seconds
      if (Math.random() < 0.02) {
        const ax = (0.2 + Math.random() * 0.6) * window.innerWidth;
        const ay = (0.2 + Math.random() * 0.6) * window.innerHeight;
        disturb(ax, ay, 8, 45);
      }

      // Wave equation propagation:
      // next[x, y] = (prev[x-1, y] + prev[x+1, y] + prev[x, y-1] + prev[x, y+1]) / 2 - current[x, y]
      const damping = intensity === 'deep' ? 0.985 : 0.975;

      for (let y = 1; y < gridHeight - 1; y++) {
        const row = y * gridWidth;
        const prevRow = (y - 1) * gridWidth;
        const nextRow = (y + 1) * gridWidth;

        for (let x = 1; x < gridWidth - 1; x++) {
          const idx = row + x;

          // 2D wave kernel
          const wave =
            (buffer1[idx - 1] +
              buffer1[idx + 1] +
              buffer1[prevRow + x] +
              buffer1[nextRow + x]) *
              0.5 -
            buffer2[idx];

          buffer2[idx] = wave * damping;
        }
      }

      // Swap buffers
      const temp = buffer1;
      buffer1 = buffer2;
      buffer2 = temp;

      // Shading & caustics rendering into pixel buffer
      let idx = 0;
      for (let y = 0; y < gridHeight; y++) {
        const row = y * gridWidth;
        const prevRow = Math.max(0, y - 1) * gridWidth;
        const nextRow = Math.min(gridHeight - 1, y + 1) * gridWidth;

        for (let x = 0; x < gridWidth; x++) {
          if (x === 0 || x === gridWidth - 1 || y === 0 || y === gridHeight - 1) {
            data32[idx++] = 0;
            continue;
          }

          // Gradients / surface normals (refraction)
          const dx = buffer1[row + x + 1] - buffer1[row + x - 1];
          const dy = buffer1[nextRow + x] - buffer1[prevRow + x];

          // Sun / sky highlight caustics
          const light = (-dx * 0.7 - dy * 0.7) * 1.8;
          const heightVal = buffer1[row + x];

          const waveMagnitude = Math.abs(heightVal) * 0.8 + Math.abs(dx) + Math.abs(dy);

          if (waveMagnitude > 0.8 || light > 1.2) {
            // Calm aquatic palette: Cyan (56, 189, 248) -> Deep Teal (14, 165, 233) -> Sun Shimmer
            const specular = Math.min(255, Math.max(0, light * 1.4));

            const r = Math.min(255, Math.floor(35 + specular * 0.85));
            const g = Math.min(255, Math.floor(160 + specular * 0.4));
            const b = Math.min(255, Math.floor(235 + specular * 0.15));

            // Alpha transparency: gentle water caustics
            const alphaVal = Math.min(160, Math.floor(Math.min(waveMagnitude * 1.4, 90) + specular * 0.45));

            // ABGR 32-bit integer packing for high speed
            data32[idx++] = (alphaVal << 24) | (b << 16) | (g << 8) | r;
          } else {
            data32[idx++] = 0;
          }
        }
      }

      // Render image data to offscreen canvas, then stretch to main canvas with smooth bilinear filter
      offCtx.putImageData(imgData, 0, 0);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(offscreen, 0, 0, canvas.width, canvas.height);

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
  }, [isEnabled, intensity]);

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
          title={isEnabled ? 'Liquid Water Motion: Active (Click to pause)' : 'Liquid Water Motion: Paused (Click to activate)'}
        >
          <span className="water-icon">🌊</span>
          <span className="water-label">{isEnabled ? 'Deep Water Fluid' : 'Calm Mode'}</span>
        </button>

        {isEnabled && (
          <button
            type="button"
            className="water-intensity-btn"
            onClick={() => setIntensity(intensity === 'deep' ? 'calm' : 'deep')}
            title="Toggle Fluid Motion Depth"
          >
            {intensity === 'deep' ? '🌊 Deep Fluid' : '💧 Subtle Flow'}
          </button>
        )}
      </div>
    </>
  );
};

export default WaterSurface;
