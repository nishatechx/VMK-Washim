import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { QRCodeSVG } from 'qrcode.react';
import {
  X,
  QrCode,
  Download,
  Copy,
  Check,
  UploadCloud,
  FileText,
  Trash2,
  ExternalLink,
  RefreshCw,
  Eye,
  Minus,
  Plus,
  FileUp,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  FolderArchive,
  Search,
  Printer,
  ShieldCheck,
  Layers,
  Sparkles,
} from 'lucide-react';
import { QrUploadedFile, formatBytes, fileToDataUrl, printDocumentDirectly, triggerFileDownload } from '../types/qrUpload';
import { qrUploadService } from '../services/qrUploadService';
import { InSoftwareDocumentViewer } from './InSoftwareDocumentViewer';

interface QrUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QrUploadModal: React.FC<QrUploadModalProps> = ({ isOpen, onClose }) => {
  const [sessionId, setSessionId] = useState<string>(() => {
    return 'VMK-' + Math.floor(100000 + Math.random() * 900000);
  });

  const [activeTab, setActiveTab] = useState<'qr_sync' | 'software_vault'>('qr_sync');
  const [files, setFiles] = useState<QrUploadedFile[]>([]);
  const [vaultFiles, setVaultFiles] = useState<QrUploadedFile[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'pdf' | 'image' | 'verified'>('all');
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [previewFile, setPreviewFile] = useState<QrUploadedFile | null>(null);
  const [isLocalUploading, setIsLocalUploading] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' | '' }>({
    text: '',
    type: '',
  });

  const localFileInputRef = useRef<HTMLInputElement>(null);

  // Derive upload link
  const uploadUrl = typeof window !== 'undefined'
    ? `${window.location.origin}${window.location.pathname}?qrSession=${sessionId}`
    : `https://vmkwashim.gov.in/?qrSession=${sessionId}`;

  // Reset or load files when sessionId changes
  const fetchSessionFiles = async () => {
    try {
      const list = await qrUploadService.getFiles(sessionId);
      setFiles(list);
      const allVault = await qrUploadService.getAllVaultFilesAsync();
      setVaultFiles(allVault);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    fetchSessionFiles();

    // Fast polling every 1.5 seconds for fresh mobile uploads across devices
    const interval = setInterval(fetchSessionFiles, 1500);

    const onIncomingFile = (newFile: QrUploadedFile) => {
      setFiles((prev) => {
        if (prev.some((f) => f.id === newFile.id)) return prev;
        return [newFile, ...prev];
      });
      setVaultFiles((prev) => {
        if (prev.some((f) => f.id === newFile.id)) return prev;
        return [newFile, ...prev];
      });
      setStatusMessage({
        text: `📥 Real-time Received: "${newFile.name}" (${formatBytes(newFile.size)}) downloaded directly into software storage!`,
        type: 'success',
      });
    };

    // 1. Listen to real-time Firebase Firestore database snapshots
    const unsubFirestore = qrUploadService.listenFirestoreRealtime(sessionId, onIncomingFile);

    // 2. Listen to real-time Server-Sent Events (cross-device: Phone -> PC)
    const unsubServer = qrUploadService.listenServerEvents(sessionId, onIncomingFile);

    // 3. Also listen to cross-tab BroadcastChannel
    const unsubBroadcast = qrUploadService.listenBroadcast(sessionId, onIncomingFile);

    return () => {
      clearInterval(interval);
      unsubFirestore();
      unsubServer();
      unsubBroadcast();
    };
  }, [isOpen, sessionId]);

  // Keyboard escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        if (previewFile) {
          setPreviewFile(null);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, previewFile]);

  const handleGenerateNewSession = () => {
    const newId = 'VMK-' + Math.floor(100000 + Math.random() * 900000);
    setSessionId(newId);
    setFiles([]);
    setStatusMessage({
      text: `New QR Session #${newId} active. Any documents scanned will be downloaded directly into software storage.`,
      type: 'success',
    });
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(uploadUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const handleLocalFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    setIsLocalUploading(true);
    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
        const ext = file.name.split('.').pop()?.toLowerCase();
        const isAllowedExt = ext && ['pdf', 'jpeg', 'jpg', 'png'].includes(ext);

        if (!validTypes.includes(file.type) && !isAllowedExt) {
          setStatusMessage({
            text: `Skipped "${file.name}": Only PDF, JPEG, and PNG files are allowed.`,
            type: 'error',
          });
          continue;
        }

        const dataUrl = await fileToDataUrl(file);
        await qrUploadService.uploadFile(sessionId, {
          name: file.name,
          type: file.type || 'application/octet-stream',
          size: file.size,
          dataUrl,
        });
      }

      await fetchSessionFiles();
      setStatusMessage({
        text: 'Document(s) successfully downloaded and stored in software memory! Click "Open in Software" to inspect.',
        type: 'success',
      });
    } catch {
      setStatusMessage({
        text: 'Failed to process selected file(s).',
        type: 'error',
      });
    } finally {
      setIsLocalUploading(false);
      if (localFileInputRef.current) localFileInputRef.current.value = '';
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    await qrUploadService.deleteFile(sessionId, fileId);
    await fetchSessionFiles();
  };

  const handleToggleStamp = (file: QrUploadedFile) => {
    qrUploadService.toggleVerifyStamp(file.sessionId || sessionId, file.id);
    fetchSessionFiles();
  };

  // Filtered files for software vault tab
  const displayedVaultFiles = vaultFiles.filter((f) => {
    const matchesSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (f.category && f.category.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (!matchesSearch) return false;
    if (typeFilter === 'pdf') return f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf');
    if (typeFilter === 'image') return f.type.startsWith('image/') || /\.(jpg|jpeg|png)$/i.test(f.name);
    if (typeFilter === 'verified') return !!f.verifiedStamp;
    return true;
  });

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="qr-upload-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.32, 0.72, 0, 1] }}
            className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-5 bg-black/80 backdrop-blur-md overflow-y-auto"
            onClick={onClose}
          >
            <motion.div
              id="qr-upload-modal-container"
              initial={{
                clipPath: 'inset(0% 0% 100% 0% round 16px)',
                opacity: 0.3,
                y: -15,
              }}
              animate={{
                clipPath: 'inset(0% 0% 0% 0% round 16px)',
                opacity: 1,
                y: 0,
              }}
              exit={{
                clipPath: 'inset(100% 0% 0% 0% round 16px)',
                opacity: 0.2,
                y: 15,
              }}
              transition={{
                duration: 0.38,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="relative w-full max-w-4xl bg-[#091a30] text-white rounded-2xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8),0_0_30px_rgba(59,130,246,0.3)] border border-blue-400/30 overflow-hidden my-auto max-h-[94vh] flex flex-col origin-top"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Mac Titlebar Header */}
              <div className="bg-gradient-to-r from-[#061527] via-[#0f2747] to-[#1e40af] px-4 sm:px-5 py-3 border-b border-blue-500/20 flex items-center justify-between shrink-0 select-none">
                <div className="flex items-center gap-3">
                  {/* Mac Traffic Lights */}
                  <div className="flex items-center gap-2 group/traffic">
                    <button
                      id="mac-qr-close-btn"
                      onClick={onClose}
                      className="w-3.5 h-3.5 rounded-full bg-[#ff5f56] border border-[#e0443e] hover:bg-[#ff3b30] flex items-center justify-center shadow-sm transition-transform active:scale-90 cursor-pointer"
                      title="Close (Esc)"
                    >
                      <X className="w-2 h-2 text-[#4c0000] opacity-0 group-hover/traffic:opacity-100 transition-opacity" />
                    </button>

                    <button
                      id="mac-qr-minimize-btn"
                      onClick={onClose}
                      className="w-3.5 h-3.5 rounded-full bg-[#ffbd2e] border border-[#dea123] hover:bg-[#f59e0b] flex items-center justify-center shadow-sm transition-transform active:scale-90 cursor-pointer"
                      title="Minimize"
                    >
                      <Minus className="w-2 h-2 text-[#5c3e00] opacity-0 group-hover/traffic:opacity-100 transition-opacity" />
                    </button>

                    <button
                      id="mac-qr-zoom-btn"
                      className="w-3.5 h-3.5 rounded-full bg-[#27c93f] border border-[#1aab29] hover:bg-[#10b981] flex items-center justify-center shadow-sm transition-transform active:scale-90 cursor-pointer"
                      title="Active"
                    >
                      <Plus className="w-2 h-2 text-[#004d10] opacity-0 group-hover/traffic:opacity-100 transition-opacity" />
                    </button>
                  </div>

                  <div className="h-4 w-px bg-blue-400/20 hidden sm:block ml-1" />

                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-amber-600 flex items-center justify-center shadow-md text-slate-950">
                      <QrCode className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-white tracking-wide leading-tight">
                        Upload by QR Code
                      </h2>
                    </div>
                  </div>
                </div>

                {/* Tab Navigation in Header */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center bg-black/30 p-0.5 rounded-lg border border-white/10">
                    <button
                      onClick={() => setActiveTab('qr_sync')}
                      className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        activeTab === 'qr_sync'
                          ? 'bg-amber-500 text-slate-950 shadow-sm'
                          : 'text-blue-200 hover:text-white'
                      }`}
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                      <span>QR Scanner</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('software_vault')}
                      className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        activeTab === 'software_vault'
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'text-blue-200 hover:text-white'
                      }`}
                    >
                      <FolderArchive className="w-3.5 h-3.5" />
                      <span>Software Vault ({vaultFiles.length})</span>
                    </button>
                  </div>

                  <button
                    id="close-qr-modal-btn"
                    onClick={onClose}
                    className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-blue-100 hover:text-white transition-colors cursor-pointer ml-1"
                    title="Close (Esc)"
                  >
                    <X className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>
              </div>

              {/* Scrollable Body */}
              <div className="p-4 sm:p-5 overflow-y-auto space-y-3.5 text-slate-900 bg-[#f4f7fb]">
                {/* Notification Banner */}
                {statusMessage.text && (
                  <div
                    className={`p-3 rounded-xl flex items-start gap-2.5 text-xs sm:text-sm font-medium animate-fadeIn ${
                      statusMessage.type === 'error'
                        ? 'bg-red-50 text-red-800 border border-red-200'
                        : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                    }`}
                  >
                    {statusMessage.type === 'error' ? (
                      <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    )}
                    <span className="flex-1">{statusMessage.text}</span>
                    <button
                      onClick={() => setStatusMessage({ text: '', type: '' })}
                      className="text-xs opacity-60 hover:opacity-100"
                    >
                      ✕
                    </button>
                  </div>
                )}

                {/* TAB 1: QR Scanner & Live Session */}
                {activeTab === 'qr_sync' && (
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    {/* Left Column: QR Code Card */}
                    <div className="md:col-span-5 bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center text-center space-y-3">
                      <div className="w-full flex items-center justify-between border-b border-slate-100 pb-2">
                        <span className="text-xs font-extrabold text-[#0f2747] flex items-center gap-1.5">
                          <Smartphone className="w-4 h-4 text-amber-600" />
                          Mobile Scan & Upload
                        </span>
                        <button
                          type="button"
                          onClick={handleGenerateNewSession}
                          className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                          title="Generate new session QR code"
                        >
                          <RefreshCw className="w-3 h-3" />
                          New QR
                        </button>
                      </div>

                      {/* QR Code Frame */}
                      <div className="p-3 bg-white rounded-xl border-2 border-amber-300/80 shadow-inner flex items-center justify-center relative group">
                        <QRCodeSVG
                          value={uploadUrl}
                          size={175}
                          level="H"
                          includeMargin={false}
                          className="w-40 h-40 sm:w-44 sm:h-44"
                        />

                        {/* Central Logo */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className="w-9 h-9 rounded-lg bg-[#0f2747] border-2 border-amber-300 shadow-md flex items-center justify-center">
                            <FileUp className="w-5 h-5 text-amber-400" />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <p className="text-xs font-extrabold text-slate-800">
                          Scan with Mobile Camera / Scanner
                        </p>
                        <p className="text-[11px] text-slate-500">
                          Session: <span className="font-mono font-bold text-blue-700">#{sessionId}</span>
                        </p>
                        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-semibold border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Auto-downloads into Software Vault
                        </div>
                      </div>

                      {/* Actions under QR */}
                      <div className="w-full pt-1 flex flex-col gap-2">
                        <button
                          type="button"
                          onClick={handleCopyLink}
                          className="w-full py-2 px-3 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          {copiedLink ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span className="text-emerald-700">Upload Link Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              Copy Mobile Upload Link
                            </>
                          )}
                        </button>

                        <a
                          href={uploadUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full py-1.5 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <ExternalLink className="w-3 h-3" />
                          Open Mobile View in New Tab
                        </a>
                      </div>
                    </div>

                    {/* Right Column: Direct Drop & Session Files */}
                    <div className="md:col-span-7 space-y-3 flex flex-col">
                      {/* Direct PC Import Box */}
                      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-extrabold text-[#0f2747] flex items-center gap-1.5">
                            <UploadCloud className="w-4 h-4 text-emerald-600" />
                            Direct Import to Software Memory
                          </span>
                          <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">
                            PDF • JPEG • PNG
                          </span>
                        </div>

                        <input
                          ref={localFileInputRef}
                          type="file"
                          multiple
                          accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                          onChange={handleLocalFileSelect}
                          className="hidden"
                        />

                        <div
                          onClick={() => localFileInputRef.current?.click()}
                          className="border-2 border-dashed border-blue-200 hover:border-blue-500 rounded-xl p-3 text-center bg-blue-50/40 hover:bg-blue-50/80 cursor-pointer transition-colors"
                        >
                          <FileUp className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                          <p className="text-xs font-bold text-slate-800">
                            Click to Browse or Drag & Drop Documents
                          </p>
                          <p className="text-[10px] text-slate-500">Loads immediately into in-app viewer</p>
                        </div>
                      </div>

                      {/* Current Session Files List */}
                      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm flex-1 flex flex-col space-y-2">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-extrabold text-[#0f2747]">
                              Current Session Documents ({files.length})
                            </span>
                            {files.length > 0 && (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                                In-Software Ready
                              </span>
                            )}
                          </div>

                          {files.length > 0 && (
                            <button
                              type="button"
                              onClick={() => setPreviewFile(files[0])}
                              className="text-[11px] font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1 cursor-pointer"
                            >
                              <Eye className="w-3 h-3" />
                              Open First Document
                            </button>
                          )}
                        </div>

                        {/* Files Stream */}
                        <div className="flex-1 min-h-[160px] max-h-64 overflow-y-auto space-y-2 pr-1">
                          {files.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 space-y-1.5">
                              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                                <UploadCloud className="w-5 h-5" />
                              </div>
                              <p className="text-xs font-semibold text-slate-600">Waiting for mobile scan...</p>
                              <p className="text-[11px] text-slate-400 max-w-xs">
                                When a candidate scans the QR code and uploads documents, they appear here instantly ready to view & verify inside the software.
                              </p>
                            </div>
                          ) : (
                            files.map((file) => {
                              const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
                              return (
                                <div
                                  key={file.id}
                                  className="p-2.5 rounded-lg border border-slate-200 bg-slate-50/90 hover:bg-blue-50/50 flex items-center justify-between gap-2.5 transition-colors"
                                >
                                  <div
                                    className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer"
                                    onClick={() => setPreviewFile(file)}
                                    title="Click to Open in Software Viewer"
                                  >
                                    {isPdf ? (
                                      <div className="w-8 h-8 rounded-lg bg-red-100 border border-red-200 flex items-center justify-center shrink-0 text-red-600">
                                        <FileText className="w-4 h-4" />
                                      </div>
                                    ) : (
                                      <div className="w-8 h-8 rounded-lg bg-emerald-100 border border-emerald-200 flex items-center justify-center shrink-0 overflow-hidden">
                                        <img src={file.dataUrl} alt={file.name} className="w-full h-full object-cover" />
                                      </div>
                                    )}

                                    <div className="min-w-0 flex-1">
                                      <div className="flex items-center gap-1.5">
                                        <p className="text-xs font-bold text-slate-800 truncate" title={file.name}>
                                          {file.name}
                                        </p>
                                        {file.verifiedStamp && (
                                          <span className="shrink-0 text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-0.5">
                                            <ShieldCheck className="w-2.5 h-2.5" />
                                            Verified
                                          </span>
                                        )}
                                      </div>
                                      <p className="text-[10px] text-slate-500 font-mono">
                                        {formatBytes(file.size)} • {file.category || 'Doc'} • {new Date(file.uploadedAt).toLocaleTimeString()}
                                      </p>
                                    </div>
                                  </div>

                                  {/* Actions for each file */}
                                  <div className="flex items-center gap-1.5 shrink-0">
                                    {/* Primary Action: Open / View in Software */}
                                    <button
                                      type="button"
                                      onClick={() => setPreviewFile(file)}
                                      className="px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1 shadow-sm transition-all cursor-pointer"
                                      title="Open and Inspect Document in Software Viewer"
                                    >
                                      <Eye className="w-3.5 h-3.5" />
                                      <span>Open in Software</span>
                                    </button>

                                    {/* Direct Print Button */}
                                    <button
                                      type="button"
                                      onClick={() => printDocumentDirectly(file.dataUrl, file.name, !isPdf)}
                                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                                      title="Direct Print from Software"
                                    >
                                      <Printer className="w-3.5 h-3.5" />
                                    </button>

                                    {/* Optional Export to PC Device */}
                                    <button
                                      type="button"
                                      onClick={() => triggerFileDownload(file.dataUrl, file.name)}
                                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-emerald-100 text-slate-600 hover:text-emerald-700 transition-colors cursor-pointer"
                                      title="Optional: Save Copy to PC Device"
                                    >
                                      <Download className="w-3.5 h-3.5" />
                                    </button>

                                    {/* Delete Button */}
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteFile(file.id)}
                                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-red-100 text-slate-500 hover:text-red-700 transition-colors cursor-pointer"
                                      title="Remove from Software"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: Software Vault (All Documents Downloaded & Stored in Software) */}
                {activeTab === 'software_vault' && (
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
                    {/* Header + Search Bar + Filters */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pb-2 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <FolderArchive className="w-5 h-5 text-blue-600" />
                        <div>
                          <h3 className="text-xs sm:text-sm font-bold text-slate-800">
                            In-Software Document Vault ({displayedVaultFiles.length} / {vaultFiles.length})
                          </h3>
                          <p className="text-[10px] text-slate-500">
                            Persistent document memory stored inside the software console.
                          </p>
                        </div>
                      </div>

                      {/* Search & Filter Controls */}
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Search Input */}
                        <div className="relative">
                          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            placeholder="Search document name..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-8 pr-2.5 py-1 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 bg-slate-50"
                          />
                        </div>

                        {/* Type Filters */}
                        <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-[11px] font-semibold text-slate-600">
                          <button
                            onClick={() => setTypeFilter('all')}
                            className={`px-2 py-0.5 rounded ${typeFilter === 'all' ? 'bg-white shadow-xs text-blue-700' : ''}`}
                          >
                            All
                          </button>
                          <button
                            onClick={() => setTypeFilter('pdf')}
                            className={`px-2 py-0.5 rounded ${typeFilter === 'pdf' ? 'bg-white shadow-xs text-blue-700' : ''}`}
                          >
                            PDFs
                          </button>
                          <button
                            onClick={() => setTypeFilter('image')}
                            className={`px-2 py-0.5 rounded ${typeFilter === 'image' ? 'bg-white shadow-xs text-blue-700' : ''}`}
                          >
                            Images
                          </button>
                          <button
                            onClick={() => setTypeFilter('verified')}
                            className={`px-2 py-0.5 rounded ${typeFilter === 'verified' ? 'bg-white shadow-xs text-emerald-700' : ''}`}
                          >
                            Verified
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Vault Documents Grid */}
                    <div className="min-h-[250px] max-h-[380px] overflow-y-auto space-y-2 pr-1">
                      {displayedVaultFiles.length === 0 ? (
                        <div className="py-12 flex flex-col items-center justify-center text-center text-slate-400 space-y-2">
                          <FolderArchive className="w-10 h-10 text-slate-300" />
                          <p className="text-xs font-semibold text-slate-600">No documents found in vault</p>
                          <p className="text-[11px] text-slate-400">
                            {searchQuery ? 'Try modifying your search filter.' : 'Upload files via the QR Scanner tab or import directly.'}
                          </p>
                        </div>
                      ) : (
                        displayedVaultFiles.map((file) => {
                          const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
                          return (
                            <div
                              key={file.id}
                              className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-100 flex items-center justify-between gap-3 transition-colors"
                            >
                              <div
                                className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer"
                                onClick={() => setPreviewFile(file)}
                              >
                                {isPdf ? (
                                  <div className="w-9 h-9 rounded-lg bg-red-100 border border-red-200 flex items-center justify-center shrink-0 text-red-600">
                                    <FileText className="w-5 h-5" />
                                  </div>
                                ) : (
                                  <div className="w-9 h-9 rounded-lg bg-emerald-100 border border-emerald-200 flex items-center justify-center shrink-0 overflow-hidden">
                                    <img src={file.dataUrl} alt={file.name} className="w-full h-full object-cover" />
                                  </div>
                                )}

                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-2">
                                    <h4 className="text-xs font-bold text-slate-800 truncate" title={file.name}>
                                      {file.name}
                                    </h4>
                                    <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-blue-100 text-blue-800">
                                      {file.category || 'Candidate Doc'}
                                    </span>
                                    {file.verifiedStamp && (
                                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-0.5">
                                        <ShieldCheck className="w-3 h-3" />
                                        Verified
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                                    {formatBytes(file.size)} • Session #{file.sessionId || sessionId} • {new Date(file.uploadedAt).toLocaleString()}
                                  </p>
                                </div>
                              </div>

                              {/* Vault Actions */}
                              <div className="flex items-center gap-1.5 shrink-0">
                                {/* Verify Stamp Toggle */}
                                <button
                                  type="button"
                                  onClick={() => handleToggleStamp(file)}
                                  className={`p-1.5 rounded-lg border text-xs transition-colors cursor-pointer ${
                                    file.verifiedStamp
                                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                                  }`}
                                  title={file.verifiedStamp ? 'Marked as Verified' : 'Stamp as Verified'}
                                >
                                  <ShieldCheck className="w-3.5 h-3.5" />
                                </button>

                                {/* Primary: Open in Software */}
                                <button
                                  type="button"
                                  onClick={() => setPreviewFile(file)}
                                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1 shadow-sm transition-all cursor-pointer"
                                  title="Open in Software Viewer"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  <span>Open in Software</span>
                                </button>

                                {/* Direct Print */}
                                <button
                                  type="button"
                                  onClick={() => printDocumentDirectly(file.dataUrl, file.name, !isPdf)}
                                  className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
                                  title="Direct Print Document"
                                >
                                  <Printer className="w-3.5 h-3.5" />
                                </button>

                                {/* Export to Device */}
                                <button
                                  type="button"
                                  onClick={() => triggerFileDownload(file.dataUrl, file.name)}
                                  className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 transition-colors cursor-pointer"
                                  title="Export Copy to PC Device"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                </button>

                                {/* Delete */}
                                <button
                                  type="button"
                                  onClick={() => handleDeleteFile(file.id)}
                                  className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-red-50 text-slate-500 hover:text-red-700 transition-colors cursor-pointer"
                                  title="Delete Document"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Footer */}
              <div className="bg-[#061527] px-4 py-2.5 border-t border-blue-500/20 flex items-center justify-between text-xs text-blue-200/80">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="text-[11px] font-mono">
                    All documents are downloaded instantly inside software storage • No local disk storage needed
                  </span>
                </div>
                <button
                  onClick={onClose}
                  className="px-3.5 py-1 rounded bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Interactive In-Software Document Viewer */}
      <InSoftwareDocumentViewer
        file={previewFile}
        allFiles={activeTab === 'software_vault' ? displayedVaultFiles : files}
        onClose={() => setPreviewFile(null)}
        onSelectFile={(f) => setPreviewFile(f)}
      />
    </>
  );
};
