const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// Fallback JSON file path
const FALLBACK_DB_PATH = path.join(__dirname, "fallback_db.json");

// Define fallback default data structure
const DEFAULT_FALLBACK_DATA = {
  site_settings: {
    general: {
      phone: "1800-000-000",
      email: "care@priyahospital.in",
      address: "123 Hospital Road, Sector 22, India — 110022",
      opd_hours: "Mon – Sat, 9:00 AM – 8:00 PM · Emergency 24/7",
      emergency_phone: "1800-000-000"
    },
    hero_slides: [
      {
        eyebrow: "Round-the-clock care",
        title: "Compassionate care, 24 hours a day.",
        body: "From routine check-ups to critical emergencies — our doors, and our doctors, never close.",
        ctaLabel: "Book an appointment",
        ctaTo: "/booking"
      },
      {
        eyebrow: "Meet the specialists",
        title: "Expert doctors across 15+ specialities.",
        body: "Board-certified consultants in cardiology, orthopedics, gynecology, pediatrics and more.",
        ctaLabel: "Meet our doctors",
        ctaTo: "/doctors"
      },
      {
        eyebrow: "Precision diagnostics",
        title: "Modern diagnostics, faster answers.",
        body: "In-house MRI, CT, digital X-ray and pathology — results you can trust, when you need them.",
        ctaLabel: "See our services",
        ctaTo: "/services"
      }
    ],
    home_content: {
      about_title: "A hospital built completely around you.",
      about_body: "We combine advanced medical technology with a genuinely human approach — because getting better should feel supported, not overwhelming."
    },
    about_content: {
      title: "Two decades of caring for our community.",
      body: "Priya Multispeciality Hospital was founded on a simple belief — that world-class healthcare should feel personal. Today we serve tens of thousands of families every year across 15+ specialities.",
      story_title: "People before protocols.",
      story_body_1: "We invest in our people first. Every doctor, nurse and technician on our team is trained not only in the latest medical protocols, but in listening — because we believe the best diagnosis starts with a real conversation.",
      story_body_2: "From our operation theatres to our reception desk, everything we do is designed to make a difficult day feel a little easier for our patients and their families."
    }
  },
  services: [
    { id: 1, name: "Cardiology", description: "Preventive cardiology, angiography, angioplasty, and heart failure care.", icon: "Heart", color: "oklch(0.65 0.20 25)" },
    { id: 2, name: "Orthopedics", description: "Joint replacement, arthroscopy, spine care, and sports rehabilitation.", icon: "Bone", color: "oklch(0.55 0.14 240)" },
    { id: 3, name: "Pediatrics", description: "Well-baby check-ups, immunizations, neonatal care, and child specialists.", icon: "Baby", color: "oklch(0.62 0.17 140)" },
    { id: 4, name: "General Medicine", description: "Diabetes, hypertension, thyroid, and everyday adult healthcare.", icon: "Stethoscope", color: "oklch(0.55 0.16 262)" },
    { id: 5, name: "Neurology", description: "Stroke care, epilepsy, headache clinic, and neurological rehabilitation.", icon: "Brain", color: "oklch(0.55 0.18 300)" },
    { id: 6, name: "Ophthalmology", description: "Cataract surgery, LASIK, glaucoma, and comprehensive retina care.", icon: "Eye", color: "oklch(0.58 0.16 220)" }
  ],
  doctors: [
    { id: 1, name: "Dr. Anjali Sharma", specialty: "Cardiology", qualification: "MD, DM (Cardiology), FSCAI", experience: "18 yrs", color: "oklch(0.65 0.20 25)", rating: 5 },
    { id: 2, name: "Dr. Ramesh Iyer", specialty: "Orthopedics", qualification: "MS (Ortho), Fellowship in Joint Replacement", experience: "22 yrs", color: "oklch(0.55 0.14 240)", rating: 5 },
    { id: 3, name: "Dr. Priya Nair", specialty: "Pediatrics", qualification: "MD (Pediatrics), Fellowship Neonatology", experience: "14 yrs", color: "oklch(0.62 0.17 140)", rating: 5 },
    { id: 4, name: "Dr. Vikram Desai", specialty: "Neurology", qualification: "MD, DM (Neurology)", experience: "16 yrs", color: "oklch(0.55 0.18 300)", rating: 5 }
  ],
  testimonials: [
    { id: 1, name: "Kavitha R.", department: "Cardiology", text: "The doctors here truly listen. My angioplasty went smoothly and recovery was faster than expected.", rating: 5 },
    { id: 2, name: "Arjun M.", department: "Orthopedics", text: "Best knee replacement experience. The team was professional, caring and highly skilled.", rating: 5 }
  ],
  milestones: [
    { id: 1, year: "2003", title: "Founded", description: "Started as a small 3-doctor clinic in Sector 22.", sort_order: 0 },
    { id: 2, year: "2009", title: "Expanded", description: "Grew to 50 beds with dedicated OT and emergency unit.", sort_order: 1 },
    { id: 3, year: "2015", title: "NABH Accredited", description: "Achieved national quality certification across all departments.", sort_order: 2 }
  ],
  appointments: [],
  contact_messages: []
};

