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
