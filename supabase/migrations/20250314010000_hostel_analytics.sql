-- Hostel Rooms
CREATE TABLE IF NOT EXISTS hostel_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_number TEXT NOT NULL,
  block TEXT NOT NULL,
  floor INTEGER NOT NULL DEFAULT 0,
  capacity INTEGER NOT NULL DEFAULT 4,
  occupied INTEGER NOT NULL DEFAULT 0,
  room_type TEXT NOT NULL DEFAULT 'shared' CHECK (room_type IN ('single', 'shared', 'dormitory')),
  amenities TEXT[],
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'full', 'maintenance')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Hostel Allocations
CREATE TABLE IF NOT EXISTS hostel_allocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES hostel_rooms(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  allocated_date DATE NOT NULL DEFAULT CURRENT_DATE,
  vacated_date DATE,
  mess_opted BOOLEAN NOT NULL DEFAULT true,
  emergency_contact TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'vacated')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(room_id, student_id)
);

-- RLS
ALTER TABLE hostel_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE hostel_allocations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Hostel rooms viewable by authenticated" ON hostel_rooms
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage hostel rooms" ON hostel_rooms
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Hostel allocations viewable by authenticated" ON hostel_allocations
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage hostel allocations" ON hostel_allocations
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
