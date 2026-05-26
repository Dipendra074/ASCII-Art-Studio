import React, {
  useImperativeHandle,
  forwardRef,
  useRef,
  useEffect,
  useState,
} from 'react';
import { AppOptions, CHARSET_PRESETS, COLOR_PRESETS } from '../types';

interface AsciiCanvasProps {
  options: AppOptions;
  isStreamActive: boolean;
  onToggleStream: () => void;
  selectedCameraId: string;
  onDevicesFound: (devices: MediaDeviceInfo[]) => void;
  onFpsUpdate: (fps: number) => void;
  onDimensionsUpdate: (cols: number, rows: number) => void;
}

export interface AsciiCanvasRef {
  downloadTxt: () => void;
  downloadPng: () => void;
}

// Convert Hex colors to RGBA for trail-blending and canvas clearing
function hexToRgba(hex: string, alpha: number): string {
  const cleanHex = hex.replace('#', '');
  const r = parseInt(cleanHex.substring(0, 2), 16) || 0;
  const g = parseInt(cleanHex.substring(2, 4), 16) || 0;
  const b = parseInt(cleanHex.substring(4, 6), 16) || 0;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

const AsciiCanvas = forwardRef<AsciiCanvasRef, AsciiCanvasProps>(
  (
    {
      options,
      isStreamActive,
      onToggleStream,
      selectedCameraId,
      onDevicesFound,
      onFpsUpdate,
      onDimensionsUpdate,
    },
    ref
  ) => {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const mainCanvasRef = useRef<HTMLCanvasElement | null>(null);
    const offscreenCanvasRef = useRef<HTMLCanvasElement | null>(null);
    const streamRef = useRef<MediaStream | null>(null);

    const onDevicesFoundRef = useRef(onDevicesFound);
    const onFpsUpdateRef = useRef(onFpsUpdate);
    const onDimensionsUpdateRef = useRef(onDimensionsUpdate);
    const onToggleStreamRef = useRef(onToggleStream);

    useEffect(() => {
      onDevicesFoundRef.current = onDevicesFound;
    }, [onDevicesFound]);

    useEffect(() => {
      onFpsUpdateRef.current = onFpsUpdate;
    }, [onFpsUpdate]);

    useEffect(() => {
      onDimensionsUpdateRef.current = onDimensionsUpdate;
    }, [onDimensionsUpdate]);

    useEffect(() => {
      onToggleStreamRef.current = onToggleStream;
    }, [onToggleStream]);

    const lastDimensionsRef = useRef({ cols: 0, rows: 0 });

    // Matrix Rain animation drop positions state
    const matrixDropsRef = useRef<number[]>([]);
    const typewriterScanColRef = useRef<number>(0);

    // Track frame rate counters
    const fpsTrackerRef = useRef({
      frameCount: 0,
      lastFpsUpdate: 0,
    });

    // Reference to the active ASCII characters currently drawn, for Download TXT action
    const currentAsciiCacheRef = useRef<string[][]>([]);

    // Expose actions to parent so ControlPanel triggers exports cleanly
    useImperativeHandle(ref, () => ({
      downloadTxt() {
        if (currentAsciiCacheRef.current.length === 0) return;
        const textContent = currentAsciiCacheRef.current
          .map((row) => row.join(''))
          .join('\n');
        const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `ascii-art-studio-${Date.now()}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      },
      downloadPng() {
        const canvas = mainCanvasRef.current;
        if (!canvas) return;
        const url = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = url;
        link.download = `ascii-art-studio-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      },
    }));

    // Enumerate connected media gadgets
    useEffect(() => {
      const getCameras = async () => {
        try {
          // Ask for permissions early if camera starts
          const devices = await navigator.mediaDevices.enumerateDevices();
          const videoInputCams = devices.filter((d) => d.kind === 'videoinput');
          onDevicesFoundRef.current(videoInputCams);
        } catch (e) {
          console.error('Failed to locate camera equipment:', e);
        }
      };

      getCameras();

      // Setup list change listeners if supporting devices shifts
      navigator.mediaDevices.addEventListener('devicechange', getCameras);
      return () => {
        navigator.mediaDevices.removeEventListener('devicechange', getCameras);
      };
    }, []);

    // Webcam Access Lifecycle
    useEffect(() => {
      // Shutdown previous streams
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }

      if (!isStreamActive) {
        return;
      }

      const initiateWebcam = async () => {
        const constraints: MediaStreamConstraints = {
          video: selectedCameraId
            ? {
                deviceId: { exact: selectedCameraId },
                width: { ideal: 640 },
                height: { ideal: 480 },
              }
            : {
                width: { ideal: 640 },
                height: { ideal: 480 },
              },
        };

        try {
          const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
          streamRef.current = mediaStream;

          // Wire stream to video
          if (videoRef.current) {
            videoRef.current.srcObject = mediaStream;
            videoRef.current.onloadedmetadata = () => {
              videoRef.current?.play().catch((e) => console.log('Video play failed', e));
            };
          }
        } catch (err) {
          console.error('Error starting live video transmit:', err);
          // Auto disable switch
          onToggleStreamRef.current();
        }
      };

      initiateWebcam();

      return () => {
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
        }
      };
    }, [selectedCameraId, isStreamActive]);

    // Standard animation and analytical render cycles
    useEffect(() => {
      let animationFrameId: number;

      // Ensure offscreen initialization
      if (!offscreenCanvasRef.current) {
        offscreenCanvasRef.current = document.createElement('canvas');
      }

      const renderLoop = () => {
        const video = videoRef.current;
        const mainCanvas = mainCanvasRef.current;
        const offscreenCanvas = offscreenCanvasRef.current;

        if (!mainCanvas || !offscreenCanvas) {
          animationFrameId = requestAnimationFrame(renderLoop);
          return;
        }

        const mainCtx = mainCanvas.getContext('2d');
        const offscreenCtx = offscreenCanvas.getContext('2d');

        if (!mainCtx || !offscreenCtx) {
          animationFrameId = requestAnimationFrame(renderLoop);
          return;
        }

        // 1. Color mapping setup
        let activeBgColor = '#000000';
        let activeTextColor = '#ffffff';

        if (options.colorMode === 'green') {
          activeBgColor = '#000500';
          activeTextColor = '#00ff00';
        } else if (options.colorMode === 'amber') {
          activeBgColor = '#080300';
          activeTextColor = '#fbbf24';
        } else if (options.colorMode === 'custom') {
          activeBgColor = options.backColor;
          activeTextColor = options.textColor;
        }

        // Draw basic layout specs
        const cols = options.resolution;
        const cellHeight = options.fontSize;
        // Compensate spacing horizontally for widescreen typography stretch
        const cellWidth = Math.round(options.fontSize * 0.55 * options.stretch);

        // Fetch character map matching options selection
        let charsetString = ' .,:;i1tfLCG08@';
        const activePreset = CHARSET_PRESETS.find((p) => p.id === options.charset);
        if (activePreset) {
          if (activePreset.id === 'custom') {
            charsetString = options.customCharset || ' ';
          } else {
            charsetString = presetCharsToUse(activePreset.id);
          }
        }

        // Safely fallback
        if (!charsetString) charsetString = ' ';

        // 2. Decide drawing context (Live Webcam active vs. Screensaver animated state)
        if (isStreamActive && video && video.readyState >= 2) {
          const videoWidth = video.videoWidth || 640;
          const videoHeight = video.videoHeight || 480;

          // Compensating height row allocation for character sizing
          const videoAspect = videoWidth / videoHeight;
          const rows = Math.round((cols / videoAspect) * (options.stretch / 1.5)) || 1;

          if (lastDimensionsRef.current.cols !== cols || lastDimensionsRef.current.rows !== rows) {
            lastDimensionsRef.current = { cols, rows };
            onDimensionsUpdateRef.current(cols, rows);
          }

          // Update offscreen dimension
          if (offscreenCanvas.width !== cols || offscreenCanvas.height !== rows) {
            offscreenCanvas.width = cols;
            offscreenCanvas.height = rows;
          }

          // Render video onto offscreen with viewport objectFit configuration
          offscreenCtx.fillStyle = '#0a0a0a';
          offscreenCtx.fillRect(0, 0, cols, rows);

          const gridAspect = cols / rows; // canvas layout mapping

          if (options.objectFit === 'fill') {
            offscreenCtx.drawImage(video, 0, 0, videoWidth, videoHeight, 0, 0, cols, rows);
          } else if (options.objectFit === 'cover') {
            let sx = 0,
              sy = 0,
              sw = videoWidth,
              sh = videoHeight;
            if (videoAspect > gridAspect) {
              // Video wider than canvas viewport -> clip sides
              sw = videoHeight * gridAspect;
              sx = (videoWidth - sw) / 2;
            } else {
              // Video taller than canvas viewport -> clip top/bottom
              sh = videoWidth / gridAspect;
              sy = (videoHeight - sh) / 2;
            }
            offscreenCtx.drawImage(video, sx, sy, sw, sh, 0, 0, cols, rows);
          } else if (options.objectFit === 'contain') {
            let dx = 0,
              dy = 0,
              dw = cols,
              dh = rows;
            if (videoAspect > gridAspect) {
              // Video wider -> crop vertical offset letters
              dh = cols / videoAspect;
              dy = (rows - dh) / 2;
            } else {
              // Video taller -> pillarbox sides
              dw = rows * videoAspect;
              dx = (cols - dw) / 2;
            }
            offscreenCtx.drawImage(
              video,
              0,
              0,
              videoWidth,
              videoHeight,
              Math.max(0, dx),
              Math.max(0, dy),
              Math.min(cols, dw),
              Math.min(rows, dh)
            );
          }

          const imgData = offscreenCtx.getImageData(0, 0, cols, rows);
          const pixels = imgData.data;

          // Resize main onscreen canvas
          if (mainCanvas.width !== cols * cellWidth || mainCanvas.height !== rows * cellHeight) {
            mainCanvas.width = cols * cellWidth;
            mainCanvas.height = rows * cellHeight;
          }

          // Clear main canvas backings with fade-trails (HMR phosphor look) support
          if (options.animation === 'fade') {
            mainCtx.fillStyle = hexToRgba(activeBgColor, 0.22);
            mainCtx.fillRect(0, 0, mainCanvas.width, mainCanvas.height);
          } else {
            mainCtx.fillStyle = activeBgColor;
            mainCtx.fillRect(0, 0, mainCanvas.width, mainCanvas.height);
          }

          // Draw ASCII
          mainCtx.font = `bold ${options.fontSize}px "JetBrains Mono", "Fira Code", monospace`;
          mainCtx.textBaseline = 'top';

          // Ensure drop matrix tracker capacity
          if (matrixDropsRef.current.length !== cols) {
            matrixDropsRef.current = Array(cols)
              .fill(0)
              .map(() => Math.floor(Math.random() * -100));
          }

          // Increment Typewriter sweep indexes
          if (options.animation === 'typewriter') {
            typewriterScanColRef.current += 1.5;
            if (typewriterScanColRef.current >= cols) {
              typewriterScanColRef.current = 0;
            }
          }

          // Build local cache for text export
          const currentAsciiGrid: string[][] = Array(rows)
            .fill(null)
            .map(() => Array(cols).fill(' '));

          // Draw cells line by line
          for (let y = 0; y < rows; y++) {
            // Update rain positions
            const dropY = Math.floor(matrixDropsRef.current[y] || 0);

            for (let x = 0; x < cols; x++) {
              const pixelIndex = (y * cols + x) * 4;
              let r = pixels[pixelIndex];
              let g = pixels[pixelIndex + 1];
              let b = pixels[pixelIndex + 2];

              // Filter brightness
              if (options.brightness !== 0) {
                r += options.brightness;
                g += options.brightness;
                b += options.brightness;
              }

              // Filter contrast
              if (options.contrast !== 0) {
                const factor = (259 * (options.contrast + 255)) / (255 * (259 - options.contrast));
                r = factor * (r - 128) + 128;
                g = factor * (g - 128) + 128;
                b = factor * (b - 128) + 128;
              }

              // Clamp rgb values
              r = Math.min(255, Math.max(0, r));
              g = Math.min(255, Math.max(0, g));
              b = Math.min(255, Math.max(0, b));

              // Compute standard photorealistic luminance:
              const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;

              // Character extraction with inversion support
              let charIndex = Math.floor((luminance / 255) * (charsetString.length - 1));
              if (options.invert) {
                charIndex = charsetString.length - 1 - charIndex;
              }
              // Clamp char index
              charIndex = Math.min(charsetString.length - 1, Math.max(0, charIndex));

              const char = charsetString[charIndex] || ' ';
              currentAsciiGrid[y][x] = char;

              // Determine design colors representing animations
              let displayTextColor = activeTextColor;

              if (options.trueColor) {
                displayTextColor = `rgb(${r}, ${g}, ${b})`;
              }

              // Apply typewriter sweep checks
              if (options.animation === 'typewriter' && x > typewriterScanColRef.current) {
                continue; // skip rendering untyped characters
              }

              // Rain Code overlay logic
              if (options.animation === 'matrix') {
                const dripHead = Math.floor(matrixDropsRef.current[x] || 0);
                const dripDiff = y - dripHead;

                if (y === dripHead) {
                  // White head falling down
                  displayTextColor = '#ffffff';
                } else if (dripDiff > 0 && dripDiff < 15) {
                  // Standard trail fading
                  const fadeRatio = 1 - dripDiff / 15;
                  // Merge text target chromaticity with Matrix green look
                  if (options.trueColor) {
                    displayTextColor = `rgba(${r * fadeRatio}, ${g * fadeRatio + 150 * (1 - fadeRatio)}, ${b * fadeRatio}, ${fadeRatio})`;
                  } else {
                    displayTextColor = hexToRgba('#00ff00', fadeRatio);
                  }
                } else {
                  // Dim standard background characters slightly to make dripping pop
                  if (options.trueColor) {
                    displayTextColor = `rgba(${r * 0.3}, ${g * 0.3}, ${b * 0.3}, 0.35)`;
                  } else {
                    displayTextColor = hexToRgba(activeTextColor, 0.25);
                  }
                }
              }

              // Complete fill
              mainCtx.fillStyle = displayTextColor;
              mainCtx.fillText(char, x * cellWidth, y * cellHeight);
            }

            // Slide Matrix column trackers
            if (options.animation === 'matrix') {
              matrixDropsRef.current = matrixDropsRef.current.map((dropY, colIndex) => {
                let currentY = dropY + 0.35 + Math.random() * 0.15; // smooth gravity falls
                if (currentY >= rows) {
                  currentY = -Math.floor(Math.random() * 60);
                }
                return currentY;
              });
            }
          }

          // Cache grid characters
          currentAsciiCacheRef.current = currentAsciiGrid;
        } else {
          // --- STANDBY SCREENSAVER TERMINAL GRID ---
          const rows = Math.round(cols * 0.45) || 1;
          if (lastDimensionsRef.current.cols !== cols || lastDimensionsRef.current.rows !== rows) {
            lastDimensionsRef.current = { cols, rows };
            onDimensionsUpdateRef.current(cols, rows);
          }

          if (mainCanvas.width !== cols * cellWidth || mainCanvas.height !== rows * cellHeight) {
            mainCanvas.width = cols * cellWidth;
            mainCanvas.height = rows * cellHeight;
          }

          mainCtx.fillStyle = activeBgColor;
          mainCtx.fillRect(0, 0, mainCanvas.width, mainCanvas.height);

          mainCtx.font = `bold ${options.fontSize}px "JetBrains Mono", "Fira Code", monospace`;
          mainCtx.textBaseline = 'top';

          // Create standard oscillating sine wave lines or circular radar maps for standby visual aesthetic
          const timestamp = performance.now() * 0.0015;

          for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
              // Mathematical art functions:
              // Vector ring mapping + scrolling ripples
              const centerX = cols / 2;
              const centerY = rows / 2;
              const dx = x - centerX;
              const dy = y - centerY;
              const dist = Math.sqrt(dx * dx + (dy * dy * 2.5)); // stretched sphere
              
              const sinVal = Math.sin(dist * 0.15 - timestamp);
              const cosVal = Math.cos((x * 0.05) + (y * 0.1) - timestamp * 0.5);
              const waveVal = Math.sin(x * 0.1 + timestamp) * 5 + centerY;

              // Generate custom aesthetic standby layouts
              let luminance = Math.floor((sinVal + 1.0) * 127.5);
              
              // Draw text scanning bars
              if (Math.abs(y - waveVal) < 1.0) {
                luminance = 255; // highlight wave line
              }

              // Apply grid margins checks to highlight boundaries
              if (x === 0 || x === cols - 1 || y === 0 || y === rows - 1) {
                luminance = 180;
              }

              let charIndex = Math.floor((luminance / 255) * (charsetString.length - 1));
              charIndex = Math.min(charsetString.length - 1, Math.max(0, charIndex));
              const char = charsetString[charIndex] || ' ';

              // Pulse textcolor on screensaver
              const opacity = 0.15 + (luminance / 255) * 0.85;
              mainCtx.fillStyle = hexToRgba(activeTextColor, opacity);
              mainCtx.fillText(char, x * cellWidth, y * cellHeight);
            }
          }

          // Draw large technical details inside standby bounding boxes overlay
          mainCtx.fillStyle = '#ffffff';
          mainCtx.font = 'bold 24px "Helvetica Neue", Helvetica, Arial, sans-serif';
          
          const labelText = isStreamActive ? "Transmitting..." : "CH-01: READY TO TRANSMIT";
          const labelY = mainCanvas.height * 0.42;
          
          // Outer overlay card backings
          mainCtx.fillStyle = 'rgba(10,10,10,0.85)';
          const boxWidth = 380;
          const boxHeight = 110;
          mainCtx.fillRect((mainCanvas.width - boxWidth) / 2, labelY - 25, boxWidth, boxHeight);
          
          mainCtx.strokeStyle = 'rgba(139, 92, 246, 0.4)';
          mainCtx.lineWidth = 1;
          mainCtx.strokeRect((mainCanvas.width - boxWidth) / 2, labelY - 25, boxWidth, boxHeight);

          // Render centered warnings
          mainCtx.fillStyle = activeTextColor;
          mainCtx.font = 'bold 15px "Helvetica Neue", Helvetica, Arial, sans-serif';
          mainCtx.fillText(labelText, (mainCanvas.width - mainCtx.measureText(labelText).width) / 2, labelY - 5);

          mainCtx.fillStyle = 'rgba(156, 163, 175, 0.8)';
          mainCtx.font = 'normal 11px "JetBrains Mono", monospace';
          const commandText = "CLICK 'START CAM' TO PROCESS CHROMATIC STREAM";
          mainCtx.fillText(commandText, (mainCanvas.width - mainCtx.measureText(commandText).width) / 2, labelY + 22);

          const signalText = `GRID: ${cols}×${rows} // CHSET: ${options.charset.toUpperCase()} // STATUS: STANDBY_ON`;
          mainCtx.fillStyle = 'rgba(139, 92, 246, 0.8)';
          mainCtx.font = 'bold 9px "JetBrains Mono", monospace';
          mainCtx.fillText(signalText, (mainCanvas.width - mainCtx.measureText(signalText).width) / 2, labelY + 44);
        }

        // 3. Count frames to monitor rendering FPS bandwidth
        const track = fpsTrackerRef.current;
        track.frameCount++;
        const currentMs = performance.now();
        if (currentMs - track.lastFpsUpdate >= 1000) {
          const fps = Math.round((track.frameCount * 1000) / (currentMs - track.lastFpsUpdate));
          onFpsUpdateRef.current(fps);
          track.frameCount = 0;
          track.lastFpsUpdate = currentMs;
        }

        animationFrameId = requestAnimationFrame(renderLoop);
      };

      animationFrameId = requestAnimationFrame(renderLoop);

      return () => {
        cancelAnimationFrame(animationFrameId);
      };
    }, [options, isStreamActive]);

    // Char presets definitions mappings helper
    function presetCharsToUse(id: string): string {
      const p = CHARSET_PRESETS.find((v) => v.id === id);
      return p ? p.chars : ' .,:;i1tfLCG08@';
    }

    return (
      <div className="relative flex-1 bg-black flex items-center justify-center p-4 md:p-8 min-h-0 select-none overflow-hidden matrix-grid-overlay">
        {/* Real hidden video capture */}
        <video
          ref={videoRef}
          style={{ display: 'none' }}
          playsInline
          muted
        />

        {/* Dynamic Display Canvas Box */}
        <div className="relative w-full h-full max-w-full max-h-full flex items-center justify-center">
          {/* Accent lighting dots over corners */}
          <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-purple-500/35 rounded-tl-lg pointer-events-none" />
          <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-purple-500/35 rounded-tr-lg pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-purple-500/35 rounded-bl-lg pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-purple-500/35 rounded-br-lg pointer-events-none" />

          {/* Active Canvas Renders */}
          <div className="relative max-w-full max-h-[85vh] p-2 border border-white/5 bg-neutral-950/80 rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.9)] flex items-center justify-center">
            <canvas
              ref={mainCanvasRef}
              className="max-w-full max-h-[80vh] object-contain block select-none bg-black"
            />
          </div>
        </div>
      </div>
    );
  }
);

AsciiCanvas.displayName = 'AsciiCanvas';

export default AsciiCanvas;
