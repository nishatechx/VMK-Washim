import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Copy,
  Check,
  Trash2,
  FileText,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Info,
  Send,
  ArrowRight,
  RotateCcw,
} from 'lucide-react';

interface TicketState {
  cet: string;
  name: string;
  course: string;
  category: string;
  cap: string;
  grievance: string;
  attempt: string;
  year: string;
  problem: string;
  context: string;
  history: string;
  impact: string;
  evidence: string;
}

interface ClosureState {
  ticket: string;
  cet: string;
  name: string;
  course: string;
  status: string;
  issue: string;
  investigation: string;
  action: string;
  refType: string;
  ref: string;
  next: string;
  attach: string;
}

interface TicketGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TicketGeneratorModal: React.FC<TicketGeneratorModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'ticket' | 'closure'>('ticket');

  // Ticket Form State
  const [ticketForm, setTicketForm] = useState<TicketState>({
    cet: '',
    name: '',
    course: '',
    category: '',
    cap: '',
    grievance: '',
    attempt: '',
    year: '',
    problem: '',
    context: '',
    history: '',
    impact: '',
    evidence: '',
  });

  const [ticketOutput, setTicketOutput] = useState<string>('');
  const [ticketStatus, setTicketStatus] = useState<{ message: string; type: 'ok' | 'bad' | 'neutral' }>({
    message: 'Fill mandatory fields to generate a compliant ticket.',
    type: 'neutral',
  });
  const [ticketCopied, setTicketCopied] = useState<boolean>(false);

  // Closure Form State
  const [closureForm, setClosureForm] = useState<ClosureState>({
    ticket: '',
    cet: '',
    name: '',
    course: '',
    status: '',
    issue: '',
    investigation: '',
    action: '',
    refType: '',
    ref: '',
    next: '',
    attach: '',
  });

  const [closureOutput, setClosureOutput] = useState<string>('');
  const [closureStatus, setClosureStatus] = useState<{ message: string; type: 'ok' | 'bad' | 'neutral' }>({
    message: 'Complete all mandatory closure fields.',
    type: 'neutral',
  });
  const [closureCopied, setClosureCopied] = useState<boolean>(false);

  // Stored Current Ticket for sync
  const [currentTicket, setCurrentTicket] = useState<TicketState | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleTabChange = (tab: 'ticket' | 'closure') => {
    setActiveTab(tab);
    if (tab === 'closure' && currentTicket) {
      setClosureForm((prev) => ({
        ...prev,
        cet: currentTicket.cet || prev.cet,
        name: currentTicket.name || prev.name,
        course: currentTicket.course || prev.course,
        issue: currentTicket.problem || prev.issue,
      }));
    }
  };

  // Ticket Generator Handlers
  const handleTicketChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    const keyMap: Record<string, keyof TicketState> = {
      t_cet: 'cet',
      t_name: 'name',
      t_course: 'course',
      t_category: 'category',
      t_cap: 'cap',
      t_grievance: 'grievance',
      t_attempt: 'attempt',
      t_year: 'year',
      t_problem: 'problem',
      t_context: 'context',
      t_history: 'history',
      t_impact: 'impact',
      t_evidence: 'evidence',
    };
    const stateKey = keyMap[id];
    if (stateKey) {
      setTicketForm((prev) => ({ ...prev, [stateKey]: value }));
    }
  };

  const generateTicket = () => {
    const { cet, name, course, category, attempt, year, problem, context, history, impact, evidence } =
      ticketForm;

    const isYearRequired = attempt.startsWith('Yes');
    const isBasicValid =
      cet.trim() &&
      name.trim() &&
      course.trim() &&
      category.trim() &&
      attempt.trim() &&
      problem.trim() &&
      context.trim() &&
      history.trim() &&
      impact.trim() &&
      evidence.trim();

    if (!isBasicValid || (isYearRequired && !year.trim())) {
      setTicketStatus({
        message: 'Complete all mandatory ticket fields marked with *',
        type: 'bad',
      });
      return;
    }

    const attemptString = isYearRequired
      ? `Yes, appeared in ${year.trim()}.`
      : attempt.trim();

    const storedTicket: TicketState = {
      ...ticketForm,
      attempt: attemptString,
    };
    setCurrentTicket(storedTicket);

    const outputText = `=== MANDATORY CASE HEADER ===
CET App No: ${cet.trim()} | Name: ${name.trim()} | Course: ${course.trim()}
CAP App ID: ${ticketForm.cap.trim() || 'N/A'} | CAP Grievance No: ${ticketForm.grievance.trim() || 'N/A'}
Nature of Issue: ${category.trim()} | CET Attempt History: ${attemptString}

=== DETAILED NARRATIVE ===
Problem Statement: ${problem.trim()}
Context & Environment: ${context.trim()}
Prior Actions: ${history.trim()}
Impact: ${impact.trim()}
Evidence / Verification: ${evidence.trim()}`;

    setTicketOutput(outputText);

    // Auto-carry forward to closure
    setClosureForm((prev) => ({
      ...prev,
      cet: cet.trim(),
      name: name.trim(),
      course: course.trim(),
      issue: problem.trim(),
    }));

    setTicketStatus({
      message: 'Ticket note generated. Details carried to Resolution / Close Ticket.',
      type: 'ok',
    });
  };

  const copyTicket = async () => {
    if (!ticketOutput) return;
    try {
      await navigator.clipboard.writeText(ticketOutput);
      setTicketCopied(true);
      setTimeout(() => setTicketCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  const clearTicket = () => {
    setTicketForm({
      cet: '',
      name: '',
      course: '',
      category: '',
      cap: '',
      grievance: '',
      attempt: '',
      year: '',
      problem: '',
      context: '',
      history: '',
      impact: '',
      evidence: '',
    });
    setTicketOutput('');
    setTicketStatus({
      message: 'Fill mandatory fields to generate a compliant ticket.',
      type: 'neutral',
    });
    setCurrentTicket(null);
    setClosureForm((prev) => ({
      ...prev,
      cet: '',
      name: '',
      course: '',
      issue: '',
    }));
  };

  // Closure Form Handlers
  const handleClosureChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    const keyMap: Record<string, keyof ClosureState> = {
      c_ticket: 'ticket',
      c_cet: 'cet',
      c_name: 'name',
      c_course: 'course',
      c_status: 'status',
      c_issue: 'issue',
      c_investigation: 'investigation',
      c_action: 'action',
      c_ref_type: 'refType',
      c_ref: 'ref',
      c_next: 'next',
      c_attach: 'attach',
    };
    const stateKey = keyMap[id];
    if (stateKey) {
      setClosureForm((prev) => ({ ...prev, [stateKey]: value }));
    }
  };

  const generateClosure = () => {
    const {
      ticket,
      cet,
      name,
      status,
      issue,
      investigation,
      action,
      refType,
      ref,
      next,
      attach,
    } = closureForm;

    const isValid =
      ticket.trim() &&
      cet.trim() &&
      name.trim() &&
      status.trim() &&
      issue.trim() &&
      investigation.trim() &&
      action.trim() &&
      refType.trim() &&
      ref.trim() &&
      next.trim();

    if (!isValid) {
      setClosureStatus({
        message: 'Complete all mandatory closure fields marked with *',
        type: 'bad',
      });
      return;
    }

    const att = attach.trim()
      ? attach
          .trim()
          .split('\n')
          .filter(Boolean)
          .map((x) => `[Attached: ${x.trim()}]`)
          .join('\n')
      : '[No closure attachment specified]';

    const outputText = `=== RESOLUTION / CLOSURE NOTE ===
Ticket No: ${ticket.trim()} | CET App No: ${cet.trim()} | Candidate: ${name.trim()}
Case Status: ${status.trim()}

Issue Summary: ${issue.trim()}
Investigation Conducted: ${investigation.trim()}
Action Taken: ${action.trim()}
Resolution Reference: ${refType.trim()} — ${ref.trim()}
Next Steps / Candidate Informed: ${next.trim()}

Closure Evidence:
${att}`;

    setClosureOutput(outputText);
    setClosureStatus({
      message: 'Evidence-backed resolution / closure note generated.',
      type: 'ok',
    });
  };

  const copyClosure = async () => {
    if (!closureOutput) return;
    try {
      await navigator.clipboard.writeText(closureOutput);
      setClosureCopied(true);
      setTimeout(() => setClosureCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  const clearClosure = () => {
    setClosureForm({
      ticket: '',
      cet: '',
      name: '',
      course: '',
      status: '',
      issue: '',
      investigation: '',
      action: '',
      refType: '',
      ref: '',
      next: '',
      attach: '',
    });
    setClosureOutput('');
    setClosureStatus({
      message: 'Complete all mandatory closure fields.',
      type: 'neutral',
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          id="ticket-modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-950/70 backdrop-blur-sm overflow-y-auto"
          onClick={onClose}
        >
          <motion.div
            id="ticket-modal-container"
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-6xl bg-slate-50 text-slate-900 rounded-2xl shadow-2xl border border-slate-200/90 overflow-hidden my-auto max-h-[94vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header: Dark Slate/Navy with Indigo Accent */}
            <div className="bg-slate-900 text-white px-5 sm:px-8 py-4 border-b border-slate-800 flex items-center justify-between shrink-0 select-none">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-xs">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="text-base sm:text-lg font-bold text-white tracking-wide leading-tight">
                    SOP105 • Candidate Support Case Tool
                  </h1>
                  <p className="text-xs text-slate-300 font-medium">
                    Ticket Creation + Separate Resolution / Closure Forms
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:gap-3">
                <span className="hidden sm:inline-flex text-xs font-mono font-bold px-2.5 py-1 bg-slate-800 text-indigo-300 border border-slate-700 rounded-lg">
                  SOP105 • v1.0
                </span>
                <span className="text-xs font-mono font-bold px-2.5 py-1 bg-slate-800 text-slate-300 border border-slate-700 rounded-lg">
                  VMK-WSM
                </span>
                <button
                  id="close-ticket-modal"
                  onClick={onClose}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                  title="Close (Esc)"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="bg-white border-b border-slate-200 px-5 sm:px-8 pt-3 shrink-0">
              <div className="flex gap-2">
                <button
                  id="tab-ticket"
                  onClick={() => handleTabChange('ticket')}
                  className={`px-5 py-2.5 rounded-t-xl font-bold text-xs sm:text-sm transition-all cursor-pointer border-t border-x flex items-center gap-2 ${
                    activeTab === 'ticket'
                      ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                      : 'bg-slate-100 text-slate-600 border-slate-200 hover:text-slate-900 hover:bg-slate-200/80'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>Create Ticket</span>
                </button>
                <button
                  id="tab-closure"
                  onClick={() => handleTabChange('closure')}
                  className={`px-5 py-2.5 rounded-t-xl font-bold text-xs sm:text-sm transition-all cursor-pointer border-t border-x flex items-center gap-2 ${
                    activeTab === 'closure'
                      ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                      : 'bg-slate-100 text-slate-600 border-slate-200 hover:text-slate-900 hover:bg-slate-200/80'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Resolution / Close Ticket</span>
                </button>
              </div>
            </div>

            {/* Scrollable Body Content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-7">
              {/* TAB 1: CREATE TICKET */}
              {activeTab === 'ticket' && (
                <div id="ticket" className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6">
                  {/* Left Column: Form Cards */}
                  <div className="space-y-5">
                    {/* Card 1: Ticket Information */}
                    <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
                      <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                        <h2 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wide">
                          Ticket Information
                        </h2>
                        <span className="text-[11px] font-mono font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md border border-indigo-100">
                          SOP §5.0
                        </span>
                      </div>
                      <div className="p-5 space-y-4">
                        <div className="bg-indigo-50/80 border border-indigo-100 text-indigo-900 rounded-xl p-3 text-xs leading-relaxed flex items-start gap-2">
                          <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                          <span>
                            This form is only for <b>creating and documenting a candidate ticket</b>. Resolution and closure are handled separately in the second form.
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="flex flex-col gap-1.5">
                            <label htmlFor="t_cet" className="text-xs font-bold text-slate-700">
                              CET Application Number <span className="text-rose-600">*</span>
                            </label>
                            <input
                              id="t_cet"
                              type="text"
                              value={ticketForm.cet}
                              onChange={handleTicketChange}
                              placeholder="CET2026XXXXXXX"
                              className="w-full px-3.5 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:border-indigo-600 focus:ring-3 focus:ring-indigo-600/15 outline-none bg-white font-mono placeholder:text-slate-400"
                            />
                          </div>

                          <div className="flex flex-col gap-1.5">
                            <label htmlFor="t_name" className="text-xs font-bold text-slate-700">
                              Candidate Name <span className="text-rose-600">*</span>
                            </label>
                            <input
                              id="t_name"
                              type="text"
                              value={ticketForm.name}
                              onChange={handleTicketChange}
                              placeholder="As per official application form"
                              className="w-full px-3.5 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:border-indigo-600 focus:ring-3 focus:ring-indigo-600/15 outline-none bg-white placeholder:text-slate-400"
                            />
                          </div>

                          <div className="flex flex-col gap-1.5">
                            <label htmlFor="t_course" className="text-xs font-bold text-slate-700">
                              Course Name <span className="text-rose-600">*</span>
                            </label>
                            <input
                              id="t_course"
                              type="text"
                              value={ticketForm.course}
                              onChange={handleTicketChange}
                              placeholder="e.g. B.E. / B.Tech Computer Engineering"
                              className="w-full px-3.5 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:border-indigo-600 focus:ring-3 focus:ring-indigo-600/15 outline-none bg-white placeholder:text-slate-400"
                            />
                          </div>

                          <div className="flex flex-col gap-1.5">
                            <label htmlFor="t_category" className="text-xs font-bold text-slate-700">
                              Nature of Issue <span className="text-rose-600">*</span>
                            </label>
                            <select
                              id="t_category"
                              value={ticketForm.category}
                              onChange={handleTicketChange}
                              className="w-full px-3.5 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:border-indigo-600 focus:ring-3 focus:ring-indigo-600/15 outline-none bg-white"
                            >
                              <option value="">Select issue category</option>
                              <option value="Technical Issue">Technical Issue</option>
                              <option value="Policy/Process Clarity">Policy/Process Clarity</option>
                              <option value="General Query">General Query</option>
                              <option value="Case Update (Follow-up)">Case Update (Follow-up)</option>
                            </select>
                          </div>

                          <div className="flex flex-col gap-1.5">
                            <label htmlFor="t_cap" className="text-xs font-bold text-slate-700">
                              CAP Application ID
                            </label>
                            <input
                              id="t_cap"
                              type="text"
                              value={ticketForm.cap}
                              onChange={handleTicketChange}
                              placeholder="e.g. EN26123456 (If applicable)"
                              className="w-full px-3.5 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:border-indigo-600 focus:ring-3 focus:ring-indigo-600/15 outline-none bg-white font-mono placeholder:text-slate-400"
                            />
                          </div>

                          <div className="flex flex-col gap-1.5">
                            <label htmlFor="t_grievance" className="text-xs font-bold text-slate-700">
                              CAP Ticket / Grievance No.
                            </label>
                            <input
                              id="t_grievance"
                              type="text"
                              value={ticketForm.grievance}
                              onChange={handleTicketChange}
                              placeholder="If already raised on portal"
                              className="w-full px-3.5 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:border-indigo-600 focus:ring-3 focus:ring-indigo-600/15 outline-none bg-white font-mono placeholder:text-slate-400"
                            />
                          </div>

                          <div className="flex flex-col gap-1.5">
                            <label htmlFor="t_attempt" className="text-xs font-bold text-slate-700">
                              CET Attempt History <span className="text-rose-600">*</span>
                            </label>
                            <select
                              id="t_attempt"
                              value={ticketForm.attempt}
                              onChange={handleTicketChange}
                              className="w-full px-3.5 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:border-indigo-600 focus:ring-3 focus:ring-indigo-600/15 outline-none bg-white"
                            >
                              <option value="">Select attempt status</option>
                              <option value="No, this is the first attempt.">No, this is the first attempt.</option>
                              <option value="Yes, appeared in previous CET">Yes, appeared in previous CET</option>
                            </select>
                          </div>

                          {ticketForm.attempt.startsWith('Yes') && (
                            <div id="t_year_box" className="flex flex-col gap-1.5">
                              <label htmlFor="t_year" className="text-xs font-bold text-slate-700">
                                Previous CET Year <span className="text-rose-600">*</span>
                              </label>
                              <input
                                id="t_year"
                                type="text"
                                value={ticketForm.year}
                                onChange={handleTicketChange}
                                placeholder="e.g. 2025"
                                className="w-full px-3.5 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:border-indigo-600 focus:ring-3 focus:ring-indigo-600/15 outline-none bg-white font-mono placeholder:text-slate-400"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Card 2: Ticket Narrative */}
                    <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
                      <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                        <h2 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wide">
                          Ticket Narrative
                        </h2>
                        <span className="text-[11px] font-mono font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md border border-indigo-100">
                          5-Pillar Framework
                        </span>
                      </div>
                      <div className="p-5 space-y-4">
                        <div className="flex flex-col gap-1.5">
                          <label htmlFor="t_problem" className="text-xs font-bold text-slate-700">
                            Problem Statement — What? <span className="text-rose-600">*</span>
                          </label>
                          <textarea
                            id="t_problem"
                            value={ticketForm.problem}
                            onChange={handleTicketChange}
                            rows={2}
                            placeholder="One precise sentence describing the candidate's issue or blocker."
                            className="w-full px-3.5 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:border-indigo-600 focus:ring-3 focus:ring-indigo-600/15 outline-none bg-white placeholder:text-slate-400"
                          />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label htmlFor="t_context" className="text-xs font-bold text-slate-700">
                            Context & Environment — Where / When? <span className="text-rose-600">*</span>
                          </label>
                          <textarea
                            id="t_context"
                            value={ticketForm.context}
                            onChange={handleTicketChange}
                            rows={2}
                            placeholder="Portal page/step, date/time, device/browser if technical, and source of information."
                            className="w-full px-3.5 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:border-indigo-600 focus:ring-3 focus:ring-indigo-600/15 outline-none bg-white placeholder:text-slate-400"
                          />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label htmlFor="t_history" className="text-xs font-bold text-slate-700">
                            Prior Actions — History <span className="text-rose-600">*</span>
                          </label>
                          <textarea
                            id="t_history"
                            value={ticketForm.history}
                            onChange={handleTicketChange}
                            rows={2}
                            placeholder="What has the candidate already tried? Previous helpdesk/ticket numbers, if any."
                            className="w-full px-3.5 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:border-indigo-600 focus:ring-3 focus:ring-indigo-600/15 outline-none bg-white placeholder:text-slate-400"
                          />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label htmlFor="t_impact" className="text-xs font-bold text-slate-700">
                            Impact — Urgency / Deadline <span className="text-rose-600">*</span>
                          </label>
                          <textarea
                            id="t_impact"
                            value={ticketForm.impact}
                            onChange={handleTicketChange}
                            rows={2}
                            placeholder="Deadline, consequence, SLA or other measurable impact."
                            className="w-full px-3.5 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:border-indigo-600 focus:ring-3 focus:ring-indigo-600/15 outline-none bg-white placeholder:text-slate-400"
                          />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label htmlFor="t_evidence" className="text-xs font-bold text-slate-700">
                            Evidence / Verification <span className="text-rose-600">*</span>
                          </label>
                          <textarea
                            id="t_evidence"
                            value={ticketForm.evidence}
                            onChange={handleTicketChange}
                            rows={2}
                            placeholder="What has been verified? Mention the system/document/source checked."
                            className="w-full px-3.5 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:border-indigo-600 focus:ring-3 focus:ring-indigo-600/15 outline-none bg-white placeholder:text-slate-400"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap items-center gap-3 pt-1">
                      <button
                        onClick={generateTicket}
                        className="px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors cursor-pointer flex items-center gap-2"
                      >
                        <Sparkles className="w-4 h-4" />
                        <span>Generate Ticket Note</span>
                      </button>
                      <button
                        onClick={copyTicket}
                        className="px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        {ticketCopied ? (
                          <Check className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Copy className="w-4 h-4 text-slate-600" />
                        )}
                        <span>{ticketCopied ? 'Copied!' : 'Copy'}</span>
                      </button>
                      <button
                        onClick={clearTicket}
                        className="px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Clear</span>
                      </button>
                    </div>
                  </div>

                  {/* Right Column: Output Side Panel */}
                  <aside className="lg:sticky lg:top-0 space-y-4">
                    <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden flex flex-col h-full">
                      <div className="px-5 py-3.5 bg-slate-900 text-white border-b border-slate-800 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                          <h2 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
                            Generated Ticket Note
                          </h2>
                        </div>
                        <button
                          onClick={copyTicket}
                          className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-200 border border-slate-700 flex items-center gap-1 transition-colors"
                        >
                          {ticketCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          <span>{ticketCopied ? 'Copied' : 'Copy Text'}</span>
                        </button>
                      </div>
                      <div className="p-4 sm:p-5 flex-1 flex flex-col gap-3">
                        <div
                          id="t_status"
                          className={`p-3 rounded-xl text-xs font-medium border flex items-center gap-2 ${
                            ticketStatus.type === 'ok'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : ticketStatus.type === 'bad'
                              ? 'bg-rose-50 text-rose-800 border-rose-200'
                              : 'bg-slate-50 text-slate-600 border-slate-200'
                          }`}
                        >
                          {ticketStatus.type === 'ok' && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                          {ticketStatus.type === 'bad' && <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />}
                          <span>{ticketStatus.message}</span>
                        </div>

                        <textarea
                          id="t_output"
                          readOnly
                          value={ticketOutput}
                          placeholder="Generated ticket narrative will appear here..."
                          className="w-full flex-1 min-h-[460px] p-4 bg-slate-950 text-emerald-400 font-mono text-xs sm:text-sm leading-relaxed rounded-xl border border-slate-800 outline-none resize-none selection:bg-indigo-600 selection:text-white"
                        />
                      </div>
                    </div>
                  </aside>
                </div>
              )}

              {/* TAB 2: RESOLUTION / CLOSE TICKET */}
              {activeTab === 'closure' && (
                <div id="closure" className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6">
                  {/* Left Column: Form Cards */}
                  <div className="space-y-5">
                    {/* Card 1: Existing Ticket / Case */}
                    <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
                      <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                        <h2 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wide">
                          Existing Ticket / Case
                        </h2>
                        <span className="text-[11px] font-mono font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md border border-indigo-100">
                          Resolution & Closure
                        </span>
                      </div>
                      <div className="p-5 space-y-4">
                        <div className="bg-indigo-50/80 border border-indigo-100 text-indigo-900 rounded-xl p-3 text-xs leading-relaxed flex items-start gap-2">
                          <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                          <span>
                            Use this separate form after investigation. Candidate details are carried from <b>Create Ticket</b>. A ticket must not be closed without at least one traceable resolution reference.
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="flex flex-col gap-1.5">
                            <label htmlFor="c_ticket" className="text-xs font-bold text-slate-700">
                              Ticket Number <span className="text-rose-600">*</span>
                            </label>
                            <input
                              id="c_ticket"
                              type="text"
                              value={closureForm.ticket}
                              onChange={handleClosureChange}
                              placeholder="e.g. #67951"
                              className="w-full px-3.5 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:border-indigo-600 focus:ring-3 focus:ring-indigo-600/15 outline-none bg-white font-mono placeholder:text-slate-400"
                            />
                          </div>

                          <div className="flex flex-col gap-1.5">
                            <label htmlFor="c_cet" className="text-xs font-bold text-slate-700">
                              CET Application Number <span className="text-rose-600">*</span>
                            </label>
                            <input
                              id="c_cet"
                              type="text"
                              value={closureForm.cet}
                              onChange={handleClosureChange}
                              placeholder="CET2026XXXXXXX"
                              className="w-full px-3.5 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:border-indigo-600 focus:ring-3 focus:ring-indigo-600/15 outline-none bg-white font-mono placeholder:text-slate-400"
                            />
                          </div>

                          <div className="flex flex-col gap-1.5">
                            <label htmlFor="c_name" className="text-xs font-bold text-slate-700">
                              Candidate Name <span className="text-rose-600">*</span>
                            </label>
                            <input
                              id="c_name"
                              type="text"
                              value={closureForm.name}
                              onChange={handleClosureChange}
                              placeholder="Candidate name"
                              className="w-full px-3.5 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:border-indigo-600 focus:ring-3 focus:ring-indigo-600/15 outline-none bg-white placeholder:text-slate-400"
                            />
                          </div>

                          <div className="flex flex-col gap-1.5">
                            <label htmlFor="c_course" className="text-xs font-bold text-slate-700">
                              Course Name
                            </label>
                            <input
                              id="c_course"
                              type="text"
                              readOnly
                              value={closureForm.course}
                              onChange={handleClosureChange}
                              placeholder="Auto-filled from Create Ticket"
                              className="w-full px-3.5 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl outline-none bg-slate-100 text-slate-600 cursor-not-allowed"
                            />
                          </div>

                          <div className="flex flex-col gap-1.5 sm:col-span-2">
                            <label htmlFor="c_status" className="text-xs font-bold text-slate-700">
                              Case Status <span className="text-rose-600">*</span>
                            </label>
                            <select
                              id="c_status"
                              value={closureForm.status}
                              onChange={handleClosureChange}
                              className="w-full px-3.5 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:border-indigo-600 focus:ring-3 focus:ring-indigo-600/15 outline-none bg-white"
                            >
                              <option value="">Select status</option>
                              <option value="Resolved">Resolved</option>
                              <option value="Update Provided">Update Provided</option>
                              <option value="Closed - Information Provided">Closed - Information Provided</option>
                              <option value="Escalated">Escalated</option>
                              <option value="Pending Candidate Action">Pending Candidate Action</option>
                              <option value="Pending Internal Action">Pending Internal Action</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Card 2: Mandatory Closure Note */}
                    <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
                      <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                        <h2 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wide">
                          Mandatory Closure Note
                        </h2>
                        <span className="text-[11px] font-mono font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md border border-indigo-100">
                          SOP §8.0
                        </span>
                      </div>
                      <div className="p-5 space-y-4">
                        <div className="flex flex-col gap-1.5">
                          <label htmlFor="c_issue" className="text-xs font-bold text-slate-700">
                            Issue Summary <span className="text-rose-600">*</span>
                          </label>
                          <textarea
                            id="c_issue"
                            value={closureForm.issue}
                            onChange={handleClosureChange}
                            rows={2}
                            placeholder="Precise one-line summary of the issue."
                            className="w-full px-3.5 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:border-indigo-600 focus:ring-3 focus:ring-indigo-600/15 outline-none bg-white placeholder:text-slate-400"
                          />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label htmlFor="c_investigation" className="text-xs font-bold text-slate-700">
                            Investigation Conducted <span className="text-rose-600">*</span>
                          </label>
                          <textarea
                            id="c_investigation"
                            value={closureForm.investigation}
                            onChange={handleClosureChange}
                            rows={2}
                            placeholder="Systems, documents, portal records, backend status, or other checks performed."
                            className="w-full px-3.5 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:border-indigo-600 focus:ring-3 focus:ring-indigo-600/15 outline-none bg-white placeholder:text-slate-400"
                          />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label htmlFor="c_action" className="text-xs font-bold text-slate-700">
                            Action Taken <span className="text-rose-600">*</span>
                          </label>
                          <textarea
                            id="c_action"
                            value={closureForm.action}
                            onChange={handleClosureChange}
                            rows={2}
                            placeholder="Exact steps performed by counselor/backend team."
                            className="w-full px-3.5 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:border-indigo-600 focus:ring-3 focus:ring-indigo-600/15 outline-none bg-white placeholder:text-slate-400"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="flex flex-col gap-1.5">
                            <label htmlFor="c_ref_type" className="text-xs font-bold text-slate-700">
                              Resolution Reference Type <span className="text-rose-600">*</span>
                            </label>
                            <select
                              id="c_ref_type"
                              value={closureForm.refType}
                              onChange={handleClosureChange}
                              className="w-full px-3.5 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:border-indigo-600 focus:ring-3 focus:ring-indigo-600/15 outline-none bg-white"
                            >
                              <option value="">Select reference</option>
                              <option value="KB Article">KB Article</option>
                              <option value="Official Notice / Circular">Official Notice / Circular</option>
                              <option value="Government Resolution (GR)">Government Resolution (GR)</option>
                              <option value="CET Cell Notification">CET Cell Notification</option>
                              <option value="Official Portal Screenshot">Official Portal Screenshot</option>
                              <option value="Parent Ticket / Cross-reference">Parent Ticket / Cross-reference</option>
                            </select>
                          </div>

                          <div className="flex flex-col gap-1.5">
                            <label htmlFor="c_ref" className="text-xs font-bold text-slate-700">
                              Reference Number / Version / Date <span className="text-rose-600">*</span>
                            </label>
                            <input
                              id="c_ref"
                              type="text"
                              value={closureForm.ref}
                              onChange={handleClosureChange}
                              placeholder="e.g. KB-101, Version 2.0"
                              className="w-full px-3.5 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:border-indigo-600 focus:ring-3 focus:ring-indigo-600/15 outline-none bg-white placeholder:text-slate-400"
                            />
                          </div>
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label htmlFor="c_next" className="text-xs font-bold text-slate-700">
                            Next Steps / Candidate Informed <span className="text-rose-600">*</span>
                          </label>
                          <textarea
                            id="c_next"
                            value={closureForm.next}
                            onChange={handleClosureChange}
                            rows={2}
                            placeholder="What was communicated to the candidate and what they need to do next."
                            className="w-full px-3.5 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:border-indigo-600 focus:ring-3 focus:ring-indigo-600/15 outline-none bg-white placeholder:text-slate-400"
                          />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label htmlFor="c_attach" className="text-xs font-bold text-slate-700">
                            Closure Evidence / Attachment Filename
                          </label>
                          <textarea
                            id="c_attach"
                            value={closureForm.attach}
                            onChange={handleClosureChange}
                            rows={2}
                            placeholder={`Official_Notice_15Jul2026.pdf\nScreenshot_Successful_Upload.png`}
                            className="w-full px-3.5 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:border-indigo-600 focus:ring-3 focus:ring-indigo-600/15 outline-none bg-white font-mono placeholder:text-slate-400"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap items-center gap-3 pt-1">
                      <button
                        onClick={generateClosure}
                        className="px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors cursor-pointer flex items-center gap-2"
                      >
                        <Sparkles className="w-4 h-4" />
                        <span>Generate Closure Note</span>
                      </button>
                      <button
                        onClick={copyClosure}
                        className="px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        {closureCopied ? (
                          <Check className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Copy className="w-4 h-4 text-slate-600" />
                        )}
                        <span>{closureCopied ? 'Copied!' : 'Copy'}</span>
                      </button>
                      <button
                        onClick={clearClosure}
                        className="px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Clear</span>
                      </button>
                    </div>
                  </div>

                  {/* Right Column: Output Side Panel */}
                  <aside className="lg:sticky lg:top-0 space-y-4">
                    <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden flex flex-col h-full">
                      <div className="px-5 py-3.5 bg-slate-900 text-white border-b border-slate-800 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                          <h2 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
                            Resolution / Closure Note
                          </h2>
                        </div>
                        <button
                          onClick={copyClosure}
                          className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-200 border border-slate-700 flex items-center gap-1 transition-colors"
                        >
                          {closureCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          <span>{closureCopied ? 'Copied' : 'Copy Text'}</span>
                        </button>
                      </div>
                      <div className="p-4 sm:p-5 flex-1 flex flex-col gap-3">
                        <div
                          id="c_status_box"
                          className={`p-3 rounded-xl text-xs font-medium border flex items-center gap-2 ${
                            closureStatus.type === 'ok'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : closureStatus.type === 'bad'
                              ? 'bg-rose-50 text-rose-800 border-rose-200'
                              : 'bg-slate-50 text-slate-600 border-slate-200'
                          }`}
                        >
                          {closureStatus.type === 'ok' && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                          {closureStatus.type === 'bad' && <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />}
                          <span>{closureStatus.message}</span>
                        </div>

                        <textarea
                          id="c_output"
                          readOnly
                          value={closureOutput}
                          placeholder="Closure note will appear here..."
                          className="w-full flex-1 min-h-[460px] p-4 bg-slate-950 text-emerald-400 font-mono text-xs sm:text-sm leading-relaxed rounded-xl border border-slate-800 outline-none resize-none selection:bg-indigo-600 selection:text-white"
                        />
                      </div>
                    </div>
                  </aside>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
