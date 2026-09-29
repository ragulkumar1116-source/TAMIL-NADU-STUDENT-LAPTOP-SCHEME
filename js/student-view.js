/**
 * ==========================================================================
 * 2022 BATCH LAPTOP SCHEME - STUDENT REPRESENTATION PORTAL
 * Single Public Student Representation Record View (?id=LB2022-XXXXX)
 * ==========================================================================
 */

document.addEventListener("DOMContentLoaded", async function() {
  const urlParams = new URLSearchParams(window.location.search);
  const regId = urlParams.get("id");

  if (!regId) {
    showErrorState("No Registration ID provided in URL parameters.");
    return;
  }

  await loadStudentDetail(regId.trim().toUpperCase());
});

async function loadStudentDetail(registrationId) {
  const loading = document.getElementById("studentViewLoading");
  const content = document.getElementById("studentViewContent");
  const errorBox = document.getElementById("studentViewError");

  if (loading) loading.classList.remove("d-none");
  if (content) content.classList.add("d-none");
  if (errorBox) errorBox.classList.add("d-none");

  try {
    const student = await PortalDB.lookupStudentStatus(registrationId);

    if (loading) loading.classList.add("d-none");

    if (!student) {
      showErrorState(`Registration ID "${registrationId}" was not found in the representation records.`);
      return;
    }

    renderStudentRecord(student);
  } catch (err) {
    console.error("Error loading student view:", err);
    if (loading) loading.classList.add("d-none");
    showErrorState("Unable to load student record details. Please check network connection.");
  }
}

function renderStudentRecord(student) {
  const content = document.getElementById("studentViewContent");
  if (!content) return;

  document.getElementById("viewRegId").textContent = student.registrationId || "-";
  document.getElementById("viewStudentName").textContent = student.name || "-";
  document.getElementById("viewSchool").textContent = student.school || "-";
  document.getElementById("viewDistrict").textContent = student.district || "-";
  document.getElementById("viewTaluk").textContent = student.taluk || "Not Specified";
  document.getElementById("viewPassingYear").textContent = student.passingYear || "2021-2022";

  // Date
  let dateFormatted = "-";
  if (student.registeredAt) {
    try {
      dateFormatted = new Date(student.registeredAt).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "long",
        day: "2-digit"
      });
    } catch (e) {
      dateFormatted = student.registeredAt;
    }
  }
  document.getElementById("viewRegisteredDate").textContent = dateFormatted;

  // Status with Blue Tick
  const statusContainer = document.getElementById("viewStatusBadge");
  const rawStatus = student.status || "Submitted";

  if (rawStatus === "Verified") {
    statusContainer.innerHTML = `
      <div class="badge-verified-container fs-5 py-2 px-4 shadow-sm">
        <span class="verified-circle-tick" style="width:24px; height:24px; font-size:0.95rem;">
          <i class="bi bi-check-lg"></i>
        </span>
        <span>VERIFIED</span>
      </div>
    `;
  } else if (rawStatus === "Under Verification") {
    statusContainer.innerHTML = `
      <span class="badge-status badge-status-under-verification fs-6 py-2 px-3">
        <i class="bi bi-search me-1"></i> Under Verification
      </span>
    `;
  } else if (rawStatus === "Correction Required") {
    statusContainer.innerHTML = `
      <span class="badge-status badge-status-correction-required fs-6 py-2 px-3">
        <i class="bi bi-exclamation-triangle me-1"></i> Correction Required
      </span>
    `;
  } else if (rawStatus === "Rejected") {
    statusContainer.innerHTML = `
      <span class="badge-status badge-status-rejected fs-6 py-2 px-3">
        <i class="bi bi-x-circle me-1"></i> Registration Not Verified
      </span>
    `;
  } else {
    statusContainer.innerHTML = `
      <span class="badge-status badge-status-submitted fs-6 py-2 px-3">
        <i class="bi bi-clock-history me-1"></i> Registration Submitted
      </span>
    `;
  }

  content.classList.remove("d-none");
}

function showErrorState(message) {
  const errorBox = document.getElementById("studentViewError");
  const errorMsg = document.getElementById("studentViewErrorMessage");
  if (errorMsg) errorMsg.textContent = message;
  if (errorBox) errorBox.classList.remove("d-none");
}
