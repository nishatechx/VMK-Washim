import React, { useState } from 'react';
import { Users, BookOpen, Compass, CheckSquare, Award, FileSpreadsheet, ArrowRight } from 'lucide-react';

export const CounsellingView: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('Engineering');

  const guidanceRules = [
    {
      title: 'Caste & Validity Documentation',
      desc: 'Candidates claiming SC/ST/OBC/VJNT/NT/SBC category must produce original Caste Validity Certificate issued by Divisional Caste Scrutiny Committee.',
    },
    {
      title: 'Non-Creamy Layer (NCL) Validity',
      desc: 'NCL certificate must be valid up to 31st March 2027 (current financial block) for OBC, VJ/DT, NT-A, NT-B, NT-C, NT-D, and SBC categories.',
    },
    {
      title: 'EWS (Economically Weaker Section)',
      desc: 'EWS certificate in prescribed Proforma-V issued by Competent Authority for Maharashtra state candidates.',
    },
    {
      title: 'TFWS (Tuition Fee Waiver Scheme)',
      desc: 'Annual family income certificate issued by Tahsildar showing income less than ₹8,00,000/- per annum.',
    },
  ];

  return (
    <div className="relative z-10 w-full space-y-5">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-xs p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-700">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Student Counselling & Guidance</h2>
          </div>
        </div>
      </div>

      {/* Rules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {guidanceRules.map((rule, idx) => (
          <div
            key={idx}
            className="bg-white/90 backdrop-blur-xs border border-slate-200/80 rounded-xl p-4.5 shadow-2xs hover:border-blue-300 transition-colors"
          >
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                0{idx + 1}
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900">{rule.title}</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{rule.desc}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Option Form Verification Checklist */}
      <div className="bg-white/90 backdrop-blur-xs border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-3">
        <h3 className="text-sm font-bold text-slate-900">Option Form Verification Checklist</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
          <div className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-100">
            <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Choice Code Verification with DTE Institute Directory</span>
          </div>
          <div className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-100">
            <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Category reservation seats & TFWS priority checks</span>
          </div>
          <div className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-100">
            <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Candidate signature on final confirmed Option Form</span>
          </div>
          <div className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-100">
            <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Scrutiny acknowledgment receipt stamp & sign</span>
          </div>
        </div>
      </div>
    </div>
  );
};
