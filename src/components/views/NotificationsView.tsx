import React from 'react';
import { Bell, MessageCircle, AlertCircle, CheckCircle, Info } from 'lucide-react';

export const NotificationsView: React.FC = () => {
  const notifications = [
    {
      id: 1,
      title: 'State CET Cell Notice: Schedule Extension',
      desc: 'Online registration & document verification for B.E. / B.Tech extended till 28th August 2026.',
      time: '1 hour ago',
      type: 'info',
      icon: Info,
      color: 'bg-blue-50 text-blue-700 border-blue-200',
    },
    {
      id: 2,
      title: 'WhatsApp Batch Delivery Report',
      desc: 'All 24 pending candidate objection memos delivered successfully via WhatsApp gateway.',
      time: '3 hours ago',
      type: 'success',
      icon: CheckCircle,
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    {
      id: 3,
      title: 'Action Needed: 7 Candidates with Pending Objections',
      desc: 'Candidates have not responded to objection notices within the 48-hour window.',
      time: '5 hours ago',
      type: 'warning',
      icon: AlertCircle,
      color: 'bg-amber-50 text-amber-700 border-amber-200',
    },
  ];

  return (
    <div className="relative z-10 w-full space-y-5">
      <div className="bg-white/90 backdrop-blur-xs p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-700">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Notifications</h2>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {notifications.map((n) => {
          const Icon = n.icon;
          return (
            <div
              key={n.id}
              className="bg-white/90 backdrop-blur-xs border border-slate-200/80 rounded-2xl p-4.5 shadow-2xs flex items-start gap-4 hover:border-slate-300 transition-colors"
            >
              <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${n.color}`}>
                <Icon className="w-4.5 h-4.5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-xs font-bold text-slate-900">{n.title}</h3>
                  <span className="text-[11px] text-slate-400 whitespace-nowrap">{n.time}</span>
                </div>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{n.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
