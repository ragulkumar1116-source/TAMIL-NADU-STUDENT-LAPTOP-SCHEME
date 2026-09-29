/**
 * ==========================================================================
 * TAMIL NADU STUDENT LAPTOP SCHEME - REPRESENTATION PORTAL
 * Student Registration Logic & Representation Email Preparation
 * (Multi-Batch: 2020-2021, 2021-2022, 2022-2023)
 * ==========================================================================
 */

document.addEventListener("DOMContentLoaded", function() {
  populateDistricts();
  populateAcademicYears();

  const form = document.getElementById("studentRegistrationForm");
  if (form) {
    form.addEventListener("submit", handleRegistrationSubmit);
  }
});

/**
 * Populate Tamil Nadu 38 districts in select element
 */
function populateDistricts() {
  const districtSelect = document.getElementById("districtSelect");
  if (!districtSelect || typeof TN_DISTRICTS === "undefined") return;

  districtSelect.innerHTML = '<option value="">-- Select District --</option>';
  TN_DISTRICTS.forEach(district => {
    const opt = document.createElement("option");
    opt.value = district;
    opt.textContent = district;
    districtSelect.appendChild(opt);
  });
}

/**
 * Populate Academic Batch Years in select element
 */
function populateAcademicYears() {
  const yearSelect = document.getElementById("passingYearSelect");
  if (!yearSelect || typeof ACADEMIC_YEARS === "undefined") return;

  yearSelect.innerHTML = '<option value="">-- Select Academic Batch Year --</option>';
  ACADEMIC_YEARS.forEach(yr => {
    const opt = document.createElement("option");
    opt.value = yr;
    opt.textContent = yr + " Batch";
    if (yr === "2021-2022") opt.selected = true; // sensible default
    yearSelect.appendChild(opt);
  });
}

/**
 * Generate unique registration ID: TNLS-XXXXXXXX (8 uppercase alphanumeric)
 */
function generateRegistrationId() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let randomPart = "";
  for (let i = 0; i < 8; i++) {
    randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `TNLS-${randomPart}`;
}

/**
 * Form Submission & Validation
 */
