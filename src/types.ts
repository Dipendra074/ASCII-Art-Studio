export type ColorMode = 'monochrome' | 'green' | 'amber' | 'custom';
export type AnimationMode = 'none' | 'fade' | 'matrix' | 'typewriter';
export type ObjectFitMode = 'cover' | 'contain' | 'fill';

export interface AppOptions {
  charset: string;
  customCharset: string;
  colorMode: ColorMode;
  textColor: string;
  backColor: string;
  trueColor: boolean;
  animation: AnimationMode;
  brightness: number; // -50 to 50
  contrast: number; // -50 to 50
  invert: boolean;
  stretch: number; // 1.0 to 3.0
  objectFit: ObjectFitMode;
  resolution: number; // 40 to 240
  fontSize: number; // 6 to 24
  selectedCameraId: string;
}

export interface CharsetPreset {
  id: string;
  name: string;
  chars: string;
  icon: string;
}

export const CHARSET_PRESETS: CharsetPreset[] = [
  { id: 'standard', name: 'Standard Ramp', chars: ' .,:;i1tfLCG08@', icon: '📝' },
  { id: 'blocks', name: 'Blocks & Shades', chars: ' ░▒▓█', icon: '🟩' },
  { id: 'binary', name: 'Digital Binary', chars: ' 01', icon: '💻' },
  { id: 'dots', name: 'Dynamic Dots', chars: ' ·•●', icon: '⚫' },
  { id: 'minimal', name: 'Minimalist Dot', chars: ' .:░▒', icon: '◽' },
  { id: 'dense', name: 'Vintage Dense', chars: ' .`\'",:;CjLft1iI!l-_[]{}()|\\/?~+_<>^&*#%@$', icon: '📜' },
  { id: 'arrows', name: 'Arrows Dynamic', chars: ' ←↑→↓↖↗↘↙', icon: '↔️' },
  { id: 'stars', name: 'Cosmic Stars', chars: ' ·*✦★☀', icon: '✨' },
  { id: 'hash', name: 'Matrix Hash', chars: '  .#', icon: '#️⃣' },
  { id: 'pipes', name: 'Structural Pipes', chars: '  |/\\-└┌┐┘├┤┬┴┼', icon: '📐' },
  { id: 'braille', name: 'Tactile Braille', chars: ' ⠁⠃⠇⠏⠟⠿⡿⣿', icon: '⠓' },
  { id: 'circles', name: 'Progressive Circles', chars: ' ○◔◑◕●', icon: '⚪' },
  { id: 'squares', name: 'Symmetric Squares', chars: '  ·▫◽◻⬜', icon: '⬜' },
  { id: 'hearts', name: 'Pixel Hearts', chars: '  ·♥', icon: '❤️' },
  { id: 'math', name: 'Math Equations', chars: '  +-=×÷√∞π', icon: '➕' },
  { id: 'custom', name: 'Custom Ramp', chars: ' .,:;i1tfLCG08@', icon: '🛠️' },
];

export interface ColorPreset {
  id: ColorMode;
  name: string;
  text: string;
  bg: string;
  previewClass: string;
}

export const COLOR_PRESETS: ColorPreset[] = [
  { id: 'monochrome', name: 'Monochrome Slate', text: '#ffffff', bg: '#000000', previewClass: 'from-slate-100 to-slate-900' },
  { id: 'green', name: 'Terminal phosphor', text: '#00ff00', bg: '#000500', previewClass: 'from-emerald-400 to-emerald-950' },
  { id: 'amber', name: 'Vintage Amber', text: '#fbbf24', bg: '#080300', previewClass: 'from-amber-400 to-amber-950' },
  { id: 'custom', name: 'Custom Chromatic', text: '#ec4899', bg: '#030712', previewClass: 'from-purple-500 via-pink-500 to-blue-500' },
];
