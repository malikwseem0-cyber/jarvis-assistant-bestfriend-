import React, { useState, useEffect } from 'react';
import {
  Volume2,
  Sliders,
  CheckCircle,
  Play,
  RotateCcw,
  Save,
  Radio,
  Sparkles,
  ShieldCheck,
  Headphones,
  Activity,
  Mic,
  Database,
  RefreshCw,
  SlidersHorizontal,
  Waves,
} from 'lucide-react';
import { VoiceProfileConfig } from '../types';

interface VoiceProfileSettingsProps {
  config: VoiceProfileConfig;
  onChangeConfig: (newConfig: VoiceProfileConfig) => void;
  onTestVoice: (sampleText: string) => void;
}

export const VoiceProfileSettings: React.FC<VoiceProfileSettingsProps> = ({
  config,
  onChangeConfig,
  onTestVoice,
}) => {
  const [pitch, setPitch] = useState<number>(config.pitch);
  const [speed, setSpeed] = useState<number>(config.speed);
  const [genderResonance, setGenderResonance] = useState<VoiceProfileConfig['genderResonance']>(
    config.genderResonance || 'baritone'
  );
  const [voiceModel, setVoiceModel] = useState<string>(config.voice || 'Fenrir');
  const [vocalStyle, setVocalStyle] = useState<string>(config.style || 'British Courtesy');
  const [testPhrase, setTestPhrase] = useState<string>(
    'Good day, sir. All neural subsystems are online and operating within optimal parameters.'
  );
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [isLoadingMemory, setIsLoadingMemory] = useState<boolean>(false);
  const [lastSavedTimestamp, setLastSavedTimestamp] = useState<string | null>(null);

  // Sync with prop changes if updated externally
  useEffect(() => {
    setPitch(config.pitch);
    setSpeed(config.speed);
    setGenderResonance(config.genderResonance || 'baritone');
    setVoiceModel(config.voice || 'Fenrir');
    setVocalStyle(config.style || 'British Courtesy');
  }, [config]);

  // Auto-check local memory engine for saved voice profile on mount
  useEffect(() => {
    checkSavedMemoryProfile();
  }, []);

  const checkSavedMemoryProfile = async () => {
    try {
      const res = await fetch('/api/memory');
      const data = await res.json();
      if (data.records && Array.isArray(data.records)) {
        const voiceRecord = data.records.find(
          (r: any) => r.key === 'JARVIS Voice Profile' || r.key === 'JARVIS Voice Profile Settings'
        );
        if (voiceRecord && voiceRecord.value) {
          try {
            const parsed = JSON.parse(voiceRecord.value);
            if (parsed && typeof parsed.pitch === 'number') {
              setLastSavedTimestamp(voiceRecord.updatedAt || voiceRecord.createdAt || 'Stored in SQLite');
            }
          } catch {
            setLastSavedTimestamp(voiceRecord.updatedAt || 'Stored in SQLite');
          }
        }
      }
    } catch (err) {
      console.warn('Memory engine query error:', err);
    }
  };

  // Update parent and notify in real-time
  const updateProfile = (newValues: Partial<VoiceProfileConfig>) => {
    const updated: VoiceProfileConfig = {
      pitch: newValues.pitch !== undefined ? newValues.pitch : pitch,
      speed: newValues.speed !== undefined ? newValues.speed : speed,
      genderResonance: newValues.genderResonance !== undefined ? newValues.genderResonance : genderResonance,
      voice: newValues.voice !== undefined ? newValues.voice : voiceModel,
      style: newValues.style !== undefined ? newValues.style : vocalStyle,
    };

    if (newValues.pitch !== undefined) setPitch(newValues.pitch);
    if (newValues.speed !== undefined) setSpeed(newValues.speed);
    if (newValues.genderResonance !== undefined) setGenderResonance(newValues.genderResonance);
    if (newValues.voice !== undefined) setVoiceModel(newValues.voice);
    if (newValues.style !== undefined) setVocalStyle(newValues.style);

    onChangeConfig(updated);
  };

  // Save to persistent SQLite memory engine
  const handleSaveToMemory = async () => {
    const payload = {
      pitch,
      speed,
      genderResonance,
      voice: voiceModel,
      style: vocalStyle,
      summary: `Pitch: ${pitch.toFixed(2)}x, Speed: ${speed.toFixed(2)}x, Resonance: ${genderResonance.toUpperCase()}, Model: ${voiceModel}`,
      savedAt: new Date().toISOString(),
    };

    try {
      const res = await fetch('/api/memory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: 'preference',
          key: 'JARVIS Voice Profile',
          value: JSON.stringify(payload),
          tags: ['voice', 'audio', 'jarvis-profile', 'male-voice', 'pitch', 'speed', 'resonance'],
        }),
      });
      const data = await res.json();
      if (data.record || data.success) {
        setLastSavedTimestamp(new Date().toLocaleTimeString());
        setSaveStatus('Voice profile preferences successfully saved into local SQLite memory engine.');
        setTimeout(() => setSaveStatus(null), 4000);
      }
    } catch (err: any) {
      setSaveStatus(`Error saving to memory engine: ${err.message}`);
    }
  };

  // Load from persistent memory engine
  const handleLoadFromMemory = async () => {
    setIsLoadingMemory(true);
    try {
      const res = await fetch('/api/memory');
      const data = await res.json();
      if (data.records && Array.isArray(data.records)) {
        const voiceRecord = data.records.find(
          (r: any) => r.key === 'JARVIS Voice Profile' || r.key === 'JARVIS Voice Profile Settings'
        );
        if (voiceRecord && voiceRecord.value) {
          try {
            const parsed = JSON.parse(voiceRecord.value);
            updateProfile({
              pitch: parsed.pitch ?? 0.88,
              speed: parsed.speed ?? 0.95,
              genderResonance: parsed.genderResonance ?? 'baritone',
              voice: parsed.voice ?? 'Fenrir',
              style: parsed.style ?? 'British Courtesy',
            });
            setSaveStatus('Loaded saved preferences from local SQLite memory.');
            setLastSavedTimestamp(voiceRecord.updatedAt || 'Recent');
            setTimeout(() => setSaveStatus(null), 3500);
          } catch {
            setSaveStatus('Loaded memory record (raw string format).');
          }
        } else {
          setSaveStatus('No previous voice profile found in memory engine. Save one first.');
          setTimeout(() => setSaveStatus(null), 3000);
        }
      }
    } catch (err: any) {
      setSaveStatus(`Failed to read from memory engine: ${err.message}`);
    } finally {
      setIsLoadingMemory(false);
    }
  };

  const handleResetDefaults = () => {
    const defaults: VoiceProfileConfig = {
      pitch: 0.88,
      speed: 0.95,
      genderResonance: 'baritone',
      voice: 'Fenrir',
      style: 'British Courtesy',
    };
    updateProfile(defaults);
    setSaveStatus('Voice reset to classic Paul Bettany JARVIS default specifications.');
    setTimeout(() => setSaveStatus(null), 3000);
  };

  const resonancePresets = [
    {
      id: 'baritone' as const,
      label: 'Deep Baritone (باریک و گونج دار)',
      subtitle: 'Chest Resonance + Low-End Harmonics',
      description: 'Paul Bettany inspired deep, composed British resonance with rich low-end harmonics.',
      pitchOffset: 0.88,
      eq: { sub: 80, low: 90, mid: 65, high: 60, air: 55 },
    },
    {
      id: 'classic_butler' as const,
      label: 'Classic British Butler (شائستہ لہجہ)',
      subtitle: 'Articulate Formal Diction',
      description: 'Formal, polite, highly articulate executive cadence with balanced natural pitch.',
      pitchOffset: 0.95,
      eq: { sub: 60, low: 75, mid: 85, high: 75, air: 70 },
    },
    {
      id: 'crisp_tactical' as const,
      label: 'Crisp Tactical (واضح اور تیز)',
      subtitle: 'Command Center Upper-Mid Clarity',
      description: 'Tactical situational alerts, heightened clarity, slightly elevated cadence.',
      pitchOffset: 1.05,
      eq: { sub: 45, low: 60, mid: 92, high: 88, air: 80 },
    },
    {
      id: 'deep_cyber' as const,
      label: 'Ultra-Deep Cyber Bass (سائبر باس)',
      subtitle: 'Sub-Harmonic Synthetic Bass',
      description: 'Futuristic sub-bass resonance with synthetic acoustic harmonics.',
      pitchOffset: 0.78,
      eq: { sub: 95, low: 88, mid: 50, high: 55, air: 45 },
    },
  ];

  const currentPreset = resonancePresets.find((r) => r.id === genderResonance) || resonancePresets[0];

  return (
    <div className="bg-slate-950/85 border border-cyan-500/25 rounded-2xl p-4 md:p-6 backdrop-blur-md font-mono text-xs text-slate-200 flex flex-col gap-4 shadow-[0_0_35px_rgba(0,240,255,0.08)]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-cyan-500/20 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-950/60 border border-cyan-500/30 text-cyan-400">
            <Headphones className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold tracking-wider text-cyan-300 uppercase text-xs sm:text-sm">
                JARVIS MALE VOICE PROFILE & ACOUSTIC RESONANCE
              </span>
              <span className="bg-cyan-950 text-cyan-400 text-[10px] px-2 py-0.5 rounded-full border border-cyan-500/30 font-bold">
                REAL-TIME SYNTHESIS
              </span>
            </div>
            <div className="text-[10px] text-cyan-400/80 mt-0.5 font-sans">
              صوتی ترتیبات — Real-time Pitch, Speed & Gender Resonance Calibration Stored in SQLite Memory
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleResetDefaults}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-[10px] cursor-pointer transition-colors"
            title="Reset to default Paul Bettany JARVIS profile"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Defaults</span>
          </button>

          <button
            onClick={handleLoadFromMemory}
            disabled={isLoadingMemory}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-cyan-950/70 border border-cyan-500/30 text-cyan-300 text-[10px] cursor-pointer transition-colors"
            title="Load saved profile from local SQLite memory engine"
          >
            <RefreshCw className={`w-3 h-3 ${isLoadingMemory ? 'animate-spin' : ''}`} />
            <span>LOAD MEMORY</span>
          </button>

          <button
            onClick={handleSaveToMemory}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-[11px] cursor-pointer transition-all shadow-[0_0_12px_rgba(0,240,255,0.3)]"
          >
            <Save className="w-3.5 h-3.5" />
            <span>SAVE TO MEMORY</span>
          </button>
        </div>
      </div>

      {/* Save Notification Banner */}
      {saveStatus && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-950/70 border border-emerald-500/40 text-emerald-200 text-[11px] animate-fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="flex-1">{saveStatus}</span>
        </div>
      )}

      {/* Main Grid: Controls on Left, Live Audio Tester on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1">
        {/* Left Column: Sliders and Resonance Presets (7 cols) */}
        <div className="lg:col-span-7 flex flex-col bg-slate-900/60 border border-cyan-500/20 rounded-xl p-4 md:p-5 space-y-4">
          {/* Pitch Control */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-slate-300">
              <span className="font-bold text-cyan-300 flex items-center gap-1.5 uppercase text-xs">
                <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                1. Voice Pitch (آواز کا گونج دار سر)
              </span>
              <span className="text-cyan-400 font-extrabold text-xs">
                {pitch.toFixed(2)}x {pitch < 0.85 ? '(Ultra Deep)' : pitch < 0.95 ? '(Baritone Male)' : pitch > 1.15 ? '(High Register)' : '(Natural)'}
              </span>
            </div>
            <input
              type="range"
              min={0.5}
              max={1.5}
              step={0.02}
              value={pitch}
              onChange={(e) => updateProfile({ pitch: parseFloat(e.target.value) })}
              className="w-full accent-cyan-400 cursor-pointer"
            />
            <div className="flex justify-between text-[9px] text-slate-500">
              <span>0.50x (Ultra Deep Male)</span>
              <span className="text-cyan-400/80">0.88x (Paul Bettany JARVIS)</span>
              <span>1.50x (High Pitch)</span>
            </div>
          </div>

          {/* Speed / Cadence Control */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-slate-300">
              <span className="font-bold text-cyan-300 flex items-center gap-1.5 uppercase text-xs">
                <Activity className="w-3.5 h-3.5 text-cyan-400" />
                2. Speaking Speed / Cadence (بولنے کی رفتار)
              </span>
              <span className="text-cyan-400 font-extrabold text-xs">
                {speed.toFixed(2)}x {speed < 0.85 ? '(Deliberate)' : speed > 1.2 ? '(Fast Tactical)' : '(Articulate Butler)'}
              </span>
            </div>
            <input
              type="range"
              min={0.6}
              max={1.6}
              step={0.05}
              value={speed}
              onChange={(e) => updateProfile({ speed: parseFloat(e.target.value) })}
              className="w-full accent-cyan-400 cursor-pointer"
            />
            <div className="flex justify-between text-[9px] text-slate-500">
              <span>0.60x (Slow Deliberate)</span>
              <span className="text-cyan-400/80">0.95x (Executive Cadence)</span>
              <span>1.60x (Rapid Stream)</span>
            </div>
          </div>

          {/* Gender Resonance Presets */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1.5">
                <Waves className="w-3.5 h-3.5 text-cyan-400" />
                3. Male Gender Resonance Harmonics (مردانہ گونج کی اقسام)
              </span>
              <span className="text-[10px] text-cyan-400 font-mono">
                ACTIVE: {genderResonance.toUpperCase()}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {resonancePresets.map((r) => (
                <div
                  key={r.id}
                  onClick={() => updateProfile({ genderResonance: r.id, pitch: r.pitchOffset })}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    genderResonance === r.id
                      ? 'bg-cyan-950/70 border-cyan-500 text-cyan-200 shadow-[0_0_15px_rgba(0,240,255,0.18)]'
                      : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:bg-slate-900 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-[11px] text-cyan-300">{r.label}</span>
                    <span className="text-[9px] text-cyan-400/80 font-mono">{r.pitchOffset}x</span>
                  </div>
                  <div className="text-[9px] text-cyan-200/60 font-mono mb-1">{r.subtitle}</div>
                  <div className="text-[9px] text-slate-400 leading-relaxed font-sans">{r.description}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Live Graphic Resonance Equalizer Preview */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 space-y-2">
            <div className="flex items-center justify-between text-[10px] text-slate-400">
              <span className="flex items-center gap-1 font-bold text-cyan-300">
                <SlidersHorizontal className="w-3 h-3 text-cyan-400" />
                HARMONIC FREQUENCY SPECTRUM PREVIEW
              </span>
              <span className="text-[9px] text-emerald-400 font-mono">BASS BOOST & EQ ONLINE</span>
            </div>
            <div className="grid grid-cols-5 gap-2 pt-1">
              {[
                { label: 'Sub (60Hz)', val: currentPreset.eq.sub },
                { label: 'Chest (180Hz)', val: currentPreset.eq.low },
                { label: 'Butler (1.2k)', val: currentPreset.eq.mid },
                { label: 'Clarity (4k)', val: currentPreset.eq.high },
                { label: 'Air (10k)', val: currentPreset.eq.air },
              ].map((eqBand, i) => (
                <div key={i} className="flex flex-col items-center gap-1">
                  <div className="h-14 w-full bg-slate-900 rounded-lg p-1 flex flex-col justify-end border border-slate-800">
                    <div
                      className="w-full bg-gradient-to-t from-cyan-600 to-cyan-300 rounded-sm transition-all duration-300 shadow-[0_0_8px_rgba(0,240,255,0.4)]"
                      style={{ height: `${eqBand.val}%` }}
                    />
                  </div>
                  <span className="text-[8px] text-slate-500 font-mono text-center truncate w-full">
                    {eqBand.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Neural Gemini TTS Voice Selection */}
          <div className="space-y-1.5 pt-1 border-t border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase font-bold">
              4. NEURAL GEMINI TTS MODEL
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {[
                { id: 'Fenrir', label: 'Fenrir (Deep Male)' },
                { id: 'Charon', label: 'Charon (Butler Male)' },
                { id: 'Puck', label: 'Puck (Crisp Male)' },
                { id: 'Zephyr', label: 'Zephyr (Futuristic)' },
              ].map((vm) => (
                <button
                  key={vm.id}
                  onClick={() => updateProfile({ voice: vm.id })}
                  className={`px-2 py-2 rounded-lg text-[10px] border transition-all cursor-pointer ${
                    voiceModel === vm.id
                      ? 'bg-cyan-500/25 text-cyan-300 border-cyan-500 font-bold shadow-[0_0_8px_rgba(0,240,255,0.2)]'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  {vm.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Live Audio Tester & Memory Persistence Card (5 cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-4 bg-slate-900/60 border border-cyan-500/20 rounded-xl p-4 md:p-5">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-bold text-cyan-300 flex items-center gap-1.5 text-xs">
                <Volume2 className="w-4 h-4 text-cyan-400" />
                LIVE ACOUSTIC PREVIEW & TEST
              </span>
              <span className="text-[10px] text-emerald-400 font-bold px-1.5 py-0.5 rounded bg-emerald-950 border border-emerald-500/30">
                ACTIVE
              </span>
            </div>

            {/* Test Phrase Input */}
            <div className="space-y-1.5">
              <div className="text-[10px] text-slate-400 uppercase font-bold">SAMPLE SPEECH SYNTHESIS</div>
              <textarea
                value={testPhrase}
                onChange={(e) => setTestPhrase(e.target.value)}
                rows={3}
                className="w-full bg-slate-950 border border-cyan-500/30 rounded-lg p-2.5 text-[11px] text-cyan-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 resize-none font-sans leading-relaxed"
                placeholder="Enter sample sentence to test real-time voice..."
              />
            </div>

            {/* Quick Sample Presets */}
            <div className="space-y-1">
              <div className="text-[9px] text-slate-500">QUICK SAMPLE PROMPTS (EN / UR):</div>
              <div className="flex flex-col gap-1">
                {[
                  'Good day, sir. All neural subsystems are online.',
                  'At your service, sir. How may I be of assistance today?',
                  'جناب، تمام سسٹمز فعال ہیں اور آپ کے حکم کے منتظر ہیں۔',
                ].map((phrase, i) => (
                  <button
                    key={i}
                    onClick={() => setTestPhrase(phrase)}
                    className="text-left px-2.5 py-1.5 rounded bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-400 hover:text-cyan-300 text-[10px] transition-colors cursor-pointer truncate"
                  >
                    "{phrase}"
                  </button>
                ))}
              </div>
            </div>

            {/* Test Trigger Button */}
            <button
              onClick={() => onTestVoice(testPhrase)}
              className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] cursor-pointer text-xs"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>TEST VOICE PROFILE NOW (آواز سنیں)</span>
            </button>
          </div>

          {/* Persistent Memory Card Status */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 space-y-2 text-[10px]">
            <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
              <div className="flex items-center gap-1.5 font-bold text-cyan-300">
                <Database className="w-3.5 h-3.5 text-emerald-400" />
                <span>LOCAL MEMORY ENGINE PERSISTENCE</span>
              </div>
              <span className="text-[9px] text-emerald-400 font-bold">SQLITE STORAGE</span>
            </div>

            <div className="space-y-1 text-slate-400 font-sans leading-relaxed text-[10px]">
              <p>
                Target Key: <code className="text-cyan-300">JARVIS Voice Profile</code>
              </p>
              <p>
                Status:{' '}
                {lastSavedTimestamp ? (
                  <span className="text-emerald-400 font-mono">Synchronized ({lastSavedTimestamp})</span>
                ) : (
                  <span className="text-amber-400 font-mono">Default Unsaved Config</span>
                )}
              </p>
              <p className="text-slate-500 text-[9px]">
                Saved preferences are automatically memorized across application reboots and applied to all conversational voice transmissions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
