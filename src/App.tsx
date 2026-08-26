import React, { useState, useEffect } from 'react';
import { Sidebar, NavTab } from './components/Sidebar';
import { TopNavbar } from './components/TopNavbar';
import { DashboardBackgroundSvg } from './components/DashboardBackgroundSvg';
import { DashboardView } from './components/views/DashboardView';
import { VisitorsView } from './components/views/VisitorsView';
import { StudentsView } from './components/views/StudentsView';
import { CounsellingView } from './components/views/CounsellingView';
import { ReportsView } from './components/views/ReportsView';
import { NotificationsView } from './components/views/NotificationsView';
import { SettingsView } from './components/views/SettingsView';
import { ProfileView } from './components/views/ProfileView';
import { UserManagementView } from './components/views/UserManagementView';
import { GoogleSheetsView } from './components/views/GoogleSheetsView';

import { TicketGeneratorModal } from './components/TicketGeneratorModal';
import { WhatsappTicketModal } from './components/WhatsappTicketModal';
import { QrUploadModal } from './components/QrUploadModal';
import { MobileQrUploadView } from './components/MobileQrUploadView';
import { LoginScreen } from './components/LoginScreen';
import { getCurrentUser, setCurrentUser, DNO_USER } from './services/authService';
import { UserProfile } from './types/auth';

