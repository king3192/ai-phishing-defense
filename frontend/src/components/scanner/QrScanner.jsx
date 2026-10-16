import React, { useState, useRef, useEffect } from 'react';
import { QrCode, Upload, ArrowRight, Camera, RefreshCw, X, AlertCircle, Cpu } from 'lucide-react';

export default function QrScanner({ onScan, loading }) {
  const [mode, setMode] = useState('upload'); // 'upload' or 'camera'
  const [imagePreview, setImagePreview] = useState(null);
  const [base64Data, setBase64Data] = useState('');
  const [interaction, setInteraction] = useState('none');
  const [cameraError, setCameraError] = useState('');
  const [isCameraActive, setIsCameraActive] = useState(false);

  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setBase64Data(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const startCamera = async () => {
    setCameraError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setIsCameraActive(true);
    } catch (err) {
      setCameraError('Unable to access browser camera. Please ensure permissions are granted or upload an image file.');
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const captureCameraFrame = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/png');
    setImagePreview(dataUrl);
    setBase64Data(dataUrl);
    stopCamera();
    setMode('upload');
  };

  useEffect(() => {
    if (mode === 'camera') {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [mode]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!base64Data) return;
    onScan({ scan_type: 'qr', content: base64Data, interaction_level: interaction });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <QrCode className="w-4 h-4 text-cyan-400" /> QR Code Payload Source
          </label>
          <div className="flex items-center gap-1.5 p-1 bg-[#070b14] rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => { setMode('upload'); stopCamera(); }}
              className={`px-3 py-1 text-xs font-mono font-bold rounded-lg transition ${
                mode === 'upload' ? 'bg-cyan-500 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Upload File
            </button>
            <button
              type="button"
              onClick={() => { setMode('camera'); }}
              className={`px-3 py-1 text-xs font-mono font-bold rounded-lg flex items-center gap-1.5 transition ${
                mode === 'camera' ? 'bg-cyan-500 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Camera className="w-3 h-3" /> Browser Camera
            </button>
          </div>
        </div>

        {mode === 'camera' ? (
          <div className="relative border-2 border-slate-800 rounded-2xl overflow-hidden bg-[#070b14] p-4 text-center">
            {cameraError ? (
              <div className="py-8 space-y-3">
                <AlertCircle className="w-10 h-10 text-rose-400 mx-auto" />
                <p className="text-xs text-rose-300 font-mono max-w-sm mx-auto">{cameraError}</p>
                <button
                  type="button"
                  onClick={() => setMode('upload')}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono rounded-xl transition"
                >
                  Switch to File Upload
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <div className="relative w-full max-w-md aspect-video bg-black rounded-xl overflow-hidden border border-cyan-500/30">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  {/* Viewfinder Overlay */}
                  <div className="absolute inset-0 border-2 border-cyan-400/40 m-8 rounded-xl pointer-events-none flex items-center justify-center">
                    <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded">Align QR Code</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 mt-4">
                  <button
                    type="button"
                    onClick={captureCameraFrame}
                    className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-heading font-extrabold text-xs rounded-xl shadow-lg shadow-cyan-500/25 flex items-center gap-2 transition"
                  >
                    <Camera className="w-4 h-4" /> Snap & Analyze Frame
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode('upload')}
                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs rounded-xl transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="relative border-2 border-dashed border-slate-800 hover:border-cyan-500/60 rounded-2xl p-8 text-center bg-[#070b14]/80 transition-all duration-200 cursor-pointer group">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />

            {imagePreview ? (
              <div className="flex flex-col items-center">
                <img
                  src={imagePreview}
                  alt="QR Preview"
                  className="w-36 h-36 object-contain rounded-xl border border-cyan-500/40 shadow-lg shadow-cyan-500/15 mb-3"
                />
                <span className="text-xs font-mono font-bold text-cyan-300 bg-cyan-950/80 px-3 py-1 rounded-full border border-cyan-500/30">
                  QR Payload Loaded! Click submit below to decode matrix.
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center py-4">
                <div className="p-4 bg-slate-900/90 rounded-2xl text-cyan-400 mb-3 border border-slate-800 group-hover:scale-110 transition-transform">
                  <Upload className="w-7 h-7" />
                </div>
                <p className="text-sm font-heading font-bold text-slate-200">Click to browse or drag & drop QR image file</p>
                <p className="text-xs text-slate-500 font-mono mt-1">Supports PNG, JPG, WEBP formats</p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="bg-[#070b14]/70 p-4 rounded-2xl border border-slate-800/90 space-y-2.5">
        <label className="block text-xs font-semibold text-slate-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-cyan-400" /> Interaction Status:
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {[
            { id: 'none', label: "Haven't scanned QR" },
            { id: 'clicked', label: "Scanned QR, opened URL" },
            { id: 'entered_info', label: "Entered info on QR landing page" },
          ].map((item) => (
            <button
              type="button"
              key={item.id}
              onClick={() => setInteraction(item.id)}
              className={`py-2.5 px-3.5 rounded-xl text-xs font-medium border text-left transition duration-200 ${
                interaction === item.id
                  ? 'bg-cyan-950/70 border-cyan-500/60 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.15)] font-semibold'
                  : 'bg-[#0d1424]/60 border-slate-800 text-slate-400 hover:border-slate-700/80'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={loading || !base64Data}
        className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-heading font-extrabold text-sm rounded-2xl shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2.5 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.99]"
      >
        {loading ? (
          <span className="flex items-center gap-2 font-mono">
            <Cpu className="w-4 h-4 text-cyan-200 animate-spin" />
            Decoding QR Matrix & Scanning Target Payload...
          </span>
        ) : (
          <>
            Decode Matrix & Scan QR Payload <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>
    </form>
  );
}
