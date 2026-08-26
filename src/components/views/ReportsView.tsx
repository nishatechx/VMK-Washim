import React from 'react';
import { BarChart3, Download, Printer, TrendingUp, CheckCircle2, AlertTriangle, Send } from 'lucide-react';

export const ReportsView: React.FC = () => {
  return (
    <div className="relative z-10 w-full space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/90 backdrop-blur-xs p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-700">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Reports & Analytics</h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span>Print Report</span>
          </button>
          <button
            onClick={() => alert('Exporting Scrutiny Center CSV log...')}
            className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer shadow-xs"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Discrepancy Tally Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white/90 backdrop-blur-xs border border-slate-200/80 rounded-2xl p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-700">Caste / Category Objections</span>
            <span className="text-xs font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
              42%
            </span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-2">
            <div className="bg-amber-500 h-full w-[42%]" />
          </div>
          <p className="text-[11px] text-slate-500">
            NCL expiry, Caste Validity submission pending, EWS financial year updates.
          </p>
        </div>

        <div className="bg-white/90 backdrop-blur-xs border border-slate-200/80 rounded-2xl p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-700">Academic Marksheet Discrepancies</span>
            <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
              35%
            </span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-2">
            <div className="bg-blue-500 h-full w-[35%]" />
          </div>
          <p className="text-[11px] text-slate-500">
            HSC / Diploma aggregate marks mismatch, PCM percentage recalculation.
          </p>
        </div>

        <div className="bg-white/90 backdrop-blur-xs border border-slate-200/80 rounded-2xl p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-700">Domicile / Identity Issues</span>
            <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
              23%
            </span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-2">
            <div className="bg-emerald-500 h-full w-[23%]" />
          </div>
          <p className="text-[11px] text-slate-500">
            Domicile certificate proforma mismatch or Leaving Certificate replacement.
          </p>
        </div>
      </div>
    </div>
  );
};
