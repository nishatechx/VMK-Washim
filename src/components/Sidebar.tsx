import React from 'react';
import {
  LayoutDashboard,
  UserCheck,
  GraduationCap,
  Users,
  FileText,
  BarChart3,
  Bell,
  Settings,
  UserCircle,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  User,
  FileSpreadsheet,
  Lock,
} from 'lucide-react';
import { TabPermission, UserProfile } from '../types/auth';

export type NavTab = TabPermission;

interface SidebarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onLogout: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  unreadCount?: number;
  currentUser?: UserProfile | null;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  onLogout,
  isCollapsed,
  onToggleCollapse,
  unreadCount = 0,
  currentUser,
}) => {
  const allNavItems: {
    id: NavTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
    isProtected?: boolean;
  }[] = [
    { id: 'dashboard' as NavTab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'visitors' as NavTab, label: 'Visitors Entry', icon: UserCheck },
    { id: 'google_sheets' as NavTab, label: 'Google Sheets', icon: FileSpreadsheet, isProtected: true },
    { id: 'students' as NavTab, label: 'Students', icon: GraduationCap },
    { id: 'counselling' as NavTab, label: 'Counselling', icon: Users },
    { id: 'reports' as NavTab, label: 'Reports', icon: BarChart3 },
    { id: 'notifications' as NavTab, label: 'Notifications', icon: Bell, badge: unreadCount },
    { id: 'settings' as NavTab, label: 'Settings', icon: Settings },
    { id: 'profile' as NavTab, label: 'Profile', icon: UserCircle },
    { id: 'user_management' as NavTab, label: 'User Management', icon: ShieldCheck },
  ];

  // Check if current user is DNO administrator
  const isDnoAdmin = currentUser?.role === 'dno' || currentUser?.username?.toLowerCase() === 'dno';

  // Filter tabs according to the logged-in user's allowedTabs RBAC rules (Google Sheets exclusively for DNO Admin)
  const allowedNavItems = allNavItems.filter((item) => {
    if (item.id === 'google_sheets') {
      return isDnoAdmin;
    }
    if (item.id === 'user_management') {
      return isDnoAdmin;
    }
    if (!currentUser) return true;
    return currentUser.allowedTabs.includes(item.id);
  });

  // Get user role display label
  const getRoleLabel = (role?: string) => {
    if (!role) return 'Authorized User';
    switch (role.toLowerCase()) {
      case 'dno':
        return 'DNO Admin';
      case 'operator':
        return 'Scrutiny Officer';
      case 'counsellor':
        return 'Guidance Counsellor';
      default:
        return role.toUpperCase();
    }
  };

  const displayName = currentUser?.fullName || currentUser?.username || 'Officer / User';
  const displayRole = currentUser?.designation || getRoleLabel(currentUser?.role);

  return (
    <aside
      id="portal-sidebar"
      className={`relative h-full flex flex-col justify-between bg-[#f4f7fb] border-r border-slate-200/80 transition-all duration-300 select-none z-20 shrink-0 ${
        isCollapsed ? 'w-20' : 'w-64 lg:w-72'
      }`}
    >
      {/* Top User Profile Section (Replaces VMK Name and Logo) */}
      <div className="pt-5 pb-4 px-3.5 border-b border-slate-200/70 bg-gradient-to-b from-white/90 to-transparent">
        {isCollapsed ? (
          /* Collapsed User Avatar */
          <div
            className="flex flex-col items-center justify-center cursor-pointer group"
            onClick={() => onSelectTab('profile')}
            title={`${displayName} (${displayRole})`}
          >
            <div className="relative">
              {currentUser?.profilePicture ? (
                <img
                  src={currentUser.profilePicture}
                  alt={displayName}
                  className="w-11 h-11 rounded-2xl object-cover border-2 border-white shadow-sm ring-2 ring-blue-500/20 group-hover:ring-blue-500 transition-all"
                />
              ) : (
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center font-bold text-base shadow-sm ring-2 ring-blue-500/20 group-hover:ring-blue-500 transition-all">
                  {displayName.charAt(0).toUpperCase()}
                </div>
              )}
              <span
                className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white shadow-xs"
                title="Online & Active"
              />
            </div>
          </div>
        ) : (
          /* Expanded User Info Card */
          <div
            className="p-3 bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-xs hover:border-blue-200 transition-all cursor-pointer group"
            onClick={() => onSelectTab('profile')}
          >
            <div className="flex items-center gap-3">
              <div className="relative shrink-0">
                {currentUser?.profilePicture ? (
                  <img
                    src={currentUser.profilePicture}
                    alt={displayName}
                    className="w-12 h-12 rounded-2xl object-cover border-2 border-white shadow-sm ring-2 ring-blue-500/10 group-hover:ring-blue-500/30 transition-all"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center font-bold text-lg shadow-sm ring-2 ring-blue-500/10 group-hover:ring-blue-500/30 transition-all">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                )}
                <span
                  className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white shadow-xs"
                  title="Online & Active"
                />
              </div>

              <div className="flex-1 min-w-0">
                <h2 className="text-sm font-bold text-slate-900 truncate leading-snug group-hover:text-blue-700 transition-colors">
                  {displayName}
                </h2>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-800 border border-blue-200/70 truncate max-w-[150px]">
                    {getRoleLabel(currentUser?.role)}
                  </span>
                </div>
                {currentUser?.designation && (
                  <p className="text-[11px] text-slate-500 truncate mt-0.5 font-medium">
                    {currentUser.designation}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Nav Menu Items */}
      <div className="flex-1 px-3 py-3 space-y-1.5 overflow-y-auto">
        {allowedNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              id={`nav-item-${item.id}`}
              onClick={() => onSelectTab(item.id)}
              title={isCollapsed ? item.label : undefined}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#0a389c] text-white shadow-md shadow-blue-900/20 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              } ${isCollapsed ? 'justify-center px-0' : ''}`}
            >
              <Icon
                className={`w-5 h-5 shrink-0 transition-transform ${
                  isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-700'
                }`}
              />

              {!isCollapsed && (
                <span className="flex-1 text-left whitespace-nowrap flex items-center justify-between">
                  <span>{item.label}</span>
                  {item.isProtected && (
                    <span
                      title="Password Protected (dno1)"
                      className={`ml-1.5 p-1 rounded-md text-[10px] flex items-center gap-1 ${
                        isActive ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      <Lock className="w-3 h-3" />
                    </span>
                  )}
                </span>
              )}

              {!isCollapsed && item.badge && item.badge > 0 ? (
                <span
                  className={`text-[11px] font-bold px-1.5 py-0.5 rounded-full ${
                    isActive ? 'bg-white/20 text-white' : 'bg-red-500 text-white'
                  }`}
                >
                  {item.badge}
                </span>
              ) : null}
            </button>
          );
        })}

        {/* Logout Menu Item */}
        <button
          id="nav-item-logout"
          onClick={onLogout}
          title={isCollapsed ? 'Logout' : undefined}
          className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm text-slate-600 hover:text-red-600 hover:bg-red-50/80 transition-all cursor-pointer ${
            isCollapsed ? 'justify-center px-0' : ''
          }`}
        >
          <LogOut className="w-5 h-5 shrink-0 text-slate-500" />
          {!isCollapsed && <span className="flex-1 text-left">Logout</span>}
        </button>
      </div>

      {/* Collapse/Expand Toggle Circular Button at Bottom-Right */}
      <div className="relative p-3 flex justify-end">
        <button
          id="sidebar-toggle-btn"
          onClick={onToggleCollapse}
          className="w-8 h-8 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-50 active:scale-95 transition-all cursor-pointer"
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          aria-label={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>
    </aside>
  );
};