// Help to read / write fallback JSON
function readFallback() {
  if (!fs.existsSync(FALLBACK_DB_PATH)) {
    fs.writeFileSync(FALLBACK_DB_PATH, JSON.stringify(DEFAULT_FALLBACK_DATA, null, 2), "utf8");
    return DEFAULT_FALLBACK_DATA;
  }
  try {
    const raw = fs.readFileSync(FALLBACK_DB_PATH, "utf8");
    return JSON.parse(raw);
  } catch (err) {
    return DEFAULT_FALLBACK_DATA;
  }
}

function writeFallback(data) {
  fs.writeFileSync(FALLBACK_DB_PATH, JSON.stringify(data, null, 2), "utf8");
}

// MySQL connection pool holder
let pool = null;
let useFallback = false;

async function checkDbConnection() {
  const dbConfig = {
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "priya_hospital",
    port: Number(process.env.DB_PORT || 3306),
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  };

  try {
    pool = mysql.createPool(dbConfig);
    // test connection
    const conn = await pool.getConnection();
    console.log("🚀 MySQL Database connected successfully!");
    conn.release();
    useFallback = false;
  } catch (error) {
    console.warn("⚠️ MySQL connection failed! Running server in FALLBACK Mode (using local fallback_db.json).");
    console.warn("Error message:", error.message);
    useFallback = true;
  }
}

checkDbConnection();

// ── API ROUTES ──

