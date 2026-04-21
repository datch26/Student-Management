// ============================================
// script.js - Frontend Logic
// Communicates with Express REST API
// ============================================

const API = "http://localhost:3000/students";

// ---- Grab DOM elements ----
const studentBody  = document.getElementById("studentBody");
const countBadge   = document.getElementById("countBadge");
const loader       = document.getElementById("loader");
const tableWrapper = document.getElementById("tableWrapper");
const emptyState   = document.getElementById("emptyState");
const toast        = document.getElementById("toast");
const addBtn       = document.getElementById("addBtn");

// ============================================
// Show a temporary toast message
// type: 'success' | 'error'
// ============================================
function showToast(message, type = "success") {
  toast.textContent = message;
  toast.className = `toast ${type}`;
  // Auto-hide after 3 seconds
  setTimeout(() => { toast.className = "toast hidden"; }, 3000);
}

// ============================================
// Fetch all students from GET /students
// and render them in the table
// ============================================
async function loadStudents() {
  // Show loader, hide table & empty state
  loader.style.display = "flex";
  tableWrapper.style.display = "none";
  emptyState.style.display = "none";

  try {
    const res = await fetch(API);
    const students = await res.json();

    // Update count badge
    countBadge.textContent = `${students.length} student${students.length !== 1 ? "s" : ""}`;

    // Clear old rows
    studentBody.innerHTML = "";

    if (students.length === 0) {
      // Show empty state if no students
      loader.style.display = "none";
      emptyState.style.display = "block";
      return;
    }

    // Build table rows
    students.forEach((student, index) => {
      const tr = document.createElement("tr");
      tr.className = "row-animate";
      tr.style.animationDelay = `${index * 0.04}s`;
      tr.innerHTML = `
        <td>${index + 1}</td>
        <td><span class="id-pill">${escapeHtml(student.id)}</span></td>
        <td class="name-cell">${escapeHtml(student.name)}</td>
        <td><span class="course-tag">${escapeHtml(student.course)}</span></td>
        <td>
          <button class="delete-btn" onclick="deleteStudent('${escapeHtml(student.id)}')">
            Delete
          </button>
        </td>
      `;
      studentBody.appendChild(tr);
    });

    // Show table
    loader.style.display = "none";
    tableWrapper.style.display = "block";

  } catch (err) {
    // Handle network/server error
    loader.style.display = "none";
    emptyState.style.display = "block";
    emptyState.querySelector("p").textContent = "⚠️ Could not connect to server.";
    console.error("Error loading students:", err);
  }
}

// ============================================
// Add a student via POST /students
// ============================================
async function addStudent() {
  const id     = document.getElementById("studentId").value.trim();
  const name   = document.getElementById("studentName").value.trim();
  const course = document.getElementById("studentCourse").value.trim();

  // Client-side validation
  if (!id || !name || !course) {
    showToast("⚠️ Please fill in all three fields.", "error");
    return;
  }

  // Disable button while request is in flight
  addBtn.disabled = true;
  addBtn.querySelector("span").textContent = "Adding...";

  try {
    const res = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, name, course }),
    });

    const data = await res.json();

    if (!res.ok) {
      // Server returned an error (e.g., duplicate ID)
      showToast(`❌ ${data.error}`, "error");
    } else {
      // Success — clear fields and refresh table
      showToast(`✅ ${data.student.name} added successfully!`, "success");
      document.getElementById("studentId").value = "";
      document.getElementById("studentName").value = "";
      document.getElementById("studentCourse").value = "";
      loadStudents(); // Refresh list
    }
  } catch (err) {
    showToast("❌ Server error. Is the backend running?", "error");
    console.error("Error adding student:", err);
  } finally {
    // Re-enable button
    addBtn.disabled = false;
    addBtn.querySelector("span").textContent = "Add Student";
  }
}

// ============================================
// Delete a student via DELETE /students/:id
// ============================================
async function deleteStudent(id) {
  if (!confirm(`Delete student "${id}"? This cannot be undone.`)) return;

  try {
    const res = await fetch(`${API}/${encodeURIComponent(id)}`, {
      method: "DELETE",
    });

    const data = await res.json();

    if (!res.ok) {
      showToast(`❌ ${data.error}`, "error");
    } else {
      showToast(`🗑️ Student "${id}" deleted.`, "success");
      loadStudents(); // Refresh list
    }
  } catch (err) {
    showToast("❌ Server error. Is the backend running?", "error");
    console.error("Error deleting student:", err);
  }
}

// ============================================
// Utility: Escape HTML to prevent XSS
// ============================================
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ============================================
// Allow pressing Enter in any input to submit
// ============================================
document.querySelectorAll("input").forEach((input) => {
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") addStudent();
  });
});

// ---- Load students on page load ----
loadStudents();
