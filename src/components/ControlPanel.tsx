import React, { useRef } from 'react';
import {
  Sliders,
  Contrast,
  Sun,
  Palette,
  Eye,
  Download,
  Shuffle,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Layers,
  Expand,
  Type,
  FileDown,
  Image,
  RefreshCw,
} from 'lucide-react';
import {
  AppOptions,
  CHARSET_PRESETS,
  COLOR_PRESETS,
  ColorMode,
  AnimationMode,
  ObjectFitMode,
} from '../types';

interface ControlPanelProps {
  options: AppOptions;
  onChangeOptions: (updater: Partial<AppOptions>) => void;
  isOpen: boolean;
  onToggleOpen: () => void;
  onDownloadTxt: () => void;
  onDownloadPng: () => void;
  isStreamActive: boolean;
  onRandomize: () => void;
}

export default function ControlPanel({
  options,
  onChangeOptions,
  isOpen,
  onToggleOpen,
  onDownloadTxt,
  onDownloadPng,
  isStreamActive,
  onRandomize,
}: ControlPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper inside panel to render standard visual group labels
  const SectionHeader = ({ icon: Icon, title }: { icon: any; title: string }) => (
    <div className="flex items-center gap-2 mb-4 mt-6 first:mt-0 pb-1.5 border-b border-white/5">
      <Icon className="h-4 w-4 text-purple-400" />
      <span className="font-display font-medium text-xs tracking-wider text-neutral-300 uppercase">
        {title}
      </span>
    </div>
  );

  return (
    <div
      className={`relative h-[calc(100vh-65px)] flex transition-all duration-300 z-30 ${
        isOpen ? 'w-full md:w-[380px]' : 'w-0'
      }`}
    >
      {/* Absolute Toggle Button for Sidebar on Right Edge */}
      <button
        onClick={onToggleOpen}
        id="toggle-panel-sidebar-btn"
        className="absolute top-1/2 -right-3 transform -translate-y-1/2 w-6 h-12 bg-neutral-950 border border-white/10 rounded-r-xl flex items-center justify-center hover:bg-neutral-900 text-neutral-400 hover:text-white transition-all shadow-lg cursor-pointer z-40 hidden md:flex"
        title={isOpen ? 'Collapse Panel' : 'Expand Panel'}
      >
        {isOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
      </button>

      {/* Main body wrapper that actually clips content during collapse width change */}
      <div className="w-full h-full border-r border-white/5 bg-neutral-950/70 backdrop-blur-xl flex flex-col overflow-hidden">
        {/* Main Form Fields Container (Scrollable) */}
        <div className="flex-1 overflow-y-auto px-5 py-6 space-y-6">
        {/* RANDOMIZER BADGE */}
        <div className="flex items-center justify-between bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-indigo-500/10 border border-purple-500/30 rounded-xl p-3 shadow-inner">
          <div className="flex flex-col">
            <span className="text-xs font-display font-semibold text-white flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5 text-pink-400 animate-pulse" /> Custom Sandbox
            </span>
            <span className="text-[10px] text-neutral-400">Randomize styling presets</span>
          </div>
          <button
            onClick={onRandomize}
            id="randomize-presets-btn"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 border border-purple-400/30 text-xs font-mono text-white glow-purple hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            <Shuffle className="h-3 w-3" />
            <span>SHUFFLE</span>
          </button>
        </div>

        {/* SECTION 1: CHARSET SELECTION */}
        <div>
          <SectionHeader icon={Type} title="Character Sets" />
          <div className="grid grid-cols-2 gap-2 mt-3">
            {CHARSET_PRESETS.map((preset) => {
              const isSelected = options.charset === preset.id;
              return (
                <button
                  key={preset.id}
                  onClick={() => onChangeOptions({ charset: preset.id })}
                  className={`flex items-center justify-between p-2.5 rounded-lg border text-left transition-all text-xs font-mono ${
                    isSelected
                      ? 'border-purple-500 bg-purple-500/10 text-white shadow-[0_0_12px_rgba(139,92,246,0.15)]'
                      : 'border-white/5 bg-white/[0.02] text-neutral-400 hover:bg-white/5 hover:text-neutral-200'
                  }`}
                >
                  <span className="truncate">{preset.name}</span>
                  <span className="text-base select-none pl-1">{preset.icon}</span>
                </button>
              );
            })}
          </div>

          {/* Custom Charset Input */}
          {options.charset === 'custom' && (
            <div className="mt-3 p-3 bg-neutral-900/50 border border-white/5 rounded-xl space-y-2">
              <label className="block text-[10px] font-mono tracking-widest text-neutral-400 uppercase">
                Custom Character Ramp
              </label>
              <input
                type="text"
                value={options.customCharset}
                onChange={(e) => onChangeOptions({ customCharset: e.target.value })}
                className="w-full bg-neutral-950 border border-white/15 px-3 py-2 rounded-lg font-mono text-xs text-white focus:outline-none focus:border-purple-500 transition-colors"
                placeholder="Type characters from dark to light..."
              />
              <p className="text-[10px] text-neutral-500 font-mono">
                ASCII characters order will map lowest brightness on left to highest mapping on right.
              </p>
            </div>
          )}
        </div>

        {/* SECTION 2: CHROMATIC STYLE */}
        <div>
          <SectionHeader icon={Palette} title="Colors & Chromaticity" />

          {/* Color Presets */}
          <div className="grid grid-cols-2 gap-2 mt-3">
            {COLOR_PRESETS.map((col) => {
              const isSelected = options.colorMode === col.id;
              return (
                <button
                  key={col.id}
                  onClick={() => onChangeOptions({ colorMode: col.id })}
                  className={`relative flex flex-col p-2.5 rounded-lg border text-left transition-all ${
                    isSelected
                      ? 'border-pink-500 bg-pink-500/5 text-white'
                      : 'border-white/5 bg-white/[0.02] text-neutral-400 hover:border-white/10'
                  }`}
                >
                  <span className="font-mono text-xs font-medium">{col.name}</span>
                  <div className={`mt-2 h-1.5 w-full rounded bg-gradient-to-r ${col.previewClass}`} />
                </button>
              );
            })}
          </div>

          {/* True Color Map Toggle */}
          <div className="mt-4 flex items-center justify-between p-3 bg-neutral-900/40 border border-white/5 rounded-xl">
            <div className="flex flex-col">
              <span className="text-xs font-mono font-semibold text-neutral-200">True-Color Mapping</span>
              <span className="text-[10px] text-neutral-500 font-mono">Bind true pixel RGB values from camera</span>
            </div>
            <button
              id="true-color-toggle"
              onClick={() => onChangeOptions({ trueColor: !options.trueColor })}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                options.trueColor ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-neutral-800'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                  options.trueColor ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Inline Custom Colors (Only visible if Custom Color preset selected) */}
          {options.colorMode === 'custom' && !options.trueColor && (
            <div className="mt-3 p-4 bg-neutral-900/50 border border-white/5 rounded-xl grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-mono tracking-wider text-neutral-400 uppercase">
                  Text Glyph Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={options.textColor}
                    id="picker-text-color"
                    onChange={(e) => onChangeOptions({ textColor: e.target.value })}
                    className="w-8 h-8 rounded-lg border-2 border-white/10 bg-transparent cursor-pointer overflow-hidden p-0"
                  />
                  <span className="font-mono text-xs text-neutral-300 uppercase">{options.textColor}</span>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="block text-[10px] font-mono tracking-wider text-neutral-400 uppercase">
                  Background Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={options.backColor}
                    id="picker-back-color"
                    onChange={(e) => onChangeOptions({ backColor: e.target.value })}
                    className="w-8 h-8 rounded-lg border-2 border-white/10 bg-transparent cursor-pointer overflow-hidden p-0"
                  />
                  <span className="font-mono text-xs text-neutral-300 uppercase">{options.backColor}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* SECTION 3: ACETERNITY ANIMATION EFFECTS */}
        <div>
          <SectionHeader icon={Layers} title="Animations & Rendering" />
          <div className="space-y-3">
            <div>
              <label className="block text-[10px] font-mono tracking-wider text-neutral-400 uppercase mb-1.5">
                Render Animation Style
              </label>
              <div className="relative">
                <select
                  id="select-animation-mode"
                  value={options.animation}
                  onChange={(e) => onChangeOptions({ animation: e.target.value as AnimationMode })}
                  className="premium-select w-full bg-neutral-900 border border-white/10 px-3 py-2 rounded-lg font-mono text-xs text-neutral-200 focus:outline-none focus:border-purple-500 transition-colors cursor-pointer pr-10 hover:border-white/20"
                >
                  <option value="none" className="bg-neutral-950">None (Instant Real-time)</option>
                  <option value="fade" className="bg-neutral-950">Fade (Phosphor trails effect)</option>
                  <option value="matrix" className="bg-neutral-950">Matrix Code Rain highlight</option>
                  <option value="typewriter" className="bg-neutral-950">Staggered scanning reveal</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 4: GRID GEOMETRY & FRAMING */}
        <div>
          <SectionHeader icon={Expand} title="Grid & Geometry" />

          {/* Resolutions Selector */}
          <div className="space-y-4">
            {/* Resolution Columns Slider */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-neutral-400">Resolution (Columns)</span>
                <span className="text-purple-400 font-bold">{options.resolution} cols</span>
              </div>
              <input
                type="range"
                min="30"
                max="240"
                step="5"
                value={options.resolution}
                id="slider-resolution"
                onChange={(e) => onChangeOptions({ resolution: parseInt(e.target.value, 10) })}
                className="w-full accent-purple-500 bg-neutral-800 h-1.5 rounded-lg cursor-pointer"
              />
              <p className="text-[10px] text-neutral-500 font-mono">
                Higher values create dense detailed representations, lower values optimize frame rates.
              </p>
            </div>

            {/* Font Size slider */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-neutral-400">Display Font Size</span>
                <span className="text-purple-400 font-bold">{options.fontSize}px</span>
              </div>
              <input
                type="range"
                min="6"
                max="24"
                step="1"
                value={options.fontSize}
                id="slider-font-size"
                onChange={(e) => onChangeOptions({ fontSize: parseInt(e.target.value, 10) })}
                className="w-full accent-purple-500 bg-neutral-800 h-1.5 rounded-lg cursor-pointer"
              />
            </div>

            {/* Aspect Ratio Stretch Slider */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-neutral-400">Monospace Stretcher</span>
                <span className="text-pink-400 font-bold">{options.stretch.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="1.0"
                max="3.0"
                step="0.1"
                value={options.stretch}
                id="slider-stretch"
                onChange={(e) => onChangeOptions({ stretch: parseFloat(e.target.value) })}
                className="w-full accent-pink-500 bg-neutral-800 h-1.5 rounded-lg cursor-pointer"
              />
              <p className="text-[10px] text-neutral-500 font-mono">
                Compensates for tall narrow characters. Standard default is ~1.8.
              </p>
            </div>

            {/* Object Fit Dropdown */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-mono tracking-wider text-neutral-400 uppercase">
                Viewport Object Fit
              </label>
              <div className="relative">
                <select
                  id="select-object-fit"
                  value={options.objectFit}
                  onChange={(e) => onChangeOptions({ objectFit: e.target.value as ObjectFitMode })}
                  className="premium-select w-full bg-neutral-900 border border-white/10 px-3 py-2 rounded-lg font-mono text-xs text-neutral-200 focus:outline-none focus:border-purple-500 transition-colors cursor-pointer pr-10 hover:border-white/20"
                >
                  <option value="cover" className="bg-neutral-950">Cover (Full Screen Fill & Crop)</option>
                  <option value="contain" className="bg-neutral-950">Contain (Full Aspect Letterbox)</option>
                  <option value="fill" className="bg-neutral-950">Fill (Stretch-to-Fit Canvas)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 5: IMAGE FILTERS ADJUSTMENT */}
        <div>
          <SectionHeader icon={Sun} title="Image Filters" />
          <div className="space-y-4">
            {/* Brightness */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-neutral-400">Brightness Offset</span>
                <span className={`font-bold ${options.brightness >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {options.brightness >= 0 ? `+${options.brightness}` : options.brightness}
                </span>
              </div>
              <input
                type="range"
                min="-50"
                max="50"
                step="2"
                value={options.brightness}
                id="slider-brightness"
                onChange={(e) => onChangeOptions({ brightness: parseInt(e.target.value, 10) })}
                className="w-full accent-purple-500 bg-neutral-800 h-1.5 rounded-lg cursor-pointer"
              />
            </div>

            {/* Contrast */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-neutral-400">Luminance Contrast</span>
                <span className={`font-bold ${options.contrast >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {options.contrast >= 0 ? `+${options.contrast}` : options.contrast}
                </span>
              </div>
              <input
                type="range"
                min="-50"
                max="50"
                step="2"
                value={options.contrast}
                id="slider-contrast"
                onChange={(e) => onChangeOptions({ contrast: parseInt(e.target.value, 10) })}
                className="w-full accent-purple-500 bg-neutral-800 h-1.5 rounded-lg cursor-pointer"
              />
            </div>

            {/* Invert toggle */}
            <div className="flex items-center justify-between p-3 bg-neutral-900/40 border border-white/5 rounded-xl">
              <div className="flex flex-col">
                <span className="text-xs font-mono font-semibold text-neutral-200">Invert Palette</span>
                <span className="text-[10px] text-neutral-500 font-mono">Flip character ramp selection order</span>
              </div>
              <button
                id="invert-toggle"
                onClick={() => onChangeOptions({ invert: !options.invert })}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  options.invert ? 'bg-indigo-500' : 'bg-neutral-800'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    options.invert ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER ACTION BUTTONS: EXPORT CONTROLS */}
      <div className="p-4 border-t border-white/5 bg-neutral-950/95 space-y-3">
        <label className="block text-[9px] font-mono tracking-widest text-neutral-500 uppercase text-center mb-0.5">
          Export Creation Engine
        </label>
        <div className="grid grid-cols-2 gap-2">
          {/* Download Raw TXT */}
          <button
            onClick={onDownloadTxt}
            disabled={!isStreamActive}
            id="download-txt-btn"
            className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-neutral-900 border border-white/10 hover:border-purple-500/80 text-xs font-mono text-neutral-300 hover:text-white glow-purple transition-all cursor-pointer disabled:opacity-40 disabled:pointer-events-none"
            title="Download frame as a standard text file"
          >
            <FileDown className="h-4 w-4 text-purple-400" />
            <span>TXT FILE</span>
          </button>

          {/* Download Canvas PNG */}
          <button
            onClick={onDownloadPng}
            disabled={!isStreamActive}
            id="download-png-btn"
            className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-xs font-mono text-white transition-all cursor-pointer disabled:opacity-40 disabled:pointer-events-none glow-pink shadow-lg"
            title="Download ASCII visual rendering as high-res PNG image"
          >
            <Image className="h-4 w-4" />
            <span>PNG ART</span>
          </button>
        </div>

        {/* DIPENDRA SINGH CREDIT LINE */}
        <div className="pt-2 text-[10px] font-mono text-center text-neutral-500 border-t border-white/5">
          Created by <span className="text-purple-400 font-semibold uppercase tracking-wider">Dipendra Singh</span>
        </div>
      </div>
    </div>
  </div>
  );
}
