import { Camera, CameraOff, Monitor, Settings, Sparkles, Video } from 'lucide-react';

interface HeaderProps {
  cameras: MediaDeviceInfo[];
  selectedCameraId: string;
  onCameraChange: (id: string) => void;
  isStreamActive: boolean;
  onToggleStream: () => void;
  fps: number;
  cols: number;
  rows: number;
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
}

export default function Header({
  cameras,
  selectedCameraId,
  onCameraChange,
  isStreamActive,
  onToggleStream,
  fps,
  cols,
  rows,
  isSidebarOpen,
  onToggleSidebar,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full bg-neutral-950/85 backdrop-blur-md px-4 py-3 flex flex-wrap items-center justify-between gap-4 flowing-gradient-border">
      {/* Brand Logo and Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          id="toggle-sidebar-btn"
          className="p-2 mr-1 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white transition-all md:hidden"
          title="Toggle Control Panel"
        >
          <Settings className={`h-4 w-4 ${isSidebarOpen ? 'text-purple-400 rotate-180 transition-all duration-500' : ''}`} />
        </button>
        <div className="flex items-center gap-2">
          <div className="relative flex items-center justify-center w-9 h-9 rounded-xl overflow-hidden bg-gradient-to-tr from-purple-600 via-pink-600 to-indigo-600 shadow-[0_0_15px_rgba(168,85,247,0.4)]">
            <Sparkles className="h-5 w-5 text-white animate-pulse" />
          </div>
          <div>
            <h1 className="font-display font-bold text-lg md:text-xl tracking-tight bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-300 bg-clip-text text-transparent">
              ASCII Art Studio &trade;
            </h1>
            <p className="text-[10px] font-mono text-neutral-500 hidden sm:flex items-center gap-2">
              <span>CREATED BY DIPENDRA SINGH</span>
              <span>•</span>
              <span className="text-purple-400/80 animate-pulse">LIVE RENDERER</span>
            </p>
          </div>
        </div>
      </div>

      {/* Connection & Cam Selector */}
      <div className="flex items-center flex-wrap gap-3">
        {/* Cam Selection dropdown */}
        {cameras.length > 0 && (
          <div className="flex items-center bg-neutral-900 border border-white/10 rounded-lg overflow-hidden px-3 hover:border-purple-500/50 transition-all">
            <Video className="h-4 w-4 text-purple-400 mr-2" />
            <select
              id="camera-select"
              value={selectedCameraId}
              onChange={(e) => onCameraChange(e.target.value)}
              className="premium-select bg-neutral-900 border-none text-xs text-neutral-200 py-1.5 focus:outline-none cursor-pointer pr-8 font-mono"
            >
              {cameras.map((cam) => (
                <option key={cam.deviceId} value={cam.deviceId} className="bg-neutral-950 text-neutral-300">
                  {cam.label || `Camera ${cameras.indexOf(cam) + 1}`}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Play / Pause Toggle Button */}
        <button
          onClick={onToggleStream}
          id="toggle-camera-btn"
          className={`px-4 py-2 rounded-lg font-mono text-xs flex items-center gap-1.5 border transition-all cursor-pointer ${
            isStreamActive
              ? 'bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20 active:scale-95'
              : 'bg-gradient-to-r from-purple-600 to-indigo-600 border-purple-500/40 text-white glow-purple active:scale-95'
          }`}
        >
          {isStreamActive ? (
            <>
              <CameraOff className="h-3.5 w-3.5 animate-pulse" />
              <span>PAUSE CAM</span>
            </>
          ) : (
            <>
              <Camera className="h-3.5 w-3.5" />
              <span>START CAM</span>
            </>
          )}
        </button>

        {/* Real-time Status Badge */}
        <div className="flex items-center gap-2 bg-neutral-950/50 font-mono text-xs text-neutral-400 px-3 py-1.5 rounded-lg border border-white/5">
          <div className="flex items-center gap-1.5 mr-2">
            <span
              className={`inline-block w-2.5 h-2.5 rounded-full ${
                isStreamActive ? 'bg-green-500 shadow-[0_0_10px_#22c55e]' : 'bg-red-500/50'
              }`}
            />
            <span className="text-[11px] font-medium text-neutral-300 uppercase">
              {isStreamActive ? 'Live' : 'Standby'}
            </span>
          </div>
          <span className="hidden sm:inline-block text-neutral-600">|</span>
          <div className="hidden sm:flex items-center gap-1 whitespace-nowrap">
            <Monitor className="h-3 w-3 text-neutral-500" />
            <span>
              {cols}×{rows} ASCII
            </span>
          </div>
          <span className="text-neutral-600">|</span>
          <span className="whitespace-nowrap font-bold text-neutral-200">{fps} FPS</span>
        </div>
      </div>
    </header>
  );
}

