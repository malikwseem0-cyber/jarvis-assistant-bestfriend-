import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Gamepad2, Play, RotateCcw, Trophy, Shield, Zap, Download, Volume2, VolumeX } from 'lucide-react';

export const CyberGame3D: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [health, setHealth] = useState<number>(100);
  const [speed, setSpeed] = useState<number>(1.0);
  const [highScore, setHighScore] = useState<number>(0);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Audio synthesis using Web Audio API (zero external 404 dependencies per skill rules)
  const audioCtxRef = useRef<AudioContext | null>(null);

  const playChime = (freq: number, type: OscillatorType = 'sine', duration: number = 0.15) => {
    if (!soundEnabled) return;
    try {
      if (!audioCtxRef.current) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {}
  };

  // Game Loop Ref variables
  const isPlayingRef = useRef<boolean>(false);
  const playerPosRef = useRef<number>(0); // Target X (-3 to 3)

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050811, 0.035);

    const camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(0, 2.5, 6);
    camera.lookAt(0, 1, -10);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 2. Lighting
    const ambLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambLight);

    const dirLight = new THREE.DirectionalLight(0x00f0ff, 1.5);
    dirLight.position.set(0, 10, 5);
    scene.add(dirLight);

    // 3. Tron Neon Grid Floor
    const grid1 = new THREE.GridHelper(80, 40, 0x00f0ff, 0x1e293b);
    grid1.position.y = 0;
    scene.add(grid1);

    const grid2 = new THREE.GridHelper(80, 40, 0x00f0ff, 0x1e293b);
    grid2.position.set(0, 0, -80);
    scene.add(grid2);

    // 4. Player Ship (Composite procedural 3D model)
    const playerGroup = new THREE.Group();
    playerGroup.position.set(0, 0.6, 2);
    scene.add(playerGroup);

    // Hull (Cone)
    const hullGeo = new THREE.ConeGeometry(0.5, 1.6, 4);
    const hullMat = new THREE.MeshStandardMaterial({
      color: 0x00f0ff,
      metalness: 0.8,
      roughness: 0.2,
      wireframe: false,
    });
    const hull = new THREE.Mesh(hullGeo, hullMat);
    hull.rotation.x = Math.PI / 2;
    hull.rotation.y = Math.PI / 4;
    playerGroup.add(hull);

    // Wings
    const wingGeo = new THREE.BoxGeometry(2.0, 0.06, 0.8);
    const wingMat = new THREE.MeshStandardMaterial({
      color: 0x0088ff,
      metalness: 0.9,
      roughness: 0.1,
    });
    const wings = new THREE.Mesh(wingGeo, wingMat);
    wings.position.set(0, 0, 0.2);
    playerGroup.add(wings);

    // Cockpit Glow
    const cockpitGeo = new THREE.SphereGeometry(0.2, 16, 16);
    const cockpitMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const cockpit = new THREE.Mesh(cockpitGeo, cockpitMat);
    cockpit.position.set(0, 0.2, 0);
    playerGroup.add(cockpit);

    // 5. Obstacles & Collectibles Pool
    interface Obstacle {
      mesh: THREE.Mesh;
      type: 'barrier' | 'energy';
      active: boolean;
    }

    const objectsPool: Obstacle[] = [];
    const poolSize = 14;

    const barrierGeo = new THREE.BoxGeometry(0.8, 1.8, 0.8);
    const barrierMat = new THREE.MeshStandardMaterial({
      color: 0xff0055,
      metalness: 0.7,
      roughness: 0.3,
    });

    const energyGeo = new THREE.OctahedronGeometry(0.4, 0);
    const energyMat = new THREE.MeshStandardMaterial({
      color: 0x00ff88,
      metalness: 0.9,
      roughness: 0.1,
    });

    for (let i = 0; i < poolSize; i++) {
      const isBarrier = i % 2 === 0;
      const mesh = new THREE.Mesh(isBarrier ? barrierGeo : energyGeo, isBarrier ? barrierMat : energyMat);
      mesh.position.set(
        (Math.random() - 0.5) * 6,
        isBarrier ? 0.9 : 0.8,
        -15 - i * 8
      );
      scene.add(mesh);
      objectsPool.push({
        mesh,
        type: isBarrier ? 'barrier' : 'energy',
        active: true,
      });
    }

    // 6. Keyboard Control Handlers
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'KeyA' || e.code === 'ArrowLeft') {
        playerPosRef.current = Math.max(-3, playerPosRef.current - 1.2);
      } else if (e.code === 'KeyD' || e.code === 'ArrowRight') {
        playerPosRef.current = Math.min(3, playerPosRef.current + 1.2);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    // Mouse movement inside game container
    const handlePointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      const normX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      playerPosRef.current = normX * 3.2;
    };
    container.addEventListener('pointermove', handlePointerMove);

    // 7. Animation Game Loop
    let animId: number;
    let localScore = 0;
    let localHealth = 100;
    let gameSpeed = 35;

    const animate = () => {
      animId = requestAnimationFrame(animate);

      if (isPlayingRef.current) {
        // Smooth player tilt and lateral movement
        playerGroup.position.x += (playerPosRef.current - playerGroup.position.x) * 0.15;
        playerGroup.rotation.z = -(playerPosRef.current - playerGroup.position.x) * 0.4;

        // Move Grids towards camera
        grid1.position.z += 0.45;
        grid2.position.z += 0.45;
        if (grid1.position.z > 80) grid1.position.z = -80;
        if (grid2.position.z > 80) grid2.position.z = -80;

        // Move Obstacles
        for (const obj of objectsPool) {
          obj.mesh.position.z += 0.55;
          obj.mesh.rotation.y += 0.05;

          // Check Collision with player
          const dist = obj.mesh.position.distanceTo(playerGroup.position);
          if (dist < 1.1 && obj.active) {
            obj.active = false;
            obj.mesh.visible = false;

            if (obj.type === 'barrier') {
              localHealth = Math.max(0, localHealth - 25);
              setHealth(localHealth);
              playChime(150, 'sawtooth', 0.25); // Collision thud

              if (localHealth <= 0) {
                isPlayingRef.current = false;
                setIsPlaying(false);
                setGameOver(true);
                playChime(80, 'sawtooth', 0.5);
              }
            } else {
              localScore += 50;
              setScore(localScore);
              playChime(880, 'sine', 0.15); // Pickup chime
            }
          }

          // Respawn past camera
          if (obj.mesh.position.z > 8) {
            obj.mesh.position.z = -60 - Math.random() * 20;
            obj.mesh.position.x = (Math.random() - 0.5) * 6.5;
            obj.active = true;
            obj.mesh.visible = true;

            localScore += 5;
            setScore(localScore);
          }
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('keydown', handleKeyDown);
      container.removeEventListener('pointermove', handlePointerMove);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  const handleStartGame = () => {
    setScore(0);
    setHealth(100);
    setGameOver(false);
    setIsPlaying(true);
    isPlayingRef.current = true;
    playChime(520, 'sine', 0.2);
  };

  const pythonGameCode = `"""
JARVIS Autonomous Pygame Cyber Space Runner
Standalone Windows 10/11 Python Game Engine
"""
import pygame
import random
import sys

pygame.init()
WIDTH, HEIGHT = 800, 600
screen = pygame.display.set_mode((WIDTH, HEIGHT))
pygame.display.set_caption("JARVIS 3D Cyber Space Runner")
clock = pygame.time.Clock()

CYAN = (0, 240, 255)
DARK = (5, 8, 17)
RED = (255, 0, 85)
GREEN = (0, 255, 136)

class Player:
    def __init__(self):
        self.rect = pygame.Rect(WIDTH//2 - 25, HEIGHT - 80, 50, 40)
        self.speed = 8
    def move(self, dx):
        self.rect.x = max(50, min(WIDTH - 100, self.rect.x + dx))

def main():
    player = Player()
    score = 0
    obstacles = [pygame.Rect(random.randint(50, WIDTH-100), -i*150, 40, 40) for i in range(5)]
    running = True

    while running:
        clock.tick(60)
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                running = False

        keys = pygame.key.get_pressed()
        if keys[pygame.K_LEFT] or keys[pygame.K_a]:
            player.move(-player.speed)
        if keys[pygame.K_RIGHT] or keys[pygame.K_d]:
            player.move(player.speed)

        # Move obstacles
        for obs in obstacles:
            obs.y += 6
            if obs.y > HEIGHT:
                obs.y = -50
                obs.x = random.randint(50, WIDTH-100)
                score += 10
            if obs.colliderect(player.rect):
                print(f"[GAME OVER] Final Score: {score}")
                running = False

        # Draw
        screen.fill(DARK)
        pygame.draw.rect(screen, CYAN, player.rect, border_radius=6)
        for obs in obstacles:
            pygame.draw.rect(screen, RED, obs, border_radius=4)
        pygame.display.flip()

    pygame.quit()

if __name__ == "__main__":
    main()
`;

  const handleDownloadPygame = () => {
    const blob = new Blob([pythonGameCode], { type: 'text/x-python;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'jarvis_cyber_runner_game.py';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-slate-950/85 border border-cyan-500/25 rounded-2xl p-4 md:p-5 backdrop-blur-md font-mono text-xs text-slate-200 flex flex-col gap-4 shadow-[0_0_35px_rgba(0,240,255,0.08)]">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-cyan-500/20 pb-3">
        <div className="flex items-center gap-2.5">
          <Gamepad2 className="w-5 h-5 text-cyan-400" />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold tracking-wider text-cyan-300 uppercase text-xs sm:text-sm">
                3D CYBER SPACE RUNNER
              </span>
              <span className="bg-cyan-950 text-cyan-400 text-[10px] px-2 py-0.5 rounded-full border border-cyan-500/30 font-bold">
                THREE.JS & PYGAME READY
              </span>
            </div>
            <div className="text-[10px] text-cyan-400/80 mt-0.5 font-sans">
              سائبر اسپیس رنر گیم — Move with A/D, Arrow Keys or Mouse Cursor
            </div>
          </div>
        </div>

        {/* HUD Telemetry Badges */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded bg-slate-900 border border-cyan-500/30 text-[11px] text-cyan-300 font-bold">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>SCORE: {score}</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded bg-slate-900 border border-cyan-500/30 text-[11px] text-emerald-400 font-bold">
            <Shield className="w-3.5 h-3.5" />
            <span>SHIELDS: {health}%</span>
          </div>

          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-1.5 rounded bg-slate-900 border border-slate-700 text-slate-400 hover:text-white cursor-pointer"
            title="Toggle Synthesized Audio"
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-cyan-400" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Main 3D Game Viewport */}
      <div className="relative h-[440px] bg-black/90 border border-cyan-500/30 rounded-xl overflow-hidden flex items-center justify-center">
        {/* Three.js Canvas Container */}
        <div ref={mountRef} className="w-full h-full cursor-none" />

        {/* Start / Game Over Screen Overlay */}
        {(!isPlaying || gameOver) && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/75 backdrop-blur-sm p-6 text-center space-y-3">
            <div className="font-extrabold text-xl text-cyan-300 tracking-widest drop-shadow-[0_0_15px_rgba(0,240,255,0.8)]">
              {gameOver ? 'MISSION ABORTED // SHIELDS DEPLETED' : 'JARVIS CYBER RUNNER 3D'}
            </div>

            {gameOver ? (
              <div className="text-amber-300 text-sm font-bold">Final Score: {score}</div>
            ) : (
              <div className="text-slate-400 text-xs max-w-sm">
                Steer your holographic craft across the infinite neon grid. Dodge red barriers and collect green energy nodes!
              </div>
            )}

            <button
              onClick={handleStartGame}
              className="flex items-center gap-2 px-6 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-extrabold rounded-xl text-sm transition-all shadow-[0_0_20px_rgba(0,240,255,0.5)] cursor-pointer"
            >
              {gameOver ? <RotateCcw className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
              <span>{gameOver ? 'RETRY MISSION' : 'LAUNCH GAME'}</span>
            </button>

            <div className="text-[10px] text-slate-500 pt-2">
              Controls: <kbd className="px-1.5 py-0.5 bg-slate-800 text-cyan-300 rounded">A</kbd> / <kbd className="px-1.5 py-0.5 bg-slate-800 text-cyan-300 rounded">D</kbd> or Mouse Movement
            </div>
          </div>
        )}
      </div>

      {/* Python Pygame Standalone Export Footer */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-800 text-[10px] text-slate-400">
        <div>
          Includes native Python 3 Pygame source code ready to run directly on Windows 10 & 11.
        </div>
        <button
          onClick={handleDownloadPygame}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 hover:text-white font-bold cursor-pointer transition-all self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Download Python Pygame Code (.py)</span>
        </button>
      </div>
    </div>
  );
};
