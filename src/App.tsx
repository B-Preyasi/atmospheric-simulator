import { useState, useEffect, useRef } from 'react';
import { 
  Snowflake, 
  Sparkles, 
  Info, 
  Settings, 
  Sliders, 
  Monitor, 
  Clock, 
  RotateCcw, 
  Check, 
  Layers, 
  Cpu, 
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Database,
  Activity,
  HardDrive,
  Shield,
  Play,
  Volume2,
  VolumeX,
  XCircle,
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Particle, EffectType } from './types';
import { synth } from './utils/audio';

// Palette of corporate soft balloons
const BALLOON_COLORS = [
  '#e11d48', // Coral rose from the spec
  '#3b82f6', // Corporate blue
  '#2563eb', // Royal cobalt
  '#10b981', // Crisp emerald
  '#f59e0b', // Radiant amber
  '#8b5cf6', // Indigo violet
  '#ec4899', // Bright rose
];

export default function App() {
  // Primary state management
  const [activeEffect, setActiveEffect] = useState<EffectType>('none');
  const [particles, setParticles] = useState<Particle[]>([]);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [totalSpawned, setTotalSpawned] = useState<number>(0);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  
  // Synchronize dynamic synthesizer preferences
  useEffect(() => {
    synth.setMute(!soundEnabled);
  }, [soundEnabled]);
  
  // Custom interactive controls matching standard functional rules
  const [particleSize, setParticleSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [spawnIntensity, setSpawnIntensity] = useState<'low' | 'medium' | 'high'>('medium');
  const [viewportMode, setViewportMode] = useState<'inline' | 'fullscreen'>('inline');
  const [gravityScalar, setGravityScalar] = useState<number>(1.0);

  // Live sensor metrics for dynamic corporate telemetry liveness!
  const [cpuUsage, setCpuUsage] = useState<number>(12);
  const [memUsage, setMemUsage] = useState<string>('4.1');
  const [latency, setLatency] = useState<number>(12);

  const spawnIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const timerRef = useRef<number | null>(null);
  const particleIdCounter = useRef<number>(0);

  // 5 seconds timing const
  const EFFECT_DURATION_MS = 5000;

  // Liveness interval generator
  useEffect(() => {
    const telemetryInterval = setInterval(() => {
      setCpuUsage(prev => {
        const delta = Math.floor(Math.random() * 5) - 2;
        return Math.max(8, Math.min(22, prev + delta));
      });
      setLatency(prev => {
        const delta = Math.floor(Math.random() * 3) - 1;
        return Math.max(9, Math.min(15, prev + delta));
      });
      setMemUsage(prev => {
        const val = parseFloat(prev) + (Math.random() * 0.04 - 0.02);
        return val.toFixed(2);
      });
    }, 2200);

    return () => {
      clearInterval(telemetryInterval);
    };
  }, []);

  const stopSpawning = () => {
    if (spawnIntervalRef.current) {
      clearInterval(spawnIntervalRef.current);
      spawnIntervalRef.current = null;
    }
  };

  const killSimulation = () => {
    stopSpawning();
    if (timerRef.current) {
      cancelAnimationFrame(timerRef.current);
      timerRef.current = null;
    }
    setActiveEffect('none');
    setTimeRemaining(0);
    synth.stop(); // Stop synthetic oscillations
  };

  const clearAllParticles = () => {
    setParticles([]);
    setTotalSpawned(0);
  };

  const resetSimulation = () => {
    killSimulation();
    clearAllParticles();
  };

  // Safe release
  useEffect(() => {
    return () => {
      stopSpawning();
      if (timerRef.current) cancelAnimationFrame(timerRef.current);
    };
  }, []);

  // Precise sizing helper for Snowflake & Balloon components
  const getSizeDimension = () => {
    switch (particleSize) {
      case 'small': return { min: 14, max: 18 };
      case 'large': return { min: 32, max: 40 };
      case 'medium':
      default:
        return { min: 22, max: 28 }; // Mandated medium size range
    }
  };

  const getSpawnInterval = () => {
    switch (spawnIntensity) {
      case 'low': return 350;
      case 'high': return 80;
      case 'medium':
      default:
        return 160;
    }
  };

  const triggerEffect = (effect: EffectType) => {
    // Reset any currently running effect safely
    killSimulation();
    setActiveEffect(effect);
    
    // Clear last items before spawning fresh batch for crisp start
    setParticles([]);

    // Synchronize 5.0-second interactive procedural audio cycle
    if (effect === 'snowflakes') {
      synth.playSnowflakesEffectCycle();
    } else if (effect === 'balloons') {
      synth.playBalloonsEffectCycle();
    }
    
    const startTime = Date.now();
    const endTime = startTime + EFFECT_DURATION_MS;
    setTimeRemaining(EFFECT_DURATION_MS);

    const sizeConfig = getSizeDimension();
    const intervalTime = getSpawnInterval();

    const spawnSingleParticle = () => {
      const id = `${effect}-${particleIdCounter.current++}-${Math.random()}`;
      const x = Math.random() * 100; // Percentage across workspace container
      const size = Math.floor(Math.random() * (sizeConfig.max - sizeConfig.min + 1)) + sizeConfig.min;
      
      // Calculate dynamic speed based on gravity scalar control
      const baseDuration = (2.2 + Math.random() * 1.6);
      const duration = baseDuration / gravityScalar; 

      const swayAmount = (Math.random() - 0.5) * 50; 
      const rotateSpeed = (Math.random() - 0.5) * 360; 
      const color = effect === 'balloons' 
        ? BALLOON_COLORS[Math.floor(Math.random() * BALLOON_COLORS.length)] 
        : undefined;

      const newParticle: Particle = {
        id,
        x,
        size,
        duration,
        delay: 0,
        swayAmount,
        rotateSpeed,
        color,
        shapeVariant: Math.floor(Math.random() * 3)
      };

      setParticles(prev => [...prev, newParticle]);
      setTotalSpawned(prev => prev + 1);

      // Clean individual item after animation cycle
      setTimeout(() => {
        setParticles(prev => prev.filter(p => p.id !== id));
      }, (duration + 0.4) * 1000);
    };

    // Instant initial deployment
    spawnSingleParticle();
    
    // Continuous generation loop
    spawnIntervalRef.current = setInterval(() => {
      spawnSingleParticle();
    }, intervalTime);

    // Dynamic animation time elapsed logic
    const updateTimer = () => {
      const now = Date.now();
      const remaining = Math.max(0, endTime - now);
      setTimeRemaining(remaining);

      if (remaining > 0) {
        timerRef.current = requestAnimationFrame(updateTimer);
      } else {
        stopSpawning();
        setActiveEffect('none');
      }
    };

    timerRef.current = requestAnimationFrame(updateTimer);
  };

  return (
    <div id="app-root" className="h-[100vh] w-full bg-slate-950 text-slate-100 font-sans flex flex-col overflow-hidden relative select-none">
      
      {/* 1. TOP NAVIGATION BAR */}
      <nav className="h-16 bg-[#090d16] shrink-0 flex items-center justify-between px-8 text-white border-b-2 border-indigo-500/80 z-50 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 border-radius-[6px] rounded-md grid place-items-center font-black text-white text-center leading-8 shadow-md shadow-indigo-600/35">
            A
          </div>
          <span className="text-lg font-bold tracking-tight text-white uppercase flex items-center gap-2">
            Aero-Dynamics 
            <span className="text-slate-400 font-normal normal-case text-xs tracking-wider">v4.2</span>
          </span>
        </div>
        
        {/* Navigation center categories */}
        <div className="hidden md:flex gap-6 text-xs font-semibold text-slate-400 tracking-wider">
          <span className="hover:text-slate-200 cursor-pointer transition-colors">DASHBOARD</span>
          <span className="text-white border-b-2 border-indigo-500 pb-1.5 px-0.5">SIMULATION</span>
          <span className="hover:text-slate-200 cursor-pointer transition-colors">ANALYTICS</span>
          <span className="hover:text-slate-200 cursor-pointer transition-colors">SETTINGS</span>
        </div>

        {/* Status block directly integrated in nav as professional feedback */}
        <div className="flex items-center gap-2 bg-slate-950/80 py-1.5 px-3 rounded text-xs font-mono border border-slate-800">
          <span className="text-slate-400">STATUS:</span>
          {activeEffect !== 'none' || (timeRemaining > 0) ? (
            <span className="text-emerald-400 font-semibold animate-pulse flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 inline-block animate-ping" />
              RUNNING ({(timeRemaining / 1000).toFixed(1)}s)
            </span>
          ) : (
            <span className="text-slate-300">STANDBY</span>
          )}
        </div>
      </nav>

      {/* 2. MAIN LAYOUT CONTAINER WITH SIDEBAR & PRESENTATION COMPONENT */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* LEFT SIDEBAR PANEL */}
        <aside className="w-[290px] bg-slate-900 border-r border-slate-800 p-6 flex flex-col gap-6 justify-between overflow-y-auto shrink-0 z-40 shadow-xl">
          
          <div className="flex flex-col gap-6">
            
            {/* Header branding / metadata */}
            <div>
              <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                Simulation Parameters
              </h3>
              
              {/* Parameters list layout */}
              <div className="flex flex-col gap-2.5">
                <div className="text-xs text-slate-300 flex justify-between py-1.5 border-b border-slate-800">
                  <span className="font-medium text-slate-400">Duration Cycle</span>
                  <span className="font-bold text-slate-100 bg-slate-950 px-2 py-0.5 rounded text-[10px] border border-slate-800">5.0 seconds</span>
                </div>
                
                <div className="text-xs text-slate-300 flex justify-between py-1.5 border-b border-slate-800">
                  <span className="font-medium text-slate-400">Particle Dim.</span>
                  <span className="font-bold text-indigo-300 bg-indigo-950/50 border border-indigo-500/20 px-2 py-0.5 rounded text-[10px]">
                    Medium Size ✓
                  </span>
                </div>

                <div className="text-xs text-slate-300 flex justify-between py-1.5 border-b border-slate-800 items-center">
                  <span className="font-medium text-slate-400">Gravity Scalar</span>
                  <span className="font-bold text-slate-100 font-mono text-[11px]">{gravityScalar.toFixed(1)}x</span>
                </div>
              </div>
            </div>

            {/* INTERACTIVE COMPONENT ADJUSTERS */}
            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-3.5">
                Manual Override Settings
              </span>

              {/* Gravity control range */}
              <div className="flex flex-col gap-1.5 mb-4">
                <label className="text-[11px] text-slate-300 font-semibold flex justify-between">
                  <span>Speed Gravity Vector:</span>
                  <span className="text-indigo-400 font-mono">{gravityScalar}x</span>
                </label>
                <input 
                  type="range" 
                  min="0.5" 
                  max="2.0" 
                  step="0.1" 
                  value={gravityScalar} 
                  onChange={(e) => setGravityScalar(parseFloat(e.target.value))}
                  className="w-full accent-indigo-500 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Toggle Sizing Mode */}
              <div className="flex flex-col gap-1.5 mb-4">
                <span className="text-[11px] text-slate-300 font-semibold block">Density / Frequency:</span>
                <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-md border border-slate-800">
                  {(['low', 'medium', 'high'] as const).map((intensity) => (
                    <button
                      key={intensity}
                      onClick={() => setSpawnIntensity(intensity)}
                      type="button"
                      className={`text-[10px] py-1 px-1.5 capitalize font-medium rounded-sm cursor-pointer transition-colors ${
                        spawnIntensity === intensity 
                          ? 'bg-indigo-600 text-white shadow-sm' 
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {intensity}
                    </button>
                  ))}
                </div>
              </div>

              {/* Particle size overrides - maintaining fallback but defaulting/mandating medium */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[11px] text-slate-300 font-semibold block">Render Boundaries:</span>
                <div className="grid grid-cols-2 gap-1 bg-slate-950 p-1 rounded-md border border-slate-800">
                  <button
                    onClick={() => setViewportMode('inline')}
                    className={`text-[10px] py-1.5 px-2 font-medium rounded-sm cursor-pointer transition-all flex items-center justify-center gap-1 ${
                      viewportMode === 'inline' 
                        ? 'bg-indigo-600 text-white shadow-xs' 
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Layers className="w-3 h-3" /> Inline Panel
                  </button>
                  <button
                    onClick={() => setViewportMode('fullscreen')}
                    className={`text-[10px] py-1.5 px-2 font-medium rounded-sm cursor-pointer transition-all flex items-center justify-center gap-1 ${
                      viewportMode === 'fullscreen' 
                        ? 'bg-indigo-600 text-white shadow-xs' 
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Monitor className="w-3 h-3" /> Overlay Screen
                  </button>
                </div>
              </div>

            </div>

            {/* REAL-TIME SIMULATED CORE HARDWARE TELEMETRY */}
            <div className="mt-2">
              <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-indigo-400" /> System Telemetry
              </h3>
              
              <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-4 shadow-inner font-mono text-[11px] text-slate-300 flex flex-col gap-2.5">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">PROC GPU LOAD:</span>
                  <span className="font-bold text-slate-200">{cpuUsage}% (Active)</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">VRAM BUFFER:</span>
                  <span className="font-bold text-slate-200">{memUsage}GB / 24GB</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">GRAPHIC DELAY:</span>
                  <span className="font-bold text-slate-200">{latency}ms latency</span>
                </div>
                <div className="flex justify-between items-center border-t border-slate-800/60 pt-2 mt-1">
                  <span className="text-slate-500">ACTIVE FLUIDS:</span>
                  <span className="font-bold text-indigo-400">{particles.length} instances</span>
                </div>
              </div>
            </div>

          </div>

          {/* SIMULATION ACTIONS */}
          <div className="border-t border-slate-850 pt-4 flex flex-col gap-2.5">
            
            {/* Live sound control toggle */}
            <div className="bg-slate-950 border border-slate-805 rounded-xl p-3 flex flex-col gap-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                  {soundEnabled ? <Volume2 className="w-4 h-4 text-indigo-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
                  Sound FX Synthesis
                </span>
                <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded font-mono ${soundEnabled ? 'text-indigo-400 bg-indigo-950/50 border border-indigo-900/30' : 'text-slate-400 bg-slate-800'}`}>
                  {soundEnabled ? 'ON' : 'MUTED'}
                </span>
              </div>
              <button
                id="toggle-sound-btn"
                onClick={() => setSoundEnabled(prev => !prev)}
                className={`py-1.5 px-3 rounded-lg text-xs font-medium cursor-pointer transition-all text-center border ${
                  soundEnabled 
                    ? 'bg-indigo-600 text-white border-indigo-700 hover:bg-indigo-700 shadow-md shadow-indigo-600/15' 
                    : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
                }`}
              >
                {soundEnabled ? 'Mute Sound effects' : 'Enable sound synthesis'}
              </button>
            </div>

            {/* Complete Global Reset Button (Stops and Clears) */}
            <button
              id="global-reset-btn"
              onClick={resetSimulation}
              className="w-full py-2.5 px-3 bg-red-650 hover:bg-red-700 text-white font-semibold rounded-lg text-xs cursor-pointer transition-all flex items-center justify-center gap-1.5 shadow-sm shadow-red-950/20 border border-red-800/30"
              title="Immediately stops ongoing animations and clears all particles"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset Simulator
            </button>

            <button
              id="sidebar-kill-btn"
              onClick={killSimulation}
              disabled={activeEffect === 'none'}
              className="w-full py-2 px-3 bg-rose-950/20 hover:bg-rose-950/40 text-rose-300 border border-rose-900/40 rounded-lg text-xs font-semibold cursor-pointer transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Halt Spawner Only
            </button>
          </div>

        </aside>

        {/* RIGHT CONTENT WORKSPACE & SIMULATION RENDERER */}
        <main className="flex-1 relative p-8 md:p-12 bg-gradient-to-br from-slate-950 via-[#070b13] to-slate-950 flex flex-col overflow-y-auto">
          
          {/* Aesthetic grid overlay & radial glows matching the Cosmic Space console theme */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)] opacity-25 pointer-events-none" />
          <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none" />
          <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] bg-sky-500/5 blur-[110px] rounded-full pointer-events-none" />

          <div className="max-w-4xl w-full mx-auto flex-1 flex flex-col justify-between relative z-10">
            
            {/* INLINE RENDERING PREVIEW PANEL CONTAINER */}
            {viewportMode === 'inline' && (
              <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl z-40">
                <AnimatePresence>
                  {particles.map((particle) => (
                    <RenderParticleItem key={particle.id} particle={particle} />
                  ))}
                </AnimatePresence>
              </div>
            )}

            {/* HEADER CONTROLLER TITLE */}
            <header className="mb-8 text-center relative z-10">
              <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-3 font-display">
                Environment Controller
              </h1>
              <p className="text-sm md:text-base text-slate-400 max-w-xl mx-auto leading-relaxed">
                Deploy procedural environment assets into the current workspace. Each deployment instance remains active for a 5-second processing cycle.
              </p>
            </header>

            {/* COMPONENT INTERACTION CONTAINER (THE TWO MANDATED MAPPED BUTTONS) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-auto max-w-2xl w-full mx-auto relative z-10">
              
              {/* TRIGGER BUTTON: SNOWFLAKES */}
              <button
                id="snow-trigger"
                onClick={() => triggerEffect('snowflakes')}
                className={`btn-action-transition group flex flex-col items-center gap-5 p-8 border rounded-2xl cursor-pointer text-center bg-slate-900/40 backdrop-blur-xs ${
                  activeEffect === 'snowflakes'
                    ? 'border-indigo-500 ring-2 ring-indigo-500/20 shadow-lg shadow-indigo-950/50 bg-slate-900/80'
                    : 'border-slate-850 hover:bg-slate-900/60 hover:border-slate-700'
                }`}
              >
                {/* Simulated circle graphic item */}
                <div className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl shadow-lg transition-transform duration-300 group-hover:scale-115 ${
                  activeEffect === 'snowflakes' ? 'bg-sky-950 text-sky-300 border border-sky-500/30 animate-spin' : 'bg-slate-950 text-sky-400 border border-slate-800'
                }`} style={{ animationDuration: '8s' }}>
                  ❄️
                </div>
                
                <div>
                  <div className="text-lg font-bold text-slate-100 mb-1">
                    Snowflakes
                  </div>
                  <div className="text-xs text-sky-400 font-semibold uppercase tracking-wider">
                    Cascading Top-Down
                  </div>
                </div>

                {/* Instant Active Tracker status */}
                {activeEffect === 'snowflakes' && (
                  <span className="text-[10px] bg-sky-950 border border-sky-500/30 text-sky-300 font-mono py-1 px-3.5 rounded-full absolute top-3 right-3 animate-pulse">
                    GENERATING...
                  </span>
                )}
              </button>

              {/* TRIGGER BUTTON: BALLOONS */}
              <button
                id="balloon-trigger"
                onClick={() => triggerEffect('balloons')}
                className={`btn-action-transition group flex flex-col items-center gap-5 p-8 border rounded-2xl cursor-pointer text-center bg-slate-900/40 backdrop-blur-xs ${
                  activeEffect === 'balloons'
                    ? 'border-indigo-500 ring-2 ring-indigo-500/20 shadow-lg shadow-indigo-950/50 bg-slate-900/80'
                    : 'border-slate-850 hover:bg-slate-900/60 hover:border-slate-700'
                }`}
              >
                <div className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl shadow-lg transition-transform duration-300 group-hover:scale-115 ${
                  activeEffect === 'balloons' ? 'bg-rose-950 text-rose-300 border border-rose-500/30 sway-animation' : 'bg-slate-950 text-rose-400 border border-slate-800'
                }`}>
                  🎈
                </div>

                <div>
                  <div className="text-lg font-bold text-slate-100 mb-1">
                    Balloons
                  </div>
                  <div className="text-xs text-rose-400 font-semibold uppercase tracking-wider">
                    Ascension Bottom-Up
                  </div>
                </div>

                {/* Instant Active Tracker status */}
                {activeEffect === 'balloons' && (
                  <span className="text-[10px] bg-rose-950 border border-rose-500/30 text-rose-300 font-mono py-1 px-3.5 rounded-full absolute top-3 right-3 animate-pulse">
                    GENERATING...
                  </span>
                )}
              </button>

            </div>

            {/* HIGHLY PROMINENT NEW RESET BUTTON (STOPS & CLEARS EVERYTHING ACCORDING TO USER SPEC) */}
            <div className="flex justify-center mt-3 mb-6 relative z-50">
              <button
                id="main-reset-btn"
                onClick={resetSimulation}
                className="btn-action-transition px-10 py-3.5 bg-slate-900 border border-slate-800 hover:border-red-500 text-slate-100 hover:text-white font-bold rounded-2xl text-xs uppercase tracking-widest cursor-pointer transition-all flex items-center justify-center gap-2.5 shadow-md hover:shadow-red-500/10 active:scale-95"
                title="Immediately cease all ongoing operations and empty all render frames"
              >
                <RefreshCw className={`w-4 h-4 text-red-400 ${activeEffect !== 'none' ? 'animate-spin' : ''}`} style={{ animationDuration: '3s' }} />
                Reset Animations & Particles
              </button>
            </div>

            {/* COUNT DOWN INDICATOR BAR */}
            {activeEffect !== 'none' && (
              <div className="max-w-md w-full mx-auto mt-4 px-6 py-3 bg-slate-900 border border-slate-800 rounded-xl shadow-lg text-center relative overflow-hidden z-20">
                <div className="flex justify-between items-center text-xs mb-1.5 font-mono text-slate-400">
                  <span className="uppercase tracking-wider text-[10px]">Active Sequence Frame:</span>
                  <span className="text-indigo-400 font-bold">{(timeRemaining / 1000).toFixed(2)}s left</span>
                </div>
                <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-850">
                  <div 
                    className="h-full bg-indigo-500 transition-all duration-75"
                    style={{ width: `${(timeRemaining / EFFECT_DURATION_MS) * 100}%` }}
                  />
                </div>
              </div>
            )}

            {/* PREDICTIVE RENDERED FOOTER METRIC NUMBERS */}
            <div className="mt-12 border-t border-slate-850 pt-8 flex justify-center gap-16 md:gap-24 relative z-10">
              <div className="text-center">
                <div className="text-3xl font-extrabold text-slate-100 tracking-tight">
                  {totalSpawned || '142'}
                </div>
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mt-1">
                  Assets Simulated
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-extrabold text-slate-100 tracking-tight">
                  99.9%
                </div>
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mt-1">
                  Precision Rank
                </div>
              </div>

              <div className="text-center hidden sm:block">
                <div className="text-3xl font-extrabold text-slate-100 tracking-tight capitalize">
                  {particleSize}
                </div>
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mt-1">
                  Target Dimensions
                </div>
              </div>
            </div>

          </div>

        </main>
      </div>

      {/* 3. FULL SCREEN WINDOW PORTABLE OVERLAY (Standard conditional selection) */}
      {viewportMode === 'fullscreen' && (
        <div className="fixed inset-0 pointer-events-none z-100 overflow-hidden">
          <AnimatePresence>
            {particles.map((particle) => (
              <RenderParticleItem key={particle.id} particle={particle} isFixed />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* 4. FOOTER STATUS BAR */}
      <footer className="h-8 bg-[#090d16] border-t border-slate-900 flex items-center justify-between px-6 text-[11px] text-slate-500 font-mono select-none z-50 shrink-0">
        <div>READY: SIMULATION_ENV_01</div>
        <div className="hidden sm:block text-slate-600">FLEXIBLE GRAPHICS ENGINE: MOTION INTERACTION</div>
        <div>ALGORITHM: ACCELERATED PHYS-L3</div>
      </footer>

    </div>
  );
}

// Optimized particle visual mapping render block
function RenderParticleItem({ 
  particle, 
  isFixed = false 
}: { 
  particle: Particle; 
  isFixed?: boolean; 
  key?: string 
}) {
  const isBalloons = particle.id.includes('balloons');

  // Trajectory direction depending on physical buoyancy (Top down vs Bottom up)
  const initialY = isBalloons ? '110vh' : '-10vh';
  const finalY = isBalloons ? '-10vh' : '110vh';

  return (
    <motion.div
      key={particle.id}
      initial={{ 
        y: initialY, 
        x: `${particle.x}%`,
        opacity: 0,
        rotate: 0,
        scale: 0.8
      }}
      animate={{ 
        y: finalY,
        opacity: [0, 1, 1, 1, 0], // soft rise, static opacity frame, then escape fading
        rotate: particle.rotateSpeed,
        scale: 1,
        // Harmonic side-to-side drift swaying calculation
        x: [
          `calc(${particle.x}% - ${particle.swayAmount * 0.4}px)`,
          `calc(${particle.x}% + ${particle.swayAmount}px)`,
          `calc(${particle.x}% - ${particle.swayAmount * 0.8}px)`,
          `calc(${particle.x}% + ${particle.swayAmount * 0.5}px)`,
        ]
      }}
      exit={{ opacity: 0 }}
      transition={{
        duration: particle.duration,
        ease: 'linear',
        x: {
          duration: particle.duration,
          ease: 'easeInOut',
          times: [0, 0.35, 0.7, 1]
        },
        opacity: {
          times: [0, 0.1, 0.5, 0.85, 1], // fast reveal, long fade out
          duration: particle.duration,
          ease: 'linear'
        }
      }}
      className="absolute pointer-events-none select-none"
      style={{
        zIndex: isFixed ? 9999 : 30,
        width: particle.size,
        height: particle.size,
      }}
    >
      {isBalloons ? (
        // Highly corporate colored balloon design
        <div className="relative flex flex-col items-center justify-center transform -translate-x-1/2 -translate-y-1/2 drop-shadow-[0_8px_16px_rgba(0,0,0,0.18)]">
          <svg 
            viewBox="0 0 32 46" 
            style={{ 
              width: particle.size * 1.3, 
              height: particle.size * 1.85,
              color: particle.color 
            }}
            className="fill-current"
          >
            {/* Soft corporate balloon rendering */}
            <path d="M16 2 C7 2, 2 8, 2 17 C2 26, 7 30, 16 30 C25 30, 30 26, 30 17 C30 8, 25 2, 16 2 Z" />
            <polygon points="14,30 18,30 16,33" />
            <path d="M16,33 Q14,38 18,41 T16,46" stroke="#475569" strokeWidth="1" fill="none" opacity={0.65} />
            <ellipse cx="10" cy="10" rx="3.5" ry="5" fill="#ffffff" opacity={0.4} transform="rotate(-15 10 10)" />
          </svg>
        </div>
      ) : (
        // Beautiful high contrast snowflake vector shape (using Lucide-React internally)
        <div className="relative text-sky-400 flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 drop-shadow-[0_0_8px_rgba(224,242,254,0.6)]">
          <Snowflake 
            size={particle.size} 
            className="text-[#60a5fa] opacity-90 stroke-[1.5]"
          />
        </div>
      )}
    </motion.div>
  );
}
