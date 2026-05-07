import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { UploadCloud, CheckCircle, AlertTriangle, Image as ImageIcon, Loader2, X } from 'lucide-react';

const COMPLAINT_PORTAL_URL = 'https://portal.mcgm.gov.in/irj/portal/anonymous/qlcomplaintreg?3w5kPW=5LBjTyt3acn&guest_user=english';

export default function App() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelection = (selectedFile) => {
    setError(null);
    setResult(null);

    if (!selectedFile.type.startsWith('image/')) {
      setError('Please select a valid image file.');
      return;
    }

    setFile(selectedFile);
    const objectUrl = URL.createObjectURL(selectedFile);
    setPreview(objectUrl);
  };

  const clearSelection = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const detectPothole = async () => {
    if (!file) return;

    setIsUploading(true);
    setResult(null);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('http://localhost:8000/detect', formData);
      setResult(response.data);

      if (response.data?.result === 'Pothole detected') {
        window.location.assign(COMPLAINT_PORTAL_URL);
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'An error occurred during detection.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen px-6 pb-20 flex flex-col max-w-4xl mx-auto">
      {/* Header Section */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="pt-12 pb-8 text-center"
      >
        <div className="inline-block px-4 py-1.5 rounded-full bg-surface-highest text-primary text-sm font-semibold tracking-wider mb-6 border border-cyprus-600">
          Johann Joseph
        </div>
        <h1 className="text-4xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary to-sand mb-4 drop-shadow-sm font-manrope">
          Pothole Detector
        </h1>
        <p className="text-lg md:text-xl text-[#beebeb]/80 max-w-xl mx-auto">
          Upload road images and instantly analyze them for potholes using advanced computer vision.
        </p>
      </motion.header>

      {/* Main Content Area */}
      <main className="flex-1 grid md:grid-cols-1 gap-8 mt-4">

        {/* Upload Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="glass-panel p-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold font-manrope text-white">Image Upload</h2>
          </div>

          <AnimatePresence mode="wait">
            {!preview ? (
              <motion.div
                key="dropzone"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="border-2 border-dashed border-[#404848]/60 rounded-xl p-10 flex flex-col items-center justify-center bg-surface-high/50 hover:bg-surface-highest/50 transition-colors cursor-pointer group"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="h-16 w-16 bg-[#002425] rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <UploadCloud className="text-primary w-8 h-8" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Drag & drop your image here</h3>
                <p className="text-[#a3cfcf] text-sm mb-6">or click to browse from your computer</p>

                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files?.length) handleFileSelection(e.target.files[0]);
                  }}
                />

                <button className="px-6 py-2.5 rounded-full bg-surface-highest text-primary font-medium border border-primary/20 hover:border-primary/50 transition-colors">
                  Select Image
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="preview"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative"
              >
                <div className="relative rounded-xl overflow-hidden bg-black/40 border border-[#0c3b3c]">
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-full max-h-[400px] object-contain"
                  />
                  <button
                    onClick={clearSelection}
                    className="absolute top-4 right-4 bg-black/60 p-2 rounded-full text-white hover:bg-black/80 transition-colors backdrop-blur-md"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    onClick={detectPothole}
                    disabled={isUploading}
                    className="w-full md:w-auto px-8 py-3.5 rounded-full bg-secondary text-[#3a2f0d] font-bold text-lg hover:bg-[#c5b486] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <ImageIcon className="w-5 h-5" />
                        Run Detection
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Results Card */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-[#93000a]/20 border border-[#ffb4ab]/30 p-4 rounded-xl flex items-start gap-3 mt-4"
            >
              <AlertTriangle className="text-[#ffb4ab] mt-0.5" />
              <div>
                <h4 className="text-[#ffb4ab] font-semibold">Error</h4>
                <p className="text-[#ffdad6] text-sm">{error}</p>
              </div>
            </motion.div>
          )}

          {result && !error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-panel p-8 mt-4 overflow-hidden relative"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold font-manrope text-white">Analysis Report</h2>
                <div className="px-3 py-1 bg-surface-highest rounded-full text-xs font-semibold text-primary/80 border border-primary/20">
                  BLIP Model
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                {/* Result Highlighting Area */}
                <div className="flex flex-col justify-center items-center p-6 bg-surface-high rounded-xl border border-[#0c3b3c]">
                  {result.result === "Pothole detected" ? (
                    <>
                      <div className="w-20 h-20 bg-[#ffb4ab]/20 rounded-full flex items-center justify-center mb-4 border border-[#ffb4ab]/30">
                        <AlertTriangle className="w-10 h-10 text-[#ffb4ab]" />
                      </div>
                      <h3 className="text-2xl font-bold text-[#ffb4ab] mb-2 text-center">Hazard Detected</h3>
                      <p className="text-[#ffdad6] text-center text-sm">Action required: Pothole identified in image.</p>
                    </>
                  ) : (
                    <>
                      <div className="w-20 h-20 bg-[#a3cfcf]/20 rounded-full flex items-center justify-center mb-4 border border-[#a3cfcf]/30">
                        <CheckCircle className="w-10 h-10 text-primary" />
                      </div>
                      <h3 className="text-2xl font-bold text-primary mb-2 text-center">Clear Road</h3>
                      <p className="text-[#beebeb] text-center text-sm">No significant potholes detected.</p>
                    </>
                  )}
                </div>

                {/* Caption Detail Area */}
                <div>
                  <h4 className="text-sm font-semibold text-tertiary mb-2 uppercase tracking-wider">This is a </h4>
                  <div className="p-4 bg-surface-highest rounded-lg border border-surface-highest overflow-hidden relative">
                    {/* decorative left border hint */}
                    <div className={`absolute top-0 left-0 w-1 h-full ${result.result === 'Pothole detected' ? 'bg-[#ffb4ab]' : 'bg-primary'}`}></div>

                    <p className="text-lg text-white font-medium pl-3 capitalize first-letter:text-xl">
                      "{result.caption}"
                    </p>
                  </div>

                  <div className="mt-8">
                    <h4 className="text-sm font-semibold text-tertiary mb-4 uppercase tracking-wider">Detailed Analysis</h4>
                    <ul className="space-y-3">
                      <li className="flex items-center gap-3 text-sm text-[#beebeb]">
                        <CheckCircle className="w-4 h-4 text-primary" /> Image structure parsed
                      </li>
                      <li className="flex items-center gap-3 text-sm text-[#beebeb]">
                        <CheckCircle className="w-4 h-4 text-primary" /> Semantic matching completed
                      </li>
                      <li className="flex items-center gap-3 text-sm text-[#beebeb]">
                        <CheckCircle className={`w-4 h-4 ${result.result === 'Pothole detected' ? 'text-[#ffb4ab]' : 'text-primary'}`} />
                        Contextual rules evaluated
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </main>
    </div>
  );
}
