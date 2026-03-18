import crypto from 'crypto';

const SRK = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhndXJjb2VubnJ5bnluYXVjbWR5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzI5Nzc3OCwiZXhwIjoyMDg4ODczNzc4fQ.HoCDq2eN_IDxOOKfvZ4kyWCKCnvrXAwBsZQY-FUY7nU';
const BASE = 'https://hgurcoennrynynaucmdy.supabase.co/rest/v1';

const headers = {
  'apikey': SRK,
  'Authorization': `Bearer ${SRK}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=minimal,resolution=merge-duplicates',
};

async function insert(table, data) {
  const res = await fetch(`${BASE}/${table}`, { method: 'POST', headers, body: JSON.stringify(data) });
  if (!res.ok) {
    const text = await res.text();
    console.error(`  FAIL ${table}: ${res.status} ${text}`);
    return false;
  }
  console.log(`  OK ${table}: ${Array.isArray(data) ? data.length : 1} rows`);
  return true;
}

const genuuid = () => crypto.randomUUID();
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
function bell(max) {
  const u1 = Math.random(), u2 = Math.random();
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return Math.round(Math.max(max * 0.2, Math.min(max, max * (0.68 + z * 0.15))));
}

const TEACHERS = [
  '56b41cde-af8c-484e-8e0d-912a59960cc0',
  '53d3c614-0579-4621-a665-bb02db3cb9bd',
  'd87b3d92-3867-4e7e-b2c3-2aaf37b1e0c5',
  'f39f4962-037b-4991-91c2-7177c4fb407f',
];
const CLASS_IDS = Array.from({ length: 6 }, (_, i) => `c1000000-0000-0000-0000-00000000000${i + 1}`);
const SUBJECT_IDS = Array.from({ length: 6 }, (_, i) => `b1000000-0000-0000-0000-00000000000${i + 1}`);
const STUDENT_IDS = Array.from({ length: 60 }, (_, i) => {
  const n = String(i + 1).padStart(12, '0');
  return `d1000000-0000-0000-0000-${n}`;
});

async function seed() {
  console.log('Seeding missing data...\n');

  // 1. Class-Subject mappings (already inserted, skip if exists)
  const classSubjects = [];
  for (const classId of CLASS_IDS) {
    for (const subjectId of SUBJECT_IDS) {
      classSubjects.push({
        id: genuuid(),
        class_id: classId,
        subject_id: subjectId,
        teacher_id: TEACHERS[classSubjects.length % TEACHERS.length],
      });
    }
  }
  // Fetch existing class_subjects
  const csRes = await fetch(`${BASE}/class_subjects?select=id,class_id,subject_id`, { headers });
  const existingCS = await csRes.json();

  let csToUse = existingCS;
  if (existingCS.length === 0) {
    await insert('class_subjects', classSubjects);
    csToUse = classSubjects;
  } else {
    console.log(`  SKIP class_subjects: ${existingCS.length} already exist`);
    csToUse = existingCS;
  }

  // 2. Assignments
  const assignmentTypes = ['Homework', 'Quiz', 'Project'];
  const assignments = [];
  for (let ci = 0; ci < CLASS_IDS.length; ci++) {
    for (let a = 0; a < 3; a++) {
      const subjectIdx = (a + ci) % SUBJECT_IDS.length;
      const csMatch = csToUse.find(
        cs => cs.class_id === CLASS_IDS[ci] && cs.subject_id === SUBJECT_IDS[subjectIdx]
      );
      if (!csMatch) continue;
      const maxScore = [50, 100, 25][a];
      assignments.push({
        id: genuuid(),
        title: `${assignmentTypes[a]} - Unit ${a + 1}`,
        description: `Assessment for unit ${a + 1}`,
        class_subject_id: csMatch.id,
        due_date: `2025-${String(7 + a).padStart(2, '0')}-${String(15 + ci).padStart(2, '0')}`,
        max_score: maxScore,
        created_by: TEACHERS[ci % TEACHERS.length],
      });
    }
  }
  await insert('assignments', assignments);

  // 3. Grades
  const grades = [];
  for (let si = 0; si < STUDENT_IDS.length; si++) {
    const classIdx = Math.floor(si / 10);
    const classAssignments = assignments.filter(a => {
      const cs = csToUse.find(c => c.id === a.class_subject_id);
      return cs && cs.class_id === CLASS_IDS[classIdx];
    });
    for (const assignment of classAssignments) {
      if (Math.random() < 0.1) continue; // 10% miss
      const score = bell(assignment.max_score);
      const pct = score / assignment.max_score;
      grades.push({
        id: genuuid(),
        student_id: STUDENT_IDS[si],
        assignment_id: assignment.id,
        score,
        remarks: pct >= 0.8 ? 'Excellent work' : pct >= 0.6 ? 'Good effort' : pct >= 0.4 ? 'Needs improvement' : 'Requires extra support',
        graded_by: TEACHERS[classIdx % TEACHERS.length],
      });
    }
  }
  await insert('grades', grades);

  // 4. Examinations
  const exams = [];
  for (let ci = 0; ci < CLASS_IDS.length; ci++) {
    for (let e = 0; e < 3; e++) {
      const examName = ['Unit Test 1', 'Mid-Term Exam', 'Unit Test 2'][e];
      exams.push({
        id: genuuid(),
        name: `${examName} - Class ${ci + 5}`,
        class_id: CLASS_IDS[ci],
        subject_id: SUBJECT_IDS[e % SUBJECT_IDS.length],
        date: `2025-${String(6 + e * 2).padStart(2, '0')}-${String(10 + ci).padStart(2, '0')}`,
        start_time: '09:00:00',
        end_time: '11:00:00',
        max_marks: 100,
        room: `Room ${101 + ci}`,
        created_by: TEACHERS[ci % TEACHERS.length],
      });
    }
  }
  await insert('examinations', exams);

  // 5. Exam Results
  const examResults = [];
  for (let si = 0; si < STUDENT_IDS.length; si++) {
    const classIdx = Math.floor(si / 10);
    const classExams = exams.filter(e => e.class_id === CLASS_IDS[classIdx]);
    for (const exam of classExams) {
      const marks = bell(100);
      examResults.push({
        id: genuuid(),
        exam_id: exam.id,
        student_id: STUDENT_IDS[si],
        marks_obtained: marks,
        remarks: marks >= 80 ? 'Distinction' : marks >= 60 ? 'First Division' : marks >= 40 ? 'Second Division' : 'Needs improvement',
        graded_by: TEACHERS[classIdx % TEACHERS.length],
      });
    }
  }
  await insert('exam_results', examResults);

  // 6. Library Books
  const books = [
    { title: 'NCERT Mathematics Class 10', author: 'NCERT', isbn: '978-8174506351', category: 'Textbook', total_copies: 15, available_copies: 12, shelf_location: 'A-1' },
    { title: 'Wings of Fire', author: 'A.P.J. Abdul Kalam', isbn: '978-8173711466', category: 'Biography', total_copies: 5, available_copies: 3, shelf_location: 'B-3' },
    { title: 'The Story of My Experiments with Truth', author: 'Mahatma Gandhi', isbn: '978-8172345136', category: 'Biography', total_copies: 4, available_copies: 2, shelf_location: 'B-4' },
    { title: 'Concise Oxford English Dictionary', author: 'Oxford Press', isbn: '978-0199601080', category: 'Reference', total_copies: 3, available_copies: 3, shelf_location: 'C-1' },
    { title: 'India After Gandhi', author: 'Ramachandra Guha', isbn: '978-0330505642', category: 'History', total_copies: 6, available_copies: 4, shelf_location: 'D-2' },
    { title: 'Malgudi Days', author: 'R.K. Narayan', isbn: '978-0143031161', category: 'Fiction', total_copies: 8, available_copies: 6, shelf_location: 'B-1' },
    { title: 'The Discovery of India', author: 'Jawaharlal Nehru', isbn: '978-0143031031', category: 'History', total_copies: 4, available_copies: 3, shelf_location: 'D-1' },
    { title: 'NCERT Science Class 8', author: 'NCERT', isbn: '978-8174506283', category: 'Textbook', total_copies: 20, available_copies: 18, shelf_location: 'A-2' },
    { title: 'Fundamentals of Physics', author: 'Halliday & Resnick', isbn: '978-1118230718', category: 'Reference', total_copies: 3, available_copies: 1, shelf_location: 'C-2' },
    { title: 'The Jungle Book', author: 'Rudyard Kipling', isbn: '978-0141325293', category: 'Fiction', total_copies: 7, available_copies: 5, shelf_location: 'B-2' },
    { title: 'Premchand Ki Kahaniyaan', author: 'Munshi Premchand', isbn: '978-8170286875', category: 'Fiction', total_copies: 5, available_copies: 4, shelf_location: 'B-5' },
    { title: 'Computer Science with Python', author: 'Sumita Arora', isbn: '978-9352838080', category: 'Textbook', total_copies: 10, available_copies: 8, shelf_location: 'A-3' },
  ].map(b => ({ ...b, id: genuuid() }));
  await insert('library_books', books);

  // 7. Book Issues
  const bookIssues = [];
  for (let i = 0; i < 20; i++) {
    const issueDate = new Date(2025, 5, 1 + i);
    const dueDate = new Date(issueDate); dueDate.setDate(dueDate.getDate() + 14);
    const status = i < 8 ? 'returned' : i < 15 ? 'issued' : 'overdue';
    bookIssues.push({
      id: genuuid(),
      book_id: books[i % books.length].id,
      student_id: STUDENT_IDS[i * 3 % STUDENT_IDS.length],
      issued_by: TEACHERS[i % TEACHERS.length],
      issue_date: issueDate.toISOString().split('T')[0],
      due_date: dueDate.toISOString().split('T')[0],
      return_date: status === 'returned' ? new Date(dueDate.getTime() - 86400000 * 3).toISOString().split('T')[0] : null,
      status,
      fine_amount: status === 'overdue' ? (i - 14) * 5 : 0,
    });
  }
  await insert('book_issues', bookIssues);

  // 8. Transport Routes
  const routes = [
    { name: 'Route A - Sector 14 to School', driver_name: 'Ramesh Kumar', driver_phone: '+91-98765-43210', vehicle_number: 'DL-01-AB-1234', capacity: 40, start_point: 'Sector 14 Bus Stop', end_point: 'ScholarSync Campus', stops: ['Sector 14', 'Sector 21', 'MG Road', 'City Center', 'School Gate'] },
    { name: 'Route B - Nehru Nagar to School', driver_name: 'Suresh Yadav', driver_phone: '+91-98765-43211', vehicle_number: 'DL-01-CD-5678', capacity: 35, start_point: 'Nehru Nagar', end_point: 'ScholarSync Campus', stops: ['Nehru Nagar', 'Gandhi Chowk', 'Railway Station', 'Main Market', 'School Gate'] },
    { name: 'Route C - Civil Lines to School', driver_name: 'Manoj Singh', driver_phone: '+91-98765-43212', vehicle_number: 'DL-01-EF-9012', capacity: 40, start_point: 'Civil Lines', end_point: 'ScholarSync Campus', stops: ['Civil Lines', 'University Road', 'Hospital Chowk', 'Park Avenue', 'School Gate'] },
    { name: 'Route D - Ashok Vihar to School', driver_name: 'Deepak Sharma', driver_phone: '+91-98765-43213', vehicle_number: 'DL-01-GH-3456', capacity: 30, start_point: 'Ashok Vihar', end_point: 'ScholarSync Campus', stops: ['Ashok Vihar', 'Model Town', 'Pitampura', 'Rohini', 'School Gate'] },
  ].map(r => ({ ...r, id: genuuid() }));
  await insert('transport_routes', routes);

  // 9. Transport Assignments (using unique student per route)
  const transportAssignments = [];
  const usedStudents = new Set();
  for (let i = 0; i < 30; i++) {
    const route = routes[i % routes.length];
    let studentIdx = i * 2 % STUDENT_IDS.length;
    while (usedStudents.has(STUDENT_IDS[studentIdx])) studentIdx = (studentIdx + 1) % STUDENT_IDS.length;
    usedStudents.add(STUDENT_IDS[studentIdx]);
    transportAssignments.push({
      id: genuuid(),
      route_id: route.id,
      student_id: STUDENT_IDS[studentIdx],
      pickup_stop: route.stops[i % (route.stops.length - 1)],
      dropoff_stop: route.stops[route.stops.length - 1],
    });
  }
  await insert('transport_assignments', transportAssignments);

  // 10. Hostel Rooms
  const hostelRooms = [];
  for (const block of ['A', 'B']) {
    for (let floor = 1; floor <= 3; floor++) {
      for (let room = 1; room <= 4; room++) {
        const cap = room <= 2 ? 2 : 4;
        hostelRooms.push({
          id: genuuid(),
          room_number: `${block}${floor}0${room}`,
          block,
          floor,
          capacity: cap,
          occupied: Math.min(cap, Math.floor(Math.random() * (cap + 1))),
          room_type: room <= 2 ? 'shared' : 'dormitory',
          amenities: ['bed', 'desk', 'cupboard', ...(room === 1 ? ['AC'] : [])],
          status: hostelRooms.length < 20 ? 'available' : hostelRooms.length < 22 ? 'full' : 'maintenance',
        });
      }
    }
  }
  await insert('hostel_rooms', hostelRooms);

  // 11. Hostel Allocations
  const hostelAllocations = [];
  for (let i = 0; i < 15; i++) {
    hostelAllocations.push({
      id: genuuid(),
      room_id: hostelRooms[i % hostelRooms.length].id,
      student_id: STUDENT_IDS[i + 30],
      allocated_date: '2025-04-15',
      mess_opted: Math.random() > 0.2,
      emergency_contact: `+91-98100-${String(10000 + i * 111).slice(0, 5)}`,
      status: 'active',
    });
  }
  await insert('hostel_allocations', hostelAllocations);

  console.log('\nDone!');
}

seed().catch(console.error);
