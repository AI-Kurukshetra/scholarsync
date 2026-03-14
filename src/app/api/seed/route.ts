import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

// ─── Helpers ───────────────────────────────────────────────

const uuid = (prefix: string, n: number) =>
  `${prefix}0000-0000-${String(n).padStart(12, '0')}`;

const pickRandom = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const bellCurve = (maxScore: number): number => {
  const u1 = Math.random(), u2 = Math.random();
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return Math.round(Math.max(maxScore * 0.25, Math.min(maxScore, maxScore * (0.72 + z * 0.13))));
};

const dateStr = (d: Date) => d.toISOString().split('T')[0];

const addDays = (d: Date, n: number) => {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
};

const randomDate = (start: Date, end: Date) =>
  new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));

const txnRef = () =>
  `SS-${new Date().getFullYear()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

// ─── Reference Data ────────────────────────────────────────

const ACADEMIC_YEAR_ID = uuid('a1000000-0000-', 1);
const CLASS_IDS = Array.from({ length: 6 }, (_, i) => uuid('c1000000-0000-', i + 1));
const SUBJECT_IDS = Array.from({ length: 6 }, (_, i) => uuid('b1000000-0000-', i + 1));
const FEE_STRUCTURE_IDS = Array.from({ length: 4 }, (_, i) => uuid('f1000000-0000-', i + 1));

const SUBJECTS = [
  { id: SUBJECT_IDS[0], name: 'Mathematics', code: 'MATH' },
  { id: SUBJECT_IDS[1], name: 'English', code: 'ENG' },
  { id: SUBJECT_IDS[2], name: 'Science', code: 'SCI' },
  { id: SUBJECT_IDS[3], name: 'Social Studies', code: 'SST' },
  { id: SUBJECT_IDS[4], name: 'Hindi', code: 'HIN' },
  { id: SUBJECT_IDS[5], name: 'Computer Science', code: 'CS' },
];

const CLASSES = [
  { id: CLASS_IDS[0], name: 'Class 5-A', grade_level: 5, section: 'A' },
  { id: CLASS_IDS[1], name: 'Class 6-A', grade_level: 6, section: 'A' },
  { id: CLASS_IDS[2], name: 'Class 7-A', grade_level: 7, section: 'A' },
  { id: CLASS_IDS[3], name: 'Class 8-A', grade_level: 8, section: 'A' },
  { id: CLASS_IDS[4], name: 'Class 9-A', grade_level: 9, section: 'A' },
  { id: CLASS_IDS[5], name: 'Class 10-A', grade_level: 10, section: 'A' },
];

const STUDENTS_DATA: { first: string; last: string; gender: 'male' | 'female' }[] = [
  // Class 5 (born 2014-2015)
  { first: 'Aarav', last: 'Sharma', gender: 'male' },
  { first: 'Ananya', last: 'Patel', gender: 'female' },
  { first: 'Dev', last: 'Kapoor', gender: 'male' },
  { first: 'Ishita', last: 'Gupta', gender: 'female' },
  { first: 'Kabir', last: 'Singh', gender: 'male' },
  { first: 'Myra', last: 'Reddy', gender: 'female' },
  { first: 'Nikhil', last: 'Kumar', gender: 'male' },
  { first: 'Priya', last: 'Joshi', gender: 'female' },
  { first: 'Rohan', last: 'Desai', gender: 'male' },
  { first: 'Sanya', last: 'Verma', gender: 'female' },
  // Class 6 (born 2013-2014)
  { first: 'Aditya', last: 'Nair', gender: 'male' },
  { first: 'Diya', last: 'Menon', gender: 'female' },
  { first: 'Harsh', last: 'Agarwal', gender: 'male' },
  { first: 'Kavya', last: 'Iyer', gender: 'female' },
  { first: 'Laksh', last: 'Bhat', gender: 'male' },
  { first: 'Nisha', last: 'Rao', gender: 'female' },
  { first: 'Om', last: 'Chauhan', gender: 'male' },
  { first: 'Riya', last: 'Das', gender: 'female' },
  { first: 'Shaurya', last: 'Pandey', gender: 'male' },
  { first: 'Tara', last: 'Mishra', gender: 'female' },
  // Class 7 (born 2012-2013)
  { first: 'Arjun', last: 'Thakur', gender: 'male' },
  { first: 'Bhavna', last: 'Saxena', gender: 'female' },
  { first: 'Chirag', last: 'Mehta', gender: 'male' },
  { first: 'Deepika', last: 'Shetty', gender: 'female' },
  { first: 'Eshan', last: 'Malhotra', gender: 'male' },
  { first: 'Gauri', last: 'Pillai', gender: 'female' },
  { first: 'Hrithik', last: 'Chandra', gender: 'male' },
  { first: 'Ira', last: 'Chopra', gender: 'female' },
  { first: 'Jay', last: 'Kulkarni', gender: 'male' },
  { first: 'Kiara', last: 'Hegde', gender: 'female' },
  // Class 8 (born 2011-2012)
  { first: 'Manav', last: 'Bajaj', gender: 'male' },
  { first: 'Nandini', last: 'Goyal', gender: 'female' },
  { first: 'Pranav', last: 'Tiwari', gender: 'male' },
  { first: 'Rashi', last: 'Bansal', gender: 'female' },
  { first: 'Siddharth', last: 'Yadav', gender: 'male' },
  { first: 'Tanvi', last: 'Choudhary', gender: 'female' },
  { first: 'Utkarsh', last: 'Rawat', gender: 'male' },
  { first: 'Vanshika', last: 'Dubey', gender: 'female' },
  { first: 'Yash', last: 'Khatri', gender: 'male' },
  { first: 'Zara', last: 'Arora', gender: 'female' },
  // Class 9 (born 2010-2011)
  { first: 'Advait', last: 'Jain', gender: 'male' },
  { first: 'Charvi', last: 'Sethi', gender: 'female' },
  { first: 'Dhruv', last: 'Kohli', gender: 'male' },
  { first: 'Eshani', last: 'Gill', gender: 'female' },
  { first: 'Gautam', last: 'Sinha', gender: 'male' },
  { first: 'Hina', last: 'Bhatt', gender: 'female' },
  { first: 'Ishaan', last: 'Oberoi', gender: 'male' },
  { first: 'Jiya', last: 'Rathi', gender: 'female' },
  { first: 'Karan', last: 'Dhawan', gender: 'male' },
  { first: 'Lavanya', last: 'Bose', gender: 'female' },
  // Class 10 (born 2009-2010)
  { first: 'Mihir', last: 'Kapoor', gender: 'male' },
  { first: 'Navya', last: 'Dutta', gender: 'female' },
  { first: 'Ojas', last: 'Mukherjee', gender: 'male' },
  { first: 'Pihu', last: 'Sen', gender: 'female' },
  { first: 'Reyansh', last: 'Ahuja', gender: 'male' },
  { first: 'Saanvi', last: 'Grover', gender: 'female' },
  { first: 'Tejas', last: 'Luthra', gender: 'male' },
  { first: 'Uma', last: 'Ranganathan', gender: 'female' },
  { first: 'Vivaan', last: 'Srinivasan', gender: 'male' },
  { first: 'Wridhi', last: 'Talwar', gender: 'female' },
];

const TEACHER_USERS = [
  { email: 'teacher@scholarsync.demo', full_name: 'Mrs. Sunita Krishnamurthy', role: 'teacher' },
  { email: 'rajesh.mathur@scholarsync.demo', full_name: 'Mr. Rajesh Mathur', role: 'teacher' },
  { email: 'priyanka.nair@scholarsync.demo', full_name: 'Ms. Priyanka Nair', role: 'teacher' },
  { email: 'amit.saxena@scholarsync.demo', full_name: 'Mr. Amit Saxena', role: 'teacher' },
];

const PARENT_NAMES = [
  'Rajesh Sharma', 'Meena Patel', 'Suresh Kapoor', 'Anjali Gupta', 'Vikram Singh',
  'Sunita Reddy', 'Arun Kumar', 'Lakshmi Joshi', 'Ramesh Desai', 'Pooja Verma',
  'Sanjay Nair', 'Deepa Menon', 'Raghav Agarwal', 'Meena Iyer', 'Ashok Bhat',
  'Kavita Rao', 'Nitin Chauhan', 'Swati Das', 'Vijay Pandey', 'Geeta Mishra',
  'Mahesh Thakur', 'Anita Saxena', 'Prakash Mehta', 'Rekha Shetty', 'Sunil Malhotra',
  'Padma Pillai', 'Dinesh Chandra', 'Neha Chopra', 'Mohan Kulkarni', 'Usha Hegde',
];

// ─── Main Seed ─────────────────────────────────────────────

export async function POST() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: { autoRefreshToken: false, persistSession: false },
        db: { schema: 'public' },
        global: { headers: { 'X-Supabase-Bypass-RLS': 'true' } },
      }
    );

    // ── Step 1: Create auth users ──────────────────────────
    const allUsers = [
      { email: 'admin@scholarsync.demo', password: 'demo123456', full_name: 'Dr. Vikram Chandra', role: 'admin' },
      ...TEACHER_USERS.map(t => ({ ...t, password: 'demo123456' })),
      { email: 'parent@scholarsync.demo', password: 'demo123456', full_name: PARENT_NAMES[0], role: 'parent' },
      ...PARENT_NAMES.slice(1).map((name, i) => ({
        email: `parent${i + 2}@scholarsync.demo`,
        password: 'demo123456',
        full_name: name,
        role: 'parent',
      })),
    ];

    const userIds: Record<string, string> = {};
    const errors: string[] = [];

    // First, try to drop the trigger so user creation doesn't fail
    // We'll insert profiles manually after creating users
    // The trigger may fail due to enum casting issues

    for (const u of allUsers) {
      // Try to create user without metadata first (avoids trigger issues)
      const { data, error } = await supabase.auth.admin.createUser({
        email: u.email,
        password: u.password,
        email_confirm: true,
        user_metadata: { full_name: u.full_name, role: u.role },
      });
      if (error) {
        // If trigger fails, try listing existing users
        const { data: list } = await supabase.auth.admin.listUsers();
        const existing = list?.users?.find(x => x.email === u.email);
        if (existing) { userIds[u.email] = existing.id; continue; }
        errors.push(`${u.email}: ${error.message}`);
        continue;
      }
      userIds[u.email] = data.user.id;

      // Manually upsert profile (in case trigger failed or didn't run)
      await supabase.from('profiles').upsert({
        id: data.user.id,
        email: u.email,
        full_name: u.full_name,
        role: u.role,
      });
    }

    const adminId = userIds['admin@scholarsync.demo'];
    const teacherIds = TEACHER_USERS.map(t => userIds[t.email]).filter(Boolean);
    const parentIds = [userIds['parent@scholarsync.demo'], ...PARENT_NAMES.slice(1).map((_, i) => userIds[`parent${i + 2}@scholarsync.demo`])].filter(Boolean);

    if (!adminId || teacherIds.length === 0) {
      return NextResponse.json({ success: false, error: 'Could not create core users' }, { status: 500 });
    }

    // ── Step 2: Academic Year ──────────────────────────────
    await supabase.from('academic_years').upsert({
      id: ACADEMIC_YEAR_ID,
      name: '2025-26',
      start_date: '2025-04-01',
      end_date: '2026-03-31',
      is_current: true,
    });

    // ── Step 3: Subjects ───────────────────────────────────
    await supabase.from('subjects').upsert(SUBJECTS);

    // ── Step 4: Classes (assigned to teachers) ─────────────
    await supabase.from('classes').upsert(
      CLASSES.map((c, i) => ({
        ...c,
        academic_year_id: ACADEMIC_YEAR_ID,
        teacher_id: teacherIds[i % teacherIds.length],
      }))
    );

    // ── Step 5: Class-Subject mappings ─────────────────────
    let csCounter = 1;
    const classSubjects: { id: string; class_id: string; subject_id: string; teacher_id: string }[] = [];
    for (const cls of CLASSES) {
      for (const sub of SUBJECTS) {
        classSubjects.push({
          id: uuid('cs100000-0000-', csCounter++),
          class_id: cls.id,
          subject_id: sub.id,
          teacher_id: teacherIds[csCounter % teacherIds.length],
        });
      }
    }
    await supabase.from('class_subjects').upsert(classSubjects);

    // ── Step 6: Students ───────────────────────────────────
    const students = STUDENTS_DATA.map((s, i) => {
      const classIndex = Math.floor(i / 10);
      const baseYear = 2015 - classIndex; // grade 5 → born 2014-2015
      const dob = randomDate(new Date(`${baseYear - 1}-01-01`), new Date(`${baseYear}-06-30`));
      // Stagger enrollment: most on day 1, a few late joiners
      const enrollOffset = Math.random() < 0.85 ? 0 : Math.floor(Math.random() * 30) + 5;
      const enrollDate = addDays(new Date('2025-04-01'), enrollOffset);

      return {
        id: uuid('d1000000-0000-', i + 1),
        first_name: s.first,
        last_name: s.last,
        email: `${s.first.toLowerCase()}.${s.last.toLowerCase()}@springdale.edu.in`,
        date_of_birth: dateStr(dob),
        gender: s.gender,
        class_id: CLASS_IDS[classIndex],
        enrollment_date: dateStr(enrollDate),
        status: i === 37 ? 'transferred' : 'active', // 1 transferred student for realism
      };
    });
    await supabase.from('students').upsert(students);

    const studentIds = students.map(s => s.id);
    const activeStudentIds = students.filter(s => s.status === 'active').map(s => s.id);

    // ── Step 7: Parent-Student links ───────────────────────
    const parentStudents: { parent_id: string; student_id: string; relationship: string }[] = [];
    for (let i = 0; i < Math.min(parentIds.length, 30); i++) {
      const s1 = i * 2, s2 = i * 2 + 1;
      if (s1 < studentIds.length) {
        parentStudents.push({ parent_id: parentIds[i], student_id: studentIds[s1], relationship: i % 3 === 0 ? 'mother' : 'father' });
      }
      if (s2 < studentIds.length) {
        parentStudents.push({ parent_id: parentIds[i], student_id: studentIds[s2], relationship: i % 3 === 0 ? 'mother' : 'father' });
      }
    }
    await supabase.from('parent_students').upsert(parentStudents, { onConflict: 'parent_id,student_id' });

    // ── Step 8: Attendance (realistic ~92% rate over school days) ─
    // Indian school: Mon-Sat, April 2025 onwards
    const schoolDays: string[] = [];
    const termStart = new Date('2025-04-07'); // first Monday after April 1
    let cursor = new Date(termStart);
    while (schoolDays.length < 15) {
      const dow = cursor.getDay();
      if (dow >= 1 && dow <= 6) { // Mon-Sat
        schoolDays.push(dateStr(cursor));
      }
      cursor = addDays(cursor, 1);
    }

    // Give each student a "personality" — some are always present, some frequently absent
    const studentAbsenceRate: Record<string, number> = {};
    for (const sid of activeStudentIds) {
      const r = Math.random();
      if (r < 0.60) studentAbsenceRate[sid] = 0.03;       // very regular
      else if (r < 0.85) studentAbsenceRate[sid] = 0.08;   // normal
      else if (r < 0.95) studentAbsenceRate[sid] = 0.15;   // somewhat absent
      else studentAbsenceRate[sid] = 0.25;                  // frequently absent
    }

    const attendance: {
      student_id: string; class_id: string; date: string;
      status: string; marked_by: string;
    }[] = [];

    for (const sid of activeStudentIds) {
      const sIndex = parseInt(sid.slice(-3)) - 1;
      const classIndex = Math.floor(sIndex / 10);
      const classId = CLASS_IDS[classIndex];
      const teacher = teacherIds[classIndex % teacherIds.length];
      const absRate = studentAbsenceRate[sid];

      for (const day of schoolDays) {
        const r = Math.random();
        let status: string;
        if (r < (1 - absRate - 0.04)) status = 'present';
        else if (r < (1 - absRate)) status = 'late';
        else if (r < (1 - absRate * 0.3)) status = 'absent';
        else status = 'excused';

        attendance.push({ student_id: sid, class_id: classId, date: day, status, marked_by: teacher });
      }
    }

    // Batch insert attendance
    for (let i = 0; i < attendance.length; i += 200) {
      await supabase.from('attendance').upsert(
        attendance.slice(i, i + 200),
        { onConflict: 'student_id,date' }
      );
    }

    // ── Step 9: Fee Structures ─────────────────────────────
    const feeStructures = [
      { id: FEE_STRUCTURE_IDS[0], name: 'Tuition Fee - Term 1', amount: 18500, due_date: '2025-04-30', description: 'First term tuition fee (April-September 2025)' },
      { id: FEE_STRUCTURE_IDS[1], name: 'Tuition Fee - Term 2', amount: 18500, due_date: '2025-10-31', description: 'Second term tuition fee (October 2025-March 2026)' },
      { id: FEE_STRUCTURE_IDS[2], name: 'Annual Development Fee', amount: 5000, due_date: '2025-04-15', description: 'Infrastructure and development levy' },
      { id: FEE_STRUCTURE_IDS[3], name: 'Activity & Lab Fee', amount: 3200, due_date: '2025-04-15', description: 'Covers lab consumables, sports equipment, and co-curricular activities' },
    ];
    await supabase.from('fee_structures').upsert(
      feeStructures.map(f => ({ ...f, academic_year_id: ACADEMIC_YEAR_ID }))
    );

    // ── Step 10: Fee Payments (realistic mix) ──────────────
    const feePayments: {
      student_id: string; fee_structure_id: string; amount_paid: number;
      payment_date: string | null; status: string; transaction_ref: string | null;
    }[] = [];

    for (const sid of studentIds) {
      // Each student gets 1-3 fee line items (not always all 4)
      const numFees = Math.random() < 0.6 ? 2 : Math.random() < 0.8 ? 3 : 1;
      const feeIndices = [0]; // Everyone has term 1 tuition
      if (numFees >= 2) feeIndices.push(2); // dev fee
      if (numFees >= 3) feeIndices.push(3); // activity fee

      for (const fi of feeIndices) {
        const fee = feeStructures[fi];
        const r = Math.random();
        let status: string, amountPaid: number, paymentDate: string | null, ref: string | null;

        if (r < 0.55) {
          // Paid on time (within 2 weeks of due date)
          status = 'paid';
          amountPaid = fee.amount;
          const paidOn = addDays(new Date(fee.due_date), -Math.floor(Math.random() * 14));
          paymentDate = dateStr(paidOn);
          ref = txnRef();
        } else if (r < 0.70) {
          // Paid late
          status = 'paid';
          amountPaid = fee.amount;
          const paidOn = addDays(new Date(fee.due_date), Math.floor(Math.random() * 30) + 1);
          paymentDate = dateStr(paidOn);
          ref = txnRef();
        } else if (r < 0.82) {
          // Partial payment
          status = 'partial';
          amountPaid = Math.round(fee.amount * (0.4 + Math.random() * 0.3));
          paymentDate = dateStr(addDays(new Date(fee.due_date), Math.floor(Math.random() * 10)));
          ref = txnRef();
        } else if (r < 0.92) {
          // Pending (not yet due or just due)
          status = 'pending';
          amountPaid = 0;
          paymentDate = null;
          ref = null;
        } else {
          // Overdue
          status = 'overdue';
          amountPaid = 0;
          paymentDate = null;
          ref = null;
        }

        feePayments.push({
          student_id: sid,
          fee_structure_id: fee.id,
          amount_paid: amountPaid,
          payment_date: paymentDate,
          status,
          transaction_ref: ref,
        });
      }
    }
    await supabase.from('fee_payments').insert(feePayments);

    // ── Step 11: Assignments (realistic titles & spread) ───
    const assignmentTemplates = [
      // Math
      { title: 'Fractions & Decimals Quiz', subjectIdx: 0, max_score: 25 },
      { title: 'Algebra Unit Test', subjectIdx: 0, max_score: 50 },
      { title: 'Geometry Worksheet', subjectIdx: 0, max_score: 20 },
      // English
      { title: 'Creative Writing — My Favourite Season', subjectIdx: 1, max_score: 30 },
      { title: 'Grammar & Comprehension Test', subjectIdx: 1, max_score: 40 },
      { title: 'Book Report: Novel Study', subjectIdx: 1, max_score: 50 },
      // Science
      { title: 'Periodic Table Quiz', subjectIdx: 2, max_score: 25 },
      { title: 'Lab Report: Density Experiment', subjectIdx: 2, max_score: 30 },
      { title: 'Science Unit Assessment', subjectIdx: 2, max_score: 50 },
      // SST
      { title: 'Map Work — Rivers of India', subjectIdx: 3, max_score: 20 },
      { title: 'History Chapter Test: Mughal Empire', subjectIdx: 3, max_score: 40 },
      // Hindi
      { title: 'Hindi Nibandh (Essay)', subjectIdx: 4, max_score: 30 },
      { title: 'Vyakaran Pariksha (Grammar)', subjectIdx: 4, max_score: 25 },
      // CS
      { title: 'Scratch Programming Project', subjectIdx: 5, max_score: 50 },
      { title: 'HTML & CSS Mini Website', subjectIdx: 5, max_score: 40 },
      { title: 'Python Basics Quiz', subjectIdx: 5, max_score: 25 },
      // Additional assessments
      { title: 'Monthly Maths Olympiad Prep', subjectIdx: 0, max_score: 30 },
      { title: 'English Spelling Bee', subjectIdx: 1, max_score: 20 },
    ];

    const assignments: {
      id: string; title: string; description: string | null;
      class_subject_id: string; due_date: string; max_score: number;
      created_by: string; created_at: string;
    }[] = [];

    let asnCounter = 1;
    for (let ci = 0; ci < 6; ci++) {
      // Each class gets 3 assignments from different subjects
      const templates = assignmentTemplates
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);

      for (const tmpl of templates) {
        const csRow = classSubjects.find(
          cs => cs.class_id === CLASS_IDS[ci] && cs.subject_id === SUBJECT_IDS[tmpl.subjectIdx]
        );
        if (!csRow) continue;

        const dueDate = addDays(new Date('2025-04-14'), ci * 5 + asnCounter * 3);
        const createdAt = addDays(dueDate, -(7 + Math.floor(Math.random() * 7)));

        assignments.push({
          id: uuid('e1000000-0000-', asnCounter),
          title: tmpl.title,
          description: null,
          class_subject_id: csRow.id,
          due_date: dateStr(dueDate),
          max_score: tmpl.max_score,
          created_by: teacherIds[ci % teacherIds.length],
          created_at: createdAt.toISOString(),
        });
        asnCounter++;
      }
    }
    await supabase.from('assignments').upsert(assignments);

    // ── Step 12: Grades (bell-curve, with remarks) ─────────
    const remarkOptions = [
      null, null, null, null, // most have no remarks
      'Well done!', 'Keep practicing', 'Excellent work',
      'Needs improvement', 'Good effort', 'See me after class',
      'Very neat work', 'Shows strong understanding',
      'Review chapter 3', 'Consistent performer',
    ];

    const grades: {
      student_id: string; assignment_id: string; score: number;
      remarks: string | null; graded_by: string; created_at: string;
    }[] = [];

    for (const asn of assignments) {
      const csRow = classSubjects.find(cs => cs.id === asn.class_subject_id);
      if (!csRow) continue;
      const classIndex = CLASS_IDS.indexOf(csRow.class_id);
      if (classIndex < 0) continue;

      const classStudentStart = classIndex * 10;
      for (let s = classStudentStart; s < classStudentStart + 10; s++) {
        if (s >= studentIds.length) break;
        const sid = studentIds[s];
        // Skip transferred student
        if (students[s].status !== 'active') continue;
        // 5% chance grade not yet entered
        if (Math.random() < 0.05) continue;

        const score = bellCurve(asn.max_score);
        const pct = score / asn.max_score;
        let remark = pickRandom(remarkOptions);
        // Override remark for extreme scores
        if (pct >= 0.95) remark = pickRandom(['Outstanding!', 'Excellent work', 'Top of the class']);
        else if (pct < 0.4) remark = pickRandom(['Needs significant improvement', 'Please see me', 'Review all chapters']);

        const gradedAt = addDays(new Date(asn.due_date), Math.floor(Math.random() * 5) + 1);

        grades.push({
          student_id: sid,
          assignment_id: asn.id,
          score,
          remarks: remark,
          graded_by: csRow.teacher_id,
          created_at: gradedAt.toISOString(),
        });
      }
    }

    for (let i = 0; i < grades.length; i += 100) {
      await supabase.from('grades').upsert(
        grades.slice(i, i + 100),
        { onConflict: 'student_id,assignment_id' }
      );
    }

    // ── Step 13: Announcements (realistic school comms) ────
    const announcements = [
      {
        title: 'Welcome to Academic Session 2025-26',
        content: `Dear Parents and Students,

