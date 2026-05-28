import { useRef, useEffect } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  baseAlpha: number;
  pulseSpeed: number;
  pulsePhase: number;
}

export default function BackgroundEffect() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      createParticles();
    };

    const createParticles = () => {
      const count = Math.min(Math.floor((canvas.width * canvas.height) / 8000), 120);
      const particles: Particle[] = [];
      for (let i = 0; i < count; i++) {
        const baseAlpha = 0.3 + Math.random() * 0.4;
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.2,
          vy: (Math.random() - 0.5) * 0.2,
          radius: 1.5 + Math.random() * 2.5,
          alpha: baseAlpha,
          baseAlpha,
          pulseSpeed: 0.008 + Math.random() * 0.02,
          pulsePhase: Math.random() * Math.PI * 2,
        });
      }
      particlesRef.current = particles;
    };

    resize();
    window.addEventListener('resize', resize);

    const onMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
    };

    const onMouseLeave = () => {
      mouseRef.current.x = -1000;
      mouseRef.current.y = -1000;
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseleave', onMouseLeave);

    let isVisible = true;
    const onVisibilityChange = () => {
      isVisible = !document.hidden;
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    const MAX_DIST = 200;
    const MOUSE_RADIUS = 250;
    const MOUSE_GLOW_RADIUS = 180;

    const animate = (time: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const particles = particlesRef.current;
      const mouse = mouseRef.current;

      for (const p of particles) {
        if (!isVisible) {
          p.alpha = p.baseAlpha * 0.3;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(${217 + Math.sin(p.pulsePhase + p.x * 0.01) * 30}, 80%, 75%, ${p.alpha})`;
          ctx.fill();
          continue;
        }

        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const distToMouse = Math.sqrt(dx * dx + dy * dy);

        if (distToMouse < MOUSE_RADIUS) {
          const force = (1 - distToMouse / MOUSE_RADIUS) * 2;
          p.x += (dx / distToMouse || 0) * force;
          p.y += (dy / distToMouse || 0) * force;
        }

        p.alpha = p.baseAlpha + Math.sin(time * p.pulseSpeed + p.pulsePhase) * 0.15;
        p.alpha = Math.max(0.1, Math.min(0.85, p.alpha));

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${217 + Math.sin(p.pulsePhase + p.x * 0.01) * 30}, 80%, 75%, ${p.alpha})`;
        ctx.fill();
      }

      if (isVisible) {
        for (let i = 0; i < particles.length; i++) {
          for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < MAX_DIST) {
              const alpha = (1 - dist / MAX_DIST) * 0.25;
              ctx.beginPath();
              ctx.moveTo(particles[i].x, particles[i].y);
              ctx.lineTo(particles[j].x, particles[j].y);
              ctx.strokeStyle = `hsla(217, 60%, 70%, ${alpha})`;
              ctx.lineWidth = 1;
              ctx.stroke();
            }
          }
        }
      }

      if (isVisible && mouse.x > 0 && mouse.x < canvas.width && mouse.y > 0 && mouse.y < canvas.height) {
        const glow = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, MOUSE_GLOW_RADIUS);
        glow.addColorStop(0, 'hsla(217, 80%, 70%, 0.08)');
        glow.addColorStop(0.5, 'hsla(217, 60%, 60%, 0.04)');
        glow.addColorStop(1, 'hsla(217, 50%, 50%, 0)');
        ctx.fillStyle = glow;
        ctx.fillRect(mouse.x - MOUSE_GLOW_RADIUS, mouse.y - MOUSE_GLOW_RADIUS, MOUSE_GLOW_RADIUS * 2, MOUSE_GLOW_RADIUS * 2);

        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = 'hsla(217, 80%, 80%, 0.3)';
        ctx.fill();
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ width: '100vw', height: '100vh' }}
    />
  );
}