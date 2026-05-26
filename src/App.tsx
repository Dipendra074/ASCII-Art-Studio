import { useState, useRef } from 'react';
import Header from './components/Header';
import ControlPanel from './components/ControlPanel';
import AsciiCanvas, { AsciiCanvasRef } from './components/AsciiCanvas';
import { AppOptions, ColorMode, AnimationMode, ObjectFitMode } from './types';
import { Sparkles, Camera, Settings, Compass, Info, Terminal } from 'lucide-react';

const DEFAULT_OPTIONS: AppOptions = {
  charset: 'blocks',
  customCharset: ' .,:;i1tfLCG08@',
  colorMode: 'green', // Authentic matrix terminal green default
  textColor: '#00ff00',
  backColor: '#000800',
  trueColor: false,
  animation: 'none',
  brightness: 10,
  contrast: 15,
  invert: false,
  stretch: 1.8,
  objectFit: 'cover',
  resolution: 100,
  fontSize: 10,
  selectedCameraId: '',
};

// Shuffling preset styles to give beautiful creative outputs
const CINEMATIC_THEMES = [
  { text: '#38bdf8', bg: '#030712', name: 'Cyberpunk Aurora (Blue on Slate)' },
  { text: '#f43f5e', bg: '#09050d', name: 'Tokyo Synthwave (Rose on Onyx)' },
  { text: '#06b6d4', bg: '#050c18', name: 'Deep Sea Sonar (Cyan on Oceanic)' },
  { text: '#10b981', bg: '#020617', name: 'Terminal Hack (Emerald on Space)' },
  { text: '#f59e0b', bg: '#090300', name: 'Retro Amber (Amber on Obsidian)' },
  { text: '#d946ef', bg: '#05020c', name: 'Vapor Wave (Magenta on Void)' },
];

export default function App() {
  const [options, setOptions] = useState<AppOptions>(DEFAULT_OPTIONS);
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [isStreamActive, setIsStreamActive] = useState<boolean>(false);
  const [fps, setFps] = useState<number>(0);
  const [dimensions, setDimensions] = useState({ cols: 0, rows: 0 });
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'creative' | 'tips'>('creative');

  const canvasRef = useRef<AsciiCanvasRef>(null);

  // Expose updates back into options
  const handleUpdateOptions = (updater: Partial<AppOptions>) => {
    setOptions((prev) => ({ ...prev, ...updater }));
  };

  const handleDevicesFound = (devices: MediaDeviceInfo[]) => {
    setCameras(devices);
    // Auto sync first camera if none is set
    if (devices.length > 0 && !options.selectedCameraId) {
      handleUpdateOptions({ selectedCameraId: devices[0].deviceId });
    }
  };

  const handleToggleStream = () => {
    setIsStreamActive((prev) => !prev);
  };

  const handleRandomize = () => {
    // Select styling targets and randomize
    const charsets = ['standard', 'blocks', 'binary', 'dots', 'minimal', 'dense', 'arrows', 'stars', 'pipes', 'braille', 'circles'];
    const colorModes: ColorMode[] = ['monochrome', 'green', 'amber', 'custom'];
    const animations: AnimationMode[] = ['none', 'fade', 'matrix', 'typewriter'];
    const objectFits: ObjectFitMode[] = ['cover', 'contain', 'fill'];

    const randomCharset = charsets[Math.floor(Math.random() * charsets.length)];
    const randomColorMode = colorModes[Math.floor(Math.random() * colorModes.length)];
    const randomAnim = animations[Math.floor(Math.random() * animations.length)];
    const randomFit = objectFits[Math.floor(Math.random() * objectFits.length)];

    const randomContrast = Math.floor(Math.random() * 30) - 10; // -10 to 20
    const randomBrightness = Math.floor(Math.random() * 30) - 10; // -10 to 20
    const randomStretch = parseFloat((Math.random() * 0.8 + 1.4).toFixed(1)); // 1.4 to 2.2
    const randomResolution = Math.floor(Math.random() * 60) + 70; // 70 to 130 (safe rendering resolution bounds)

    // Customize Colors randomly if custom is drawn
    const themeIndex = Math.floor(Math.random() * CINEMATIC_THEMES.length);
    const selectedTheme = CINEMATIC_THEMES[themeIndex];

    const isTrueColor = Math.random() > 0.65; // True color mapping toggle chance

    setOptions((prev) => ({
      ...prev,
      charset: randomCharset,
      colorMode: randomColorMode,
      trueColor: isTrueColor,
      textColor: selectedTheme.text,
      backColor: selectedTheme.bg,
      animation: randomAnim,
      objectFit: randomFit,
      brightness: randomBrightness,
      contrast: randomContrast,
      stretch: randomStretch,
      resolution: randomResolution,
      fontSize: 10, // keep font size aligned for density
    }));
  };

  const handleDownloadTxt = () => {
    canvasRef.current?.downloadTxt();
  };

  const handleDownloadPng = () => {
    canvasRef.current?.downloadPng();
  };

  return (
    <div className="min-h-screen bg-[#070708] text-neutral-200 flex flex-col font-sans overflow-hidden">
      {/* Dynamic Animated subtle grid or vapor glow backdrop */}
      <div className="absolute top-0 left-0 w-full h-[350px] bg-gradient-to-b from-purple-500/5 via-transparent to-transparent pointer-events-none z-0" />
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-pink-500/5 rounded-full blur-[120px] pointer-events-none z-0" />

      {/* Header element */}
      <Header
        cameras={cameras}
        selectedCameraId={options.selectedCameraId}
        onCameraChange={(id) => handleUpdateOptions({ selectedCameraId: id })}
        isStreamActive={isStreamActive}
        onToggleStream={handleToggleStream}
        fps={fps}
        cols={dimensions.cols}
        rows={dimensions.rows}
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      {/* Main body: Split screen panels workspace layout */}
      <main className="flex-1 flex flex-col md:flex-row min-h-0 relative z-10 w-full">
        {/* Collaborative/responsive Collapsing glass sidebar controller */}
        <ControlPanel
          options={options}
          onChangeOptions={handleUpdateOptions}
          isOpen={isSidebarOpen}
          onToggleOpen={() => setIsSidebarOpen(!isSidebarOpen)}
          onDownloadTxt={handleDownloadTxt}
          onDownloadPng={handleDownloadPng}
          isStreamActive={isStreamActive}
          onRandomize={handleRandomize}
        />

        {/* Dynamic Art Display Canvas container */}
        <div className="flex-1 flex flex-col min-h-0 bg-[#020202] relative">
          
          {/* Quick info bar inside canvas workspace viewport */}
          <div className="bg-neutral-950/70 border-b border-white/5 py-2 px-4 flex justify-between items-center text-xs font-mono">
            <div className="flex items-center gap-2">
              <Terminal className="h-3.5 w-3.5 text-purple-400" />
              <span className="text-neutral-400 select-none">ASCII Art Sandbox Canvas</span>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Informative Help Badge */}
              <div className="hidden sm:flex items-center gap-1.5 text-neutral-500">
                <Info className="h-3 w-3 text-neutral-400" />
                <span>Adjust settings in the left panel to change glyph sets & resolutions.</span>
              </div>
            </div>
          </div>

          <AsciiCanvas
            ref={canvasRef}
            options={options}
            isStreamActive={isStreamActive}
            onToggleStream={handleToggleStream}
            selectedCameraId={options.selectedCameraId}
            onDevicesFound={handleDevicesFound}
            onFpsUpdate={setFps}
            onDimensionsUpdate={(cols, rows) => setDimensions({ cols, rows })}
          />
        </div>
      </main>
    </div>
  );
}
