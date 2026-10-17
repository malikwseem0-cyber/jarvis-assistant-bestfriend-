import React, { useEffect, useRef } from 'react';
import { AssistantState } from '../types';

interface DigitalFaceAvatarProps {
  state: AssistantState;
  audioLevel?: number; // 0 to 1
  size?: number;
}

export const DigitalFaceAvatar: React.FC<DigitalFaceAvatarProps> = ({ state, audioLevel = 0, size = 260 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let frame = 0;
    let blinkProgress = 0;
    let isBlinking = false;
    let nextBlinkTime = 120 + Math.random() * 100;

    const render = () => {
      frame++;
      ctx.clearRect(0, 0, size, size);

      const cx = size / 2;
      const cy = size / 2;

      // Handle natural blinking
      if (!isBlinking && frame > nextBlinkTime) {
        isBlinking = true;
        blinkProgress = 0;
      }
      if (isBlinking) {
        blinkProgress += 0.15;
        if (blinkProgress >= 1) {
          isBlinking = false;
          nextBlinkTime = frame + 140 + Math.random() * 120;
        }
      }

      // Determine palette based on state
      let primaryColor = '#00f0ff';
      let glowColor = 'rgba(0, 240, 255, 0.4)';
      let eyeColor = '#00f0ff';

      if (state === 'listening') {
        primaryColor = '#3b82f6';
        glowColor = 'rgba(59, 130, 246, 0.5)';
        eyeColor = '#60a5fa';
      } else if (state === 'thinking') {
        primaryColor = '#fbbf24';
        glowColor = 'rgba(251, 191, 36, 0.5)';
        eyeColor = '#fef08a';
      } else if (state === 'speaking') {
        primaryColor = '#10b981';
        glowColor = 'rgba(16, 185, 129, 0.5)';
        eyeColor = '#34d399';
      } else if (state === 'working') {
        primaryColor = '#a855f7';
        glowColor = 'rgba(168, 85, 247, 0.5)';
        eyeColor = '#c084fc';
      } else if (state === 'error') {
        primaryColor = '#ef4444';
        glowColor = 'rgba(239, 68, 68, 0.6)';
        eyeColor = '#f87171';
      }

      // Subtle breathing head float
      const headOffsetY = Math.sin(frame * 0.04) * 3;

      ctx.save();
      ctx.translate(cx, cy + headOffsetY);

      // 1. Holographic Face Outer Contour (Cybernetic Jaw & Temples)
      ctx.strokeStyle = glowColor;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      // Cranium
      ctx.arc(0, -25, 75, Math.PI * 0.8, Math.PI * 2.2, false);
      // Cheeks down to jaw
      ctx.lineTo(48, 45);
      ctx.lineTo(24, 78);
      ctx.lineTo(-24, 78);
      ctx.lineTo(-48, 45);
      ctx.closePath();
      ctx.stroke();

      // Cybernetic Jaw accent markings
      ctx.strokeStyle = primaryColor;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(-20, 75);
      ctx.lineTo(20, 75);
      ctx.moveTo(-35, 42);
      ctx.lineTo(-48, 45);
      ctx.moveTo(35, 42);
      ctx.lineTo(48, 45);
      ctx.stroke();

      // Forehead Neural Node grid
      ctx.fillStyle = glowColor;
      for (let i = -3; i <= 3; i++) {
        const dotX = i * 14;
        const dotY = -65 + Math.abs(i) * 3;
        const pulse = state === 'thinking' ? Math.sin(frame * 0.2 + i) * 2 : 1.2;
        ctx.beginPath();
        ctx.arc(dotX, dotY, Math.max(0.5, pulse), 0, Math.PI * 2);
        ctx.fill();
      }

      // 2. Cybernetic Eyebrows
      let browTilt = 0;
      if (state === 'thinking') browTilt = 3;
      if (state === 'error') browTilt = -4;
      if (state === 'listening') browTilt = -1;

      ctx.strokeStyle = primaryColor;
      ctx.lineWidth = 2.5;
      // Left Brow
      ctx.beginPath();
      ctx.moveTo(-44, -26 + browTilt);
      ctx.lineTo(-18, -28 - browTilt);
      ctx.stroke();
      // Right Brow
      ctx.beginPath();
      ctx.moveTo(18, -28 - browTilt);
      ctx.lineTo(44, -26 + browTilt);
      ctx.stroke();

      // 3. Eyes (Glowing apertures with blinking)
      const blinkScale = isBlinking ? Math.sin(blinkProgress * Math.PI) : 0;
      const eyeOpenHeight = Math.max(1, 9 * (1 - blinkScale));

      // Left Eye
      ctx.save();
      ctx.fillStyle = eyeColor;
      ctx.shadowColor = primaryColor;
      ctx.shadowBlur = 12;

      ctx.beginPath();
      ctx.ellipse(-30, -12, 14, eyeOpenHeight, 0, 0, Math.PI * 2);
      ctx.fill();

      // Pupil aperture reticle
      if (!isBlinking) {
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(-30, -12, 4, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Right Eye
      ctx.beginPath();
      ctx.ellipse(30, -12, 14, eyeOpenHeight, 0, 0, Math.PI * 2);
      ctx.fill();

      if (!isBlinking) {
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(30, -12, 4, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();

      // 4. Nose Bridge Contour
      ctx.strokeStyle = glowColor;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, -16);
      ctx.lineTo(0, 16);
      ctx.lineTo(5, 20);
      ctx.stroke();

      // 5. Synchronized Cybernetic Mouth Viseme Animation
      // When speaking: mouth opening correlates with audioLevel and sine frequency
      let mouthOpen = 2;
      let mouthWidth = 26;
      if (state === 'speaking') {
        const speechViseme = Math.abs(Math.sin(frame * 0.35)) * 14 * Math.max(0.3, audioLevel * 1.5);
        mouthOpen = 2 + speechViseme;
        mouthWidth = 26 + speechViseme * 0.5;
      } else if (state === 'listening') {
        mouthOpen = 1.5;
        mouthWidth = 24;
      }

      ctx.save();
      ctx.shadowColor = primaryColor;
      ctx.shadowBlur = state === 'speaking' ? 14 : 4;

      // Outer mouth lip aperture
      ctx.strokeStyle = primaryColor;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(0, 48, mouthWidth / 2, mouthOpen, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Inner vocalization sound bar when speaking
      if (state === 'speaking') {
        ctx.fillStyle = primaryColor;
        ctx.beginPath();
        ctx.ellipse(0, 48, (mouthWidth / 2) * 0.65, mouthOpen * 0.65, 0, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Neutral clean line
        ctx.strokeStyle = glowColor;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(-12, 48);
        ctx.lineTo(12, 48);
        ctx.stroke();
      }
      ctx.restore();

      // 6. Holographic Scanline Overlay
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.lineWidth = 1;
      for (let y = -90; y < 90; y += 4) {
        ctx.beginPath();
        ctx.moveTo(-75, y);
        ctx.lineTo(75, y);
        ctx.stroke();
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [state, audioLevel, size]);

  return (
    <div className="relative flex flex-col items-center justify-center select-none">
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        className="drop-shadow-[0_0_20px_rgba(0,240,255,0.25)]"
      />
      <div className="text-[10px] tracking-widest text-cyan-400/70 uppercase font-mono mt-[-8px]">
        {state === 'speaking' ? 'VOCAL SYNTHESIS ACTIVE' : state === 'listening' ? 'ACOUSTIC SENSORS ARMED' : 'NEURAL AVATAR ONLINE'}
      </div>
    </div>
  );
};
