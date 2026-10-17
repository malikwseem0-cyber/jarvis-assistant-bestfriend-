import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import {
  Palette,
  Image as ImageIcon,
  Box,
  Layers,
  RotateCw,
  Sun,
  Download,
  Trash2,
  Sparkles,
  Sliders,
  Type,
  PlusCircle,
  Eye,
  Check,
} from 'lucide-react';

export const HolographicStudio3D: React.FC = () => {
  const [studioMode, setStudioMode] = useState<'3d_paint' | 'picture_edit'>('3d_paint');

  // --- 3D Paint State ---
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const objectsGroupRef = useRef<THREE.Group | null>(null);

  const [selectedShape, setSelectedShape] = useState<'cube' | 'sphere' | 'torus' | 'octahedron' | 'cylinder'>('sphere');
  const [activeMaterialColor, setActiveMaterialColor] = useState<string>('#00f0ff');
  const [isWireframe, setIsWireframe] = useState<boolean>(false);
  const [objectCount, setObjectCount] = useState<number>(3);
  const [isRotating, setIsRotating] = useState<boolean>(true);

  // --- Picture Edit State ---
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [activeFilter, setActiveFilter] = useState<'normal' | 'hologram' | 'matrix' | 'neon' | 'cyberpunk' | 'crt'>('hologram');
  const [brushColor, setBrushColor] = useState<string>('#00f0ff');
  const [brushSize, setBrushSize] = useState<number>(4);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [overlayText, setOverlayText] = useState<string>('JARVIS CLASSIFIED // LEVEL 3');
  const [showWatermark, setShowWatermark] = useState<boolean>(true);

  // --------------------------------------------------------------------------
  // 3D Paint Three.js Engine
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (studioMode !== '3d_paint') return;
    const container = mountRef.current;
    if (!container) return;

    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(50, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(0, 3, 7);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x00f0ff, 1.8);
    dirLight1.position.set(5, 10, 7);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xff00aa, 1.2);
    dirLight2.position.set(-5, -5, -5);
    scene.add(dirLight2);

    // Floor Grid (Holographic Tron Grid)
    const grid = new THREE.GridHelper(12, 24, 0x00f0ff, 0x1e293b);
    grid.position.y = -1.5;
    scene.add(grid);

    // Objects Group
    const objectsGroup = new THREE.Group();
    scene.add(objectsGroup);
    objectsGroupRef.current = objectsGroup;

    // Initial 3D shapes
    const spawnInitialShapes = () => {
      // 1. Center Sphere
      const sphereGeo = new THREE.SphereGeometry(0.9, 32, 32);
      const sphereMat = new THREE.MeshStandardMaterial({
        color: 0x00f0ff,
        metalness: 0.7,
        roughness: 0.2,
      });
      const sphere = new THREE.Mesh(sphereGeo, sphereMat);
      objectsGroup.add(sphere);

      // 2. Torus Ring
      const torusGeo = new THREE.TorusGeometry(1.5, 0.08, 16, 80);
      const torusMat = new THREE.MeshStandardMaterial({
        color: 0xffb700,
        metalness: 0.9,
        roughness: 0.1,
      });
      const torus = new THREE.Mesh(torusGeo, torusMat);
      torus.rotation.x = Math.PI / 3;
      objectsGroup.add(torus);

      // 3. Cyber Crystal
      const octGeo = new THREE.OctahedronGeometry(0.7, 0);
      const octMat = new THREE.MeshStandardMaterial({
        color: 0xaa00ff,
        metalness: 0.8,
        roughness: 0.15,
        wireframe: false,
      });
      const oct = new THREE.Mesh(octGeo, octMat);
      oct.position.set(2, 0.5, -1);
      objectsGroup.add(oct);
    };

    spawnInitialShapes();

    // Resize Handler
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // Animation Loop
    let animId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      if (isRotating && objectsGroup) {
        objectsGroup.rotation.y += delta * 0.35;
      }

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [studioMode]);

  // Add 3D Shape
  const handleAddShape = () => {
    if (!objectsGroupRef.current) return;
    const group = objectsGroupRef.current;

    let geo: THREE.BufferGeometry;
    if (selectedShape === 'cube') {
      geo = new THREE.BoxGeometry(0.9, 0.9, 0.9);
    } else if (selectedShape === 'sphere') {
      geo = new THREE.SphereGeometry(0.65, 32, 32);
    } else if (selectedShape === 'torus') {
      geo = new THREE.TorusGeometry(1.1, 0.1, 16, 60);
    } else if (selectedShape === 'octahedron') {
      geo = new THREE.OctahedronGeometry(0.75, 0);
    } else {
      geo = new THREE.CylinderGeometry(0.4, 0.4, 1.2, 24);
    }

    const mat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(activeMaterialColor),
      metalness: 0.85,
      roughness: 0.2,
      wireframe: isWireframe,
    });

    const mesh = new THREE.Mesh(geo, mat);
    const spread = 3;
    mesh.position.set(
      (Math.random() - 0.5) * spread,
      Math.random() * 2 - 0.5,
      (Math.random() - 0.5) * spread
    );
    mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);

    group.add(mesh);
    setObjectCount(group.children.length);
  };

  const handleClear3DScene = () => {
    if (!objectsGroupRef.current) return;
    const group = objectsGroupRef.current;
    while (group.children.length > 0) {
      const obj = group.children[0] as THREE.Mesh;
      group.remove(obj);
      obj.geometry?.dispose();
    }
    setObjectCount(0);
  };

  const handleDownload3DShot = () => {
    if (!rendererRef.current) return;
    const dataUrl = rendererRef.current.domElement.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `jarvis_3d_sculpt_${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  // --------------------------------------------------------------------------
  // 2D Picture & Image Editor Canvas
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (studioMode !== 'picture_edit') return;
    drawPictureCanvas();
  }, [studioMode, activeFilter, overlayText, showWatermark]);

  const drawPictureCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw Cyberpunk Futuristic Background
    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    // Dark cyber backdrop
    const grad = ctx.createLinearGradient(0, 0, w, h);
    if (activeFilter === 'matrix') {
      grad.addColorStop(0, '#021808');
      grad.addColorStop(1, '#052b0e');
    } else if (activeFilter === 'cyberpunk') {
      grad.addColorStop(0, '#1a0026');
      grad.addColorStop(1, '#001a33');
    } else {
      grad.addColorStop(0, '#060d1a');
      grad.addColorStop(1, '#0b162c');
    }
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Cyber perspective grid
    ctx.strokeStyle = activeFilter === 'matrix' ? 'rgba(0, 255, 100, 0.25)' : 'rgba(0, 240, 255, 0.25)';
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Central Holographic Target Glyph
    ctx.save();
    ctx.translate(w / 2, h / 2);

    ctx.strokeStyle = activeFilter === 'matrix' ? '#10b981' : '#00f0ff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, 110, 0, Math.PI * 2);
    ctx.stroke();

    ctx.setLineDash([8, 8]);
    ctx.beginPath();
    ctx.arc(0, 0, 135, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Crosshairs
    ctx.beginPath();
    ctx.moveTo(-160, 0);
    ctx.lineTo(-120, 0);
    ctx.moveTo(120, 0);
    ctx.lineTo(160, 0);
    ctx.moveTo(0, -160);
    ctx.lineTo(0, -120);
    ctx.moveTo(0, 120);
    ctx.lineTo(0, 160);
    ctx.stroke();

    // Central Cyber Crest
    ctx.fillStyle = activeFilter === 'matrix' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(0, 240, 255, 0.15)';
    ctx.beginPath();
    ctx.arc(0, 0, 80, 0, Math.PI * 2);
    ctx.fill();

    ctx.font = 'bold 16px monospace';
    ctx.fillStyle = activeFilter === 'matrix' ? '#34d399' : '#38bdf8';
    ctx.textAlign = 'center';
    ctx.fillText('JARVIS CYBER OPTICS', 0, -10);
    ctx.font = '11px monospace';
    ctx.fillText('ULTRA RESOLUTION 2160p', 0, 15);
    ctx.restore();

    // Filter Effect: Scanlines
    if (activeFilter === 'crt' || activeFilter === 'hologram') {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
      for (let y = 0; y < h; y += 4) {
        ctx.fillRect(0, y, w, 2);
      }
    }

    // Watermark & Overlay Text
    if (showWatermark && overlayText) {
      ctx.fillStyle = activeFilter === 'matrix' ? '#10b981' : '#00f0ff';
      ctx.font = 'bold 12px monospace';
      ctx.fillText(overlayText, 25, 35);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.font = '10px monospace';
      ctx.fillText(`SECURITY AUDIT // HASH_${Date.now().toString(16).toUpperCase()}`, 25, 52);
    }
  };

  // Picture Drawing handlers
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    drawOnCanvas(e);
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    drawOnCanvas(e);
  };

  const handleCanvasMouseUp = () => {
    setIsDrawing(false);
  };

  const drawOnCanvas = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.fillStyle = brushColor;
    ctx.shadowColor = brushColor;
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(x, y, brushSize, 0, Math.PI * 2);
    ctx.fill();
  };

  const handleDownloadPicture = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = `jarvis_cyber_art_${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  return (
    <div className="bg-slate-950/85 border border-cyan-500/25 rounded-2xl p-4 md:p-5 backdrop-blur-md font-mono text-xs text-slate-200 flex flex-col gap-4 shadow-[0_0_35px_rgba(0,240,255,0.08)]">
      {/* Top Header & Mode Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-cyan-500/20 pb-3">
        <div className="flex items-center gap-2.5">
          <Palette className="w-5 h-5 text-cyan-400" />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold tracking-wider text-cyan-300 uppercase text-xs sm:text-sm">
                3D PAINT & HOLOGRAPHIC PICTURE STUDIO
              </span>
              <span className="bg-cyan-950 text-cyan-400 text-[10px] px-2 py-0.5 rounded-full border border-cyan-500/30 font-bold">
                WEBGL ACCELERATED
              </span>
            </div>
            <div className="text-[10px] text-cyan-400/80 mt-0.5 font-sans">
              تھری ڈی پینٹ اور ہولوگرافک پکچر ایڈیٹر — 3D Object Sculptor, Shaders & Cyber Image Editor
            </div>
          </div>
        </div>

        {/* Mode Switcher */}
        <div className="flex items-center bg-slate-900 border border-cyan-500/30 rounded-xl p-1">
          <button
            onClick={() => setStudioMode('3d_paint')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              studioMode === '3d_paint'
                ? 'bg-cyan-600 text-slate-950 shadow-[0_0_12px_rgba(0,240,255,0.4)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Box className="w-3.5 h-3.5" />
            <span>3D Paint Studio</span>
          </button>
          <button
            onClick={() => setStudioMode('picture_edit')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              studioMode === 'picture_edit'
                ? 'bg-cyan-600 text-slate-950 shadow-[0_0_12px_rgba(0,240,255,0.4)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Picture & Image Editor</span>
          </button>
        </div>
      </div>

      {/* MODE 1: 3D Paint Studio */}
      {studioMode === '3d_paint' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1">
          {/* 3D Viewport (8 cols) */}
          <div className="lg:col-span-8 flex flex-col bg-slate-900/60 border border-cyan-500/20 rounded-xl p-3 relative min-h-[420px] overflow-hidden">
            <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-slate-950/80 border border-cyan-500/30 rounded-lg px-2.5 py-1 text-[10px] text-cyan-300 backdrop-blur-md">
              <Box className="w-3.5 h-3.5 text-cyan-400" />
              <span>3D SCENE: {objectCount} OBJECTS</span>
            </div>

            {/* Three.js Mount Container */}
            <div ref={mountRef} className="w-full h-full flex-1 rounded-lg cursor-grab active:cursor-grabbing" />

            {/* Viewport Overlay Controls */}
            <div className="absolute bottom-4 right-4 z-10 flex items-center gap-2">
              <button
                onClick={() => setIsRotating(!isRotating)}
                className={`px-2.5 py-1.5 rounded-lg border text-[10px] font-bold cursor-pointer transition-all ${
                  isRotating
                    ? 'bg-cyan-950 text-cyan-300 border-cyan-500/40'
                    : 'bg-slate-900 text-slate-400 border-slate-700'
                }`}
                title="Toggle automatic rotation"
              >
                <RotateCw className="w-3.5 h-3.5 inline mr-1" />
                {isRotating ? 'Auto Orbit ON' : 'Paused'}
              </button>
              <button
                onClick={handleDownload3DShot}
                className="flex items-center gap-1 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold rounded-lg shadow-lg cursor-pointer text-[10px]"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Save 3D Image</span>
              </button>
            </div>
          </div>

          {/* 3D Tools & Palette Sidebar (4 cols) */}
          <div className="lg:col-span-4 bg-slate-900/70 border border-cyan-500/20 rounded-xl p-4 flex flex-col justify-between space-y-4">
            <div className="space-y-3.5">
              {/* Shape Selector */}
              <div>
                <div className="text-[10px] text-slate-400 uppercase font-bold mb-2">1. SELECT 3D SHAPE</div>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['sphere', 'cube', 'torus', 'octahedron', 'cylinder'] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => setSelectedShape(s)}
                      className={`px-2 py-1.5 rounded-lg capitalize text-[10px] font-mono border transition-all cursor-pointer ${
                        selectedShape === s
                          ? 'bg-cyan-500/25 text-cyan-300 border-cyan-500 font-bold'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color & Material Finish */}
              <div>
                <div className="text-[10px] text-slate-400 uppercase font-bold mb-2">2. HOLOGRAPHIC FINISH</div>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: 'Cyan Glow', hex: '#00f0ff' },
                    { label: 'Gold Amber', hex: '#ffb700' },
                    { label: 'Plasma Violet', hex: '#aa00ff' },
                    { label: 'Matrix Emerald', hex: '#00ff88' },
                    { label: 'Crimson Red', hex: '#ff0055' },
                    { label: 'Titanium White', hex: '#ffffff' },
                  ].map((color) => (
                    <button
                      key={color.hex}
                      onClick={() => setActiveMaterialColor(color.hex)}
                      className={`w-7 h-7 rounded-full border-2 transition-transform cursor-pointer ${
                        activeMaterialColor === color.hex ? 'scale-125 border-white shadow-[0_0_10px_currentColor]' : 'border-slate-800'
                      }`}
                      style={{ backgroundColor: color.hex, color: color.hex }}
                      title={color.label}
                    />
                  ))}
                </div>
              </div>

              {/* Wireframe Mode Toggle */}
              <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <span className="text-[11px] text-slate-300">Wireframe Holo Mode</span>
                <input
                  type="checkbox"
                  checked={isWireframe}
                  onChange={(e) => setIsWireframe(e.target.checked)}
                  className="w-4 h-4 accent-cyan-500 cursor-pointer"
                />
              </div>

              {/* Add Shape Action Button */}
              <button
                onClick={handleAddShape}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(0,240,255,0.3)] cursor-pointer text-xs"
              >
                <PlusCircle className="w-4 h-4" />
                <span>SPAWN 3D OBJECT IN SCENE</span>
              </button>
            </div>

            {/* Clear Scene */}
            <div className="pt-3 border-t border-slate-800">
              <button
                onClick={handleClear3DScene}
                className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-red-950/60 hover:bg-red-900 border border-red-500/30 text-red-300 hover:text-white text-[10px] transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Reset / Clear 3D Viewport</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODE 2: Picture & Image Editor */}
      {studioMode === 'picture_edit' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1">
          {/* Main 2D Canvas (8 cols) */}
          <div className="lg:col-span-8 flex flex-col bg-slate-900/60 border border-cyan-500/20 rounded-xl p-3 items-center justify-center relative min-h-[420px]">
            <div className="relative border border-cyan-500/40 rounded-lg overflow-hidden shadow-[0_0_25px_rgba(0,240,255,0.15)]">
              <canvas
                ref={canvasRef}
                width={640}
                height={380}
                onMouseDown={handleCanvasMouseDown}
                onMouseMove={handleCanvasMouseMove}
                onMouseUp={handleCanvasMouseUp}
                className="max-w-full h-auto cursor-crosshair bg-slate-950"
              />
            </div>
            <div className="text-[10px] text-slate-500 mt-2">
              Click & drag to paint glowing cyber brush strokes directly on picture
            </div>
          </div>

          {/* Picture Controls & Filter Sidebar (4 cols) */}
          <div className="lg:col-span-4 bg-slate-900/70 border border-cyan-500/20 rounded-xl p-4 flex flex-col justify-between space-y-3.5">
            <div className="space-y-3">
              {/* Cyber Filter Presets */}
              <div>
                <div className="text-[10px] text-slate-400 uppercase font-bold mb-2">1. CYBERPUNK FILTERS</div>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { id: 'hologram', label: 'Hologram Cyan' },
                    { id: 'matrix', label: 'Matrix Rain' },
                    { id: 'cyberpunk', label: 'Neon Cyber' },
                    { id: 'crt', label: 'CRT Scanlines' },
                  ].map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setActiveFilter(f.id as any)}
                      className={`px-2.5 py-1.5 rounded-lg text-[10px] border transition-all cursor-pointer ${
                        activeFilter === f.id
                          ? 'bg-cyan-500/25 text-cyan-300 border-cyan-500 font-bold'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Glowing Brush Color */}
              <div>
                <div className="text-[10px] text-slate-400 uppercase font-bold mb-2">2. BRUSH COLOR & SIZE</div>
                <div className="flex items-center gap-2 mb-2">
                  {['#00f0ff', '#10b981', '#ffb700', '#ff0055', '#ffffff'].map((c) => (
                    <button
                      key={c}
                      onClick={() => setBrushColor(c)}
                      className={`w-6 h-6 rounded-full border-2 cursor-pointer ${
                        brushColor === c ? 'scale-125 border-white' : 'border-slate-800'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-400 min-w-[50px]">Size: {brushSize}px</span>
                  <input
                    type="range"
                    min={2}
                    max={20}
                    value={brushSize}
                    onChange={(e) => setBrushSize(Number(e.target.value))}
                    className="flex-1 accent-cyan-400 cursor-pointer"
                  />
                </div>
              </div>

              {/* Watermark & Text Annotation */}
              <div>
                <div className="text-[10px] text-slate-400 uppercase font-bold mb-1.5">3. HUD TEXT OVERLAY</div>
                <input
                  type="text"
                  value={overlayText}
                  onChange={(e) => setOverlayText(e.target.value)}
                  placeholder="Text overlay..."
                  className="w-full bg-slate-950 border border-cyan-500/30 rounded-lg px-2.5 py-1.5 text-xs text-cyan-200 focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            {/* Actions: Download & Reset */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <button
                onClick={handleDownloadPicture}
                className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold rounded-xl transition-all shadow-md cursor-pointer text-xs"
              >
                <Download className="w-4 h-4" />
                <span>DOWNLOAD EDITED PICTURE (.PNG)</span>
              </button>
              <button
                onClick={drawPictureCanvas}
                className="w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[10px] transition-colors cursor-pointer"
              >
                Clear Brush Strokes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
