export type AppRole = 'admin' | 'teacher' | 'parent';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: AppRole;
  avatar_url: string | null;
  created_at: string;
}

export interface AcademicYear {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
}

export interface Class {
  id: string;
  name: string;
  grade_level: number;
  section: string;
  academic_year_id: string;
  teacher_id: string | null;
  teacher?: Profile;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
}

export interface ClassSubject {
  id: string;
  class_id: string;
  subject_id: string;
  teacher_id: string | null;
  class?: Class;
  subject?: Subject;
  teacher?: Profile;
}

export interface Student {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  date_of_birth: string;
  gender: 'male' | 'female' | 'other';
  class_id: string;
  enrollment_date: string;
  status: 'active' | 'inactive' | 'transferred';
  avatar_url: string | null;
  created_at: string;
  class?: Class;
}

export interface ParentStudent {
  id: string;
  parent_id: string;
  student_id: string;
  relationship: string;
  parent?: Profile;
  student?: Student;
}

export interface Attendance {
  id: string;
  student_id: string;
  class_id: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  marked_by: string;
  created_at: string;
  student?: Student;
}

export interface Assignment {
  id: string;
  title: string;
  description: string | null;
  class_subject_id: string;
  due_date: string;
  max_score: number;
  created_by: string;
  created_at: string;
  class_subject?: ClassSubject;
}

export interface Grade {
  id: string;
  student_id: string;
  assignment_id: string;
  score: number;
  remarks: string | null;
  graded_by: string;
  created_at: string;
  student?: Student;
  assignment?: Assignment;
}

export interface FeeStructure {
  id: string;
  name: string;
  amount: number;
  academic_year_id: string;
  class_id: string | null;
  due_date: string;
  description: string | null;
}

export interface FeePayment {
  id: string;
  student_id: string;
  fee_structure_id: string;
  amount_paid: number;
  payment_date: string | null;
  status: 'paid' | 'pending' | 'overdue' | 'partial';
  transaction_ref: string | null;
  created_at: string;
  student?: Student;
  fee_structure?: FeeStructure;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  author_id: string;
  target_role: AppRole | 'all';
  target_class_id: string | null;
  is_pinned: boolean;
  created_at: string;
  author?: Profile;
  target_class?: Class;
}

export interface Timetable {
  id: string;
  class_id: string;
  subject_id: string;
  teacher_id: string;
  day_of_week: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday';
  start_time: string;
  end_time: string;
  room: string | null;
  class?: Class;
  subject?: Subject;
  teacher?: Profile;
}

export interface Examination {
  id: string;
  name: string;
  class_id: string;
  subject_id: string;
  date: string;
  start_time: string;
  end_time: string;
  max_marks: number;
  room: string | null;
  created_by: string;
  created_at: string;
  class?: Class;
  subject?: Subject;
}

export interface ExamResult {
  id: string;
  exam_id: string;
  student_id: string;
  marks_obtained: number;
  remarks: string | null;
  graded_by: string;
  created_at: string;
  exam?: Examination;
  student?: Student;
}

export interface Admission {
  id: string;
  applicant_name: string;
  email: string;
  phone: string;
  date_of_birth: string;
  gender: 'male' | 'female' | 'other';
  class_applied: string;
  parent_name: string;
  parent_phone: string;
  previous_school: string | null;
  status: 'applied' | 'under_review' | 'accepted' | 'rejected' | 'waitlisted';
  applied_date: string;
  notes: string | null;
  reviewed_by: string | null;
  created_at: string;
  class?: Class;
}

export interface LibraryBook {
  id: string;
  title: string;
  author: string;
  isbn: string | null;
  category: string | null;
  total_copies: number;
  available_copies: number;
  shelf_location: string | null;
  status: 'available' | 'unavailable';
  created_at: string;
}

export interface BookIssue {
  id: string;
  book_id: string;
  student_id: string;
  issued_by: string;
  issue_date: string;
  due_date: string;
  return_date: string | null;
  status: 'issued' | 'returned' | 'overdue';
  fine_amount: number;
  created_at: string;
  book?: LibraryBook;
  student?: Student;
}

export interface Event {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  start_time: string | null;
  end_time: string | null;
  location: string | null;
  organizer_id: string;
  target_role: string;
  created_at: string;
  organizer?: Profile;
}

export interface TransportRoute {
  id: string;
  name: string;
  driver_name: string | null;
  driver_phone: string | null;
  vehicle_number: string | null;
  capacity: number;
  start_point: string | null;
  end_point: string | null;
  stops: string[] | null;
  created_at: string;
}

export interface TransportAssignment {
  id: string;
  route_id: string;
  student_id: string;
  pickup_stop: string | null;
  dropoff_stop: string | null;
  route?: TransportRoute;
  student?: Student;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: string | null;
  quantity: number;
  unit: string;
  location: string | null;
  condition: 'good' | 'fair' | 'poor';
  purchase_date: string | null;
  unit_cost: number | null;
  supplier: string | null;
  notes: string | null;
  created_at: string;
}

export interface Payroll {
  id: string;
  teacher_id: string;
  month: number;
  year: number;
  basic_salary: number;
  allowances: number;
  deductions: number;
  net_salary: number;
  status: 'pending' | 'processed' | 'paid';
  paid_date: string | null;
  created_at: string;
  teacher?: Profile;
}

export interface HostelRoom {
  id: string;
  room_number: string;
  block: string;
  floor: number;
  capacity: number;
  occupied: number;
  room_type: 'single' | 'shared' | 'dormitory';
  amenities: string[] | null;
  status: 'available' | 'full' | 'maintenance';
  created_at: string;
}

export interface HostelAllocation {
  id: string;
  room_id: string;
  student_id: string;
  allocated_date: string;
  vacated_date: string | null;
  mess_opted: boolean;
  emergency_contact: string | null;
  status: 'active' | 'vacated';
  created_at: string;
  room?: HostelRoom;
  student?: Student;
}

export interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  subject: string | null;
  content: string;
  is_read: boolean;
  created_at: string;
  sender?: Profile;
  recipient?: Profile;
}
