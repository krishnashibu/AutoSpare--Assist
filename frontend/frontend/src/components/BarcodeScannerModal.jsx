import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Camera, 
  Volume2, 
  VolumeX, 
  Plus, 
  CheckCircle2, 
  Scan,
  RefreshCw,
  Search,
  AlertCircle,
  UploadCloud,
  VideoOff,
  SwitchCamera
} from 'lucide-react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { findProductByBarcode } from '../services/posService';

export const BarcodeScannerModal = ({ isOpen, onClose, onAddToCart, addToast }) => {
  const [barcodeInput, setBarcodeInput] = useState('');
  const [scannedProduct, setScannedProduct] = useState(null);
  const [unrecognizedCode, setUnrecognizedCode] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [cameraStatus, setCameraStatus] = useState('initializing'); // 'initializing' | 'active' | 'error' | 'permission_denied'
  const [cameras, setCameras] = useState([]);
  const [selectedCameraId, setSelectedCameraId] = useState('');
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [lastScannedTime, setLastScannedTime] = useState(0);

  const scannerRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);
  const isStoppingRef = useRef(false);

  // Sound feedback
  const playBeep = () => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1950, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.12);
    } catch (e) {
      // Audio context might be restricted before user gesture
    }
  };

  // Handle successful barcode recognition
  const handleBarcodeIdentified = (code) => {
    if (!code || !code.trim()) return;
    const now = Date.now();
    // Debounce duplicate scans within 1.5s
    if (now - lastScannedTime < 1500 && scannedProduct?.code === code.trim()) {
      return;
    }
    setLastScannedTime(now);

    const match = findProductByBarcode(code.trim());
    if (match) {
      playBeep();
      setScannedProduct(match);
      setUnrecognizedCode(null);
      setBarcodeInput(code.trim());
      addToast({
        type: 'success',
        title: 'Barcode Scanned via Webcam',
        message: `${match.name} (₹${match.rate.toLocaleString()}) identified.`
      });
    } else {
      setScannedProduct(null);
      setUnrecognizedCode(code.trim());
      setBarcodeInput(code.trim());
      addToast({
        type: 'warning',
        title: 'Uncataloged Barcode',
        message: `Scanned code "${code.trim()}" not found in inventory catalog.`
      });
    }
  };

  // Initialize and start Html5Qrcode scanner
  const startScanner = async (cameraIdToUse) => {
    setCameraStatus('initializing');
    setScannedProduct(null);
    setUnrecognizedCode(null);

    // Stop any existing scanner first
    await stopScanner();

    try {
      // 1. Enumerate available video devices
      const devices = await Html5Qrcode.getCameras();
      if (!devices || devices.length === 0) {
        setCameraStatus('error');
        return;
      }
      setCameras(devices);

      const targetCameraId = cameraIdToUse || selectedCameraId || devices[0].id;
      if (!selectedCameraId) {
        setSelectedCameraId(targetCameraId);
      }

      // 2. Initialize scanner instance
      const scanner = new Html5Qrcode("webcam-barcode-container", {
        formatsToSupport: [
          Html5QrcodeSupportedFormats.CODE_128,
          Html5QrcodeSupportedFormats.CODE_39,
          Html5QrcodeSupportedFormats.CODE_93,
          Html5QrcodeSupportedFormats.EAN_13,
          Html5QrcodeSupportedFormats.EAN_8,
          Html5QrcodeSupportedFormats.UPC_A,
          Html5QrcodeSupportedFormats.UPC_E,
          Html5QrcodeSupportedFormats.UPC_EAN_EXTENSION,
          Html5QrcodeSupportedFormats.QR_CODE,
          Html5QrcodeSupportedFormats.DATA_MATRIX,
          Html5QrcodeSupportedFormats.ITF
        ],
        verbose: false
      });

      scannerRef.current = scanner;

      // 3. Start scanning
      await scanner.start(
        targetCameraId,
        {
          fps: 15,
          qrbox: { width: 280, height: 160 },
          aspectRatio: 1.777778
        },
        (decodedText) => {
          handleBarcodeIdentified(decodedText);
        },
        () => {
          // Frame-by-frame error (normal when no barcode in frame)
        }
      );

      setCameraStatus('active');
    } catch (err) {
      console.warn('Webcam initialization error:', err);
      if (err?.name === 'NotAllowedError' || err?.toString()?.includes('Permission')) {
        setCameraStatus('permission_denied');
      } else {
        setCameraStatus('error');
      }
    }
  };

  const stopScanner = async () => {
    if (isStoppingRef.current) return;
    if (scannerRef.current) {
      isStoppingRef.current = true;
      try {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop();
        }
        scannerRef.current.clear();
      } catch (err) {
        // ignore cleanup error
      } finally {
        scannerRef.current = null;
        isStoppingRef.current = false;
      }
    }
  };

  // Manage opening & closing lifecycle
  useEffect(() => {
    if (isOpen) {
      setBarcodeInput('');
      setScannedProduct(null);
      setUnrecognizedCode(null);
      // Give DOM element time to mount before initializing Html5Qrcode
      const timer = setTimeout(() => {
        startScanner();
        inputRef.current?.focus();
      }, 100);
      return () => {
        clearTimeout(timer);
        stopScanner();
      };
    } else {
      stopScanner();
    }
  }, [isOpen]);

  // Handle switching camera
  const handleCameraChange = async (e) => {
    const newId = e.target.value;
    setSelectedCameraId(newId);
    await startScanner(newId);
  };

  // Handle file/image barcode scan
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingFile(true);
    try {
      const html5QrCode = new Html5Qrcode("barcode-file-temp");
      const decodedResult = await html5QrCode.scanFile(file, true);
      html5QrCode.clear();
      if (decodedResult) {
        handleBarcodeIdentified(decodedResult);
      }
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Image Scan Failed',
        message: 'Could not detect a clear barcode in the uploaded image.'
      });
    } finally {
      setIsProcessingFile(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Manual code submission
  const handleManualSubmit = (e) => {
    e?.preventDefault();
    if (barcodeInput.trim()) {
      handleBarcodeIdentified(barcodeInput.trim());
    }
  };

  const handleAddAndClose = () => {
    if (scannedProduct) {
      onAddToCart(scannedProduct);
      addToast({
        type: 'success',
        title: 'Added to Cart',
        message: `${scannedProduct.name} added to active billing cart.`
      });
      setScannedProduct(null);
      setUnrecognizedCode(null);
      setBarcodeInput('');
      inputRef.current?.focus();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="glass-panel w-full max-w-2xl p-6 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden bg-slate-900/95">
        {/* Hidden container for file scan fallback */}
        <div id="barcode-file-temp" className="hidden" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-white/10 transition-colors z-20 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-sky-500/20 text-sky-400 border border-sky-500/30">
              <Camera className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Webcam Barcode Optical Scanner
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Live Camera Feed & Barcode Recognition
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 mr-8">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2 rounded-xl bg-slate-950 border border-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title={soundEnabled ? 'Mute beep sound' : 'Enable beep sound'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
            </button>
          </div>
        </div>

        {/* Camera Device Controls & Status Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-semibold flex items-center gap-1.5">
              <SwitchCamera className="w-3.5 h-3.5 text-sky-400" /> Camera:
            </span>
            {cameras.length > 1 ? (
              <select
                value={selectedCameraId}
                onChange={handleCameraChange}
                className="bg-slate-950 text-slate-200 border border-white/10 rounded-xl px-2.5 py-1 text-xs focus:outline-none focus:border-sky-500 cursor-pointer max-w-[220px] truncate"
              >
                {cameras.map((cam, idx) => (
                  <option key={cam.id} value={cam.id}>
                    {cam.label || `Camera ${idx + 1}`}
                  </option>
                ))}
              </select>
            ) : (
              <span className="text-slate-300 font-bold">
                {cameras[0]?.label || 'Default Webcam'}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {cameraStatus === 'active' && (
              <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Camera Active
              </span>
            )}
            {cameraStatus === 'initializing' && (
              <span className="text-[11px] text-sky-400 font-bold flex items-center gap-1 bg-sky-500/10 px-2.5 py-0.5 rounded-full border border-sky-500/20">
                <RefreshCw className="w-3 h-3 animate-spin" />
                Connecting Camera...
              </span>
            )}
            {cameraStatus === 'error' && (
              <button
                onClick={() => startScanner()}
                className="text-[11px] text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/30 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" /> Retry Camera
              </button>
            )}
          </div>
        </div>

        {/* Live Webcam Optical Viewport */}
        <div className="relative rounded-2xl bg-slate-950 border border-white/10 min-h-[260px] mb-4 overflow-hidden flex items-center justify-center">
          {/* HTML5 QR / Barcode Video Element Render Target */}
          <div id="webcam-barcode-container" className="w-full h-full min-h-[260px] flex items-center justify-center overflow-hidden" />

          {/* Animated Laser Scanning Line (Visible during active scanning) */}
          {cameraStatus === 'active' && (
            <div className="laser-line animate-scan-laser z-20 pointer-events-none" />
          )}

          {/* Error / Permission Denied HUD Overlay */}
          {cameraStatus === 'permission_denied' && (
            <div className="absolute inset-0 bg-slate-950/95 flex flex-col items-center justify-center p-6 text-center z-30">
              <VideoOff className="w-12 h-12 text-rose-400 mb-2" />
              <div className="text-white font-bold text-sm">Camera Permission Blocked</div>
              <p className="text-xs text-slate-400 mt-1 max-w-sm">
                Please allow camera permissions in your browser address bar to scan product barcodes optically.
              </p>
              <button
                onClick={() => startScanner()}
                className="mt-3 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Request Permission Again</span>
              </button>
            </div>
          )}

          {cameraStatus === 'error' && (
            <div className="absolute inset-0 bg-slate-950/95 flex flex-col items-center justify-center p-6 text-center z-30">
              <AlertCircle className="w-12 h-12 text-amber-400 mb-2" />
              <div className="text-white font-bold text-sm">No Webcam Detected</div>
              <p className="text-xs text-slate-400 mt-1 max-w-sm">
                Ensure your webcam is plugged in. You can also upload a barcode photo or type the code below.
              </p>
              <button
                onClick={() => startScanner()}
                className="mt-3 px-4 py-2 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/30 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry Connection</span>
              </button>
            </div>
          )}

          {/* Target Alignment Helper overlay on bottom */}
          <div className="absolute bottom-2 inset-x-0 text-center z-20 pointer-events-none">
            <span className="text-[10px] font-mono bg-slate-950/80 text-slate-300 px-3 py-1 rounded-full border border-white/10 shadow-md">
              Hold spare part barcode label steadily in front of webcam
            </span>
          </div>
        </div>

        {/* Identified Product Result Card */}
        {scannedProduct && (
          <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fadeIn">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                  SKU: {scannedProduct.code}
                </span>
                <span className="text-xs text-slate-400 font-mono font-semibold">{scannedProduct.brand}</span>
              </div>
              <h4 className="text-sm font-bold text-white">{scannedProduct.name}</h4>
              <div className="text-xs text-slate-300 mt-1 flex items-center gap-3 font-mono">
                <span className="text-emerald-400 font-bold text-sm">₹{scannedProduct.rate.toLocaleString()}</span>
                <span>•</span>
                <span className="text-slate-400">In Stock: <strong className="text-white">{scannedProduct.stock} {scannedProduct.unit}</strong></span>
              </div>
            </div>

            <button
              onClick={handleAddAndClose}
              className="px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-950/60 flex items-center justify-center gap-1.5 transition-all flex-shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add to Active Cart</span>
            </button>
          </div>
        )}

        {/* Unrecognized Barcode Alert */}
        {unrecognizedCode && !scannedProduct && (
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 mb-4 text-xs font-mono text-amber-300 flex items-center justify-between gap-2 animate-fadeIn">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span>Scanned Code: <strong className="text-white font-bold">{unrecognizedCode}</strong> (No matching product)</span>
            </div>
            <span className="text-[10px] text-slate-400">Try typing SKU manually</span>
          </div>
        )}

        {/* Barcode Manual Entry & Photo Upload */}
        <div className="space-y-3">
          <form onSubmit={handleManualSubmit}>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Search className="w-4 h-4 text-sky-400" />
                </div>
                <input
                  ref={inputRef}
                  type="text"
                  value={barcodeInput}
                  onChange={(e) => setBarcodeInput(e.target.value)}
                  placeholder="Manual SKU or Barcode entry (e.g. 100665, 11285)..."
                  className="w-full glass-input text-white rounded-2xl pl-10 pr-4 py-2.5 text-xs sm:text-sm focus:outline-none placeholder:text-slate-500 font-mono"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs rounded-2xl transition-colors font-mono cursor-pointer shadow-lg shadow-brand-950/50 flex items-center gap-1.5"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Search</span>
              </button>

              {/* Upload image button */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessingFile}
                className="px-3.5 py-2.5 bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white border border-white/10 rounded-2xl text-xs font-mono transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                title="Upload photo of barcode tag"
              >
                {isProcessingFile ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-sky-400" />
                ) : (
                  <UploadCloud className="w-3.5 h-3.5 text-sky-400" />
                )}
                <span className="hidden sm:inline">Upload Image</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
