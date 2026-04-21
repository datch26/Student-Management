// ============================================
// server.js - Backend for Student Management
// ============================================

const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, "students.json");

// ---- Middleware ----
app.use(express.json()); // Parse JSON request bodies
app.use(express.static(path.join(__dirname, "public"))); // Serve frontend files

// ---- Helper: Read students from JSON file ----
function readStudents() {
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([]));
  }
  const data = fs.readFileSync(DATA_FILE, "utf-8");
  return JSON.parse(data);
}

// ---- Helper: Write students to JSON file ----
function writeStudents(students) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(students, null, 2));
}

// ============================================
// ROUTES
// ============================================

// GET /students → Fetch all students
app.get("/students", (req, res) => {
  const students = readStudents();
  res.json(students);
});

// POST /students → Add a new student
app.post("/students", (req, res) => {
  const { id, name, course } = req.body;

  // Basic validation
  if (!id || !name || !course) {
    return res.status(400).json({ error: "All fields (id, name, course) are required." });
  }

  const students = readStudents();

  // Check for duplicate ID
  const exists = students.find((s) => s.id === id);
  if (exists) {
    return res.status(409).json({ error: "Student ID already exists." });
  }

  const newStudent = { id, name, course };
  students.push(newStudent);
  writeStudents(students);

  res.status(201).json({ message: "Student added successfully.", student: newStudent });
});

// DELETE /students/:id → Delete a student by ID
app.delete("/students/:id", (req, res) => {
  const { id } = req.params;
  let students = readStudents();

  const index = students.findIndex((s) => s.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "Student not found." });
  }

  students.splice(index, 1);
  writeStudents(students);

  res.json({ message: "Student deleted successfully." });
});

// ---- Start Server ----
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
