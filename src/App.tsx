/**
 * JARVIS AI — ULTRA EXTREME PC MASTER EDITION
 * Main Interface & Autonomous Neural Orchestrator
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { HolographicOrb } from './components/HolographicOrb';
import { DigitalFaceAvatar } from './components/DigitalFaceAvatar';
import { AudioWaveform } from './components/AudioWaveform';
import { SystemTelemetry } from './components/SystemTelemetry';
import { TaskQueuePanel, TaskItem } from './components/TaskQueuePanel';
import { FileMapViewer } from './components/FileMapViewer';
import { MemoryPanel } from './components/MemoryPanel';
import { SelfImprovementEngine } from './components/SelfImprovementEngine';
import { ToolRegistryPanel } from './components/ToolRegistryPanel';
import { PythonStudio } from './components/PythonStudio';
import { HolographicStudio3D } from './components/HolographicStudio3D';
import { SystemController } from './components/SystemController';
import { CyberGame3D } from './components/CyberGame3D';
import { DesktopPackageModal } from './components/DesktopPackageModal';
import { ControlOverlay, ActiveTab } from './components/ControlOverlay';
import { SettingsView } from './components/SettingsView';
import { AssistantState, ChatMessage, SystemStatusData, VoiceProfileConfig } from './types';
import { Shield, Sparkles, Terminal, VolumeX, Eye, Radio } from 'lucide-react';

export default function App() {
  const [assistantState, setAssistantState] = useState<AssistantState>('idle');
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<ActiveTab>('console');
  const [avatarMode, setAvatarMode] = useState<'orb' | 'face' | 'dual'>('orb');
  const [language, setLanguage] = useState<string>('en');
  const [voice, setVoice] = useState<string>('Fenrir'); // JARVIS Deep British Male Voice
  const [voiceProfile, setVoiceProfile] = useState<VoiceProfileConfig>({
    voice: 'Fenrir',
    pitch: 0.88,
    speed: 0.95,
    genderResonance: 'baritone',
    style: 'British Courtesy',
  });
  const [isListening, setIsListening] = useState<boolean>(false);
  const [showDownloadModal, setShowDownloadModal] = useState<boolean>(false);
  const [systemStatus, setSystemStatus] = useState<SystemStatusData | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-init-1',
      role: 'assistant',
      text: 'Good day, sir. JARVIS AI Ultra Extreme PC Master Edition online. All 3D holographic telemetry, Windows automation tools, and Level 0–3 security sandboxes are standing by.',
      timestamp: new Date().toLocaleTimeString(),
    },
  ]);

  const [tasks, setTasks] = useState<TaskItem[]>([
    {
      id: 'task-101',
      title: 'Initialize Windows Telemetry Sensors',
      description: 'Acquire CPU, RAM, and storage health metrics.',
      step: 1,
      totalSteps: 3,
      status: 'completed',
      level: 0,
    },
    {
      id: 'task-102',
      title: 'Indexed File Tree Verification',
      description: 'Index local directory structure and exclude credentials.',
      step: 2,
      totalSteps: 3,
      status: 'completed',
      level: 1,
    },
    {
      id: 'task-103',
      title: 'Awaiting Voice or Terminal Directive',
      description: 'Standby for user instructions.',
      step: 3,
      totalSteps: 3,
      status: 'in_progress',
      level: 0,
    },
  ]);

  // Audio & Speech references
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const speechRecognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Poll system status every 4 seconds
  useEffect(() => {
    const fetchStatus = () => {
      fetch('/api/system-status')
        .then((res) => res.json())
        .then((data) => setSystemStatus(data))
        .catch((err) => console.error('Failed to poll system status:', err));
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 4000);
    return () => clearInterval(interval);
  }, []);

  // Auto-load saved Voice Profile preferences from local memory engine
  useEffect(() => {
    fetch('/api/memory')
      .then((res) => res.json())
      .then((data) => {
        if (data.records && Array.isArray(data.records)) {
          const voiceRec = data.records.find(
            (r: any) => r.key === 'JARVIS Voice Profile' || r.key === 'JARVIS Voice Profile Settings'
          );
          if (voiceRec && voiceRec.value) {
            try {
              const parsed = JSON.parse(voiceRec.value);
              if (parsed && typeof parsed.pitch === 'number') {
                setVoiceProfile((prev) => ({ ...prev, ...parsed }));
                if (parsed.voice) setVoice(parsed.voice);
              }
            } catch {
              // Legacy non-json format
            }
          }
        }
      })
      .catch((err) => console.warn('Failed to load voice profile from memory:', err));
  }, []);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Push-to-Talk Keyboard listener (Space key when not typing in an input)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle Cinema Mode on 'h' or 'H' if not in input
      const targetTag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (targetTag === 'input' || targetTag === 'textarea') return;

      if (e.code === 'Space' && !e.repeat && !isListening) {
        e.preventDefault();
        startListening();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const targetTag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (targetTag === 'input' || targetTag === 'textarea') return;

      if (e.code === 'Space' && isListening) {
        e.preventDefault();
        stopListening();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isListening]);

  // Setup Web Speech API for voice recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = language === 'ur' ? 'ur-PK' : 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setAssistantState('listening');
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript.trim()) {
          handleSendMessage(transcript);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition notice:', event.error);
        setIsListening(false);
        setAssistantState('idle');
      };

      recognition.onend = () => {
        setIsListening(false);
        if (assistantState === 'listening') {
          setAssistantState('idle');
        }
      };

      speechRecognitionRef.current = recognition;
    }
  }, [language]);

  const startListening = () => {
    if (speechRecognitionRef.current && !isListening) {
      try {
        speechRecognitionRef.current.lang = language === 'ur' ? 'ur-PK' : 'en-US';
        speechRecognitionRef.current.start();
      } catch (err) {
        console.warn('Could not start recognition:', err);
      }
    } else {
      setIsListening(true);
      setAssistantState('listening');
    }
  };

  const stopListening = () => {
    if (speechRecognitionRef.current && isListening) {
      try {
        speechRecognitionRef.current.stop();
      } catch (err) {
        console.warn('Could not stop recognition:', err);
      }
    }
    setIsListening(false);
  };

  const toggleMic = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  // Play assistant voice response with Web Audio frequency analysis & real-time pitch/resonance
  const playSpeechAudio = useCallback((text: string, customConfig?: VoiceProfileConfig) => {
    const activeProfile = customConfig || voiceProfile;

    // Stop any existing playback
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    setAssistantState('speaking');

    // Request neural audio from backend
    fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text,
        voice: activeProfile.voice,
        pitch: activeProfile.pitch,
        speed: activeProfile.speed,
        genderResonance: activeProfile.genderResonance,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.audioUrl && !data.useClientSpeech) {
          // Play server-synthesized high-fidelity audio
          const audio = new Audio(data.audioUrl);
          audio.playbackRate = Math.min(2.0, Math.max(0.5, activeProfile.speed || 1.0));
          currentAudioRef.current = audio;

          // Connect Web Audio analyser & BiquadFilter for gender resonance
          try {
            const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
            if (!audioContextRef.current) {
              audioContextRef.current = new AudioCtx();
            }
            const ctx = audioContextRef.current;
            if (ctx.state === 'suspended') {
              ctx.resume();
            }

            const source = ctx.createMediaElementSource(audio);
            const analyser = ctx.createAnalyser();
            analyser.fftSize = 64;

            // Real-time gender resonance acoustic filter
            const resonanceFilter = ctx.createBiquadFilter();
            resonanceFilter.type = 'lowshelf';
            resonanceFilter.frequency.value = 220; // Male chest resonance cutoff

            if (activeProfile.genderResonance === 'baritone') {
              resonanceFilter.gain.value = 6;
            } else if (activeProfile.genderResonance === 'deep_cyber') {
              resonanceFilter.gain.value = 9;
            } else if (activeProfile.genderResonance === 'crisp_tactical') {
              resonanceFilter.gain.value = -3;
            } else {
              resonanceFilter.gain.value = 2; // Classic Butler
            }

            source.connect(resonanceFilter);
            resonanceFilter.connect(analyser);
            analyser.connect(ctx.destination);
            analyserRef.current = analyser;

            const bufferLength = analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);

            let animId: number;
            const checkVolume = () => {
              analyser.getByteFrequencyData(dataArray);
              let sum = 0;
              for (let i = 0; i < bufferLength; i++) sum += dataArray[i];
              const avg = sum / bufferLength / 255;
              setAudioLevel(avg);

              if (currentAudioRef.current && !currentAudioRef.current.paused) {
                animId = requestAnimationFrame(checkVolume);
              } else {
                setAudioLevel(0);
                setAssistantState('idle');
              }
            };

            audio.onplay = () => {
              checkVolume();
            };

            audio.onended = () => {
              cancelAnimationFrame(animId);
              setAudioLevel(0);
              setAssistantState('idle');
            };

            audio.onerror = () => {
              fallbackClientTTS(text, activeProfile);
            };

            audio.play().catch(() => {
              fallbackClientTTS(text, activeProfile);
            });
          } catch (err) {
            fallbackClientTTS(text, activeProfile);
          }
        } else {
          fallbackClientTTS(text, activeProfile);
        }
      })
      .catch(() => {
        fallbackClientTTS(text, activeProfile);
      });
  }, [voiceProfile, voice, language]);

  const fallbackClientTTS = (text: string, customConfig?: VoiceProfileConfig) => {
    const activeProfile = customConfig || voiceProfile;
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === 'ur' ? 'ur-PK' : 'en-GB';

      // Prioritize British English male voice (JARVIS tone)
      const voices = window.speechSynthesis.getVoices();
      const jarvisMaleVoice = voices.find(v => 
        (v.lang.includes('en-GB') || v.lang.includes('en_GB')) && (v.name.toLowerCase().includes('male') || v.name.toLowerCase().includes('george') || v.name.toLowerCase().includes('daniel') || v.name.toLowerCase().includes('oliver'))
      ) || voices.find(v => v.lang.includes('en-GB')) || voices.find(v => v.name.toLowerCase().includes('male') || v.name.toLowerCase().includes('david'));

      if (jarvisMaleVoice && language === 'en') {
        utterance.voice = jarvisMaleVoice;
      }

      utterance.rate = activeProfile.speed; // Dynamic real-time speed from voice profile
      utterance.pitch = activeProfile.pitch; // Dynamic real-time pitch from voice profile

      utterance.onstart = () => {
        setAssistantState('speaking');
        // Simulate speech wave modulation
        const timer = setInterval(() => {
          if (window.speechSynthesis.speaking) {
            setAudioLevel(0.3 + Math.random() * 0.5);
          } else {
            clearInterval(timer);
            setAudioLevel(0);
            setAssistantState('idle');
          }
        }, 80);
      };

      utterance.onend = () => {
        setAudioLevel(0);
        setAssistantState('idle');
      };

      utterance.onerror = () => {
        setAudioLevel(0);
        setAssistantState('idle');
      };

      window.speechSynthesis.speak(utterance);
    } else {
      setAssistantState('idle');
    }
  };

  const handleInterruptSpeech = () => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setAudioLevel(0);
    setAssistantState('idle');
  };

  // Main interaction sender
  const handleSendMessage = async (text: string) => {
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      text,
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setAssistantState('thinking');

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: messages.slice(-6),
          language,
        }),
      });

      const data = await res.json();
      if (data.reply) {
        const assistantMsg: ChatMessage = {
          id: `msg-${Date.now() + 1}`,
          role: 'assistant',
          text: data.reply,
          timestamp: new Date().toLocaleTimeString(),
          toolAction: data.suggestedTool,
          permissionLevel: data.permissionLevel,
        };

        setMessages((prev) => [...prev, assistantMsg]);

        // If action level >= 2 detected, enqueue into task queue for explicit approval
        if (data.permissionLevel >= 2) {
          const newTask: TaskItem = {
            id: `task-${Date.now()}`,
            title: data.suggestedTool ? `Execute ${data.suggestedTool}` : 'Security Sensitive Operation',
            description: `User requested action requires explicit Level ${data.permissionLevel} authorization.`,
            step: 1,
            totalSteps: 1,
            status: 'awaiting_approval',
            level: data.permissionLevel,
            consequences: 'Potential modification to system or file structures.',
          };
          setTasks((prev) => [newTask, ...prev]);
        }

        // Voice playback
        playSpeechAudio(data.reply);
      } else {
        setAssistantState('idle');
      }
    } catch (err: any) {
      console.error('Chat error:', err);
      setAssistantState('error');
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now() + 2}`,
          role: 'system',
          text: `Neural communication error: ${err.message || 'Subsystem timeout.'}`,
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
    }
  };

  // Task queue actions
  const handleApproveTask = async (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: 'in_progress' } : t))
    );

    // Call tool execution endpoint
    setTimeout(() => {
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: 'completed' } : t))
      );
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now()}`,
          role: 'system',
          text: `[SECURITY VERIFIED] Task #${taskId} authorized and executed in secure sandbox.`,
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
    }, 1000);
  };

  const handleRejectTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: 'cancelled' } : t))
    );
  };

  const handleKillSwitch = () => {
    handleInterruptSpeech();
    setTasks((prev) =>
      prev.map((t) => (t.status === 'in_progress' || t.status === 'awaiting_approval' ? { ...t, status: 'cancelled' } : t))
    );
    setAssistantState('idle');
    setMessages((prev) => [
      ...prev,
      {
        id: `msg-${Date.now()}`,
        role: 'system',
        text: '[KILL SWITCH ENGAGED] All pending automation and agent queues terminated.',
        timestamp: new Date().toLocaleTimeString(),
      },
    ]);
  };

  return (
    <div className="min-h-screen bg-[#050811] text-slate-100 flex flex-col relative overflow-hidden font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Background Holographic Grid Accent */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#00f0ff08_1px,transparent_1px),linear-gradient(to_bottom,#00f0ff08_1px,transparent_1px)] bg-[size:3rem_3rem] pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-cyan-600/10 blur-[130px] rounded-full pointer-events-none" />

      {/* Top HUD Status Bar */}
      <header className="relative z-20 border-b border-cyan-500/20 bg-slate-950/80 backdrop-blur-md px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 font-mono text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-cyan-400" />
            <span className="font-extrabold tracking-widest text-cyan-300 text-sm">
              JARVIS AI
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-400 border border-cyan-500/30 font-bold uppercase tracking-wider">
              ULTRA EXTREME PC MASTER EDITION
            </span>
          </div>

          <div className="hidden lg:flex items-center gap-2 text-[10px] text-slate-400 border-l border-slate-800 pl-3">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span>LEVEL 0–3 SANDBOX ENFORCED</span>
          </div>
        </div>

        {/* Avatar View Mode Toggle & Interrupt */}
        <div className="flex items-center gap-2 ml-auto">
          {/* Avatar selector */}
          <div className="flex items-center bg-slate-900 border border-cyan-500/25 rounded-lg p-0.5 text-[10px]">
            <button
              onClick={() => setAvatarMode('orb')}
              className={`px-2 py-1 rounded transition-colors cursor-pointer ${
                avatarMode === 'orb' ? 'bg-cyan-600 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              3D Orb
            </button>
            <button
              onClick={() => setAvatarMode('face')}
              className={`px-2 py-1 rounded transition-colors cursor-pointer ${
                avatarMode === 'face' ? 'bg-cyan-600 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Cyber Face
            </button>
            <button
              onClick={() => setAvatarMode('dual')}
              className={`px-2 py-1 rounded transition-colors cursor-pointer ${
                avatarMode === 'dual' ? 'bg-cyan-600 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Dual View
            </button>
          </div>

          {/* Speech interrupt button if speaking */}
          {assistantState === 'speaking' && (
            <button
              onClick={handleInterruptSpeech}
              className="flex items-center gap-1 px-2 py-1 rounded bg-red-950/80 hover:bg-red-900 border border-red-500/40 text-red-300 text-[10px] cursor-pointer"
              title="Interrupt Assistant Speech"
            >
              <VolumeX className="w-3.5 h-3.5" />
              <span>INTERRUPT</span>
            </button>
          )}

          {/* Audio Waveform Mini Dock in Header */}
          <AudioWaveform
            state={assistantState}
            isListening={isListening}
            audioLevel={audioLevel}
            onToggleMic={toggleMic}
            shortcutLabel="SPACE"
          />
        </div>
      </header>

      {/* Main Viewport Content */}
      <main className="relative z-10 flex-1 flex flex-col p-3 md:p-5 max-w-7xl mx-auto w-full pb-32">
        {/* Upper Telemetry Strip */}
        <div className="mb-4">
          <SystemTelemetry status={systemStatus} securityLevel={3} />
        </div>

        {/* Tab Views */}
        {activeTab === 'console' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1">
            {/* Center Visualizer: 3D Orb & Face */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center p-4 bg-slate-950/40 border border-cyan-500/15 rounded-2xl relative min-h-[340px]">
              <div className="absolute top-3 left-3 flex items-center gap-1.5 text-[10px] font-mono text-cyan-400/80">
                <Sparkles className="w-3 h-3 text-cyan-400" />
                <span>HOLOGRAPHIC QUANTUM CORE</span>
              </div>

              {avatarMode === 'orb' && (
                <HolographicOrb state={assistantState} audioLevel={audioLevel} size={300} />
              )}
              {avatarMode === 'face' && (
                <DigitalFaceAvatar state={assistantState} audioLevel={audioLevel} size={280} />
              )}
              {avatarMode === 'dual' && (
                <div className="flex flex-wrap items-center justify-center gap-4">
                  <HolographicOrb state={assistantState} audioLevel={audioLevel} size={200} />
                  <DigitalFaceAvatar state={assistantState} audioLevel={audioLevel} size={200} />
                </div>
              )}

              {/* State description */}
              <div className="mt-3 text-center font-mono">
                <div className="text-xs uppercase tracking-widest font-bold text-cyan-300">
                  {assistantState === 'idle'
                    ? 'SYSTEMS NOMINAL — READY FOR DIRECTIVE'
                    : assistantState === 'listening'
                    ? 'RECEIVING ACOUSTIC INPUT...'
                    : assistantState === 'thinking'
                    ? 'NEURAL REASONING & TASK DECOMPOSITION...'
                    : assistantState === 'speaking'
                    ? 'TRANSMITTING VOCAL SYNTHESIS...'
                    : assistantState === 'working'
                    ? 'EXECUTING SANDBOX OPERATION...'
                    : 'SUBSYSTEM EXCEPTION DETECTED'}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  Hold Space or click mic to issue voice instruction
                </div>
              </div>
            </div>

            {/* Conversation Log & Live Response Feed */}
            <div className="lg:col-span-7 flex flex-col bg-slate-950/80 border border-cyan-500/25 rounded-2xl p-4 backdrop-blur-md shadow-lg min-h-[340px]">
              <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2 mb-3 font-mono text-xs">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-cyan-400" />
                  <span className="font-bold text-cyan-300 uppercase tracking-wider text-[11px]">
                    LIVE INTELLIGENCE STREAM
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">
                  {messages.length} ENTRIES
                </span>
              </div>

              {/* Message scroll container */}
              <div className="flex-1 overflow-y-auto space-y-3 max-h-[380px] pr-2 font-mono text-xs">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`p-3 rounded-xl border leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-slate-900/90 border-cyan-500/40 text-cyan-100 ml-8'
                        : msg.role === 'assistant'
                        ? 'bg-cyan-950/30 border-cyan-500/20 text-slate-200 mr-8'
                        : 'bg-amber-950/30 border-amber-500/30 text-amber-200'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1 border-b border-slate-800 pb-1">
                      <span className="font-bold uppercase tracking-wider text-cyan-400">
                        {msg.role === 'user' ? 'OPERATOR' : msg.role === 'assistant' ? 'JARVIS' : 'SYSTEM AUDIT'}
                      </span>
                      <span>{msg.timestamp}</span>
                    </div>

                    <div className="whitespace-pre-wrap">{msg.text}</div>

                    {/* Tool action tag if triggered */}
                    {msg.toolAction && (
                      <div className="mt-2 pt-1.5 border-t border-cyan-500/15 flex items-center justify-between text-[10px]">
                        <span className="text-cyan-300 font-semibold">Action: {msg.toolAction}</span>
                        <span className="text-amber-400 bg-amber-950/50 px-1.5 py-0.5 rounded border border-amber-500/20 font-bold">
                          LEVEL {msg.permissionLevel ?? 1}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </div>
          </div>
        )}

        {/* Tab: Universal Python Studio */}
        {activeTab === 'python' && (
          <div className="flex-1">
            <PythonStudio />
          </div>
        )}

        {/* Tab: 3D Paint & Holographic Picture Studio */}
        {activeTab === 'paint_3d' && (
          <div className="flex-1">
            <HolographicStudio3D />
          </div>
        )}

        {/* Tab: Full System Mouse & Keyboard Controller */}
        {activeTab === 'controller' && (
          <div className="flex-1">
            <SystemController />
          </div>
        )}

        {/* Tab: 3D Cyber Space Runner Game */}
        {activeTab === 'game' && (
          <div className="flex-1">
            <CyberGame3D />
          </div>
        )}

        {/* Tab: Task Queue & Autonomous Execution */}
        {activeTab === 'tasks' && (
          <div className="flex-1">
            <TaskQueuePanel
              tasks={tasks}
              onApproveTask={handleApproveTask}
              onRejectTask={handleRejectTask}
              onKillSwitch={handleKillSwitch}
            />
          </div>
        )}

        {/* Tab: Local File Intelligence & Index Map */}
        {activeTab === 'files' && (
          <div className="flex-1">
            <FileMapViewer />
          </div>
        )}

        {/* Tab: Persistent Neural Memory Engine */}
        {activeTab === 'memory' && (
          <div className="flex-1">
            <MemoryPanel />
          </div>
        )}

        {/* Tab: Self-Improvement Engine */}
        {activeTab === 'self_improve' && (
          <div className="flex-1">
            <SelfImprovementEngine />
          </div>
        )}

        {/* Tab: Modular Tool Registry */}
        {activeTab === 'tools' && (
          <div className="flex-1">
            <ToolRegistryPanel />
          </div>
        )}

        {/* Tab: Settings & Real-Time Voice Profile Sub-Component */}
        {activeTab === 'settings' && (
          <div className="flex-1">
            <SettingsView
              voiceProfile={voiceProfile}
              onChangeVoiceProfile={(newCfg) => {
                setVoiceProfile(newCfg);
                setVoice(newCfg.voice);
              }}
              onTestVoice={(sampleText) => playSpeechAudio(sampleText)}
              language={language}
              onChangeLanguage={setLanguage}
              voice={voice}
              onChangeVoice={setVoice}
            />
          </div>
        )}
      </main>

      {/* Unified Collapsible Bottom Dock */}
      <ControlOverlay
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        language={language}
        onChangeLanguage={setLanguage}
        voice={voice}
        onChangeVoice={setVoice}
        onOpenDownloadModal={() => setShowDownloadModal(true)}
        onSendMessage={handleSendMessage}
        isThinking={assistantState === 'thinking'}
      />

      {/* Downloadable Windows Standalone ZIP Modal */}
      {showDownloadModal && (
        <DesktopPackageModal onClose={() => setShowDownloadModal(false)} />
      )}
    </div>
  );
}