We are delighted to welcome everyone to the new academic session 2025-26 at Springdale Academy. Classes commenced on April 7, 2025.

Please ensure your ward carries the updated ID card, completed medical form, and two sets of the new uniform. The school office is open from 8:00 AM to 2:00 PM for any queries.

We look forward to a productive and enriching year ahead.

Warm regards,
Dr. Vikram Chandra
Principal`,
        author_id: adminId,
        target_role: 'all',
        is_pinned: true,
        created_at: '2025-04-01T08:00:00Z',
      },
      {
        title: 'First Parent-Teacher Meeting — April 26',
        content: `The first PTM of the session will be held on Saturday, April 26, 2025 from 9:00 AM to 1:00 PM.

Schedule:
• Classes 5-7: 9:00 AM – 11:00 AM
• Classes 8-10: 11:00 AM – 1:00 PM

Please carry your ward's diary. Individual slots can be booked with class teachers through the school app.`,
        author_id: adminId,
        target_role: 'parent',
        is_pinned: true,
        created_at: '2025-04-10T09:30:00Z',
      },
      {
        title: 'Inter-House Quiz Competition',
        content: `The annual Inter-House Quiz Competition will be held on May 5, 2025 in the school auditorium. Each house must nominate 3 students from classes 8-10.

Topics: General Knowledge, Science & Technology, Current Affairs, Literature.
Nominations to be submitted to Mrs. Krishnamurthy by April 28.`,
        author_id: teacherIds[0],
        target_role: 'all',
        is_pinned: false,
        created_at: '2025-04-12T10:15:00Z',
      },
      {
        title: 'Fee Payment Reminder — Term 1',
        content: `This is a reminder that Term 1 tuition fees (₹18,500) and Annual Development Fee (₹5,000) are due by April 30, 2025.

Payment can be made via:
1. Online transfer to the school bank account
2. UPI payment (details in school app)
3. Cheque/DD at the school accounts office

Late payment will attract a surcharge of ₹500. For instalment plans, please contact the Accounts Office.`,
        author_id: adminId,
        target_role: 'parent',
        is_pinned: false,
        created_at: '2025-04-14T08:00:00Z',
      },
      {
        title: 'Staff Meeting — Curriculum Review',
        content: `All teaching staff are requested to attend the curriculum review meeting on April 18, 2025 at 3:30 PM in the conference room.

Agenda:
1. Review of new NCERT syllabus changes
2. Assessment pattern for 2025-26
3. Integration of digital tools in classrooms
4. Any other matters

Please bring your subject-wise annual plan drafts.`,
        author_id: adminId,
        target_role: 'teacher',
        is_pinned: false,
        created_at: '2025-04-15T11:00:00Z',
      },
      {
        title: 'Summer Uniform Transition',
        content: `From April 21 onwards, all students must wear the summer uniform (white shirt with grey shorts/skirt). Winter uniforms will not be permitted after this date.

Students who have not yet purchased the summer uniform can visit the school store (Block B, Ground Floor) between 8:00-9:00 AM any working day.`,
        author_id: adminId,
        target_role: 'all',
        is_pinned: false,
        created_at: '2025-04-16T07:45:00Z',
      },
      {
        title: 'Science Lab Safety Orientation — Class 8-10',
        content: `Mandatory lab safety orientation sessions have been scheduled:
• Class 8: April 22 (Tuesday), Period 5
• Class 9: April 23 (Wednesday), Period 4
• Class 10: April 24 (Thursday), Period 6

Students must bring their lab coats. No student will be permitted to use the lab without completing the orientation.`,
        author_id: teacherIds[2] || teacherIds[0],
        target_role: 'all',
        is_pinned: false,
        created_at: '2025-04-17T09:00:00Z',
      },
      {
        title: 'Annual Sports Day — Registrations Open',
        content: `The Annual Sports Day is tentatively scheduled for May 15, 2025. Event registrations are now open for all classes.

Available events:
• Track: 100m, 200m, 400m, 4x100m relay
• Field: Long jump, Shot put, High jump
• Fun events: Sack race, Three-legged race (Classes 5-6 only)

Each student may register for a maximum of 3 events. Forms available with your PT teacher.`,
        author_id: teacherIds[1] || teacherIds[0],
        target_role: 'all',
        is_pinned: false,
        created_at: '2025-04-18T10:30:00Z',
      },
    ];

    await supabase.from('announcements').insert(announcements);

    // ── Step 14: Timetable (Mon-Fri, 8 periods/class) ────
    const periods = [
      { start: '08:00', end: '08:45' },
      { start: '08:50', end: '09:35' },
      { start: '09:40', end: '10:25' },
      { start: '10:40', end: '11:25' },
      { start: '11:30', end: '12:15' },
      { start: '12:20', end: '13:05' },
      { start: '13:45', end: '14:30' },
      { start: '14:35', end: '15:20' },
    ];
    const weekdays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'] as const;
    const rooms = ['Room 101', 'Room 102', 'Room 201', 'Room 202', 'Lab 1', 'Lab 2', 'Room 301', 'Room 302'];

    const timetableRows: {
      class_id: string; subject_id: string; teacher_id: string;
      day_of_week: string; start_time: string; end_time: string; room: string;
    }[] = [];

    for (let ci = 0; ci < 6; ci++) {
      for (const day of weekdays) {
        const daySubjects = [...SUBJECTS].sort(() => Math.random() - 0.5);
        for (let p = 0; p < Math.min(periods.length, 6); p++) {
          const sub = daySubjects[p % daySubjects.length];
          const cs = classSubjects.find(c => c.class_id === CLASS_IDS[ci] && c.subject_id === sub.id);
          timetableRows.push({
            class_id: CLASS_IDS[ci],
            subject_id: sub.id,
            teacher_id: cs?.teacher_id || teacherIds[ci % teacherIds.length],
            day_of_week: day,
            start_time: periods[p].start,
            end_time: periods[p].end,
            room: rooms[(ci + p) % rooms.length],
          });
        }
      }
    }
    await supabase.from('timetables').insert(timetableRows);

    // ── Step 15: Examinations ────────────────────────────
    const examTemplates = [
      { name: 'Unit Test 1 - Mathematics', subjectIdx: 0, maxMarks: 50 },
      { name: 'Unit Test 1 - English', subjectIdx: 1, maxMarks: 50 },
      { name: 'Unit Test 1 - Science', subjectIdx: 2, maxMarks: 50 },
      { name: 'Mid-Term Examination - Mathematics', subjectIdx: 0, maxMarks: 100 },
      { name: 'Mid-Term Examination - English', subjectIdx: 1, maxMarks: 100 },
      { name: 'Mid-Term Examination - Science', subjectIdx: 2, maxMarks: 100 },
    ];

    const examinations: {
      id: string; name: string; class_id: string; subject_id: string;
      date: string; start_time: string; end_time: string;
      max_marks: number; room: string; created_by: string;
    }[] = [];
    let examCounter = 1;

    for (let ci = 0; ci < 6; ci++) {
      for (const tmpl of examTemplates.slice(0, 3)) {
        const examDate = addDays(new Date('2025-05-05'), ci * 3 + examCounter);
        examinations.push({
          id: uuid('ex100000-0000-', examCounter),
          name: tmpl.name,
          class_id: CLASS_IDS[ci],
          subject_id: SUBJECT_IDS[tmpl.subjectIdx],
          date: dateStr(examDate),
          start_time: '09:00',
          end_time: '12:00',
          max_marks: tmpl.maxMarks,
          room: rooms[ci % rooms.length],
          created_by: teacherIds[ci % teacherIds.length],
        });
        examCounter++;
      }
    }
    await supabase.from('examinations').insert(examinations);

    // ── Step 16: Exam Results (bell-curve scores) ────────
    const examResults: {
      exam_id: string; student_id: string; marks_obtained: number;
      remarks: string | null; graded_by: string;
    }[] = [];

    for (const exam of examinations) {
      const classIndex = CLASS_IDS.indexOf(exam.class_id);
      if (classIndex < 0) continue;
      // Only add results for past exams (first 12)
      if (examCounter > 12 && exam === examinations[examinations.length - 1]) continue;
      for (let s = classIndex * 10; s < classIndex * 10 + 10; s++) {
        if (s >= studentIds.length || students[s].status !== 'active') continue;
        if (Math.random() < 0.03) continue; // 3% absent
        examResults.push({
          exam_id: exam.id,
          student_id: studentIds[s],
          marks_obtained: bellCurve(exam.max_marks),
          remarks: pickRandom(remarkOptions),
          graded_by: exam.created_by,
        });
      }
    }
    for (let i = 0; i < examResults.length; i += 100) {
      await supabase.from('exam_results').insert(examResults.slice(i, i + 100));
    }

    // ── Step 17: Admissions ──────────────────────────────
    const admissionNames = [
      { name: 'Arnav Mittal', gender: 'male', parent: 'Rahul Mittal' },
      { name: 'Sneha Agnihotri', gender: 'female', parent: 'Deepak Agnihotri' },
      { name: 'Vihaan Chadha', gender: 'male', parent: 'Priya Chadha' },
      { name: 'Anika Khanna', gender: 'female', parent: 'Sameer Khanna' },
      { name: 'Rehan Ansari', gender: 'male', parent: 'Fatima Ansari' },
      { name: 'Dhriti Mathew', gender: 'female', parent: 'Thomas Mathew' },
      { name: 'Yuvan Nambiar', gender: 'male', parent: 'Lakshmi Nambiar' },
      { name: 'Trisha Bhardwaj', gender: 'female', parent: 'Ajay Bhardwaj' },
      { name: 'Kabir Walia', gender: 'male', parent: 'Sunita Walia' },
      { name: 'Manya Srivastava', gender: 'female', parent: 'Ravi Srivastava' },
      { name: 'Aayan Hussain', gender: 'male', parent: 'Zainab Hussain' },
      { name: 'Siya Raghavan', gender: 'female', parent: 'Krishnan Raghavan' },
    ];
    const admissionStatuses = ['applied', 'under_review', 'accepted', 'rejected', 'waitlisted'];

    const admissions = admissionNames.map((a, i) => {
      const classIdx = i % 6;
      const dob = randomDate(new Date('2012-01-01'), new Date('2016-12-31'));
      const appliedDate = addDays(new Date('2025-02-01'), Math.floor(Math.random() * 60));
      return {
        applicant_name: a.name,
        email: `${a.name.split(' ')[0].toLowerCase()}@gmail.com`,
        phone: `+91 98${String(Math.floor(Math.random() * 100000000)).padStart(8, '0')}`,
        date_of_birth: dateStr(dob),
        gender: a.gender,
        class_applied: CLASS_IDS[classIdx],
        parent_name: a.parent,
        parent_phone: `+91 97${String(Math.floor(Math.random() * 100000000)).padStart(8, '0')}`,
        previous_school: pickRandom(['DPS Indirapuram', 'Ryan International', 'Kendriya Vidyalaya', 'St. Xavier\'s', 'Modern School', null]),
        status: i < 4 ? 'accepted' : i < 6 ? 'under_review' : i < 9 ? 'applied' : admissionStatuses[i % admissionStatuses.length],
        applied_date: dateStr(appliedDate),
        notes: i < 4 ? 'Documents verified. Admission confirmed.' : null,
        reviewed_by: i < 6 ? adminId : null,
      };
    });
    await supabase.from('admissions').insert(admissions);

    // ── Step 18: Library Books ───────────────────────────
    const libraryBooks = [
      { id: uuid('lb100000-0000-', 1), title: 'NCERT Mathematics Class 9', author: 'NCERT', isbn: '978-8174506337', category: 'Textbook', total_copies: 15, available_copies: 12, shelf_location: 'A-1' },
      { id: uuid('lb100000-0000-', 2), title: 'NCERT Science Class 10', author: 'NCERT', isbn: '978-8174506344', category: 'Textbook', total_copies: 15, available_copies: 10, shelf_location: 'A-2' },
      { id: uuid('lb100000-0000-', 3), title: 'Wings of Fire', author: 'A.P.J. Abdul Kalam', isbn: '978-8173711466', category: 'Biography', total_copies: 5, available_copies: 3, shelf_location: 'B-1' },
      { id: uuid('lb100000-0000-', 4), title: 'The Story of My Experiments with Truth', author: 'Mahatma Gandhi', isbn: '978-8172345440', category: 'Biography', total_copies: 4, available_copies: 2, shelf_location: 'B-1' },
      { id: uuid('lb100000-0000-', 5), title: 'Malgudi Days', author: 'R.K. Narayan', isbn: '978-8185986173', category: 'Fiction', total_copies: 6, available_copies: 4, shelf_location: 'C-1' },
      { id: uuid('lb100000-0000-', 6), title: 'The Guide', author: 'R.K. Narayan', isbn: '978-0143039648', category: 'Fiction', total_copies: 5, available_copies: 5, shelf_location: 'C-1' },
      { id: uuid('lb100000-0000-', 7), title: 'A Brief History of Time', author: 'Stephen Hawking', isbn: '978-0553380163', category: 'Science', total_copies: 3, available_copies: 1, shelf_location: 'D-1' },
      { id: uuid('lb100000-0000-', 8), title: 'Sapiens', author: 'Yuval Noah Harari', isbn: '978-0099590088', category: 'Non-Fiction', total_copies: 4, available_copies: 3, shelf_location: 'D-2' },
      { id: uuid('lb100000-0000-', 9), title: 'The Diary of a Young Girl', author: 'Anne Frank', isbn: '978-0141315195', category: 'Biography', total_copies: 5, available_copies: 4, shelf_location: 'B-2' },
      { id: uuid('lb100000-0000-', 10), title: 'Oxford English Dictionary', author: 'Oxford University Press', isbn: '978-0199571123', category: 'Reference', total_copies: 10, available_copies: 10, shelf_location: 'E-1' },
      { id: uuid('lb100000-0000-', 11), title: 'Concise Inorganic Chemistry', author: 'J.D. Lee', isbn: '978-8126515547', category: 'Textbook', total_copies: 8, available_copies: 6, shelf_location: 'A-3' },
      { id: uuid('lb100000-0000-', 12), title: 'Harry Potter and the Philosopher\'s Stone', author: 'J.K. Rowling', isbn: '978-1408855652', category: 'Fiction', total_copies: 6, available_copies: 2, shelf_location: 'C-2' },
    ];
    await supabase.from('library_books').insert(libraryBooks);

    // ── Step 19: Book Issues ─────────────────────────────
    const bookIssues: {
      book_id: string; student_id: string; issued_by: string;
      issue_date: string; due_date: string; return_date: string | null;
      status: string; fine_amount: number;
    }[] = [];
    const bookIds = libraryBooks.map(b => b.id);

    for (let i = 0; i < 20; i++) {
      const bookId = bookIds[i % bookIds.length];
      const sid = activeStudentIds[i % activeStudentIds.length];
      const issueDate = addDays(new Date('2025-04-07'), Math.floor(Math.random() * 30));
      const dueDate = addDays(issueDate, 14);
      const returned = Math.random() < 0.6;
      const returnDate = returned ? addDays(issueDate, Math.floor(Math.random() * 18) + 3) : null;
      const isOverdue = !returned && dueDate < new Date('2025-05-15');
      bookIssues.push({
        book_id: bookId,
        student_id: sid,
        issued_by: teacherIds[i % teacherIds.length],
        issue_date: dateStr(issueDate),
        due_date: dateStr(dueDate),
        return_date: returnDate ? dateStr(returnDate) : null,
        status: returned ? 'returned' : isOverdue ? 'overdue' : 'issued',
        fine_amount: isOverdue ? Math.floor(Math.random() * 5 + 1) * 10 : 0,
      });
    }
    await supabase.from('book_issues').insert(bookIssues);

    // ── Step 20: Events ──────────────────────────────────
    const eventsList = [
      { title: 'Annual Sports Day', description: 'Inter-house athletics and sports competition. Track & field events for all classes.', event_date: '2025-05-15', start_time: '08:00', end_time: '16:00', location: 'School Grounds', target_role: 'all' },
      { title: 'Science Exhibition', description: 'Students showcase science projects and working models. Open to parents.', event_date: '2025-06-10', start_time: '09:00', end_time: '14:00', location: 'School Auditorium', target_role: 'all' },
      { title: 'Parent-Teacher Meeting', description: 'Discuss student progress and address parent concerns.', event_date: '2025-04-26', start_time: '09:00', end_time: '13:00', location: 'Respective Classrooms', target_role: 'parent' },
      { title: 'Independence Day Celebration', description: 'Flag hoisting, cultural programme, and patriotic songs.', event_date: '2025-08-15', start_time: '07:30', end_time: '11:00', location: 'Main Assembly Ground', target_role: 'all' },
      { title: 'Inter-School Debate Competition', description: 'Annual debate competition with neighbouring schools. Topic: "AI in Education"', event_date: '2025-07-22', start_time: '10:00', end_time: '15:00', location: 'Conference Hall', target_role: 'all' },
      { title: 'Annual Day Rehearsal', description: 'Full dress rehearsal for the Annual Day cultural programme.', event_date: '2025-11-20', start_time: '09:00', end_time: '15:00', location: 'School Auditorium', target_role: 'teacher' },
      { title: 'Career Counselling Workshop', description: 'Career guidance session for Class 9-10 students by industry experts.', event_date: '2025-09-15', start_time: '10:00', end_time: '13:00', location: 'Seminar Hall', target_role: 'all' },
      { title: 'Book Fair 2025', description: 'Annual book fair with publishers. Special discounts for students.', event_date: '2025-10-05', start_time: '08:00', end_time: '15:00', location: 'Library Block', target_role: 'all' },
    ];
    await supabase.from('events').insert(
      eventsList.map(e => ({ ...e, organizer_id: adminId }))
    );

    // ── Step 21: Transport Routes ────────────────────────
    const routes = [
      { id: uuid('tr100000-0000-', 1), name: 'Route 1 - Sector 12-22', driver_name: 'Ramesh Yadav', driver_phone: '+91 9876543210', vehicle_number: 'DL-01-AB-1234', capacity: 40, start_point: 'Sector 12', end_point: 'Springdale Academy', stops: ['Sector 12', 'Sector 15', 'Sector 18', 'Sector 20', 'Sector 22', 'School'] },
      { id: uuid('tr100000-0000-', 2), name: 'Route 2 - Defence Colony', driver_name: 'Suresh Prasad', driver_phone: '+91 9876543211', vehicle_number: 'DL-01-CD-5678', capacity: 35, start_point: 'Defence Colony', end_point: 'Springdale Academy', stops: ['Defence Colony', 'Lajpat Nagar', 'Kailash Colony', 'GK-1', 'School'] },
      { id: uuid('tr100000-0000-', 3), name: 'Route 3 - Vasant Kunj', driver_name: 'Mohan Lal', driver_phone: '+91 9876543212', vehicle_number: 'DL-01-EF-9012', capacity: 45, start_point: 'Vasant Kunj', end_point: 'Springdale Academy', stops: ['Vasant Kunj', 'Vasant Vihar', 'RK Puram', 'Sarojini Nagar', 'School'] },
      { id: uuid('tr100000-0000-', 4), name: 'Route 4 - Dwarka Express', driver_name: 'Ajay Kumar', driver_phone: '+91 9876543213', vehicle_number: 'DL-01-GH-3456', capacity: 50, start_point: 'Dwarka Sec 21', end_point: 'Springdale Academy', stops: ['Dwarka Sec 21', 'Dwarka Sec 12', 'Palam', 'Janakpuri', 'School'] },
    ];
    await supabase.from('transport_routes').insert(routes);

    // ── Step 22: Transport Assignments ───────────────────
    const transportAssignments: {
      route_id: string; student_id: string; pickup_stop: string; dropoff_stop: string;
    }[] = [];
    // Assign ~30 students to buses
    for (let i = 0; i < 30; i++) {
      const route = routes[i % routes.length];
      const stops = route.stops;
      transportAssignments.push({
        route_id: route.id,
        student_id: activeStudentIds[i % activeStudentIds.length],
        pickup_stop: stops[Math.floor(Math.random() * (stops.length - 1))],
        dropoff_stop: 'School',
      });
    }
    await supabase.from('transport_assignments').insert(transportAssignments);

    // ── Step 23: Inventory Items ─────────────────────────
    const inventoryItems = [
      { name: 'Student Desks', category: 'Furniture', quantity: 300, unit: 'pieces', location: 'Classrooms', condition: 'good', purchase_date: '2024-06-15', unit_cost: 4500, supplier: 'Godrej Interio' },
      { name: 'Whiteboard Markers (Box)', category: 'Stationery', quantity: 50, unit: 'boxes', location: 'Store Room B', condition: 'good', purchase_date: '2025-03-20', unit_cost: 350, supplier: 'Kores India' },
      { name: 'Desktop Computers', category: 'Electronics', quantity: 40, unit: 'pieces', location: 'Computer Lab', condition: 'good', purchase_date: '2024-01-10', unit_cost: 35000, supplier: 'Dell India' },
      { name: 'Projectors', category: 'Electronics', quantity: 12, unit: 'pieces', location: 'Various Classrooms', condition: 'good', purchase_date: '2024-03-05', unit_cost: 28000, supplier: 'Epson India' },
      { name: 'Chemistry Lab Equipment Set', category: 'Lab Equipment', quantity: 20, unit: 'sets', location: 'Chemistry Lab', condition: 'good', purchase_date: '2024-07-20', unit_cost: 8500, supplier: 'Scientific Traders' },
      { name: 'Sports Equipment Kit', category: 'Sports', quantity: 8, unit: 'kits', location: 'Sports Room', condition: 'fair', purchase_date: '2023-11-10', unit_cost: 12000, supplier: 'Cosco Sports' },
      { name: 'Library Chairs', category: 'Furniture', quantity: 60, unit: 'pieces', location: 'Library', condition: 'good', purchase_date: '2024-04-01', unit_cost: 2800, supplier: 'Nilkamal' },
      { name: 'First Aid Kits', category: 'Medical', quantity: 15, unit: 'kits', location: 'Medical Room + Floors', condition: 'good', purchase_date: '2025-01-05', unit_cost: 1500, supplier: 'Himalaya Wellness' },
      { name: 'Fire Extinguishers', category: 'Safety', quantity: 24, unit: 'pieces', location: 'All Floors', condition: 'good', purchase_date: '2024-08-15', unit_cost: 3200, supplier: 'Safex Fire' },
      { name: 'Printer Cartridges', category: 'Stationery', quantity: 12, unit: 'pieces', location: 'Admin Office', condition: 'good', purchase_date: '2025-03-01', unit_cost: 2200, supplier: 'HP India' },
      { name: 'Microscopes', category: 'Lab Equipment', quantity: 15, unit: 'pieces', location: 'Biology Lab', condition: 'fair', purchase_date: '2022-06-20', unit_cost: 15000, supplier: 'Magnus Opto' },
      { name: 'Audio System (PA)', category: 'Electronics', quantity: 2, unit: 'sets', location: 'Auditorium + Assembly', condition: 'good', purchase_date: '2024-02-10', unit_cost: 45000, supplier: 'Bose India' },
    ];
    await supabase.from('inventory_items').insert(inventoryItems);

    // ── Step 24: Payroll (April 2025) ────────────────────
    const payrollRecords: {
      teacher_id: string; month: number; year: number;
      basic_salary: number; allowances: number; deductions: number;
      net_salary: number; status: string; paid_date: string | null;
    }[] = [];

    const salarySlabs = [55000, 48000, 52000, 45000];
    for (let ti = 0; ti < teacherIds.length; ti++) {
      const basic = salarySlabs[ti % salarySlabs.length];
      const hra = Math.round(basic * 0.25);
      const da = Math.round(basic * 0.12);
      const allowances = hra + da;
      const pf = Math.round(basic * 0.12);
      const tax = Math.round(basic * 0.05);
      const deductions = pf + tax;
      const net = basic + allowances - deductions;

      // April - paid
      payrollRecords.push({
        teacher_id: teacherIds[ti],
        month: 4,
        year: 2025,
        basic_salary: basic,
        allowances,
        deductions,
        net_salary: net,
        status: 'paid',
        paid_date: '2025-04-28',
      });
      // May - pending
      payrollRecords.push({
        teacher_id: teacherIds[ti],
        month: 5,
        year: 2025,
        basic_salary: basic,
        allowances,
        deductions,
        net_salary: net,
        status: 'pending',
        paid_date: null,
      });
    }
    await supabase.from('payroll').insert(payrollRecords);

    // ── Step 25: Messages ────────────────────────────────
    const messagesList = [
      { sender_id: adminId, recipient_id: teacherIds[0], subject: 'Curriculum Meeting Tomorrow', content: 'Dear Mrs. Krishnamurthy,\n\nJust a reminder about the curriculum review meeting scheduled for tomorrow at 3:30 PM in the conference room. Please bring your annual plan draft.\n\nRegards,\nDr. Vikram Chandra', is_read: true },
      { sender_id: teacherIds[0], recipient_id: adminId, subject: 'Re: Curriculum Meeting Tomorrow', content: 'Dear Dr. Chandra,\n\nThank you for the reminder. I have prepared the annual plan for Mathematics and English. Will be there on time.\n\nBest regards,\nMrs. Krishnamurthy', is_read: true },
      { sender_id: adminId, recipient_id: teacherIds[1] || teacherIds[0], subject: 'Sports Day Coordination', content: 'Dear Mr. Mathur,\n\nPlease coordinate with the PT department for the Annual Sports Day preparations. We need the event schedule by next week.\n\nThanks,\nDr. Vikram Chandra', is_read: false },
      { sender_id: teacherIds[2] || teacherIds[0], recipient_id: adminId, subject: 'Lab Equipment Request', content: 'Dear Sir,\n\nWe need additional test tubes and beakers for the Science lab. The current stock is running low with the increased number of practical sessions this term.\n\nKindly arrange procurement at the earliest.\n\nMs. Priyanka Nair', is_read: true },
      { sender_id: adminId, recipient_id: teacherIds[2] || teacherIds[0], subject: 'Re: Lab Equipment Request', content: 'Dear Ms. Nair,\n\nI have approved the procurement request. Please submit the detailed list with quantities to the admin office by Friday.\n\nRegards,\nDr. Vikram Chandra', is_read: false },
    ];
    if (parentIds[0]) {
      messagesList.push(
        { sender_id: parentIds[0], recipient_id: teacherIds[0], subject: 'Query about PTM Slot', content: 'Dear Ma\'am,\n\nCould you please confirm my PTM slot for Aarav on April 26? I would prefer the 10:00-10:15 AM slot if available.\n\nThank you,\nRajesh Sharma', is_read: true },
        { sender_id: teacherIds[0], recipient_id: parentIds[0], subject: 'Re: Query about PTM Slot', content: 'Dear Mr. Sharma,\n\nThe 10:00-10:15 AM slot is confirmed for you. Please bring Aarav\'s diary along.\n\nRegards,\nMrs. Krishnamurthy', is_read: false },
      );
    }
    await supabase.from('messages').insert(messagesList);

    // ── Step 26: Hostel Rooms ────────────────────────────
    const hostelRooms = [
      { id: uuid('hr100000-0000-', 1), room_number: '101', block: 'A', floor: 1, capacity: 4, occupied: 3, room_type: 'shared', amenities: ['Fan', 'Cupboard', 'Study Table'], status: 'available' },
      { id: uuid('hr100000-0000-', 2), room_number: '102', block: 'A', floor: 1, capacity: 4, occupied: 4, room_type: 'shared', amenities: ['Fan', 'Cupboard', 'Study Table'], status: 'full' },
      { id: uuid('hr100000-0000-', 3), room_number: '103', block: 'A', floor: 1, capacity: 2, occupied: 1, room_type: 'shared', amenities: ['AC', 'Cupboard', 'Study Table', 'Attached Bathroom'], status: 'available' },
      { id: uuid('hr100000-0000-', 4), room_number: '201', block: 'A', floor: 2, capacity: 4, occupied: 2, room_type: 'shared', amenities: ['Fan', 'Cupboard', 'Study Table'], status: 'available' },
      { id: uuid('hr100000-0000-', 5), room_number: '202', block: 'A', floor: 2, capacity: 1, occupied: 1, room_type: 'single', amenities: ['AC', 'Cupboard', 'Study Table', 'Attached Bathroom'], status: 'full' },
      { id: uuid('hr100000-0000-', 6), room_number: '101', block: 'B', floor: 1, capacity: 6, occupied: 5, room_type: 'dormitory', amenities: ['Fan', 'Cupboard'], status: 'available' },
      { id: uuid('hr100000-0000-', 7), room_number: '102', block: 'B', floor: 1, capacity: 6, occupied: 6, room_type: 'dormitory', amenities: ['Fan', 'Cupboard'], status: 'full' },
      { id: uuid('hr100000-0000-', 8), room_number: '201', block: 'B', floor: 2, capacity: 4, occupied: 0, room_type: 'shared', amenities: ['Fan', 'Cupboard', 'Study Table'], status: 'maintenance' },
    ];
    await supabase.from('hostel_rooms').insert(hostelRooms);

    // ── Step 27: Hostel Allocations ──────────────────────
    const hostelAllocations: {
      room_id: string; student_id: string; allocated_date: string;
      mess_opted: boolean; emergency_contact: string; status: string;
    }[] = [];
    let allocIdx = 0;
    for (const room of hostelRooms) {
      if (room.status === 'maintenance') continue;
      for (let i = 0; i < room.occupied && allocIdx < activeStudentIds.length; i++) {
        hostelAllocations.push({
          room_id: room.id,
          student_id: activeStudentIds[allocIdx],
          allocated_date: '2025-04-07',
          mess_opted: Math.random() < 0.8,
          emergency_contact: `+91 98${String(Math.floor(Math.random() * 100000000)).padStart(8, '0')}`,
          status: 'active',
        });
        allocIdx++;
      }
    }
    await supabase.from('hostel_allocations').insert(hostelAllocations);

    // ── Summary ────────────────────────────────────────────
    const totalPaid = feePayments.filter(f => f.status === 'paid').reduce((s, f) => s + f.amount_paid, 0);
    const attPresent = attendance.filter(a => a.status === 'present' || a.status === 'late').length;
    const attRate = Math.round((attPresent / attendance.length) * 100);

    return NextResponse.json({
      success: true,
      summary: {
        users: Object.keys(userIds).length,
        students: students.length,
        active_students: activeStudentIds.length,
        attendance_records: attendance.length,
        attendance_rate: `${attRate}%`,
        assignments: assignments.length,
        grades: grades.length,
        fee_payments: feePayments.length,
        total_collected: `₹${totalPaid.toLocaleString('en-IN')}`,
        announcements: announcements.length,
        teachers: teacherIds.length,
        parents: parentIds.length,
        timetable_periods: timetableRows.length,
        examinations: examinations.length,
        exam_results: examResults.length,
        admissions: admissions.length,
        library_books: libraryBooks.length,
        book_issues: bookIssues.length,
        events: eventsList.length,
        transport_routes: routes.length,
        transport_assignments: transportAssignments.length,
        inventory_items: inventoryItems.length,
        payroll_records: payrollRecords.length,
        messages: messagesList.length,
        hostel_rooms: hostelRooms.length,
        hostel_allocations: hostelAllocations.length,
      },
    });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
