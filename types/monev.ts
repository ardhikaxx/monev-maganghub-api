export interface MonevUser {
  id: string;
  name: string;
  email: string;
  role: string;
  company_name?: string;
  position?: string;
  internship_start_date?: string;
  internship_end_date?: string;
  mentor_name?: string;
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
  id?: string;
  attendance_id?: string;
  date: string;
  activity_log: string;
  lesson_learned: string;
  obstacles: string;
  state?: LogApprovalState;
  reviewer_notes?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface Attendance {
  id: string;
  date: string;
  status: AttendanceStatus;
  approval_status?: 'SUBMITTED' | 'APPROVED' | 'REJECTED';
  leave_reason?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  log?: DailyLog | null;
  created_at?: string;
  updated_at?: string;
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
  participant_id?: string;
}

export interface UpdateDailyLogPayload {
  date: string;
  activity_log: string;
  lesson_learned: string;
  obstacles: string;
  state: 'REVISION_SUBMITTED';
}
