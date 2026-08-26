import React, { useState, useRef, useEffect } from 'react';
import { Menu, Bell, User, ChevronDown, LogOut, Settings, UserCheck, ShieldCheck } from 'lucide-react';
import { NavTab } from './Sidebar';
import { UserProfile } from '../types/auth';

interface TopNavbarProps {
  onToggleSidebar: () => void;
  onNavigateTab: (tab: NavTab) => void;
  onLogout: () => void;
  unreadCount?: number;
  currentUser?: UserProfile | null;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  onToggleSidebar,
  onNavigateTab,
  onLogout,
  unreadCount = 0,
  currentUser,
}) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const displayName = currentUser ? currentUser.fullName || currentUser.username : 'DNO Officer';
  const roleLabel = currentUser ? currentUser.designation || currentUser.role.toUpperCase() : 'District Nodal Officer';

  return (
    <header
      id="top-navbar"
      className="w-full h-16 px-4 sm:px-6 lg:px-8 flex items-center justify-between z-30 select-none"
    >
      {/* Left: Hamburger Menu Icon */}
      <div className="flex items-center gap-3">
        <button
          id="mobile-menu-toggle"
          onClick={onToggleSidebar}
          className="p-2 rounded-xl text-slate-700 hover:text-slate-950 hover:bg-slate-200/60 active:scale-95 transition-all cursor-pointer"
          title="Toggle Menu"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Right: Notifications & User Profile */}
      <div className="flex items-center gap-4 sm:gap-6">
        {/* Notification Bell */}
        <div className="relative" ref={notifRef}>
          <button
            id="navbar-notification-btn"
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-200/50 transition-colors cursor-pointer"
            title="Notifications"
            aria-label="View notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white" />
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl p-3 z-50 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 px-2">
                <span className="font-bold text-xs text-slate-800 uppercase tracking-wider">
                  Notifications
                </span>
                <button
                  onClick={() => {
                    setIsNotifOpen(false);
                    onNavigateTab('notifications');
                  }}
                  className="text-xs text-blue-600 hover:underline cursor-pointer"
                >
                  View all
                </button>
              </div>
              <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto">
                <div className="py-2.5 px-2 hover:bg-slate-50 rounded-lg text-xs">
                  <p className="font-semibold text-slate-800">State CET Cell Verification Portal Active</p>
                  <p className="text-slate-500 text-[11px] mt-0.5">Welcome to VMK Washim Scrutiny System</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Pill */}
        <div className="relative" ref={profileRef}>
          <button
            id="navbar-profile-btn"
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2.5 p-1 sm:pr-2.5 rounded-full sm:rounded-xl hover:bg-slate-200/50 transition-all cursor-pointer group text-left"
            aria-label="User account menu"
          >
            {currentUser?.profilePicture ? (
              <img
                src={currentUser.profilePicture}
                alt={displayName}
                className="w-8 h-8 rounded-full object-cover border border-blue-400 shadow-xs"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-blue-600 border border-blue-700 flex items-center justify-center text-white font-bold text-xs group-hover:bg-blue-700 transition-colors">
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}

            <div className="hidden sm:flex flex-col text-left leading-tight">
              <span className="text-[11px] text-slate-500">Signed in as</span>
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1">
                {displayName}
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition-transform" />
              </span>
            </div>
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-60 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 z-50">
              <div className="px-3 py-2 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-900">{displayName}</p>
                <p className="text-[11px] text-slate-500 truncate">{roleLabel}</p>
                <p className="text-[10px] font-mono text-blue-600 mt-0.5">
                  User ID: {currentUser?.username || 'dno'}
                </p>
              </div>

              <div className="py-1">
                {currentUser?.allowedTabs.includes('profile') && (
                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      onNavigateTab('profile');
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 rounded-lg cursor-pointer"
                  >
                    <UserCheck className="w-4 h-4 text-slate-500" />
                    <span>My Profile</span>
                  </button>
                )}

                {currentUser?.allowedTabs.includes('user_management') && (
                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      onNavigateTab('user_management');
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-blue-700 font-medium hover:bg-blue-50 rounded-lg cursor-pointer"
                  >
                    <ShieldCheck className="w-4 h-4 text-blue-600" />
                    <span>User Management (DNO)</span>
                  </button>
                )}

                {currentUser?.allowedTabs.includes('settings') && (
                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      onNavigateTab('settings');
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 rounded-lg cursor-pointer"
                  >
                    <Settings className="w-4 h-4 text-slate-500" />
                    <span>Center Settings</span>
                  </button>
                )}
              </div>

              <div className="pt-1 border-t border-slate-100">
                <button
                  onClick={() => {
                    setIsProfileOpen(false);
                    onLogout();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-red-600 hover:bg-red-50 rounded-lg cursor-pointer font-medium"
                >
                  <LogOut className="w-4 h-4 text-red-500" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
