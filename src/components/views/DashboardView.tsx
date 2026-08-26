import React from 'react';
import {
  MessageCircle,
  QrCode,
  FileText,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Users,
  UserCheck,
  FileSpreadsheet,
  GraduationCap,
  BarChart3,
  Bell,
  Settings,
  UserCircle,
  Lock,
  Sparkles,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import { getStudentRecords, getVisitorRecords } from '../../services/authService';
import { UserProfile } from '../../types/auth';

interface DashboardViewProps {
  onOpenWhatsappTool: () => void;
  onOpenQrTool: () => void;
  onOpenTicketTool: () => void;
  onNavigateTab: (tab: any) => void;
  currentUser?: UserProfile | null;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onOpenWhatsappTool,
  onOpenQrTool,
  onOpenTicketTool,
  onNavigateTab,
  currentUser,
}) => {
  const students = getStudentRecords();
  const visitors = getVisitorRecords();

  const verifiedCount = students.filter((s) => s.status === 'Verified').length;
  const objectionCount = students.filter((s) => s.status === 'Objection Raised').length;
  const inCenterVisitors = visitors.filter((v) => v.status === 'In Premises').length;

  const quickStats = [
    {
      label: 'Verified Candidates',
      value: `${verifiedCount}`,
      change: students.length > 0 ? `${Math.round((verifiedCount / students.length) * 100)}% verified` : '0 today',
      icon: CheckCircle2,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    },
    {
      label: 'Pending Objections',
      value: `${objectionCount}`,
      change: objectionCount > 0 ? 'Action required' : 'Clear',
      icon: AlertTriangle,
      color: 'text-amber-600 bg-amber-50 border-amber-200',
    },
    {
      label: 'Visitors Today',
      value: `${visitors.length}`,
      change: inCenterVisitors > 0 ? `${inCenterVisitors} in center` : 'All checked out',
      icon: UserCheck,
      color: 'text-indigo-600 bg-indigo-50 border-indigo-200',
    },
    {
      label: 'Total Candidates',
      value: `${students.length}`,
      change: 'Active database',
      icon: Users,
      color: 'text-blue-600 bg-blue-50 border-blue-200',
    },
  ];

  const recentStudents = students.slice(0, 5);

  const canWhatsapp = currentUser?.allowedFeatures ? currentUser.allowedFeatures.includes('whatsapp_tool') : true;
  const canQr = currentUser?.allowedFeatures ? currentUser.allowedFeatures.includes('qr_upload_tool') : true;
  const canTicket = currentUser?.allowedFeatures ? currentUser.allowedFeatures.includes('ticket_generator_tool') : true;
  const isDnoAdmin = currentUser?.role === 'dno' || currentUser?.username?.toLowerCase() === 'dno';

  // Feature cards configured for direct redirection - Google Sheets restricted to DNO Admin
  const allFeatures = [
    {
      id: 'visitors_feature',
      title: 'Visitors Entry Register',
      description: 'Record guest entry form, generate auto Sr No, log timestamps & manage check-in/out.',
      icon: UserCheck,
      iconBg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      btnText: 'Open Visitors Tab',
      btnColor: 'bg-indigo-600 hover:bg-indigo-700 text-white',
      badge: 'Active Register',
      badgeColor: 'bg-indigo-50 text-indigo-800 border-indigo-200',
      onClick: () => onNavigateTab('visitors'),
    },
    ...(isDnoAdmin
      ? [
          {
            id: 'sheets_feature',
            title: 'Google Sheets Cloud Sync',
            description: 'Real-time two-way synchronization to Google Drive spreadsheets & CSV export.',
            icon: FileSpreadsheet,
            iconBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
            btnText: 'Access Google Sheets',
            btnColor: 'bg-emerald-600 hover:bg-emerald-700 text-white',
            badge: 'Pass: dno1',
            badgeColor: 'bg-amber-100 text-amber-900 border-amber-300 font-mono',
            isProtected: true,
            onClick: () => onNavigateTab('google_sheets'),
          },
        ]
      : []),
    {
      id: 'students_feature',
      title: 'Students & Scrutiny Directory',
      description: 'Candidate CET application records, document verification statuses & objection tracking.',
      icon: GraduationCap,
      iconBg: 'bg-blue-50 text-blue-700 border-blue-200',
      btnText: 'Open Students Tab',
      btnColor: 'bg-blue-600 hover:bg-blue-700 text-white',
      badge: `${students.length} Registered`,
      badgeColor: 'bg-blue-50 text-blue-800 border-blue-200',
      onClick: () => onNavigateTab('students'),
    },
    {
      id: 'whatsapp_feature',
      title: 'WhatsApp Notice Dispatcher',
      description: 'Instant WhatsApp message generator for candidate objection slips & status alerts.',
      icon: MessageCircle,
      iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-200',
      btnText: 'Launch WhatsApp Tool',
      btnColor: 'bg-emerald-600 hover:bg-emerald-700 text-white',
      badge: 'Instant Tool',
      badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      disabled: !canWhatsapp,
      onClick: onOpenWhatsappTool,
    },
    {
      id: 'qr_feature',
      title: 'Upload by Mobile QR',
      description: 'Camera QR sync for instant mobile document photo upload to physical scrutiny desk.',
      icon: QrCode,
      iconBg: 'bg-amber-50 text-amber-700 border-amber-200',
      btnText: 'Launch QR Scanner Tool',
      btnColor: 'bg-amber-600 hover:bg-amber-700 text-white',
      badge: 'Instant Tool',
      badgeColor: 'bg-amber-50 text-amber-800 border-amber-200',
      disabled: !canQr,
      onClick: onOpenQrTool,
    },
    {
      id: 'ticket_feature',
      title: 'Objection Memo & Ticket Generator',
      description: 'Generate formatted discrepancy slips, objection memos, and candidate query notes.',
      icon: FileText,
      iconBg: 'bg-blue-50 text-blue-700 border-blue-200',
      btnText: 'Launch Generator Tool',
      btnColor: 'bg-blue-600 hover:bg-blue-700 text-white',
      badge: 'Printable Slip',
      badgeColor: 'bg-blue-50 text-blue-800 border-blue-200',
      disabled: !canTicket,
      onClick: onOpenTicketTool,
    },
    {
      id: 'counselling_feature',
      title: 'Counselling & CAP Desk',
      description: 'Admission guidance rules, caste validity requirements, cutoff stats & seat matrices.',
      icon: Users,
      iconBg: 'bg-teal-50 text-teal-700 border-teal-200',
      btnText: 'Open Counselling Tab',
      btnColor: 'bg-teal-600 hover:bg-teal-700 text-white',
      badge: 'Guidance Desk',
      badgeColor: 'bg-teal-50 text-teal-800 border-teal-200',
      onClick: () => onNavigateTab('counselling'),
    },
    {
      id: 'reports_feature',
      title: 'Reports & Data Analytics',
      description: 'Daily visitor footfall charts, document discrepancy tallies & audit CSV exports.',
      icon: BarChart3,
      iconBg: 'bg-purple-50 text-purple-700 border-purple-200',
      btnText: 'Open Reports Tab',
      btnColor: 'bg-purple-600 hover:bg-purple-700 text-white',
      badge: 'Audit & Stats',
      badgeColor: 'bg-purple-50 text-purple-800 border-purple-200',
      onClick: () => onNavigateTab('reports'),
    },
    {
      id: 'notifications_feature',
      title: 'Circulars & Notice Board',
      description: 'Post and view DTE Maharashtra circulars, center alerts, and critical date notices.',
      icon: Bell,
      iconBg: 'bg-rose-50 text-rose-700 border-rose-200',
      btnText: 'Open Notices Tab',
      btnColor: 'bg-rose-600 hover:bg-rose-700 text-white',
      badge: 'Broadcast Alerts',
      badgeColor: 'bg-rose-50 text-rose-800 border-rose-200',
      onClick: () => onNavigateTab('notifications'),
    },
    {
      id: 'user_mgmt_feature',
      title: 'Staff & User Management',
      description: 'Create & manage scrutiny operator profiles, role assignments, and tab rule permissions.',
      icon: ShieldCheck,
      iconBg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      btnText: 'Open User Management',
      btnColor: 'bg-indigo-600 hover:bg-indigo-700 text-white',
      badge: 'DNO Access',
      badgeColor: 'bg-indigo-50 text-indigo-800 border-indigo-200',
      onClick: () => onNavigateTab('user_management'),
    },
    {
      id: 'settings_feature',
      title: 'Center Configuration & Settings',
      description: 'Facilitation Center identity, DNO officer details, college info & system backup.',
      icon: Settings,
      iconBg: 'bg-slate-100 text-slate-700 border-slate-300',
      btnText: 'Open Settings Tab',
      btnColor: 'bg-slate-800 hover:bg-slate-900 text-white',
      badge: 'Center Setup',
      badgeColor: 'bg-slate-100 text-slate-800 border-slate-300',
      onClick: () => onNavigateTab('settings'),
    },
    {
      id: 'profile_feature',
      title: 'Operator Profile & Security',
      description: 'View active session details, update user profile info, and change login credentials.',
      icon: UserCircle,
      iconBg: 'bg-cyan-50 text-cyan-700 border-cyan-200',
      btnText: 'Open Profile Tab',
      btnColor: 'bg-cyan-700 hover:bg-cyan-800 text-white',
      badge: 'Current Session',
      badgeColor: 'bg-cyan-50 text-cyan-800 border-cyan-200',
      onClick: () => onNavigateTab('profile'),
    },
  ];

  return (
    <div className="relative z-10 w-full space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-7 text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-full bg-radial from-blue-500/20 via-transparent to-transparent pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-blue-200 border border-white/15 text-xs font-semibold mb-2 backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>District Facilitation & Scrutiny Center 1005 (VMK Washim)</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
              Welcome, {currentUser?.fullName || currentUser?.username || 'Officer'}
            </h1>
            <p className="text-xs sm:text-sm text-blue-100/80 mt-1 max-w-2xl leading-relaxed">
              Central Command Hub — Access all portal modules, visitor registers, Google Sheets synchronization, and student scrutiny tools below.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onNavigateTab('visitors')}
              className="px-4 py-2.5 bg-indigo-500 hover:bg-indigo-600 active:scale-95 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <UserCheck className="w-4 h-4" />
              <span>+ Log Visitor</span>
            </button>
            {isDnoAdmin && (
              <button
                onClick={() => onNavigateTab('google_sheets')}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Google Sheets (dno1)</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {quickStats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={i}
              className="bg-white/85 backdrop-blur-xs border border-slate-200/80 rounded-2xl p-4 flex items-center gap-3.5 shadow-2xs"
            >
              <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${stat.color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-slate-500 font-medium truncate">{stat.label}</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-bold text-slate-900 font-mono">{stat.value}</span>
                  <span className="text-[11px] text-slate-500 font-medium truncate">{stat.change}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Feature Launcher Hub (Buttons for Every Feature) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              Portal Features & Modules Hub
            </h2>
            <p className="text-xs text-slate-500">
              Click any feature button below to instantly launch the tool or navigate to its dedicated tab.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {allFeatures.map((feat) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.id}
                className="bg-white/95 backdrop-blur-xs border border-slate-200/90 hover:border-blue-400 rounded-2xl p-5 flex flex-col justify-between transition-all duration-200 hover:shadow-md shadow-xs group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3.5">
                    <div className={`w-11 h-11 rounded-xl border flex items-center justify-center ${feat.iconBg} group-hover:scale-105 transition-transform`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    {feat.badge && (
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border flex items-center gap-1 ${feat.badgeColor}`}>
                        {feat.isProtected && <Lock className="w-3 h-3 text-amber-700" />}
                        <span>{feat.badge}</span>
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-1 group-hover:text-blue-900 transition-colors">
                    {feat.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed mb-5">
                    {feat.description}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={feat.onClick}
                  disabled={feat.disabled}
                  className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-2xs ${
                    feat.disabled
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      : `${feat.btnColor} active:scale-[0.98] cursor-pointer`
                  }`}
                >
                  <span>{feat.disabled ? 'Restricted Access' : feat.btnText}</span>
                  {!feat.disabled && <ArrowUpRight className="w-4 h-4" />}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="bg-white/90 backdrop-blur-xs border border-slate-200/80 rounded-2xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Recent Candidate Activity</h3>
            <p className="text-xs text-slate-500">Live summary of active scrutiny records</p>
          </div>
          <button
            onClick={() => onNavigateTab('students')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
          >
            <span>View All in Directory</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentStudents.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            <p>No candidates currently logged in the active queue.</p>
            <p className="mt-1 text-slate-500">
              Go to the <b>Students</b> tab or open the tools above to register candidate records.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-slate-500 border-b border-slate-100 bg-slate-50/50">
                  <th className="py-2.5 px-3 font-semibold">Application ID</th>
                  <th className="py-2.5 px-3 font-semibold">Candidate Name</th>
                  <th className="py-2.5 px-3 font-semibold">Course</th>
                  <th className="py-2.5 px-3 font-semibold">Status</th>
                  <th className="py-2.5 px-3 font-semibold">Remarks</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentStudents.map((st) => (
                  <tr key={st.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-slate-800">{st.id}</td>
                    <td className="py-3 px-3 font-medium text-slate-900">{st.name}</td>
                    <td className="py-3 px-3 text-slate-600">{st.course}</td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                          st.status === 'Verified'
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                            : st.status === 'Objection Raised'
                            ? 'bg-amber-100 text-amber-800 border-amber-200'
                            : 'bg-blue-100 text-blue-800 border-blue-200'
                        }`}
                      >
                        {st.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-500 truncate max-w-xs">{st.remarks}</td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {canWhatsapp && (
                          <button
                            onClick={onOpenWhatsappTool}
                            title="Send WhatsApp Notice"
                            className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 border border-emerald-200 cursor-pointer"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {canTicket && (
                          <button
                            onClick={onOpenTicketTool}
                            title="Generate Objection Memo"
                            className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 border border-blue-200 cursor-pointer"
                          >
                            <FileText className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
