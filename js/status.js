/**
 * ==========================================================================
 * 2022 BATCH LAPTOP SCHEME - STUDENT REPRESENTATION PORTAL
 * Student Status Lookup Logic (Privacy Preserving)
 * ==========================================================================
 */

document.addEventListener("DOMContentLoaded", function() {
  const form = document.getElementById("statusSearchForm");
  if (form) {
    form.addEventListener("submit", handleStatusSearch);
  }

  // Check if ID was passed in query parameter (e.g., status.html?id=LB2022-XXXX)
  const urlParams = new URLSearchParams(window.location.search);
  const paramId = urlParams.get("id");
  if (paramId) {
    const input = document.getElementById("searchRegistrationId");
    if (input) {
      input.value = paramId.trim().toUpperCase();
      lookupStatus(paramId.trim().toUpperCase());
    }
  }
});

async function handleStatusSearch(event) {
  event.preventDefault();
  const input = document.getElementById("searchRegistrationId");
  const regId = (input.value || "").trim().toUpperCase();

  if (!regId) {
    showStatusAlert("Please enter your Registration ID (e.g., LB2022-AB12345).", "warning");
    return;
  }

  await lookupStatus(regId);
}

async function lookupStatus(registrationId) {
  const resultCard = document.getElementById("statusResultCard");
  const notFoundCard = document.getElementById("statusNotFoundCard");
  const loadingSpinner = document.getElementById("statusLoading");
  const alertContainer = document.getElementById("statusAlertContainer");

  alertContainer.innerHTML = "";
  if (resultCard) resultCard.classList.add("d-none");
  if (notFoundCard) notFoundCard.classList.add("d-none");
  if (loadingSpinner) loadingSpinner.classList.remove("d-none");

  try {
    const student = await PortalDB.lookupStudentStatus(registrationId);

    if (loadingSpinner) loadingSpinner.classList.add("d-none");

    if (student) {
      renderStatusResult(student);
    } else {
      if (notFoundCard) {
        document.getElementById("notFoundIdText").textContent = registrationId;
        notFoundCard.classList.remove("d-none");
      }
    }
  } catch (error) {
    console.error("Lookup error:", error);
    if (loadingSpinner) loadingSpinner.classList.add("d-none");
    showStatusAlert("Unable to check status. Please check your network connection.", "danger");
  }
}

function renderStatusResult(student) {
  const resultCard = document.getElementById("statusResultCard");
  if (!resultCard) return;

  // Populate Safe Limited Fields (Strict Data Privacy)
  document.getElementById("resRegId").textContent = student.registrationId || "-";
  document.getElementById("resStudentName").textContent = student.name || "-";
  document.getElementById("resSchool").textContent = student.school || "-";
  document.getElementById("resDistrict").textContent = student.district || "-";
  document.getElementById("resPassingYear").textContent = student.passingYear || "2021-2022";

  // Format Date
  let dateFormatted = "-";
  if (student.registeredAt) {
    try {
      dateFormatted = new Date(student.registeredAt).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "short",
        day: "2-digit"
      });
    } catch (e) {
      dateFormatted = student.registeredAt;
    }
  }
  document.getElementById("resRegisteredDate").textContent = dateFormatted;

  // Render Status Badge
  const statusContainer = document.getElementById("resStatusContainer");
  const rawStatus = student.status || "Submitted";

  if (rawStatus === "Verified") {
    statusContainer.innerHTML = `
      <div class="badge-verified-container fs-6">
        <span class="verified-circle-tick"><i class="bi bi-check-lg"></i></span>
        <span>VERIFIED</span>
      </div>
    `;
  } else if (rawStatus === "Submitted") {
    statusContainer.innerHTML = `
      <span class="badge-status badge-status-submitted fs-6">
        <i class="bi bi-clock-history me-1"></i> Registration Submitted
      </span>
    `;
  } else if (rawStatus === "Under Verification") {
    statusContainer.innerHTML = `
      <span class="badge-status badge-status-under-verification fs-6">
        <i class="bi bi-search me-1"></i> Under Verification
      </span>
    `;
  } else if (rawStatus === "Correction Required") {
    statusContainer.innerHTML = `
      <span class="badge-status badge-status-correction-required fs-6">
        <i class="bi bi-exclamation-triangle me-1"></i> Correction Required
      </span>
    `;
  } else if (rawStatus === "Rejected") {
    statusContainer.innerHTML = `
      <span class="badge-status badge-status-rejected fs-6">
        <i class="bi bi-x-circle me-1"></i> Registration Not Verified
      </span>
    `;
  } else {
    statusContainer.innerHTML = `<span class="badge bg-secondary fs-6">${rawStatus}</span>`;
  }

  resultCard.classList.remove("d-none");
  resultCard.scrollIntoView({ behavior: "smooth", block: "start" });
}

function showStatusAlert(message, type = "info") {
  const alertContainer = document.getElementById("statusAlertContainer");
  if (!alertContainer) return;
  alertContainer.innerHTML = `
    <div class="alert alert-${type} alert-dismissible fade show" role="alert">
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>
  `;
}
