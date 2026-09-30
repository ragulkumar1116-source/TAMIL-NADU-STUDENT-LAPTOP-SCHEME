/**
 * ==========================================================================
 * TAMIL NADU STUDENT LAPTOP SCHEME - REPRESENTATION PORTAL
 * Application Configuration (Multi-Batch: 2020-2021, 2021-2022, 2022-2023)
 * ==========================================================================
 *
 * NOTE FOR ADMINISTRATOR / DEVELOPER:
 * 1. Enter your Firebase project credentials in the `firebaseConfig` object below.
 *    You can get these from your Firebase Console -> Project Settings -> General -> Your Apps.
 * 2. Configure official Government email IDs and grievance URLs in `GOVERNMENT_CONTACTS`.
 */

const APP_CONFIG = {
  portalName: "TAMIL NADU STUDENT LAPTOP SCHEME",
  portalSubtitle: "Representation Portal",
  portalTagline: "Class 12 Batches: 2020-2021, 2021-2022 & 2022-2023",
  logoUrl: "assets/logo.png",
  logoExternalUrl: "https://www.pngwing.com/en/free-png-nrfvo",
  logoFallbackUrl: "https://w7.pngwing.com/pngs/408/625/png-transparent-government-of-tamil-nadu-seal-of-tamil-nadu-tamil-nadu-legislative-assembly-state-emblem-of-india-others-miscellaneous-emblem-food.png"
};

/**
 * ELIGIBLE ACADEMIC BATCH YEARS
 */
const ACADEMIC_YEARS = [
  "2020-2021",
  "2021-2022",
  "2022-2023",
  "2023-2024",
  "2024-2025"
  
];

/**
 * FIREBASE CONFIGURATION
 * --------------------------------------------------------------------------
 * Replace these placeholder values with your actual Firebase project settings:
 * --------------------------------------------------------------------------
 */
const firebaseConfig = {
  apiKey: "AIzaSyC1I7uggV3I8Z7pmbpWQmJZO_mHlWQ7qRc",
  authDomain: "aitdata-1f856.firebaseapp.com",
  databaseURL: "https://aitdata-1f856-default-rtdb.firebaseio.com",
  projectId: "aitdata-1f856",
  storageBucket: "aitdata-1f856.firebasestorage.app",
  messagingSenderId: "535350785851",
  appId: "1:535350785851:web:67abe23a6da1dca7fe291e",
  measurementId: "G-82Y1DL677C"
};

/**
 * OFFICIAL GOVERNMENT CONTACTS & GRIEVANCE ENDPOINTS
 */
const GOVERNMENT_CONTACTS = {
  chiefMinister: {
    title: "Chief Minister's Special Cell",
    email: "PLACE_OFFICIAL_EMAIL_HERE", // e.g., cmcell@tn.gov.in
    url: "https://cmcell.tn.gov.in"
  },
  schoolEducation: {
    title: "School Education Department",
    email: "PLACE_OFFICIAL_EMAIL_HERE", // e.g., secyhsed@tn.gov.in
    url: "https://tnschools.gov.in"
  },
  grievance: {
    title: "Mudhalvarin Mugavari Grievance Portal",
    url: "https://mudhalvarinmugavari.tnega.org"
  }
};

/**
 * TAMIL NADU 38 REVENUE DISTRICTS
 */
const TN_DISTRICTS = [
  "Ariyalur",
  "Chengalpattu",
  "Chennai",
  "Coimbatore",
  "Cuddalore",
  "Dharmapuri",
  "Dindigul",
  "Erode",
  "Kallakurichi",
  "Kanchipuram",
  "Kanyakumari",
  "Karur",
  "Krishnagiri",
  "Madurai",
  "Mayiladuthurai",
  "Nagapattinam",
  "Namakkal",
  "Nilgiris",
  "Perambalur",
  "Pudukkottai",
  "Ramanathapuram",
  "Ranipet",
  "Salem",
  "Sivaganga",
  "Tenkasi",
  "Thanjavur",
  "Theni",
  "Thoothukudi",
  "Tiruchirappalli",
  "Tirunelveli",
  "Tirupathur",
  "Tiruppur",
  "Tiruvallur",
  "Tiruvannamalai",
  "Thiruvarur",
  "Vellore",
  "Viluppuram",
  "Virudhunagar"
];

/**
 * STANDARD APPLICATION STATUSES
 */
const STATUS_TYPES = {
  SUBMITTED: "Submitted",
  UNDER_VERIFICATION: "Under Verification",
  VERIFIED: "Verified",
  CORRECTION_REQUIRED: "Correction Required",
  REJECTED: "Rejected"
};

/**
 * Status display definitions with badges and icons
 */
const STATUS_DISPLAY = {
  "Submitted": {
    label: "Registration Submitted",
    badgeClass: "badge-status badge-status-submitted",
    icon: "bi bi-clock-history"
  },
  "Under Verification": {
    label: "Under Verification",
    badgeClass: "badge-status badge-status-under-verification",
    icon: "bi bi-search"
  },
  "Verified": {
    label: "Verified",
    badgeClass: "badge-verified-container",
    isVerified: true
  },
  "Correction Required": {
    label: "Correction Required",
    badgeClass: "badge-status badge-status-correction-required",
    icon: "bi bi-exclamation-triangle"
  },
  "Rejected": {
    label: "Registration Not Verified",
    badgeClass: "badge-status badge-status-rejected",
    icon: "bi bi-x-circle"
  }
};
