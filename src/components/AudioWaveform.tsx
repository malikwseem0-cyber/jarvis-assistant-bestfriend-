import React, { useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2 } from 'lucide-react';
import { AssistantState } from '../types';

interface AudioWaveformProps {
  state: AssistantState;
  isListening: boolean;
  audioLevel: number; // 0 to 1
  onToggleMic: () => void;
  shortcutLabel?: string;
}

export const AudioWaveform: React.FC<AudioWaveformProps> = ({
  state,
  isListening,
  audioLevel,
  onToggleMic,
  shortcutLabel = 'SPACE',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let t = 0;

    const render = () => {
      t += 0.05;
      const width = canvas.width;
      const height = canvas.height;
      const cy = height / 2;

      ctx.clearRect(0, 0, width, height);

      // Color scheme based on state
      let strokeColor = '#00f0ff';
      if (state === 'speaking') strokeColor = '#10b981';
      else if (state === 'listening') strokeColor = '#3b82f6';
      else if (state === 'thinking') strokeColor = '#f59e0b';
      else if (state === 'error') strokeColor = '#ef4444';

      ctx.lineWidth = 2;
      ctx.strokeStyle = strokeColor;
      ctx.beginPath();

      const bars = 48;
      const step = width / bars;

      for (let i = 0; i < bars; i++) {
        const x = i * step;
        let amp = 2;

        if (state === 'speaking' || isListening) {
          // Reactive organic sine waveform
          const baseWave = Math.sin(t * 3 + i * 0.3) * Math.cos(t * 2 + i * 0.15);
          amp = 3 + Math.abs(baseWave) * (height * 0.42) * Math.max(0.2, audioLevel * 1.5);
        } else {
          // Gentle idle ripple
          amp = 2 + Math.sin(t * 1.5 + i * 0.2) * 2;
        }

        ctx.moveTo(x, cy - amp);
        ctx.lineTo(x, cy + amp);
      }
      ctx.stroke();

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [state, isListening, audioLevel]);

  return (
    <div className="flex items-center gap-3 bg-slate-900/80 border border-cyan-500/30 rounded-xl px-4 py-2 backdrop-blur-md shadow-[0_0_15px_rgba(0,240,255,0.1)]">
      {/* Mic Status & Push to talk toggle */}
      <button
        onClick={onToggleMic}
        title={`Push-to-Talk (${shortcutLabel})`}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-mono text-xs font-semibold transition-all duration-200 cursor-pointer ${
          isListening
            ? 'bg-blue-600/90 text-white shadow-[0_0_12px_rgba(59,130,246,0.6)] animate-pulse'
            : 'bg-slate-800 text-cyan-300 hover:bg-slate-700 hover:text-white border border-cyan-500/20'
        }`}
      >
        {isListening ? <Mic className="w-4 h-4 text-white" /> : <MicOff className="w-4 h-4 text-cyan-400/80" />}
        <span>{isListening ? 'LISTENING' : 'HOLD SPACE'}</span>
      </button>

      {/* Waveform Canvas */}
      <div className="flex-1 min-w-[140px] max-w-[260px] h-9 flex items-center justify-center">
        <canvas ref={canvasRef} width={260} height={36} className="w-full h-full" />
      </div>

      {/* State Badge */}
      <div className="flex items-center gap-1.5 font-mono text-xs">
        <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
        <span className="uppercase text-[11px] tracking-wider text-slate-300 font-medium">
          {state}
        </span>
      </div>
    </div>
  );
};
