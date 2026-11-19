export interface MonevUser {
  id: string | number;
  name: string;
  email: string;
  role: string;
  company_name?: string;
  position?: string;
  internship_start_date?: string;
  internship_end_date?: string;
  mentor_name?: string;
  institution_name?: string;
  university?: string;
  photo_url?: string;
  participant_status?: string;
  has_attendance_today?: boolean;
  is_holiday_today?: boolean;
  is_off_day_today?: boolean;
  home?: any;
  monthly_reports?: any[];
  [key: string]: any;
}

export type AttendanceStatus = 'PRESENT' | 'ON_LEAVE' | 'ABSENT' | 'DAYOFF';

export type LogApprovalState =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'NEEDS_REVISION'
  | 'REVISION_SUBMITTED'
  | 'APPROVED'
  | 'REJECTED';

export interface DailyLog {
  id?: string | number;
  attendance_id?: string | number;
  date: string;
  activity_log: string;
  lesson_learned: string;
  obstacles: string;
  state?: LogApprovalState;
  reviewer_notes?: string | null;
  created_at?: string;
  updated_at?: string;
  [key: string]: any;
}

export interface Attendance {
  id: string | number;
  date: string;
  status: AttendanceStatus;
  approval_status?: 'SUBMITTED' | 'APPROVED' | 'REJECTED';
  leave_reason?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  log?: DailyLog | null;
  created_at?: string;
  updated_at?: string;
  [key: string]: any;
}

export interface AttendanceSubmissionPayload {
  date: string;
  status: AttendanceStatus;
  activity_log?: string;
  lesson_learned?: string;
  obstacles?: string;
  leave_reason?: string;
  latitude?: number;
  longitude?: number;
  participant_id?: string | number;
}

export interface UpdateDailyLogPayload {
  date: string;
  activity_log: string;
  lesson_learned: string;
  obstacles: string;
  state: 'REVISION_SUBMITTED';
}
