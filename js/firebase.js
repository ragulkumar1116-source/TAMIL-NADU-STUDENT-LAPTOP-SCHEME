/**
 * ==========================================================================
 * TAMIL NADU STUDENT LAPTOP SCHEME - REPRESENTATION PORTAL
 * Firebase SDK Integration & Production Data Layer (Realtime DB & Auth)
 * ==========================================================================
 */

const PortalDB = (function() {
  let isFirebaseConfigured = false;
  let authInstance = null;
  let databaseInstance = null;

  // Check if real credentials have replaced placeholders
  if (
    typeof firebase !== 'undefined' &&
    firebaseConfig &&
    firebaseConfig.apiKey &&
    !firebaseConfig.apiKey.includes("PLACE_")
  ) {
    try {
      if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
      }
      authInstance = firebase.auth();
      databaseInstance = firebase.database();
      isFirebaseConfigured = true;
      console.log("Firebase Realtime Database & Auth successfully initialized.");
    } catch (err) {
      console.warn("Failed to initialize Firebase with provided credentials. Falling back to clean local storage.", err);
      isFirebaseConfigured = false;
    }
  } else {
    console.info("Firebase running with active clean storage.");
  }

  // --------------------------------------------------------------------------
  // Clean Data Storage (No mock/demo seed records)
  // --------------------------------------------------------------------------
  const STORAGE_KEY = "portal_tn_laptop_students_clean";
  const ADMIN_AUTH_KEY = "portal_admin_session";

  // Purge any legacy demo seed data from previous versions
  try {
    localStorage.removeItem("portal_2022_laptop_students");
  } catch (e) {}

  function getLocalRecords() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) {
        return [];
      }
      return JSON.parse(data);
    } catch (e) {
      return [];
    }
  }

  function saveLocalRecords(records) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    } catch (e) {
      console.error("Local storage save error", e);
    }
  }

  // --------------------------------------------------------------------------
  // Public Data Projection (Strict Privacy Protection - No Contact Details)
  // --------------------------------------------------------------------------
  function projectPublicRecord(record) {
    if (!record) return null;
    return {
      registrationId: record.registrationId,
      name: record.name,
      school: record.school,
      district: record.district,
      taluk: record.taluk || "",
      passingYear: record.passingYear || "2021-2022",
      status: record.status || "Submitted",
      registeredAt: record.registeredAt
    };
  }

  // --------------------------------------------------------------------------
  // API Methods
  // --------------------------------------------------------------------------
  return {
    isConfigured: function() {
      return isFirebaseConfigured;
    },

    /**
     * Submit a new student representation
     */
    submitRegistration: async function(studentData) {
      const now = new Date().toISOString();
      const record = {
        ...studentData,
        passingYear: studentData.passingYear || "2021-2022",
        status: STATUS_TYPES.SUBMITTED,
        adminNotes: "",
        registeredAt: now,
        verifiedAt: null,
        updatedAt: now
      };

      if (isFirebaseConfigured && databaseInstance) {
        const newRef = databaseInstance.ref("laptop_scheme_students").push();
        record.key = newRef.key;
        await newRef.set(record);

        // Also update public mirror index for fast, safe public search
        const publicRecord = projectPublicRecord(record);
        await databaseInstance.ref("public_students/" + record.registrationId).set(publicRecord);

        return { success: true, record: record };
      } else {
        const records = getLocalRecords();
        record.key = "rec_" + Date.now();
        records.unshift(record);
        saveLocalRecords(records);
        return { success: true, record: record };
      }
    },

    /**
     * Public Status Lookup by Registration ID (Returns ONLY safe public fields)
     */
    lookupStudentStatus: async function(registrationId) {
      const cleanId = (registrationId || "").trim().toUpperCase();
      if (!cleanId) return null;

      if (isFirebaseConfigured && databaseInstance) {
        const snapshot = await databaseInstance.ref("public_students/" + cleanId).once("value");
        if (snapshot.exists()) {
          return snapshot.val();
        }

        const querySnap = await databaseInstance.ref("laptop_scheme_students")
          .orderByChild("registrationId")
          .equalTo(cleanId)
          .once("value");

        if (querySnap.exists()) {
          let found = null;
          querySnap.forEach(child => {
            found = projectPublicRecord(child.val());
          });
          return found;
        }
        return null;
      } else {
        const records = getLocalRecords();
        const found = records.find(r => (r.registrationId || "").toUpperCase() === cleanId);
        return projectPublicRecord(found);
      }
    },

    /**
     * Public representation listing (Strictly limited public fields)
     */
    getPublicStudents: async function() {
      if (isFirebaseConfigured && databaseInstance) {
        const pubSnap = await databaseInstance.ref("public_students").once("value");
        if (pubSnap.exists()) {
          const list = [];
          pubSnap.forEach(child => {
            list.push(child.val());
          });
          return list.reverse();
        }

        const mainSnap = await databaseInstance.ref("laptop_scheme_students").once("value");
        const list = [];
        if (mainSnap.exists()) {
          mainSnap.forEach(child => {
            list.push(projectPublicRecord(child.val()));
          });
        }
        return list.reverse();
      } else {
        const records = getLocalRecords();
        return records.map(projectPublicRecord);
      }
    },

    /**
     * Admin view: Get all full student records (Contains contact info & notes)
     */
    getAllStudentsAdmin: async function() {
      if (isFirebaseConfigured && databaseInstance) {
        const snap = await databaseInstance.ref("laptop_scheme_students").once("value");
        const list = [];
        if (snap.exists()) {
          snap.forEach(child => {
            const data = child.val();
            data.key = child.key;
            list.push(data);
          });
        }
        return list.reverse();
      } else {
        return getLocalRecords();
      }
    },

    /**
     * Admin: Update student record (status, notes, etc.)
     */
    updateStudentRecord: async function(key, registrationId, updates, adminEmail = "admin@portal") {
      const now = new Date().toISOString();
      const updatedData = {
        ...updates,
        updatedAt: now,
        updatedBy: adminEmail
      };

      if (updates.status === STATUS_TYPES.VERIFIED && !updates.verifiedAt) {
        updatedData.verifiedAt = now;
      } else if (updates.status !== STATUS_TYPES.VERIFIED) {
        updatedData.verifiedAt = null;
      }

      if (isFirebaseConfigured && databaseInstance) {
        await databaseInstance.ref("laptop_scheme_students/" + key).update(updatedData);

        const pubRef = databaseInstance.ref("public_students/" + registrationId);
        const pubSnap = await pubRef.once("value");
        if (pubSnap.exists()) {
          const currentPub = pubSnap.val();
          await pubRef.update({
            status: updatedData.status,
            name: updatedData.name || currentPub.name,
            school: updatedData.school || currentPub.school,
            district: updatedData.district || currentPub.district,
            taluk: updatedData.taluk || currentPub.taluk,
            passingYear: updatedData.passingYear || currentPub.passingYear
          });
        }
        return true;
      } else {
        const records = getLocalRecords();
        const idx = records.findIndex(r => r.key === key || r.registrationId === registrationId);
        if (idx !== -1) {
          records[idx] = { ...records[idx], ...updatedData };
          saveLocalRecords(records);
          return true;
        }
        return false;
      }
    },

    /**
     * Admin: Delete student record
     */
    deleteStudentRecord: async function(key, registrationId) {
      if (isFirebaseConfigured && databaseInstance) {
        if (key) {
          await databaseInstance.ref("laptop_scheme_students/" + key).remove();
        }
        if (registrationId) {
          await databaseInstance.ref("public_students/" + registrationId).remove();
        }
        return true;
      } else {
        let records = getLocalRecords();
        records = records.filter(r => r.key !== key && r.registrationId !== registrationId);
        saveLocalRecords(records);
        return true;
      }
    },

    /**
     * Admin Authentication: Sign In
     */
    adminSignIn: async function(email, password) {
      if (isFirebaseConfigured && authInstance) {
        return await authInstance.signInWithEmailAndPassword(email, password);
      } else {
        // Local administrative session
        if (email && password && password.length >= 6) {
          const session = {
            email: email,
            uid: "admin_" + Date.now(),
            loggedInAt: Date.now()
          };
          localStorage.setItem(ADMIN_AUTH_KEY, JSON.stringify(session));
          return { user: session };
        } else {
          throw new Error("Password must be at least 6 characters.");
        }
      }
    },

    /**
     * Admin Authentication: Sign Out
     */
    adminSignOut: async function() {
      if (isFirebaseConfigured && authInstance) {
        return await authInstance.signOut();
      } else {
        localStorage.removeItem(ADMIN_AUTH_KEY);
        return true;
      }
    },

    /**
     * Admin Auth State Listener
     */
    onAdminAuthStateChanged: function(callback) {
      if (isFirebaseConfigured && authInstance) {
        authInstance.onAuthStateChanged(user => {
          callback(user);
        });
      } else {
        try {
          const session = localStorage.getItem(ADMIN_AUTH_KEY);
          if (session) {
            callback(JSON.parse(session));
          } else {
            callback(null);
          }
        } catch (e) {
          callback(null);
        }
      }
    }
  };
})();
