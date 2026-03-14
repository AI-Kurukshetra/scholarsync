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
