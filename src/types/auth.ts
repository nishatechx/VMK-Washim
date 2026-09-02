export type TabPermission =
  | 'dashboard'
  | 'visitors'
  | 'students'
  | 'settings'
  | 'profile'
  | 'user_management'
  | 'google_sheets';

export type FeaturePermission =
  | 'whatsapp_tool'
  | 'qr_upload_tool'
  | 'ticket_generator_tool'
  | 'add_candidate'
  | 'add_visitor'
  | 'export_reports';

export type UserRole = 'dno' | 'counsellor' | 'supporting_staff' | 'operator';

export interface UserProfile {
  id: string;
  username: string;
  password: string;
  fullName: string;
  designation: string;
  role: UserRole;
  allowedTabs: TabPermission[];
  allowedFeatures: FeaturePermission[];
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
  phone?: string;
  email?: string;
  profilePicture?: string;
}

export interface StudentRecord {
  id: string; // e.g. EN24109432
  name: string;
  mobile: string;
  email?: string;
  course: string;
  mode: 'E-Scrutiny' | 'Physical Scrutiny';
  status: 'Verified' | 'Objection Raised' | 'Document Pending';
  date: string;
  remarks: string;
  cetRegNo?: string;
  category?: string;
  createdAt: string;
}

export interface CenterNotice {
  id: string;
  title: string;
  desc: string;
  time: string;
  type: 'info' | 'success' | 'warning';
  createdAt: string;
}

export type VisitorType = 'Candidate' | 'Parent' | 'Institute' | 'Other';

export interface VisitorRecord {
  id: string;
  srNo: number;
  date: string; // e.g. "2026-08-24" or "24 Aug 2026"
  timestamp: string; // formatted e.g. "24 Aug 2026, 10:45 AM"
  name: string;
  mobile: string;
  visitorType: VisitorType;
  address: string; // Village / City / District / Institute
  purpose: string; // Reason for visit e.g. Document Scrutiny, Objection Resolution, etc.
  checkInTime: string; // e.g. "10:30 AM"
  checkOutTime?: string; // e.g. "11:15 AM" or undefined if on premises
  status: 'In Premises' | 'Checked Out';
  candidateAppId?: string; // e.g. "EN24109432"
  remarks?: string;
  createdAt: string;
}
