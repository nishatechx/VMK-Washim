import { UserProfile, StudentRecord, CenterNotice, VisitorRecord, TabPermission, FeaturePermission } from '../types/auth';

const USERS_STORAGE_KEY = 'vmk_user_profiles_v1';
const CURRENT_USER_KEY = 'vmk_current_logged_user';
const STUDENTS_STORAGE_KEY = 'vmk_students_records_v1';
const NOTICES_STORAGE_KEY = 'vmk_center_notices_v1';
const VISITORS_STORAGE_KEY = 'vmk_visitors_records_v1';

// Default Master DNO Account (Root Administrator)
export const DNO_USER: UserProfile = {
  id: 'dno_master_root',
  username: 'dno',
  password: 'dno1',
  fullName: 'Mr. Shrinath Ghodake',
  designation: 'District Nodal Officer (DNO)',
  role: 'dno',
  allowedTabs: [
    'dashboard',
    'visitors',
    'students',
    'counselling',
    'reports',
    'notifications',
    'settings',
    'profile',
    'user_management',
    'google_sheets',
  ],
  allowedFeatures: [
    'whatsapp_tool',
    'qr_upload_tool',
    'ticket_generator_tool',
    'add_candidate',
    'add_visitor',
    'export_reports',
  ],
  isActive: true,
  createdAt: '2026-08-22T00:00:00.000Z',
  phone: '+91 98220 00000',
  email: 'dno.washim@cetcell.mah.gov.in',
};

// Available system tabs with display labels and icons
export const AVAILABLE_TABS: { id: TabPermission; label: string; description: string }[] = [
  { id: 'dashboard', label: 'Dashboard', description: 'Core tools access & live verification activity' },
  { id: 'visitors', label: 'Visitors Entry Register', description: 'Record visitor entry form, check-in/out & directory' },
  { id: 'students', label: 'Students Directory', description: 'Candidate registration, records & scrutiny status' },
  { id: 'counselling', label: 'Counselling Desk', description: 'Guidance rules, category validity & checklists' },
  { id: 'reports', label: 'Reports & Analytics', description: 'Scrutiny statistics, discrepancy tally & CSV export' },
  { id: 'notifications', label: 'Notifications', description: 'CET Cell notices, alerts & announcements' },
  { id: 'settings', label: 'Center Settings', description: 'Center identity, DNO details & preferences' },
  { id: 'profile', label: 'Operator Profile', description: 'Account details and session information' },
  { id: 'user_management', label: 'User Management (DNO)', description: 'Create & manage staff profiles and rule permissions' },
  { id: 'google_sheets', label: 'Google Sheets (DNO Admin)', description: 'Live cloud spreadsheet synchronization & export (Passcode: dno1)' },
];

export const AVAILABLE_FEATURES: { id: FeaturePermission; label: string; description: string }[] = [
  { id: 'whatsapp_tool', label: 'WhatsApp Ticket Tool', description: 'Direct WhatsApp notice generator & dispatch' },
  { id: 'qr_upload_tool', label: 'Upload by QR Code', description: 'Instant camera sync for candidate document uploads' },
  { id: 'ticket_generator_tool', label: 'Objection Memo Generator', description: 'Official discrepancy ticket generation' },
  { id: 'add_candidate', label: 'Add New Candidates', description: 'Ability to register and input candidate details' },
  { id: 'add_visitor', label: 'Add Visitor Entry', description: 'Ability to log new visitor check-in and check-out' },
  { id: 'export_reports', label: 'Export Data & Reports', description: 'Download CSV and print scrutiny logs' },
];

// Initialize users storage with DNO account if empty
export function getAllUsers(): UserProfile[] {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    if (!raw) {
      const initial = [DNO_USER];
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    const parsed: UserProfile[] = JSON.parse(raw);
    // Ensure DNO always exists and has google_sheets tab
    const dnoIndex = parsed.findIndex((u) => u.username.toLowerCase() === 'dno');
    if (dnoIndex === -1) {
      parsed.unshift(DNO_USER);
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(parsed));
    } else {
      if (!parsed[dnoIndex].allowedTabs.includes('google_sheets')) {
        parsed[dnoIndex].allowedTabs.push('google_sheets');
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(parsed));
      }
    }
    return parsed;
  } catch (err) {
    console.error('Error reading users from storage:', err);
    return [DNO_USER];
  }
}

export function saveUser(user: UserProfile): { success: boolean; message: string } {
  try {
    const users = getAllUsers();
    const existingIndex = users.findIndex((u) => u.id === user.id);

    // Check duplicate username for another user
    const usernameTaken = users.some(
      (u) => u.username.toLowerCase() === user.username.toLowerCase() && u.id !== user.id
    );
    if (usernameTaken) {
      return { success: false, message: `Username "${user.username}" is already taken.` };
    }

    if (existingIndex >= 0) {
      users[existingIndex] = { ...users[existingIndex], ...user };
    } else {
      users.push(user);
    }

    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));

    // Update current session if the edited user is currently logged in
    const currentUser = getCurrentUser();
    if (currentUser && currentUser.id === user.id) {
      setCurrentUser(user);
    }

    return { success: true, message: 'User profile saved successfully.' };
  } catch (err) {
    console.error('Error saving user:', err);
    return { success: false, message: 'Failed to save user profile.' };
  }
}

