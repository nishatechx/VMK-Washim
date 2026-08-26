import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Copy,
  Check,
  Send,
  Sparkles,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Minus,
  Plus,
  MessageCircle,
  ExternalLink,
  Phone,
  FileCheck,
} from 'lucide-react';

interface WhatsappFormData {
  name: string;
  mobile: string;
  email: string;
  cetRegNo: string;
  capAppNo: string;
  courseName: string;
  scrutinyMode: string;
  ticketNo: string;
  query: string;
}

interface WhatsappTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WhatsappTicketModal: React.FC<WhatsappTicketModalProps> = ({ isOpen, onClose }) => {
  const [form, setForm] = useState<WhatsappFormData>({
    name: '',
    mobile: '',
    email: '',
    cetRegNo: '',
    capAppNo: '',
    courseName: '',
    scrutinyMode: 'E-Scrutiny Mode',
    ticketNo: '',
    query: '',
  });

  const [output, setOutput] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' | '' }>({
    text: '',
    type: '',
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Auto-generate ticket number if empty when opening or clicking button
  const generateTicketNumber = () => {
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    const newTicket = `WA-CAP-${new Date().getFullYear()}-${randomNum}`;
    setForm((prev) => ({ ...prev, ticketNo: newTicket }));
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: false }));
    }
  };

  const handleScrutinySelect = (mode: string) => {
    setForm((prev) => ({ ...prev, scrutinyMode: mode }));
  };

  const handleQuickQuery = (text: string) => {
    setForm((prev) => ({
      ...prev,
      query: prev.query ? `${prev.query}\n- ${text}` : text,
    }));
    if (errors.query) {
      setErrors((prev) => ({ ...prev, query: false }));
    }
  };

  const validate = () => {
    const newErrors: Record<string, boolean> = {};
    if (!form.name.trim()) newErrors.name = true;
    if (!form.mobile.trim()) newErrors.mobile = true;
    if (!form.courseName.trim()) newErrors.courseName = true;
    if (!form.query.trim()) newErrors.query = true;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      setStatusMessage({
        text: 'Please fill in the required fields highlighted in red.',
        type: 'error',
      });
      return;
    }

    const assignedTicket = form.ticketNo.trim()
      ? form.ticketNo.trim()
      : `WA-CAP-${Math.floor(100000 + Math.random() * 900000)}`;

    if (!form.ticketNo.trim()) {
      setForm((prev) => ({ ...prev, ticketNo: assignedTicket }));
    }

    // Bold formatting for WhatsApp (*Heading:*)
    const whatsappFormatted = `*Name:* ${form.name.trim()}
*Mobile Number:* ${form.mobile.trim()}
*Email:* ${form.email.trim() || 'N/A'}
*CET Registration No.:* ${form.cetRegNo.trim() || 'N/A'}
*CAP Application No.:* ${form.capAppNo.trim() || 'N/A'}
*Course Name:* ${form.courseName.trim()}
*Scrutiny Mode:* ${form.scrutinyMode}
*Ticket No -* ${assignedTicket}

*Query -*
${form.query.trim()}`;

    setOutput(whatsappFormatted);
    setStatusMessage({
      text: 'WhatsApp Ticket generated successfully! You can now copy or share it directly.',
      type: 'success',
    });
  };

  const handleCopy = async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const handleDirectWhatsApp = () => {
    if (!output) return;
    const encoded = encodeURIComponent(output);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  const handleReset = () => {
    setForm({
      name: '',
      mobile: '',
      email: '',
      cetRegNo: '',
      capAppNo: '',
      courseName: '',
      scrutinyMode: 'E-Scrutiny Mode',
      ticketNo: '',
      query: '',
    });
    setOutput('');
    setErrors({});
    setStatusMessage({ text: '', type: '' });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          id="whatsapp-ticket-modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22, ease: [0.32, 0.72, 0, 1] }}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-md overflow-y-auto"
          onClick={onClose}
        >
          <motion.div
            id="whatsapp-ticket-modal-container"
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
            className="relative w-full max-w-2xl bg-[#09261b] text-white rounded-2xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8),0_0_30px_rgba(37,211,102,0.3)] border border-emerald-500/40 overflow-hidden my-auto max-h-[92vh] flex flex-col origin-top"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Mac Window Header with Emerald WhatsApp Gradient */}
            <div className="bg-gradient-to-r from-[#063323] via-[#0b4d35] to-[#128c7e] px-4 sm:px-5 py-3.5 border-b border-emerald-500/30 flex items-center justify-between shrink-0 select-none">
              <div className="flex items-center gap-3">
                {/* Mac Traffic Light Controls */}
                <div className="flex items-center gap-2 group/traffic">
                  <button
                    id="mac-wa-close-btn"
                    onClick={onClose}
                    className="w-3.5 h-3.5 rounded-full bg-[#ff5f56] border border-[#e0443e] hover:bg-[#ff3b30] flex items-center justify-center shadow-sm transition-transform active:scale-90 cursor-pointer"
                    title="Close (Esc)"
                  >
                    <X className="w-2 h-2 text-[#4c0000] opacity-0 group-hover/traffic:opacity-100 transition-opacity" />
                  </button>

                  <button
                    id="mac-wa-minimize-btn"
                    onClick={onClose}
                    className="w-3.5 h-3.5 rounded-full bg-[#ffbd2e] border border-[#dea123] hover:bg-[#f59e0b] flex items-center justify-center shadow-sm transition-transform active:scale-90 cursor-pointer"
                    title="Minimize"
                  >
                    <Minus className="w-2 h-2 text-[#5c3e00] opacity-0 group-hover/traffic:opacity-100 transition-opacity" />
                  </button>

                  <button
                    id="mac-wa-zoom-btn"
                    className="w-3.5 h-3.5 rounded-full bg-[#27c93f] border border-[#1aab29] hover:bg-[#10b981] flex items-center justify-center shadow-sm transition-transform active:scale-90 cursor-pointer"
                    title="Active"
                  >
                    <Plus className="w-2 h-2 text-[#004d10] opacity-0 group-hover/traffic:opacity-100 transition-opacity" />
                  </button>
                </div>

                <div className="h-4 w-px bg-emerald-400/30 hidden sm:block ml-1" />

                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center shadow-md text-white">
                    <MessageCircle className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-white tracking-wide leading-tight">
                      WhatsApp Ticket
                    </h2>
                  </div>
                </div>
              </div>

              <button
                id="close-wa-ticket-modal"
                onClick={onClose}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-emerald-100 hover:text-white transition-colors"
                title="Close (Esc)"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-slate-900 bg-[#f0fdf4]">
              {/* Status Notice */}
              {statusMessage.text && (
                <div
                  className={`p-3 rounded-xl flex items-start gap-2.5 text-xs sm:text-sm font-medium ${
                    statusMessage.type === 'error'
                      ? 'bg-red-50 text-red-800 border border-red-200'
                      : 'bg-emerald-100/90 text-emerald-900 border border-emerald-300'
                  }`}
                >
                  {statusMessage.type === 'error' ? (
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  )}
                  <span>{statusMessage.text}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Form Fields Card */}
                <div className="bg-white p-4 sm:p-5 rounded-xl border border-emerald-100 shadow-sm space-y-4">
                  <h3 className="text-xs font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-2 border-b border-emerald-50 pb-2">
                    <FileCheck className="w-4 h-4 text-emerald-600" />
                    Candidate & Application Information
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {/* Name */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Name: <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        placeholder="e.g. Rahul Ashok Sharma"
                        className={`w-full px-3 py-2 text-sm rounded-lg border bg-white focus:outline-none transition-all ${
                          errors.name
                            ? 'border-red-500 focus:ring-2 focus:ring-red-200'
                            : 'border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100'
                        }`}
                      />
                    </div>

                    {/* Mobile Number */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Mobile Number: <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        name="mobile"
                        value={form.mobile}
                        onChange={handleChange}
                        placeholder="e.g. 9876543210"
                        className={`w-full px-3 py-2 text-sm rounded-lg border bg-white focus:outline-none transition-all ${
                          errors.mobile
                            ? 'border-red-500 focus:ring-2 focus:ring-red-200'
                            : 'border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100'
                        }`}
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Email:
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="e.g. candidate@example.com"
                        className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 focus:outline-none transition-all"
                      />
                    </div>

                    {/* CET Registration No. */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        CET Registration No.:
                      </label>
                      <input
                        type="text"
                        name="cetRegNo"
                        value={form.cetRegNo}
                        onChange={handleChange}
                        placeholder="e.g. 2410293847"
                        className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 focus:outline-none transition-all font-mono"
                      />
                    </div>

                    {/* CAP Application No. */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        CAP Application No.:
                      </label>
                      <input
                        type="text"
                        name="capAppNo"
                        value={form.capAppNo}
                        onChange={handleChange}
                        placeholder="e.g. EN24104928"
                        className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 focus:outline-none transition-all font-mono uppercase"
                      />
                    </div>

                    {/* Course Name */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Course Name: <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="courseName"
                        value={form.courseName}
                        onChange={handleChange}
                        placeholder="e.g. First Year Engineering (B.Tech / B.E.)"
                        className={`w-full px-3 py-2 text-sm rounded-lg border bg-white focus:outline-none transition-all ${
                          errors.courseName
                            ? 'border-red-500 focus:ring-2 focus:ring-red-200'
                            : 'border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Scrutiny Mode (e scrutiny mode / physical) */}
                  <div className="pt-1">
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Scrutiny Mode:
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => handleScrutinySelect('E-Scrutiny Mode')}
                        className={`py-2 px-3 rounded-lg border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                          form.scrutinyMode === 'E-Scrutiny Mode'
                            ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm ring-2 ring-emerald-200'
                            : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        <span className="w-2 h-2 rounded-full bg-current"></span>
                        E-Scrutiny Mode
                      </button>

                      <button
                        type="button"
                        onClick={() => handleScrutinySelect('Physical Scrutiny Mode')}
                        className={`py-2 px-3 rounded-lg border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                          form.scrutinyMode === 'Physical Scrutiny Mode'
                            ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm ring-2 ring-emerald-200'
                            : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        <span className="w-2 h-2 rounded-full bg-current"></span>
                        Physical Scrutiny Mode
                      </button>
                    </div>
                  </div>

                  {/* Ticket No */}
                  <div className="pt-1">
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-slate-700">
                        Ticket No - :
                      </label>
                      <button
                        type="button"
                        onClick={generateTicketNumber}
                        className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 cursor-pointer"
                      >
                        <Sparkles className="w-3 h-3 text-emerald-600" />
                        Auto-generate Ticket ID
                      </button>
                    </div>
                    <input
                      type="text"
                      name="ticketNo"
                      value={form.ticketNo}
                      onChange={handleChange}
                      placeholder="e.g. WA-CAP-2026-894210 (or leave empty to auto-assign)"
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 focus:outline-none transition-all font-mono"
                    />
                  </div>

                  {/* Query */}
                  <div className="pt-1">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Query - : <span className="text-red-500">*</span>
                    </label>

                    {/* Quick suggestion tags */}
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {[
                        'Document Verification Pending',
                        'Discrepancy In E-Scrutiny Receipt',
                        'Category Certificate Update',
                        'Name Spelling Correction',
                        'Income / NCL Certificate Clarification',
                      ].map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => handleQuickQuery(preset)}
                          className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition-colors cursor-pointer"
                        >
                          + {preset}
                        </button>
                      ))}
                    </div>

                    <textarea
                      name="query"
                      rows={4}
                      value={form.query}
                      onChange={handleChange}
                      placeholder="Describe candidate query / discrepancy in detail..."
                      className={`w-full px-3 py-2 text-sm rounded-lg border bg-white focus:outline-none transition-all ${
                        errors.query
                          ? 'border-red-500 focus:ring-2 focus:ring-red-200'
                          : 'border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100'
                      }`}
                    />
                  </div>
                </div>

                {/* Form Buttons */}
                <div className="flex items-center justify-between gap-3 pt-1">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Reset
                  </button>

                  <button
                    type="submit"
                    id="generate-whatsapp-ticket-btn"
                    className="px-5 py-2.5 text-xs sm:text-sm font-bold rounded-lg bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white shadow-md hover:shadow-lg flex items-center gap-2 transition-all transform active:scale-98 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-emerald-200" />
                    Submit & Generate WhatsApp Ticket
                  </button>
                </div>
              </form>

              {/* Copyable Data Preview for WhatsApp */}
              {output && (
                <div
                  id="whatsapp-output-card"
                  className="bg-white p-4 sm:p-5 rounded-xl border-2 border-emerald-400 shadow-md space-y-3 animate-in fade-in zoom-in-95 duration-200"
                >
                  <div className="flex items-center justify-between flex-wrap gap-2 border-b border-emerald-100 pb-2">
                    <div className="flex items-center gap-2">
                      <MessageCircle className="w-5 h-5 text-[#25d366]" />
                      <span className="text-xs sm:text-sm font-extrabold text-emerald-950">
                        Copyable Data for WhatsApp (*Bold Headings Ready*)
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Direct WhatsApp Share Button */}
                      <button
                        type="button"
                        id="open-whatsapp-intent-btn"
                        onClick={handleDirectWhatsApp}
                        className="px-3 py-1.5 rounded-lg bg-[#25d366] hover:bg-[#20bd5a] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                        title="Send via WhatsApp"
                      >
                        <Send className="w-3.5 h-3.5" />
                        Open WhatsApp
                      </button>

                      {/* 1-Click Copy Button */}
                      <button
                        type="button"
                        id="copy-whatsapp-ticket-btn"
                        onClick={handleCopy}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                          copied
                            ? 'bg-emerald-700 text-white shadow-inner'
                            : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
                        }`}
                      >
                        {copied ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            Copy for WhatsApp
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* WhatsApp Formatted Message Box */}
                  <div className="relative">
                    <pre className="p-3.5 bg-[#e5ddd5]/30 rounded-lg text-xs font-mono text-slate-900 whitespace-pre-wrap leading-relaxed border border-emerald-200 selection:bg-emerald-300">
                      {output}
                    </pre>
                  </div>

                  <p className="text-[11px] text-slate-500 italic">
                    💡 Tip: The <code className="text-emerald-800 font-bold">*</code> markers around headers will automatically display in <b>bold</b> text when posted inside WhatsApp.
                  </p>
                </div>
              )}
            </div>

            {/* Modal Bottom Footer */}
            <div className="bg-[#063323] px-4 py-2.5 border-t border-emerald-500/20 flex items-center justify-between text-xs text-emerald-200/80">
              <span className="text-[11px] font-mono">DNO E-Scrutiny Center • Washim</span>
              <button
                onClick={onClose}
                className="px-3 py-1 rounded bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
