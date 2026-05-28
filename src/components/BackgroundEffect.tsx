import { useRef, useEffect } from 'react';

interface Orb {
  x: number;
  y: number;
  radius: number;
  vx: number;
  vy: number;
  hue: number;
  saturation: number;
  lightness: number;
  alpha: number;
}

export default function BackgroundEffect() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const orbsRef = useRef<Orb[]>([]);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const orbCount = 6;
    const orbs: Orb[] = Array.from({ length: orbCount }, (_, i) => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: 120 + Math.random() * 180,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      hue: 240 + Math.random() * 60,
      saturation: 60 + Math.random() * 30,
      lightness: 50 + Math.random() * 20,
      alpha: 0.08 + Math.random() * 0.06
    }));
    orbsRef.current = orbs;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      orbs.forEach(orb => {
        orb.x += orb.vx;
        orb.y += orb.vy;

        if (orb.x < -orb.radius) orb.x = canvas.width + orb.radius;
        if (orb.x > canvas.width + orb.radius) orb.x = -orb.radius;
        if (orb.y < -orb.radius) orb.y = canvas.height + orb.radius;
        if (orb.y > canvas.height + orb.radius) orb.y = -orb.radius;

        const gradient = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, orb.radius);
        gradient.addColorStop(0, `hsla(${orb.hue}, ${orb.saturation}%, ${orb.lightness}%, ${orb.alpha + 0.04})`);
        gradient.addColorStop(0.5, `hsla(${orb.hue + 10}, ${orb.saturation}%, ${orb.lightness + 5}%, ${orb.alpha})`);
        gradient.addColorStop(1, `hsla(${orb.hue + 20}, ${orb.saturation}%, ${orb.lightness + 10}%, 0)`);

        ctx.fillStyle = gradient;
        ctx.fillRect(orb.x - orb.radius, orb.y - orb.radius, orb.radius * 2, orb.radius * 2);
      });

      rafRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ width: '100vw', height: '100vh' }}
    />
  );
}import { useRef, useEffect } from 'react';

interface GradientPoint {
  x:import { useRef, useEffect } from 'react';

interface GradientPoint {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
}

export default function BackgroundEffect() {
  const canvasRef =import { useRef, useEffect } from 'react';

interface GradientPoint {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
}

export default function BackgroundEffect() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx)import { useRef, useEffect } from 'react';

interface GradientPoint {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
}

export default function BackgroundEffect() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const points: GradientPoint[] = [
      { x: 0import { useRef, useEffect } from 'react';

interface GradientPoint {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
}

export default function BackgroundEffect() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const points: GradientPoint[] = [
      { x: 0, y: 0, vx: 0.15, vy: 0.08, color: 'rgba(37, 99, 235, 0.12)' },
      { x: 0, y: 0, vx: -0.import { useRef, useEffect } from 'react';

interface GradientPoint {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
}

export default function BackgroundEffect() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const points: GradientPoint[] = [
      { x: 0, y: 0, vx: 0.15, vy: 0.08, color: 'rgba(37, 99, 235, 0.12)' },
      { x: 0, y: 0, vx: -0.1, vy: 0.12, color: 'rgba(6, 182, 212, 0.10)' },
      { x: 0, yimport { useRef, useEffect } from 'react';

interface GradientPoint {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
}

export default function BackgroundEffect() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const points: GradientPoint[] = [
      { x: 0, y: 0, vx: 0.15, vy: 0.08, color: 'rgba(37, 99, 235, 0.12)' },
      { x: 0, y: 0, vx: -0.1, vy: 0.12, color: 'rgba(6, 182, 212, 0.10)' },
      { x: 0, y: 0, vx: 0.08, vy: -0.1, color: 'rgba(139, 92, 246, 0.08)' },
      { x: 0, y: 0, vx: -0import { useRef, useEffect } from 'react';

interface GradientPoint {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
}

export default function BackgroundEffect() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const points: GradientPoint[] = [
      { x: 0, y: 0, vx: 0.15, vy: 0.08, color: 'rgba(37, 99, 235, 0.12)' },
      { x: 0, y: 0, vx: -0.1, vy: 0.12, color: 'rgba(6, 182, 212, 0.10)' },
      { x: 0, y: 0, vx: 0.08, vy: -0.1, color: 'rgba(139, 92, 246, 0.08)' },
      { x: 0, y: 0, vx: -0.12, vy: -0.06, color: 'rgba(59, 130, 246, 0.07)' },
    ];

    const initPositions = () => {
      const w = canvas.width;
      const h = canvas.height;