/**
 * ==========================================================================
 * TAMIL NADU STUDENT LAPTOP SCHEME - REPRESENTATION PORTAL
 * Government View & Public Representation Logic
 * ==========================================================================
 */

let allPublicStudents = [];
let filteredStudents = [];

document.addEventListener("DOMContentLoaded", async function() {
  populateDistrictFilter();
  populateYearFilter();
  setupEventListeners();
  await loadPublicData();
});

function populateDistrictFilter() {
  const select = document.getElementById("filterDistrict");
  if (!select || typeof TN_DISTRICTS === "undefined") return;

  select.innerHTML = '<option value="">All Districts (Tamil Nadu)</option>';
  TN_DISTRICTS.forEach(d => {
    const opt = document.createElement("option");
    opt.value = d;
    opt.textContent = d;
    select.appendChild(opt);
  });
}

function populateYearFilter() {
  const select = document.getElementById("filterYear");
  if (!select || typeof ACADEMIC_YEARS === "undefined") return;

  select.innerHTML = '<option value="">All Academic Batches</option>';
  ACADEMIC_YEARS.forEach(yr => {
    const opt = document.createElement("option");
    opt.value = yr;
    opt.textContent = yr + " Batch";
    select.appendChild(opt);
  });
}

function setupEventListeners() {
  const searchInput = document.getElementById("searchKeyword");
  const districtFilter = document.getElementById("filterDistrict");
  const yearFilter = document.getElementById("filterYear");
  const statusFilter = document.getElementById("filterStatus");

  if (searchInput) searchInput.addEventListener("input", applyFilters);
  if (districtFilter) districtFilter.addEventListener("change", applyFilters);
  if (yearFilter) yearFilter.addEventListener("change", applyFilters);
  if (statusFilter) statusFilter.addEventListener("change", applyFilters);

  // Excel Download Button
  const btnExcel = document.getElementById("btnDownloadPublicExcel");
  if (btnExcel) {
    btnExcel.addEventListener("click", function() {
      PortalExcel.downloadPublicExcel(filteredStudents, "TamilNadu_Student_Laptop_Representation.xlsx");
    });
  }

  // PDF Representation Button
  const btnPDF = document.getElementById("btnGeneratePublicPDF");
  if (btnPDF) {
    btnPDF.addEventListener("click", function() {
      PortalPDF.generatePublicRepresentationPDF(filteredStudents);
    });
  }
}

async function loadPublicData() {
  const loadingIndicator = document.getElementById("tableLoading");
  if (loadingIndicator) loadingIndicator.classList.remove("d-none");

  try {
    allPublicStudents = await PortalDB.getPublicStudents();
    filteredStudents = [...allPublicStudents];
    updateSummaryStats(allPublicStudents);
    renderTable(filteredStudents);
  } catch (error) {
    console.error("Failed to load public student representations:", error);
  } finally {
    if (loadingIndicator) loadingIndicator.classList.add("d-none");
  }
}

function updateSummaryStats(students) {
  const totalElem = document.getElementById("statTotalRegistered");
  const verifiedElem = document.getElementById("statTotalVerified");
  const districtsElem = document.getElementById("statDistrictsCount");

  const total = students.length;
  const verified = students.filter(s => s.status === "Verified").length;

  const districtsSet = new Set();
  students.forEach(s => {
    if (s.district) districtsSet.add(s.district);
  });

  if (totalElem) totalElem.textContent = total.toLocaleString("en-IN");
  if (verifiedElem) verifiedElem.textContent = verified.toLocaleString("en-IN");
  if (districtsElem) districtsElem.textContent = districtsSet.size.toString();
}

function applyFilters() {
  const keyword = (document.getElementById("searchKeyword")?.value || "").trim().toLowerCase();
  const district = (document.getElementById("filterDistrict")?.value || "").trim();
  const year = (document.getElementById("filterYear")?.value || "").trim();
  const status = (document.getElementById("filterStatus")?.value || "").trim();

  filteredStudents = allPublicStudents.filter(item => {
    const matchId = (item.registrationId || "").toLowerCase().includes(keyword);
    const matchName = (item.name || "").toLowerCase().includes(keyword);
    const matchSchool = (item.school || "").toLowerCase().includes(keyword);
    const matchKeyword = !keyword || matchId || matchName || matchSchool;

    const matchDistrict = !district || item.district === district;
    const matchYear = !year || (item.passingYear || "").toString().includes(year);
    const matchStatus = !status || item.status === status;

    return matchKeyword && matchDistrict && matchYear && matchStatus;
  });

  renderTable(filteredStudents);
}

function renderTable(students) {
  const tbody = document.getElementById("publicStudentsTableBody");
  const countLabel = document.getElementById("displayingCountLabel");
  if (!tbody) return;

  if (countLabel) {
    countLabel.textContent = `Showing ${students.length} representation${students.length === 1 ? '' : 's'}`;
  }

  tbody.innerHTML = "";

  if (students.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" class="text-center py-5 text-muted">
          <i class="bi bi-inbox fs-2 d-block mb-2"></i>
          No student representations found matching the selected criteria.
        </td>
      </tr>
    `;
    return;
  }

  students.forEach((item, index) => {
    const tr = document.createElement("tr");

    let statusBadgeHtml = "";
    if (item.status === "Verified") {
      statusBadgeHtml = `
        <div class="badge-verified-container">
          <span class="verified-circle-tick"><i class="bi bi-check-lg"></i></span>
          <span>VERIFIED</span>
        </div>
      `;
    } else if (item.status === "Under Verification") {
      statusBadgeHtml = `<span class="badge-status badge-status-under-verification"><i class="bi bi-search me-1"></i> Under Verification</span>`;
    } else if (item.status === "Correction Required") {
      statusBadgeHtml = `<span class="badge-status badge-status-correction-required"><i class="bi bi-exclamation-triangle me-1"></i> Correction Required</span>`;
    } else if (item.status === "Rejected") {
      statusBadgeHtml = `<span class="badge-status badge-status-rejected"><i class="bi bi-x-circle me-1"></i> Not Verified</span>`;
    } else {
      statusBadgeHtml = `<span class="badge-status badge-status-submitted"><i class="bi bi-clock-history me-1"></i> Submitted</span>`;
    }

    tr.innerHTML = `
      <td class="text-muted fw-semibold">${index + 1}</td>
      <td>
        <span class="font-monospace fw-bold text-primary">${item.registrationId || "-"}</span>
      </td>
      <td class="fw-semibold">${escapeHtml(item.name || "-")}</td>
      <td>${escapeHtml(item.school || "-")}</td>
      <td><span class="badge bg-light text-dark border">${escapeHtml(item.district || "-")}</span></td>
      <td><span class="badge bg-primary-subtle text-primary border border-primary-subtle">${escapeHtml(item.passingYear || "2021-2022")}</span></td>
      <td>${statusBadgeHtml}</td>
      <td class="text-end">
        <a href="student-view.html?id=${encodeURIComponent(item.registrationId)}" class="btn btn-sm btn-outline-primary">
          <i class="bi bi-eye"></i> View
        </a>
      </td>
    `;

    tbody.appendChild(tr);
  });
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