async function handleRegistrationSubmit(event) {
  event.preventDefault();

  const alertContainer = document.getElementById("formAlertContainer");
  alertContainer.innerHTML = "";

  const nameInput = document.getElementById("studentName");
  const mobileInput = document.getElementById("mobileNumber");
  const emailInput = document.getElementById("emailAddress");
  const schoolInput = document.getElementById("schoolName");
  const districtSelect = document.getElementById("districtSelect");
  const talukInput = document.getElementById("talukName");
  const passingYearSelect = document.getElementById("passingYearSelect");
  const schoolTypeSelect = document.getElementById("schoolType");
  const educationInput = document.getElementById("currentEducation");
  const addressInput = document.getElementById("homeAddress");
  const laptopStatusInput = document.getElementById("laptopStatus");
  const declarationCheck = document.getElementById("declarationCheck");
  const submitBtn = document.getElementById("submitBtn");

  const errors = [];

  // Required Field Validations
  const name = nameInput.value.trim();
  if (!name || name.length < 2) {
    errors.push("Please enter a valid Student Full Name.");
  }

  const mobile = mobileInput.value.trim();
  const mobileRegex = /^[6-9]\d{9}$/;
  if (!mobileRegex.test(mobile)) {
    errors.push("Please enter a valid 10-digit Indian Mobile Number (starting with 6, 7, 8, or 9).");
  }

  const email = emailInput.value.trim();
  if (email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      errors.push("Please enter a valid Email Address or leave it empty.");
    }
  }

  const school = schoolInput.value.trim();
  if (!school || school.length < 3) {
    errors.push("Please enter your 12th Standard School Name.");
  }

  const district = districtSelect.value;
  if (!district) {
    errors.push("Please select your District.");
  }

  const passingYear = passingYearSelect ? passingYearSelect.value : "2021-2022";
  if (!passingYear) {
    errors.push("Please select your Academic Batch Year (e.g. 2020-2021, 2021-2022).");
  }

  const schoolType = schoolTypeSelect.value;
  if (!schoolType) {
    errors.push("Please select School Type (Government or Government Aided).");
  }

  const address = addressInput.value.trim();
  if (!address || address.length < 5) {
    errors.push("Please enter your full Residential Address.");
  }

  if (!declarationCheck.checked) {
    errors.push("You must check the declaration confirming your details are correct.");
  }

  if (errors.length > 0) {
    showAlert(alertContainer, errors.join("<br>"), "danger");
    window.scrollTo({ top: form.offsetTop - 50, behavior: "smooth" });
    return;
  }

  // Generate Unique ID & Payload
  const registrationId = generateRegistrationId();
  const payload = {
    registrationId: registrationId,
    name: name,
    mobile: mobile,
    email: email,
    school: school,
    district: district,
    taluk: talukInput.value.trim(),
    passingYear: passingYear,
    schoolType: schoolType,
    laptopStatus: laptopStatusInput.value,
    currentEducation: educationInput.value.trim(),
    address: address
  };

  try {
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Submitting Registration...`;

    const result = await PortalDB.submitRegistration(payload);

    if (result && result.success) {
      showRegistrationSuccess(result.record);
    } else {
      throw new Error("Unable to save registration to database.");
    }
  } catch (error) {
    console.error("Submission failed:", error);
    showAlert(alertContainer, "Registration submission error: " + (error.message || "Please check connection."), "danger");
    submitBtn.disabled = false;
    submitBtn.innerHTML = `SUBMIT REGISTRATION`;
  }
}

/**
 * Render Success Screen & Direct Representation Email Triggers
 */
function showRegistrationSuccess(record) {
  const formCard = document.getElementById("registrationFormCard");
  const successCard = document.getElementById("registrationSuccessCard");

  if (formCard) formCard.classList.add("d-none");
  if (successCard) {
    successCard.classList.remove("d-none");

    document.getElementById("successRegId").textContent = record.registrationId;
    document.getElementById("successStudentName").textContent = record.name;
    document.getElementById("successSchool").textContent = record.school;
    document.getElementById("successDistrict").textContent = record.district;
    document.getElementById("successPassingYear").textContent = record.passingYear;
    document.getElementById("successStatus").textContent = "Submitted";

    const copyBtn = document.getElementById("copyRegIdBtn");
    if (copyBtn) {
      copyBtn.onclick = function() {
        navigator.clipboard.writeText(record.registrationId).then(() => {
          copyBtn.innerHTML = `<i class="bi bi-check2"></i> Copied!`;
          setTimeout(() => {
            copyBtn.innerHTML = `<i class="bi bi-clipboard"></i> Copy ID`;
          }, 2000);
        });
      };
    }

    setupRepresentationTriggers(record);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

/**
 * Configure Representation Triggers (Chief Minister, School Education, Grievance Portal)
 */
function setupRepresentationTriggers(record) {
  const cmBtn = document.getElementById("btnRepChiefMinister");
  const eduBtn = document.getElementById("btnRepSchoolEducation");
  const grievanceBtn = document.getElementById("btnRepGrievancePortal");

  const subject = encodeURIComponent(`Request to Consider ${record.passingYear} Batch Students for Laptop Scheme Benefit`);

  const emailBodyText =
`Respected Authority,

I am submitting this student representation regarding the Class 12 Laptop Scheme benefit for the ${record.passingYear} batch in Tamil Nadu.

My Registration & Academic Details:
------------------------------------------------------
Registration ID: ${record.registrationId}
Student Name: ${record.name}
School Name: ${record.school}
District: ${record.district}
Academic Batch Year: ${record.passingYear}
Laptop Scheme Status: ${record.laptopStatus || 'Not Received'}
Status in Student Portal: Submitted

I state that as an eligible student from the ${record.passingYear} Class 12 batch, I did not receive the Government laptop scheme benefit. I kindly request the department to consider our genuine representation.

Thank you.

Sincerely,
${record.name}
Registration ID: ${record.registrationId}
(Submitted via Tamil Nadu Student Laptop Scheme Representation Portal)`;

  const encodedBody = encodeURIComponent(emailBodyText);

  // Chief Minister Email
  if (cmBtn) {
    cmBtn.onclick = function() {
      const email = GOVERNMENT_CONTACTS.chiefMinister.email;
      if (email && !email.includes("PLACE_")) {
        window.location.href = `mailto:${email}?subject=${subject}&body=${encodedBody}`;
      } else {
        const targetEmail = prompt(
          "Enter official Chief Minister Special Cell email or proceed with template:",
          "cmcell@tn.gov.in"
        );
        if (targetEmail) {
          window.location.href = `mailto:${targetEmail}?subject=${subject}&body=${encodedBody}`;
        }
      }
    };
  }

  // School Education Department Email
  if (eduBtn) {
    eduBtn.onclick = function() {
      const email = GOVERNMENT_CONTACTS.schoolEducation.email;
      if (email && !email.includes("PLACE_")) {
        window.location.href = `mailto:${email}?subject=${subject}&body=${encodedBody}`;
      } else {
        const targetEmail = prompt(
          "Enter official School Education Department email or proceed with template:",
          "secyhsed@tn.gov.in"
        );
        if (targetEmail) {
          window.location.href = `mailto:${targetEmail}?subject=${subject}&body=${encodedBody}`;
        }
      }
    };
  }

  // Government Grievance Portal URL
  if (grievanceBtn) {
    grievanceBtn.onclick = function() {
      const url = GOVERNMENT_CONTACTS.grievance.url || "https://mudhalvarinmugavari.tnega.org";
      window.open(url, "_blank");
    };
  }
}

function showAlert(container, message, type = "danger") {
  container.innerHTML = `
    <div class="alert alert-${type} alert-dismissible fade show" role="alert">
      <div class="d-flex align-items-center">
        <i class="bi bi-exclamation-circle-fill me-2 fs-5"></i>
        <div>${message}</div>
      </div>
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>
  `;
}
