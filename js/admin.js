/**
 * ==========================================================================
 * TAMIL NADU STUDENT LAPTOP SCHEME - REPRESENTATION PORTAL
 * Admin Dashboard & Management Logic
 * ==========================================================================
 */

let allAdminStudents = [];
let filteredAdminStudents = [];
let currentAdminUser = null;
let activeStudentKey = null;
let activeStudentRegId = null;

document.addEventListener("DOMContentLoaded", function() {
  setupAuthListener();
  setupAdminEventListeners();
});

/**
 * Monitor Authentication State
 */
function setupAuthListener() {
  PortalDB.onAdminAuthStateChanged(user => {
    currentAdminUser = user;
    const loginSection = document.getElementById("adminLoginSection");
    const dashboardSection = document.getElementById("adminDashboardSection");
    const adminUserBadge = document.getElementById("adminUserBadge");

    if (user) {
      if (loginSection) loginSection.classList.add("d-none");
      if (dashboardSection) dashboardSection.classList.remove("d-none");
      if (adminUserBadge) {
        adminUserBadge.textContent = user.email || "Admin";
        adminUserBadge.classList.remove("d-none");
      }
      loadAdminDashboardData();
    } else {
      if (loginSection) loginSection.classList.remove("d-none");
      if (dashboardSection) dashboardSection.classList.add("d-none");
      if (adminUserBadge) adminUserBadge.classList.add("d-none");
    }
  });
}

function setupAdminEventListeners() {
  // Login Form
  const loginForm = document.getElementById("adminLoginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", handleAdminLogin);
  }

  // Logout Buttons
  const logoutBtns = document.querySelectorAll(".btn-admin-logout");
  logoutBtns.forEach(btn => {
    btn.addEventListener("click", handleAdminLogout);
  });

  // Search & Filters
  const searchInput = document.getElementById("adminSearchInput");
  const statusFilter = document.getElementById("adminFilterStatus");
  const districtFilter = document.getElementById("adminFilterDistrict");
  const yearFilter = document.getElementById("adminFilterYear");

  if (searchInput) searchInput.addEventListener("input", applyAdminFilters);
  if (statusFilter) statusFilter.addEventListener("change", applyAdminFilters);
  if (districtFilter) districtFilter.addEventListener("change", applyAdminFilters);
  if (yearFilter) yearFilter.addEventListener("change", applyAdminFilters);

  // Edit / Status Save
  const saveBtn = document.getElementById("btnSaveStudentChanges");
  if (saveBtn) {
    saveBtn.addEventListener("click", handleSaveStudentChanges);
  }

  // Delete Confirmation
  const confirmDeleteBtn = document.getElementById("btnConfirmDeleteStudent");
  if (confirmDeleteBtn) {
    confirmDeleteBtn.addEventListener("click", handleConfirmDeleteStudent);
  }

  // Export Buttons
  const btnExportPublicExcel = document.getElementById("btnAdminExportPublicExcel");
  const btnExportPrivateExcel = document.getElementById("btnAdminExportPrivateExcel");
  const btnExportPublicPDF = document.getElementById("btnAdminExportPublicPDF");
  const btnExportConfidentialPDF = document.getElementById("btnAdminExportConfidentialPDF");

  if (btnExportPublicExcel) {
    btnExportPublicExcel.addEventListener("click", () => {
      PortalExcel.downloadPublicExcel(filteredAdminStudents, "TamilNadu_Laptop_Public_Representation.xlsx");
    });
  }

  if (btnExportPrivateExcel) {
    btnExportPrivateExcel.addEventListener("click", () => {
      PortalExcel.downloadAdminPrivateExcel(filteredAdminStudents, "CONFIDENTIAL_TamilNadu_Laptop_Master_Register.xlsx");
    });
  }

  if (btnExportPublicPDF) {
    btnExportPublicPDF.addEventListener("click", () => {
      PortalPDF.generatePublicRepresentationPDF(filteredAdminStudents);
    });
  }

  if (btnExportConfidentialPDF) {
    btnExportConfidentialPDF.addEventListener("click", () => {
      PortalPDF.generateConfidentialAdminPDF(filteredAdminStudents);
    });
  }
}