export default function App() {
  const [currentUser, setCurUser] = useState<UserProfile | null>(() => getCurrentUser());
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => !!getCurrentUser());

  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);

  // Modals for the 3 Core Functional Tools
  const [isTicketGeneratorOpen, setIsTicketGeneratorOpen] = useState<boolean>(false);
  const [isWhatsappTicketOpen, setIsWhatsappTicketOpen] = useState<boolean>(false);
  const [isQrUploadModalOpen, setIsQrUploadModalOpen] = useState<boolean>(false);

  const [qrSessionParam, setQrSessionParam] = useState<string | null>(null);

  const handleLoginSuccess = (user: UserProfile) => {
    setCurUser(user);
    setIsAuthenticated(true);
    // If user's default active tab is not in allowed tabs, switch to first allowed
    if (!user.allowedTabs.includes(activeTab)) {
      setActiveTab(user.allowedTabs[0] || 'dashboard');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurUser(null);
    setIsAuthenticated(false);
  };

  const handleRefreshSession = () => {
    const updated = getCurrentUser();
    if (updated) {
      setCurUser(updated);
      if (!updated.allowedTabs.includes(activeTab)) {
        setActiveTab(updated.allowedTabs[0] || 'dashboard');
      }
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const session = params.get('qrSession');
      if (session) {
        setQrSessionParam(session);
      }
    }
  }, []);

  // Handle Mobile QR scanning view if session exists in URL
  if (qrSessionParam) {
    return (
      <MobileQrUploadView
        sessionId={qrSessionParam}
        onBackToMain={() => {
          if (typeof window !== 'undefined') {
            window.history.pushState({}, '', window.location.pathname);
            setQrSessionParam(null);
          }
        }}
      />
    );
  }

  // Not logged in -> Show Login View
  if (!isAuthenticated || !currentUser) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  const isDnoAdmin = currentUser?.role === 'dno' || currentUser?.username?.toLowerCase() === 'dno';

  return (
    <div
      id="vmk-washim-app-root"
      className="flex h-screen w-full bg-[#f4f7fb] text-slate-900 font-sans select-none overflow-hidden"
    >
      {/* Left Sidebar (Desktop & Mobile drawer) */}
      <div
        className={`hidden md:flex h-full shrink-0 transition-all duration-300 z-20`}
      >
        <Sidebar
          activeTab={activeTab}
          onSelectTab={(tab) => {
            setActiveTab(tab);
            setIsMobileSidebarOpen(false);
          }}
          onLogout={handleLogout}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          currentUser={currentUser}
        />
      </div>

      {/* Mobile Drawer Overlay */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
          <div className="relative w-72 h-full bg-[#f4f7fb] z-10 shadow-2xl">
            <Sidebar
              activeTab={activeTab}
              onSelectTab={(tab) => {
                setActiveTab(tab);
                setIsMobileSidebarOpen(false);
              }}
              onLogout={handleLogout}
              isCollapsed={false}
              onToggleCollapse={() => setIsMobileSidebarOpen(false)}
              currentUser={currentUser}
            />
          </div>
        </div>
      )}

      {/* Main Right Area: Top Navbar + Large Rounded Content Card with Background Artwork */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <TopNavbar
          onToggleSidebar={() => {
            if (window.innerWidth < 768) {
              setIsMobileSidebarOpen(!isMobileSidebarOpen);
            } else {
              setIsSidebarCollapsed(!isSidebarCollapsed);
            }
          }}
          onNavigateTab={(tab) => setActiveTab(tab)}
          onLogout={handleLogout}
          currentUser={currentUser}
        />

        {/* Main Content Rounded Card Viewport */}
        <main className="flex-1 px-3 sm:px-6 pb-4 sm:pb-6 min-h-0 overflow-hidden">
          <div
            id="main-stage-container"
            className="relative w-full h-full bg-white rounded-2xl md:rounded-3xl border border-slate-200/90 shadow-sm overflow-y-auto p-4 sm:p-6 lg:p-8"
          >
            {/* Vector Wavy Background + Top Right Dots matching screenshot */}
            <DashboardBackgroundSvg />

            {/* Interactive View Content */}
            <div className="relative z-10 w-full max-w-6xl mx-auto">
              {activeTab === 'dashboard' && currentUser.allowedTabs.includes('dashboard') && (
                <DashboardView
                  onOpenWhatsappTool={() => setIsWhatsappTicketOpen(true)}
                  onOpenQrTool={() => setIsQrUploadModalOpen(true)}
                  onOpenTicketTool={() => setIsTicketGeneratorOpen(true)}
                  onNavigateTab={(tab) => setActiveTab(tab)}
                  currentUser={currentUser}
                />
              )}

              {activeTab === 'visitors' && currentUser.allowedTabs.includes('visitors') && (
                <VisitorsView
                  currentUser={currentUser}
                  onNavigateTab={(tab) => setActiveTab(tab as NavTab)}
                />
              )}

              {activeTab === 'google_sheets' && isDnoAdmin && currentUser.allowedTabs.includes('google_sheets') && (
                <GoogleSheetsView currentUser={currentUser} />
              )}

              {activeTab === 'students' && currentUser.allowedTabs.includes('students') && (
                <StudentsView
                  onOpenWhatsappTool={() => setIsWhatsappTicketOpen(true)}
                  onOpenTicketTool={() => setIsTicketGeneratorOpen(true)}
                  onOpenQrTool={() => setIsQrUploadModalOpen(true)}
                  currentUser={currentUser}
                />
              )}

              {activeTab === 'counselling' && currentUser.allowedTabs.includes('counselling') && (
                <CounsellingView />
              )}

              {activeTab === 'reports' && currentUser.allowedTabs.includes('reports') && (
                <ReportsView />
              )}

              {activeTab === 'notifications' && currentUser.allowedTabs.includes('notifications') && (
                <NotificationsView />
              )}

              {activeTab === 'settings' && currentUser.allowedTabs.includes('settings') && (
                <SettingsView
                  currentUser={currentUser}
                  onNavigateToUsers={() => setActiveTab('user_management')}
                />
              )}

              {activeTab === 'profile' && currentUser.allowedTabs.includes('profile') && (
                <ProfileView
                  onLogout={handleLogout}
                  currentUser={currentUser}
                  onRefreshSession={handleRefreshSession}
                />
              )}

              {activeTab === 'user_management' && currentUser.allowedTabs.includes('user_management') && (
                <UserManagementView
                  currentUser={currentUser}
                  onRefreshSession={handleRefreshSession}
                />
              )}
            </div>
          </div>
        </main>
      </div>

      {/* 3 Core Interactive Modals */}
      <WhatsappTicketModal
        isOpen={isWhatsappTicketOpen}
        onClose={() => setIsWhatsappTicketOpen(false)}
      />

      <QrUploadModal
        isOpen={isQrUploadModalOpen}
        onClose={() => setIsQrUploadModalOpen(false)}
      />

      <TicketGeneratorModal
        isOpen={isTicketGeneratorOpen}
        onClose={() => setIsTicketGeneratorOpen(false)}
      />
    </div>
  );
}
