# TAMIL NADU STUDENT LAPTOP SCHEME REPRESENTATION PORTAL

Platform to collect representations from Class 12 batch students (2020-2021, 2021-2022 & 2022-2023) in Tamil Nadu regarding the Government laptop scheme benefit.

---

## 🌟 Key Capabilities & Architecture

- **Landing Page (`index.html`)**: Clear orientation with registration and public representation access, structured check points, and mandatory disclaimers.
- **Student Registration (`register.html`)**:
  - Validation for student name, 10-digit mobile number, optional email, school name, district (all 38 Tamil Nadu districts), school type, and address.
  - Automatically locks passing year to **2022** (non-editable).
  - Generates unique Registration ID formatted as `LB2022-XXXXXXXX`.
  - Sets initial status to **`Submitted`** (never automatically verified).
  - Prepares official representation `mailto:` email templates for:
    - **Chief Minister's Special Cell**
    - **School Education Department**
    - **Government Grievance Portal** (direct link)
- **Student Status Check (`status.html`)**:
  - Students enter their `LB2022-XXXXXXXX` ID.
  - Displays **only** safe public details: Registration ID, Name, School, District, Passing Year, Registration Date, and Verification Status.
  - Distinctive **Blue Verified Badge (`✓ VERIFIED`)** shown once verified by an administrator.
  - **Strict Data Privacy**: Phone numbers, emails, and residential addresses are never shown.
- **Government / Public Representation Dashboard (`government.html`)**:
  - Aggregated KPIs: Total Registered, Total Verified, Districts Represented.
  - Searchable and filterable directory (by keyword, district, verification status).
  - Individual student view links (`student-view.html?id=LB2022-XXXXXXXX`).
  - **Excel Export**: Generates `2022_Batch_Laptop_Student_Representation.xlsx` using SheetJS (public columns only).
  - **PDF Representation**: Generates professional PDF representation report with district statistics and student register using jsPDF & AutoTable.
- **Administrator Management Portal (`admin.html`)**:
  - Protected behind Firebase Authentication (Email/Password).
  - Metric breakdown cards: Total, Submitted, Under Verification, Verified, Correction Required, Rejected.
  - District breakdown statistics.
  - Full record manager: view confidential contact details, edit records, change status, add internal admin verification notes, and permanently delete records with explicit confirmation.
  - **Confidential Exports**: Detailed Admin Excel and Audit PDF with contact numbers and admin notes marked `CONFIDENTIAL — ADMIN USE ONLY`.

---

## 📁 File Structure

```
2022-laptop-portal/
├── index.html                   # Landing page
├── register.html                # Student registration & mailto trigger page
├── status.html                  # Public student status lookup
├── government.html              # Public representation data & export dashboard
├── student-view.html            # Individual public student view (?id=...)
├── admin.html                   # Authenticated Admin Dashboard
├── css/
│   └── style.css                # Professional Blue, White & Light Grey Theme
├── js/
│   ├── config.js                # Central configuration (Firebase keys & Gov contacts)
│   ├── firebase.js              # Realtime DB & Auth integration + offline mock fallback
│   ├── register.js              # Form validation & submission logic
│   ├── status.js                # Status query & privacy-safe view renderer
│   ├── government.js            # Summary stats, search, filters & public tables
│   ├── student-view.js          # Single record view renderer
│   ├── admin.js                 # Admin authentication, audit tracking & record controls
│   ├── export.js                # SheetJS Excel exporter (Public & Confidential)
│   └── pdf.js                   # jsPDF & AutoTable PDF report generator
├── database.rules.json          # Firebase Realtime Database security rules
├── firebase.json                # Firebase Hosting configuration
└── README.md                    # Project documentation & setup instructions
```

---

## 🚀 Instant Local Testing (Zero Setup Required)

The application includes an **intelligent dual-mode data layer** (`js/firebase.js`). If Firebase credentials are not yet configured:
1. It automatically launches in **Offline / Demo Mode** using browser `LocalStorage`.
2. It is pre-seeded with realistic Tamil Nadu 2022 batch student records across multiple districts (Thiruvarur, Madurai, Salem, Tiruchirappalli, Chennai, Coimbatore).
3. You can immediately log into the **Admin Portal** (`admin.html`) using:
   - **Email:** `admin@laptop2022.portal`
   - **Password:** `Admin@2022`

To run locally with any static web server:

```powershell
# Using Python built-in HTTP server:
python -m http.server 8080

# Then open in browser:
# http://localhost:8080/index.html
# http://localhost:8080/admin.html
```

---

## 🔒 Firebase Production Setup

### 1. Create Firebase Project
1. Navigate to the [Firebase Console](https://console.firebase.google.com/).
2. Click **Add project** and name it (e.g. `laptop-scheme-2022`).
3. Under **Build**:
   - Enable **Authentication** -> Sign-in method -> Enable **Email/Password**.
   - Create an admin user under the **Users** tab (e.g. `admin@yourdomain.org` with a secure password).
   - Enable **Realtime Database** (choose default location, e.g., `asia-southeast1` or `us-central1`).

### 2. Configured Firebase Project (`aitdata-1f856`)
The Firebase Project configuration in `js/config.js` is already configured:

```javascript

```

### 3. Configure Official Government Contacts in `js/config.js`
In `js/config.js`, enter the official email addresses and grievance portal URLs:

```javascript
const GOVERNMENT_CONTACTS = {
  chiefMinister: {
    title: "Chief Minister's Special Cell",
    email: "cmcell@tn.gov.in", // Enter verified official email
    url: "https://cmcell.tn.gov.in"
  },
  schoolEducation: {
    title: "School Education Department",
    email: "secyhsed@tn.gov.in", // Enter verified official email
    url: "https://tnschools.gov.in"
  },
  grievance: {
    title: "Mudhalvarin Mugavari Grievance Portal",
    url: "https://mudhalvarinmugavari.tnega.org"
  }
};
```

### 4. Deploy Database Security Rules
The file `database.rules.json` enforces:
- **Public Write Only on Create**: Unauthenticated users can only create a record with initial status `"Submitted"`. They cannot read all records, update, or delete.
- **Admin Full Control**: Authenticated admin users can read full contact records, edit details, verify records, and delete records.
- **Public Index**: A privacy-sanitized `public_students` node allows fast, secure public lookups and representation dashboards without exposing personal phone numbers or addresses.

To deploy via Firebase CLI:
```bash
firebase login
firebase use your-project-id
firebase deploy --only database
```

### 5. Deploy to Firebase Hosting
```bash
firebase deploy --only hosting
```

---

## 🛡️ Strict Privacy Protection Rules

- **Public Representation View (`/government.html`)**: Exposes only: S.No, Registration ID, Student Name, School Name, District, Passing Year (2022), Status.
- **Student Status Query (`/status.html`)**: Exposes only: Registration ID, Name, School, District, Passing Year, Registration Date, Verification Status.
- **Protected Fields**: Mobile number, email, and home address are **never displayed** on public pages or included in the public Excel/PDF downloads. They are accessible exclusively within the authenticated Admin Panel (`/admin.html`) and the Confidential Admin Exports.