/**
 * Handle Admin Sign In
 */
async function handleAdminLogin(event) {
  event.preventDefault();
  const emailInput = document.getElementById("adminEmail");
  const passwordInput = document.getElementById("adminPassword");
  const alertContainer = document.getElementById("adminLoginAlert");
  const submitBtn = document.getElementById("adminLoginBtn");

  alertContainer.innerHTML = "";
  const email = emailInput.value.trim();
  const password = passwordInput.value;

  if (!email || !password) {
    alertContainer.innerHTML = `<div class="alert alert-warning py-2">Please enter your admin email and password.</div>`;
    return;
  }

  try {
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span>Authenticating...`;

    await PortalDB.adminSignIn(email, password);
  } catch (err) {
    let errorMsg = err.message || "Invalid authentication credentials.";
    if (err.code === "auth/user-not-found" || err.code === "auth/invalid-credential") {
      errorMsg = "Admin user not found or invalid password. Ensure this admin account is added in your Firebase Console (Authentication > Users).";
    } else if (err.code === "auth/operation-not-allowed") {
      errorMsg = "Email/Password sign-in is not enabled. Go to Firebase Console > Authentication > Sign-in method and enable Email/Password.";
    }
    alertContainer.innerHTML = `
      <div class="alert alert-danger py-2">
        <i class="bi bi-shield-x me-1"></i> ${errorMsg}
      </div>
    `;
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = `<i class="bi bi-box-arrow-in-right me-2"></i>Sign In to Dashboard`;
  }
}

/**
 * Handle Admin Sign Out
 */
async function handleAdminLogout() {
  if (confirm("Are you sure you want to sign out from the Admin Dashboard?")) {
    await PortalDB.adminSignOut();
    location.reload();
  }
}

/**
 * Load All Master Data & Render Stats & Tables
 */
async function loadAdminDashboardData() {
  const loading = document.getElementById("adminLoadingIndicator");
  if (loading) loading.classList.remove("d-none");

  try {
    populateAdminFilters();
    allAdminStudents = await PortalDB.getAllStudentsAdmin();
    filteredAdminStudents = [...allAdminStudents];

    renderAdminMetrics(allAdminStudents);
    renderDistrictBreakdown(allAdminStudents);
    renderAdminTable(filteredAdminStudents);
  } catch (err) {
    console.error("Failed to load admin data:", err);
  } finally {
    if (loading) loading.classList.add("d-none");
  }
}

function populateAdminFilters() {
  const districtSelect = document.getElementById("adminFilterDistrict");
  if (districtSelect && typeof TN_DISTRICTS !== "undefined") {
    districtSelect.innerHTML = '<option value="">All Districts</option>';
    TN_DISTRICTS.forEach(d => {
      const opt = document.createElement("option");
      opt.value = d;
      opt.textContent = d;
      districtSelect.appendChild(opt);
    });
  }

  const yearSelect = document.getElementById("adminFilterYear");
  if (yearSelect && typeof ACADEMIC_YEARS !== "undefined") {
    yearSelect.innerHTML = '<option value="">All Academic Batches</option>';
    ACADEMIC_YEARS.forEach(yr => {
      const opt = document.createElement("option");
      opt.value = yr;
      opt.textContent = yr + " Batch";
      yearSelect.appendChild(opt);
    });
  }

  // Also populate batch years in modal
  const modalYearSelect = document.getElementById("editPassingYear");
  if (modalYearSelect && typeof ACADEMIC_YEARS !== "undefined") {
    modalYearSelect.innerHTML = '';
    ACADEMIC_YEARS.forEach(yr => {
      const opt = document.createElement("option");
      opt.value = yr;
      opt.textContent = yr;
      modalYearSelect.appendChild(opt);
    });
  }
}

/**
 * Render Metric KPI Cards
 */
function renderAdminMetrics(students) {
  const total = students.length;
  let countSubmitted = 0;
  let countUnderVerif = 0;
  let countVerified = 0;
  let countCorrection = 0;
  let countRejected = 0;

  students.forEach(s => {
    const st = s.status || "Submitted";
    if (st === "Verified") countVerified++;
    else if (st === "Under Verification") countUnderVerif++;
    else if (st === "Correction Required") countCorrection++;
    else if (st === "Rejected") countRejected++;
    else countSubmitted++;
  });

  setTextSafe("statAdminTotal", total.toLocaleString("en-IN"));
  setTextSafe("statAdminSubmitted", countSubmitted.toLocaleString("en-IN"));
  setTextSafe("statAdminUnderVerif", countUnderVerif.toLocaleString("en-IN"));
  setTextSafe("statAdminVerified", countVerified.toLocaleString("en-IN"));
  setTextSafe("statAdminCorrection", countCorrection.toLocaleString("en-IN"));
  setTextSafe("statAdminRejected", countRejected.toLocaleString("en-IN"));
}

function setTextSafe(id, val) {
  const elem = document.getElementById(id);
  if (elem) elem.textContent = val;
}

/**
 * Render District-wise Statistics Table
 */
function renderDistrictBreakdown(students) {
  const tbody = document.getElementById("adminDistrictStatsBody");
  if (!tbody) return;

  const summary = {};
  students.forEach(s => {
    const d = s.district || "Unspecified";
    if (!summary[d]) {
      summary[d] = { total: 0, verified: 0, pending: 0 };
    }
    summary[d].total++;
    if (s.status === "Verified") summary[d].verified++;
    else summary[d].pending++;
  });

  const sortedDistricts = Object.keys(summary).sort();
  tbody.innerHTML = "";

  if (sortedDistricts.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted py-3">No records submitted yet</td></tr>`;
    return;
  }

  sortedDistricts.forEach((d, i) => {
    const item = summary[d];
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="text-muted">${i + 1}</td>
      <td class="fw-semibold">${escapeHtml(d)}</td>
      <td class="text-end fw-bold">${item.total}</td>
      <td class="text-end text-primary fw-bold">${item.verified}</td>
      <td class="text-end text-muted">${item.pending}</td>
    `;
    tbody.appendChild(tr);
  });
}

/**
 * Apply Search & Filters to Student Table
 */
function applyAdminFilters() {
  const keyword = (document.getElementById("adminSearchInput")?.value || "").trim().toLowerCase();
  const status = (document.getElementById("adminFilterStatus")?.value || "").trim();
  const district = (document.getElementById("adminFilterDistrict")?.value || "").trim();
  const year = (document.getElementById("adminFilterYear")?.value || "").trim();

  filteredAdminStudents = allAdminStudents.filter(s => {
    const matchKeyword = !keyword ||
      (s.registrationId || "").toLowerCase().includes(keyword) ||
      (s.name || "").toLowerCase().includes(keyword) ||
      (s.mobile || "").includes(keyword) ||
      (s.school || "").toLowerCase().includes(keyword) ||
      (s.district || "").toLowerCase().includes(keyword);

    const matchStatus = !status || s.status === status;
    const matchDistrict = !district || s.district === district;
    const matchYear = !year || (s.passingYear || "").toString().includes(year);

    return matchKeyword && matchStatus && matchDistrict && matchYear;
  });

  renderAdminTable(filteredAdminStudents);
}

/**
 * Render Master Student Table with Admin Controls
 */
function renderAdminTable(students) {
  const tbody = document.getElementById("adminStudentsTableBody");
  const countLabel = document.getElementById("adminCountLabel");
  if (!tbody) return;

  if (countLabel) {
    countLabel.textContent = `Showing ${students.length} of ${allAdminStudents.length} records`;
  }

  tbody.innerHTML = "";

  if (students.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="11" class="text-center py-5 text-muted">
          <i class="bi bi-inbox fs-2 d-block mb-2"></i>
          No student records found in the database.
        </td>
      </tr>
    `;
    return;
  }

  students.forEach((s, idx) => {
    const tr = document.createElement("tr");

    let statusBadge = "";
    if (s.status === "Verified") {
      statusBadge = `
        <div class="badge-verified-container">
          <span class="verified-circle-tick"><i class="bi bi-check-lg"></i></span>
          <span>VERIFIED</span>
        </div>
      `;
    } else if (s.status === "Under Verification") {
      statusBadge = `<span class="badge-status badge-status-under-verification">Under Verification</span>`;
    } else if (s.status === "Correction Required") {
      statusBadge = `<span class="badge-status badge-status-correction-required">Correction Required</span>`;
    } else if (s.status === "Rejected") {
      statusBadge = `<span class="badge-status badge-status-rejected">Rejected</span>`;
    } else {
      statusBadge = `<span class="badge-status badge-status-submitted">Submitted</span>`;
    }

    tr.innerHTML = `
      <td class="text-muted">${idx + 1}</td>
      <td class="font-monospace fw-bold text-primary">${escapeHtml(s.registrationId || "-")}</td>
      <td class="fw-semibold">${escapeHtml(s.name || "-")}</td>
      <td class="font-monospace">${escapeHtml(s.mobile || "-")}</td>
      <td><span class="badge bg-primary-subtle text-primary border border-primary-subtle">${escapeHtml(s.passingYear || "2021-2022")}</span></td>
      <td><span class="text-truncate d-inline-block" style="max-width:180px;" title="${escapeHtml(s.school || "")}">${escapeHtml(s.school || "-")}</span></td>
      <td><span class="badge bg-light text-dark border">${escapeHtml(s.district || "-")}</span></td>
      <td><small class="text-muted">${escapeHtml(s.schoolType || "-")}</small></td>
      <td><small class="badge bg-secondary-subtle text-secondary">${escapeHtml(s.laptopStatus || "Not Received")}</small></td>
      <td>${statusBadge}</td>
      <td class="text-end text-nowrap">
        <button class="btn btn-sm btn-primary me-1" onclick="openStudentModal('${s.key || ""}', '${s.registrationId || ""}')">
          <i class="bi bi-pencil-square"></i> Manage
        </button>
        <button class="btn btn-sm btn-outline-danger" onclick="promptDeleteStudent('${s.key || ""}', '${s.registrationId || ""}', '${escapeHtml(s.name || "")}')">
          <i class="bi bi-trash"></i>
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

/**
 * Open Full Student Detail & Edit Modal
 */
window.openStudentModal = function(key, registrationId) {
  const student = allAdminStudents.find(s => (key && s.key === key) || s.registrationId === registrationId);
  if (!student) return;

  activeStudentKey = student.key;
  activeStudentRegId = student.registrationId;

  document.getElementById("modalStudentRegId").textContent = student.registrationId;
  document.getElementById("modalStudentNameHeader").textContent = student.name;

  document.getElementById("editStudentName").value = student.name || "";
  document.getElementById("editStudentMobile").value = student.mobile || "";
  document.getElementById("editStudentEmail").value = student.email || "";
  document.getElementById("editStudentSchool").value = student.school || "";
  document.getElementById("editStudentDistrict").value = student.district || "";
  document.getElementById("editStudentTaluk").value = student.taluk || "";
  document.getElementById("editPassingYear").value = student.passingYear || "2021-2022";
  document.getElementById("editSchoolType").value = student.schoolType || "Government School";
  document.getElementById("editLaptopStatus").value = student.laptopStatus || "Not Received";
  document.getElementById("editCurrentEducation").value = student.currentEducation || "";
  document.getElementById("editHomeAddress").value = student.address || "";
  document.getElementById("editStatusSelect").value = student.status || "Submitted";
  document.getElementById("editAdminNotes").value = student.adminNotes || "";

  document.getElementById("modalRegisteredAt").textContent = student.registeredAt ? new Date(student.registeredAt).toLocaleString("en-IN") : "-";
  document.getElementById("modalVerifiedAt").textContent = student.verifiedAt ? new Date(student.verifiedAt).toLocaleString("en-IN") : "Not Verified Yet";
  document.getElementById("modalUpdatedAt").textContent = student.updatedAt ? new Date(student.updatedAt).toLocaleString("en-IN") : "-";
  document.getElementById("modalUpdatedBy").textContent = student.updatedBy || "System";

  const modalEl = document.getElementById("studentDetailModal");
  if (modalEl) {
    const modal = new bootstrap.Modal(modalEl);
    modal.show();
  }
};

/**
 * Save Student Changes & Status Update
 */
async function handleSaveStudentChanges() {
  const saveBtn = document.getElementById("btnSaveStudentChanges");
  const modalAlert = document.getElementById("modalAlertContainer");
  modalAlert.innerHTML = "";

  const updates = {
    name: document.getElementById("editStudentName").value.trim(),
    mobile: document.getElementById("editStudentMobile").value.trim(),
    email: document.getElementById("editStudentEmail").value.trim(),
    school: document.getElementById("editStudentSchool").value.trim(),
    district: document.getElementById("editStudentDistrict").value.trim(),
    taluk: document.getElementById("editStudentTaluk").value.trim(),
    passingYear: document.getElementById("editPassingYear").value,
    schoolType: document.getElementById("editSchoolType").value,
    laptopStatus: document.getElementById("editLaptopStatus").value,
    currentEducation: document.getElementById("editCurrentEducation").value.trim(),
    address: document.getElementById("editHomeAddress").value.trim(),
    status: document.getElementById("editStatusSelect").value,
    adminNotes: document.getElementById("editAdminNotes").value.trim()
  };

  try {
    saveBtn.disabled = true;
    saveBtn.innerHTML = `<span class="spinner-border spinner-border-sm me-1"></span>Saving...`;

    const adminEmail = currentAdminUser ? currentAdminUser.email : "admin@portal";
    await PortalDB.updateStudentRecord(activeStudentKey, activeStudentRegId, updates, adminEmail);

    allAdminStudents = await PortalDB.getAllStudentsAdmin();
    applyAdminFilters();
    renderAdminMetrics(allAdminStudents);
    renderDistrictBreakdown(allAdminStudents);

    const modalEl = document.getElementById("studentDetailModal");
    const modalInstance = bootstrap.Modal.getInstance(modalEl);
    if (modalInstance) modalInstance.hide();

  } catch (err) {
    console.error("Save failed:", err);
    modalAlert.innerHTML = `<div class="alert alert-danger py-2">Error saving updates: ${err.message}</div>`;
  } finally {
    saveBtn.disabled = false;
    saveBtn.innerHTML = `<i class="bi bi-check2 me-1"></i>Save Changes`;
  }
}

/**
 * Prompt & Confirm Deletion
 */
let pendingDeleteKey = null;
let pendingDeleteRegId = null;

window.promptDeleteStudent = function(key, registrationId, studentName) {
  pendingDeleteKey = key;
  pendingDeleteRegId = registrationId;

  document.getElementById("deletePromptStudentName").textContent = studentName;
  document.getElementById("deletePromptRegId").textContent = registrationId;

  const modalEl = document.getElementById("deleteConfirmModal");
  if (modalEl) {
    const modal = new bootstrap.Modal(modalEl);
    modal.show();
  }
};

async function handleConfirmDeleteStudent() {
  const confirmBtn = document.getElementById("btnConfirmDeleteStudent");
  try {
    confirmBtn.disabled = true;
    confirmBtn.innerHTML = `<span class="spinner-border spinner-border-sm me-1"></span>Deleting...`;

    await PortalDB.deleteStudentRecord(pendingDeleteKey, pendingDeleteRegId);

    allAdminStudents = await PortalDB.getAllStudentsAdmin();
    applyAdminFilters();
    renderAdminMetrics(allAdminStudents);
    renderDistrictBreakdown(allAdminStudents);

    const modalEl = document.getElementById("deleteConfirmModal");
    const modalInstance = bootstrap.Modal.getInstance(modalEl);
    if (modalInstance) modalInstance.hide();
  } catch (err) {
    console.error("Delete failed:", err);
    alert("Failed to delete record: " + err.message);
  } finally {
    confirmBtn.disabled = false;
    confirmBtn.innerHTML = `DELETE PERMANENTLY`;
  }
}

function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return (text || '').replace(/[&<>"']/g, m => map[m]);
}
