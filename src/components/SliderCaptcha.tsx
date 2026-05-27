import { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Check, ArrowRight } from 'lucide-react';

interface SliderCaptchaProps {
  onVerified: () => void;
}

export default function SliderCaptcha({ onVerified }: SliderCaptchaProps) {
  const [sliding, setSliding] = useState(false);
  const [verified, setVerified] = useState(false);
  const [pos, setPos] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef(0);
  const startPosRef = useRef(0);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (verified) return;
    setSliding(true);
    startXRef.current = e.clientX;
    startPosRef.current = pos;
  }, [verified, pos]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!sliding || verified) return;
    const track = trackRef.current;
    if (!track) return;
    const dx = e.clientX - startXRef.current;
    const max = track.clientWidth - 44;
    const newPos = Math.max(0, Math.min(max, startPosRef.current + dx));
    setPos(newPos);
  }, [sliding, verified]);

  const handleMouseUp = useCallback(() => {
    if (!sliding || verified) return;
    setSliding(false);
    const track = trackRef.current;
    if (!track) return;
    const max = track.clientWidth - 44;
    if (pos >= max * 0.92) {
      setPos(max);
      setVerified(true);
      onVerified();
    } else {
      setPos(0);
    }
  }, [sliding, verified, pos, onVerified]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (verified) return;
    setSliding(true);
    startXRef.current = e.touches[0].clientX;
    startPosRef.current = pos;
  }, [verified, pos]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!sliding || verified) return;
    const track = trackRef.current;
    if (!track) return;
    const dx = e.touches[0].clientX - startXRef.current;
    const max = track.clientWidth - 44;
    const newPos = Math.max(0, Math.min(max, startPosRef.current + dx));
    setPos(newPos);
  }, [sliding, verified]);

  const handleTouchEnd = useCallback(() => {
    if (!sliding || verified) return;
    setSliding(false);
    const track = trackRef.current;
    if (!track) return;
    const max = track.clientWidth - 44;
    if (pos >= max * 0.92) {
      setPos(max);
      setVerified(true);
      onVerified();
    } else {
      setPos(0);
    }
  }, [sliding, verified, pos, onVerified]);

  return (
    <div
      ref={trackRef}
      className="relative w-full h-11 rounded-xl select-none overflow-hidden"
      style={{
        backgroundColor: verified ? 'rgba(34, 197, 94, 0.15)' : 'rgba(255,255,255,0.06)',
        border: `1px solid ${verified ? 'rgba(34, 197, 94, 0.3)' : 'rgba(255,255,255,0.1)'}`,
        transition: 'background-color 0.3s, border-color 0.3s',
      }}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {verified ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute inset-0 flex items-center justify-center gap-2 text-green-400 text-sm font-medium"
        >
          <Check className="w-5 h-5" />
          验证通过
        </motion.div>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-slate-500 text-sm select-none pointer-events-none">
          请拖动滑块验证
        </div>
      )}

      <motion.div
        className="absolute top-0.5 bottom-0.5 left-0.5 flex items-center justify-center cursor-grab active:cursor-grabbing rounded-lg z-10"
        style={{
          width: 40,
          x: pos,
          background: verified
            ? 'linear-gradient(135deg, #22c55e, #16a34a)'
            : sliding
              ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
              : 'linear-gradient(135deg, #6366f1, #a855f7)',
          transition: sliding ? 'none' : 'background 0.2s',
          boxShadow: sliding ? '0 0 12px rgba(99,102,241,0.5)' : '0 2px 8px rgba(0,0,0,0.2)',
        }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        <ArrowRight className="w-5 h-5 text-white" />
      </motion.div>
    </div>
  );
}