// 1. SITE SETTINGS
app.get("/api/settings/:key", async (req, res) => {
  const { key } = req.params;
  if (useFallback) {
    const data = readFallback();
    const val = data.site_settings[key] || {};
    return res.json(val);
  }
  try {
    const [rows] = await pool.query("SELECT s_value FROM site_settings WHERE s_key = ?", [key]);
    if (rows.length === 0) return res.json({});
    return res.json(rows[0].s_value);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/settings/:key", async (req, res) => {
  const { key } = req.params;
  const val = req.body;
  if (useFallback) {
    const data = readFallback();
    data.site_settings[key] = val;
    writeFallback(data);
    return res.json({ success: true });
  }
  try {
    await pool.query(
      "INSERT INTO site_settings (s_key, s_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE s_value = ?, updated_at = CURRENT_TIMESTAMP",
      [key, JSON.stringify(val), JSON.stringify(val)]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. SERVICES
app.get("/api/services", async (req, res) => {
  if (useFallback) {
    return res.json(readFallback().services);
  }
  try {
    const [rows] = await pool.query("SELECT * FROM services ORDER BY name ASC");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/services", async (req, res) => {
  const { id, name, description, icon, color } = req.body;
  if (useFallback) {
    const data = readFallback();
    if (id) {
      const idx = data.services.findIndex(x => x.id === Number(id));
      if (idx !== -1) data.services[idx] = { id: Number(id), name, description, icon, color };
    } else {
      const newId = data.services.length > 0 ? Math.max(...data.services.map(x => x.id)) + 1 : 1;
      data.services.push({ id: newId, name, description, icon, color });
    }
    writeFallback(data);
    return res.json({ success: true });
  }
  try {
    if (id) {
      await pool.query(
        "UPDATE services SET name = ?, description = ?, icon = ?, color = ? WHERE id = ?",
        [name, description, icon, color, id]
      );
    } else {
      await pool.query(
        "INSERT INTO services (name, description, icon, color) VALUES (?, ?, ?, ?)",
        [name, description, icon, color]
      );
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/services/:id", async (req, res) => {
  const { id } = req.params;
  if (useFallback) {
    const data = readFallback();
    data.services = data.services.filter(x => x.id !== Number(id));
    writeFallback(data);
    return res.json({ success: true });
  }
  try {
    await pool.query("DELETE FROM services WHERE id = ?", [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. DOCTORS
app.get("/api/doctors", async (req, res) => {
  if (useFallback) {
    return res.json(readFallback().doctors);
  }
  try {
    const [rows] = await pool.query("SELECT * FROM doctors ORDER BY name ASC");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/doctors", async (req, res) => {
  const { id, name, specialty, qualification, experience, color, rating } = req.body;
  if (useFallback) {
    const data = readFallback();
    if (id) {
      const idx = data.doctors.findIndex(x => x.id === Number(id));
      if (idx !== -1) data.doctors[idx] = { id: Number(id), name, specialty, qualification, experience, color, rating: Number(rating || 5) };
    } else {
      const newId = data.doctors.length > 0 ? Math.max(...data.doctors.map(x => x.id)) + 1 : 1;
      data.doctors.push({ id: newId, name, specialty, qualification, experience, color, rating: Number(rating || 5) });
    }
    writeFallback(data);
    return res.json({ success: true });
  }
  try {
    if (id) {
      await pool.query(
        "UPDATE doctors SET name = ?, specialty = ?, qualification = ?, experience = ?, color = ?, rating = ? WHERE id = ?",
        [name, specialty, qualification, experience, color, rating || 5.0, id]
      );
    } else {
      await pool.query(
        "INSERT INTO doctors (name, specialty, qualification, experience, color, rating) VALUES (?, ?, ?, ?, ?, ?)",
        [name, specialty, qualification, experience, color, rating || 5.0]
      );
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/doctors/:id", async (req, res) => {
  const { id } = req.params;
  if (useFallback) {
    const data = readFallback();
    data.doctors = data.doctors.filter(x => x.id !== Number(id));
    writeFallback(data);
    return res.json({ success: true });
  }
  try {
    await pool.query("DELETE FROM doctors WHERE id = ?", [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. TESTIMONIALS
app.get("/api/testimonials", async (req, res) => {
  if (useFallback) {
    return res.json(readFallback().testimonials);
  }
  try {
    const [rows] = await pool.query("SELECT * FROM testimonials ORDER BY created_at DESC");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/testimonials", async (req, res) => {
  const { id, name, department, text, rating } = req.body;
  if (useFallback) {
    const data = readFallback();
    if (id) {
      const idx = data.testimonials.findIndex(x => x.id === Number(id));
      if (idx !== -1) data.testimonials[idx] = { id: Number(id), name, department, text, rating: Number(rating || 5) };
    } else {
      const newId = data.testimonials.length > 0 ? Math.max(...data.testimonials.map(x => x.id)) + 1 : 1;
      data.testimonials.push({ id: newId, name, department, text, rating: Number(rating || 5) });
    }
    writeFallback(data);
    return res.json({ success: true });
  }
  try {
    if (id) {
      await pool.query(
        "UPDATE testimonials SET name = ?, department = ?, text = ?, rating = ? WHERE id = ?",
        [name, department, text, rating || 5, id]
      );
    } else {
      await pool.query(
        "INSERT INTO testimonials (name, department, text, rating) VALUES (?, ?, ?, ?)",
        [name, department, text, rating || 5]
      );
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/testimonials/:id", async (req, res) => {
  const { id } = req.params;
  if (useFallback) {
    const data = readFallback();
    data.testimonials = data.testimonials.filter(x => x.id !== Number(id));
    writeFallback(data);
    return res.json({ success: true });
  }
  try {
    await pool.query("DELETE FROM testimonials WHERE id = ?", [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. MILESTONES (TIMELINE)
app.get("/api/milestones", async (req, res) => {
  if (useFallback) {
    return res.json(readFallback().milestones);
  }
  try {
    const [rows] = await pool.query("SELECT * FROM milestones ORDER BY sort_order ASC, year ASC");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/milestones", async (req, res) => {
  const { id, year, title, description, sort_order } = req.body;
  if (useFallback) {
    const data = readFallback();
    if (id) {
      const idx = data.milestones.findIndex(x => x.id === Number(id));
      if (idx !== -1) data.milestones[idx] = { id: Number(id), year, title, description, sort_order: Number(sort_order || 0) };
    } else {
      const newId = data.milestones.length > 0 ? Math.max(...data.milestones.map(x => x.id)) + 1 : 1;
      data.milestones.push({ id: newId, year, title, description, sort_order: Number(sort_order || 0) });
    }
    writeFallback(data);
    return res.json({ success: true });
  }
  try {
    if (id) {
      await pool.query(
        "UPDATE milestones SET year = ?, title = ?, description = ?, sort_order = ? WHERE id = ?",
        [year, title, description, sort_order || 0, id]
      );
    } else {
      await pool.query(
        "INSERT INTO milestones (year, title, description, sort_order) VALUES (?, ?, ?, ?)",
        [year, title, description, sort_order || 0]
      );
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/milestones/:id", async (req, res) => {
  const { id } = req.params;
  if (useFallback) {
    const data = readFallback();
    data.milestones = data.milestones.filter(x => x.id !== Number(id));
    writeFallback(data);
    return res.json({ success: true });
  }
  try {
    await pool.query("DELETE FROM milestones WHERE id = ?", [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 6. APPOINTMENTS
app.get("/api/appointments", async (req, res) => {
  if (useFallback) {
    return res.json(readFallback().appointments);
  }
  try {
    const [rows] = await pool.query("SELECT * FROM appointments ORDER BY created_at DESC");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/appointments", async (req, res) => {
  const { name, phone, email, department, doctor, date, time, message } = req.body;
  if (useFallback) {
    const data = readFallback();
    const newId = data.appointments.length > 0 ? Math.max(...data.appointments.map(x => x.id)) + 1 : 1;
    data.appointments.unshift({
      id: newId,
      name,
      phone,
      email,
      department,
      doctor: doctor || "",
      date,
      time,
      message: message || "",
      status: "pending",
      created_at: new Date().toISOString()
    });
    writeFallback(data);
    return res.json({ success: true });
  }
  try {
    await pool.query(
      "INSERT INTO appointments (name, phone, email, department, doctor, date, time, message, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')",
      [name, phone, email, department, doctor || null, date, time, message || null]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/appointments/:id", async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // pending, confirmed, done
  if (useFallback) {
    const data = readFallback();
    const idx = data.appointments.findIndex(x => x.id === Number(id));
    if (idx !== -1) data.appointments[idx].status = status;
    writeFallback(data);
    return res.json({ success: true });
  }
  try {
    await pool.query("UPDATE appointments SET status = ? WHERE id = ?", [status, id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/appointments/:id", async (req, res) => {
  const { id } = req.params;
  if (useFallback) {
    const data = readFallback();
    data.appointments = data.appointments.filter(x => x.id !== Number(id));
    writeFallback(data);
    return res.json({ success: true });
  }
  try {
    await pool.query("DELETE FROM appointments WHERE id = ?", [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 7. CONTACT MESSAGES (ENQUIRIES)
app.get("/api/contact_messages", async (req, res) => {
  if (useFallback) {
    return res.json(readFallback().contact_messages);
  }
  try {
    const [rows] = await pool.query("SELECT * FROM contact_messages ORDER BY created_at DESC");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/contact_messages", async (req, res) => {
  const { name, phone, email, subject, message } = req.body;
  if (useFallback) {
    const data = readFallback();
    const newId = data.contact_messages.length > 0 ? Math.max(...data.contact_messages.map(x => x.id)) + 1 : 1;
    data.contact_messages.unshift({
      id: newId,
      name,
      phone,
      email,
      subject,
      message,
      is_read: false,
      created_at: new Date().toISOString()
    });
    writeFallback(data);
    return res.json({ success: true });
  }
  try {
    await pool.query(
      "INSERT INTO contact_messages (name, phone, email, subject, message, is_read) VALUES (?, ?, ?, ?, ?, FALSE)",
      [name, phone, email, subject, message]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/contact_messages/:id", async (req, res) => {
  const { id } = req.params;
  const { is_read } = req.body;
  if (useFallback) {
    const data = readFallback();
    const idx = data.contact_messages.findIndex(x => x.id === Number(id));
    if (idx !== -1) data.contact_messages[idx].is_read = is_read;
    writeFallback(data);
    return res.json({ success: true });
  }
  try {
    await pool.query("UPDATE contact_messages SET is_read = ? WHERE id = ?", [is_read, id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/contact_messages/:id", async (req, res) => {
  const { id } = req.params;
  if (useFallback) {
    const data = readFallback();
    data.contact_messages = data.contact_messages.filter(x => x.id !== Number(id));
    writeFallback(data);
    return res.json({ success: true });
  }
  try {
    await pool.query("DELETE FROM contact_messages WHERE id = ?", [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── 8. ADMIN AUTH ──
// Credentials stored in fallback_db or .env (ADMIN_EMAIL / ADMIN_PASS)
const DEFAULT_ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@priyahospital.in";
const DEFAULT_ADMIN_PASS  = process.env.ADMIN_PASS  || "priya123";

app.post("/api/admin/login", (req, res) => {
  const { email, password } = req.body;
  // Read from fallback for overriding credentials at runtime
  let adminEmail = DEFAULT_ADMIN_EMAIL;
  let adminPass  = DEFAULT_ADMIN_PASS;
  if (fs.existsSync(FALLBACK_DB_PATH)) {
    try {
      const raw = JSON.parse(fs.readFileSync(FALLBACK_DB_PATH, "utf8"));
      if (raw.admin_credentials) {
        adminEmail = raw.admin_credentials.email || adminEmail;
        adminPass  = raw.admin_credentials.password || adminPass;
      }
    } catch (_) {}
  }
  if (email === adminEmail && password === adminPass) {
    return res.json({ success: true, message: "Logged in." });
  }
  return res.status(401).json({ success: false, message: "Invalid credentials." });
});

app.post("/api/admin/change-password", (req, res) => {
  const { currentPassword, newEmail, newPassword } = req.body;
  let adminEmail = DEFAULT_ADMIN_EMAIL;
  let adminPass  = DEFAULT_ADMIN_PASS;
  const data = readFallback();
  if (data.admin_credentials) {
    adminEmail = data.admin_credentials.email || adminEmail;
    adminPass  = data.admin_credentials.password || adminPass;
  }
  if (currentPassword !== adminPass) {
    return res.status(401).json({ success: false, message: "Current password incorrect." });
  }
  data.admin_credentials = {
    email: newEmail || adminEmail,
    password: newPassword || adminPass
  };
  writeFallback(data);
  return res.json({ success: true, message: "Credentials updated." });
});

// Start Express App
app.listen(PORT, () => {
  console.log(`📡 Express server is listening on port ${PORT}`);
  console.log(`   Admin: ${DEFAULT_ADMIN_EMAIL} / ${DEFAULT_ADMIN_PASS}`);
  if (useFallback) {
    console.log("   Mode: FALLBACK (fallback_db.json) — MySQL NOT connected");
  } else {
    console.log("   Mode: MYSQL DATABASE");
  }
});