export function deleteUser(userId: string): { success: boolean; message: string } {
  try {
    if (userId === DNO_USER.id) {
      return { success: false, message: 'The master DNO profile cannot be deleted.' };
    }

    const users = getAllUsers().filter((u) => u.id !== userId);
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    return { success: true, message: 'User profile deleted successfully.' };
  } catch (err) {
    console.error('Error deleting user:', err);
    return { success: false, message: 'Failed to delete user profile.' };
  }
}

export function authenticate(username: string, pass: string): UserProfile | null {
  const users = getAllUsers();
  const trimmedUser = username.trim().toLowerCase();
  const trimmedPass = pass.trim();

  const user = users.find(
    (u) => u.username.toLowerCase() === trimmedUser && u.password === trimmedPass && u.isActive
  );

  if (user) {
    const updated = { ...user, lastLogin: new Date().toISOString() };
    saveUser(updated);
    setCurrentUser(updated);
    return updated;
  }
  return null;
}

export function getCurrentUser(): UserProfile | null {
  try {
    const raw = localStorage.getItem(CURRENT_USER_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setCurrentUser(user: UserProfile | null): void {
  if (user) {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    localStorage.setItem('vmk_auth_token', `logged_in_${user.username}`);
  } else {
    localStorage.removeItem(CURRENT_USER_KEY);
    localStorage.removeItem('vmk_auth_token');
    localStorage.removeItem('vmk_auth_time');
  }
}

// Student records storage management (clean dynamic data)
export function getStudentRecords(): StudentRecord[] {
  try {
    const raw = localStorage.getItem(STUDENTS_STORAGE_KEY);
    if (!raw) {
      return [];
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveStudentRecord(record: StudentRecord): void {
  try {
    const records = getStudentRecords();
    const idx = records.findIndex((r) => r.id === record.id);
    if (idx >= 0) {
      records[idx] = record;
    } else {
      records.unshift(record);
    }
    localStorage.setItem(STUDENTS_STORAGE_KEY, JSON.stringify(records));
  } catch (err) {
    console.error('Error saving student record:', err);
  }
}

export function deleteStudentRecord(id: string): void {
  try {
    const records = getStudentRecords().filter((r) => r.id !== id);
    localStorage.setItem(STUDENTS_STORAGE_KEY, JSON.stringify(records));
  } catch (err) {
    console.error('Error deleting student record:', err);
  }
}

// Center Notices storage management
export function getCenterNotices(): CenterNotice[] {
  try {
    const raw = localStorage.getItem(NOTICES_STORAGE_KEY);
    if (!raw) {
      return [];
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveCenterNotice(notice: CenterNotice): void {
  try {
    const notices = getCenterNotices();
    const idx = notices.findIndex((n) => n.id === notice.id);
    if (idx >= 0) {
      notices[idx] = notice;
    } else {
      notices.unshift(notice);
    }
    localStorage.setItem(NOTICES_STORAGE_KEY, JSON.stringify(notices));
  } catch (err) {
    console.error('Error saving notice:', err);
  }
}

export function deleteCenterNotice(id: string): void {
  try {
    const notices = getCenterNotices().filter((n) => n.id !== id);
    localStorage.setItem(NOTICES_STORAGE_KEY, JSON.stringify(notices));
  } catch (err) {
    console.error('Error deleting notice:', err);
  }
}

// Visitors Entry Register storage management
export function getVisitorRecords(): VisitorRecord[] {
  try {
    const raw = localStorage.getItem(VISITORS_STORAGE_KEY);
    if (!raw) {
      return [];
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveVisitorRecord(record: VisitorRecord): void {
  try {
    const records = getVisitorRecords();
    const idx = records.findIndex((r) => r.id === record.id);
    if (idx >= 0) {
      records[idx] = record;
    } else {
      records.unshift(record);
    }
    localStorage.setItem(VISITORS_STORAGE_KEY, JSON.stringify(records));
  } catch (err) {
    console.error('Error saving visitor record:', err);
  }
}

export function deleteVisitorRecord(id: string): void {
  try {
    const records = getVisitorRecords().filter((r) => r.id !== id);
    localStorage.setItem(VISITORS_STORAGE_KEY, JSON.stringify(records));
  } catch (err) {
    console.error('Error deleting visitor record:', err);
  }
}

export function checkoutVisitor(id: string, checkOutTime?: string): void {
  try {
    const records = getVisitorRecords();
    const idx = records.findIndex((r) => r.id === id);
    if (idx >= 0) {
      const nowTime = checkOutTime || new Date().toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
      records[idx] = {
        ...records[idx],
        checkOutTime: nowTime,
        status: 'Checked Out',
      };
      localStorage.setItem(VISITORS_STORAGE_KEY, JSON.stringify(records));
    }
  } catch (err) {
    console.error('Error checking out visitor:', err);
  }
}

export function getNextVisitorSrNo(): number {
  const records = getVisitorRecords();
  if (records.length === 0) return 1;
  const maxSr = Math.max(...records.map((r) => (typeof r.srNo === 'number' ? r.srNo : 0)));
  return maxSr + 1;
}
