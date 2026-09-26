-- ─────────────────────────────────────────────────────────────
-- PRIYA MULTISPECIALITY HOSPITAL — SUPABASE POSTGRESQL SCHEMA
-- ─────────────────────────────────────────────────────────────
-- How to use:
-- 1. Go to your Supabase Dashboard (https://supabase.com).
-- 2. Open your project and click on "SQL Editor" in the left sidebar.
-- 3. Click "New Query", paste the entire contents of this file, and click "Run".
-- ─────────────────────────────────────────────────────────────

-- 1. Services / Clinical Specialities table
CREATE TABLE IF NOT EXISTS services (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    icon VARCHAR(100) NOT NULL,
    color VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Doctors / Consultants table
CREATE TABLE IF NOT EXISTS doctors (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    specialty VARCHAR(255) NOT NULL,
    qualification VARCHAR(255) NOT NULL,
    experience VARCHAR(100) NOT NULL,
    color VARCHAR(100) NOT NULL,
    rating NUMERIC(3, 2) DEFAULT 5.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Patient Testimonials / Reviews table
CREATE TABLE IF NOT EXISTS testimonials (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    department VARCHAR(255) NOT NULL,
    text TEXT NOT NULL,
    rating INTEGER DEFAULT 5,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. History Milestones (Timeline) table
CREATE TABLE IF NOT EXISTS milestones (
    id SERIAL PRIMARY KEY,
    year VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Appointments table
CREATE TABLE IF NOT EXISTS appointments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    department VARCHAR(255) NOT NULL,
    doctor VARCHAR(255) DEFAULT '',
    date VARCHAR(100) NOT NULL,
    time VARCHAR(100) NOT NULL,
    message TEXT DEFAULT '',
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Contact Messages table
CREATE TABLE IF NOT EXISTS contact_messages (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Site Settings table for A-Z Editable Content
CREATE TABLE IF NOT EXISTS site_settings (
    s_key VARCHAR(255) PRIMARY KEY,
    s_value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Brand New Patient Portal Users table
CREATE TABLE IF NOT EXISTS hospital_users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    login_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ─────────────────────────────────────────────────────────────
-- SEED DATA SETUP (PREFILL BEAUTIFUL CONTENT ON FIRST RUN)
-- ─────────────────────────────────────────────────────────────

-- Delete previous values to start fresh
DELETE FROM services;
DELETE FROM doctors;
DELETE FROM testimonials;
DELETE FROM milestones;
DELETE FROM site_settings;
DELETE FROM hospital_users;

-- Fill Services
INSERT INTO services (name, description, icon, color) VALUES
('Cardiology', 'Preventive cardiology, angiography, angioplasty, and heart failure care.', 'Heart', 'oklch(0.65 0.20 25)'),
('Orthopedics', 'Joint replacement, arthroscopy, spine care, and sports rehabilitation.', 'Bone', 'oklch(0.55 0.14 240)'),
('Pediatrics', 'Well-baby check-ups, immunizations, neonatal care, and child specialists.', 'Baby', 'oklch(0.62 0.17 140)'),
('General Medicine', 'Diabetes, hypertension, thyroid, and everyday adult healthcare.', 'Stethoscope', 'oklch(0.55 0.16 262)'),
('Neurology', 'Stroke care, epilepsy, headache clinic, and neurological rehabilitation.', 'Brain', 'oklch(0.55 0.18 300)'),
('Ophthalmology', 'Cataract surgery, LASIK, glaucoma, and comprehensive retina care.', 'Eye', 'oklch(0.58 0.16 220)');

-- Fill Doctors
INSERT INTO doctors (name, specialty, qualification, experience, color, rating) VALUES
('Dr. Anjali Sharma', 'Cardiology', 'MD, DM (Cardiology), FSCAI', '18 yrs', 'oklch(0.65 0.20 25)', 5.00),
('Dr. Ramesh Iyer', 'Orthopedics', 'MS (Ortho), Fellowship in Joint Replacement', '22 yrs', 'oklch(0.55 0.14 240)', 5.00),
('Dr. Priya Nair', 'Pediatrics', 'MD (Pediatrics), Fellowship Neonatology', '14 yrs', 'oklch(0.62 0.17 140)', 5.00),
('Dr. Vikram Desai', 'Neurology', 'MD, DM (Neurology)', '16 yrs', 'oklch(0.55 0.18 300)', 4.80);

-- Fill Testimonials
INSERT INTO testimonials (name, department, text, rating) VALUES
('Kavitha R.', 'Cardiology', 'The doctors here truly listen. My angioplasty went smoothly and recovery was faster than expected.', 5),
('Arjun M.', 'Orthopedics', 'Best knee replacement experience. The team was professional, caring and highly skilled.', 5),
('Sunita P.', 'Pediatrics', 'Dr. Priya Nair is wonderful with children. My daughter felt at ease throughout.', 5);

-- Fill History Milestone Timeline
INSERT INTO milestones (year, title, description, sort_order) VALUES
('2003', 'Founded', 'Started as a small 3-doctor clinic in Deesa.', 0),
('2009', 'Expanded', 'Grew to 50 beds with dedicated OT and emergency unit.', 1),
('2015', 'NABH Accredited', 'Achieved national quality certification across all departments.', 2);

-- Fill Site Settings
INSERT INTO site_settings (s_key, s_value) VALUES
('general', '{"phone":"1800-000-000","email":"care@priyahospital.in","address":"Priya Multispeciality Hospital, Deesa, India — 385535","opd_hours":"Mon – Sat, 9:00 AM – 8:00 PM · Emergency 24/7","emergency_phone":"1800-000-000"}'),
('home_content', '{"about_title":"A hospital built completely around you.","about_body":"We combine advanced medical technology with a genuinely human approach — because getting better should feel supported, not overwhelming."}'),
('about_content', '{"title":"Two decades of caring for our community.","body":"Priya Multispeciality Hospital was founded on a simple belief — that world-class healthcare should feel personal. Today we serve tens of thousands of families every year across 15+ specialities.","story_title":"People before protocols.","story_body_1":"We invest in our people first. Every doctor, nurse and technician on our team is trained not only in the latest medical protocols, but in listening — because we believe the best diagnosis starts with a real conversation.","story_body_2":"From our operation theatres to our reception desk, everything we do is designed to make a difficult day feel a little easier for our patients and their families."}'),
('hero_slides', '[{"eyebrow":"Round-the-clock care","title":"Compassionate care, 24 hours a day.","body":"From routine check-ups to critical emergencies — our doors, and our doctors, never close.","ctaLabel":"Book an appointment","ctaTo":"/booking"},{"eyebrow":"Meet the specialists","title":"Expert doctors across 15+ specialities.","body":"Board-certified consultants in cardiology, orthopedics, gynecology, pediatrics and more.","ctaLabel":"Meet our doctors","ctaTo":"/doctors"},{"eyebrow":"Precision diagnostics","title":"Modern diagnostics, faster answers.","body":"In-house MRI, CT, digital X-ray and pathology — results you can trust, when you need them.","ctaLabel":"See our services","ctaTo":"/services"}]'),
('admin_credentials', '{"email":"admin@priyahospital.in","password":"priya123"}');



