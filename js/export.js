/**
 * ==========================================================================
 * TAMIL NADU STUDENT LAPTOP SCHEME - REPRESENTATION PORTAL
 * Excel Export Utility using SheetJS (xlsx)
 * ==========================================================================
 */

const PortalExcel = (function() {
  function formatDate(isoStr) {
    if (!isoStr) return "-";
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString("en-IN", {
        year: "numeric",
        month: "short",
        day: "2-digit"
      });
    } catch (e) {
      return isoStr;
    }
  }

  return {
    /**
     * Download Public Representation Excel
     * Strict privacy: No mobile, email, or address
     */
    downloadPublicExcel: function(studentsList, filename = "TamilNadu_Student_Laptop_Representation.xlsx") {
      if (typeof XLSX === "undefined") {
        alert("Excel export library (SheetJS) is loading, please try again in a moment.");
        return;
      }

      const rows = [];
      rows.push(["TAMIL NADU STUDENT LAPTOP SCHEME - STUDENT REPRESENTATION"]);
      rows.push(["Batches: 2020-2021, 2021-2022 & 2022-2023 | Export Date: " + new Date().toLocaleString("en-IN")]);
      rows.push([]);

      rows.push([
        "S.No",
        "Registration ID",
        "Student Name",
        "School Name",
        "District",
        "Taluk",
        "Academic Batch",
        "Status",
        "Registration Date"
      ]);

      (studentsList || []).forEach((item, index) => {
        rows.push([
          index + 1,
          item.registrationId || "",
          item.name || "",
          item.school || "",
          item.district || "",
          item.taluk || "",
          item.passingYear || "2021-2022",
          item.status || "Submitted",
          formatDate(item.registeredAt)
        ]);
      });

      const worksheet = XLSX.utils.aoa_to_sheet(rows);

      worksheet["!cols"] = [
        { wch: 8 },  // S.No
        { wch: 20 }, // Reg ID
        { wch: 26 }, // Name
        { wch: 40 }, // School
        { wch: 18 }, // District
        { wch: 18 }, // Taluk
        { wch: 18 }, // Academic Batch
        { wch: 20 }, // Status
        { wch: 18 }  // Date
      ];

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Public Representation");
      XLSX.writeFile(workbook, filename);
    },

    /**
     * Download Private Admin Export (Confidential with Contact Information)
     */
    downloadAdminPrivateExcel: function(studentsList, filename = "CONFIDENTIAL_TamilNadu_Laptop_Master_Register.xlsx") {
      if (typeof XLSX === "undefined") {
        alert("Excel export library (SheetJS) is loading, please try again in a moment.");
        return;
      }

      const rows = [];
      rows.push(["CONFIDENTIAL — ADMIN USE ONLY — STRICT DATA PRIVACY RESTRICTED"]);
      rows.push(["TAMIL NADU STUDENT LAPTOP SCHEME - ADMINISTRATIVE MASTER DATABASE"]);
      rows.push(["Exported By: Authorized Administrator | Generated: " + new Date().toLocaleString("en-IN")]);
      rows.push([]);

      rows.push([
        "S.No",
        "Registration ID",
        "Student Name",
        "Mobile Number",
        "Email Address",
        "School Name",
        "District",
        "Taluk",
        "Academic Batch",
        "School Type",
        "Laptop Scheme Status",
        "Current Education",
        "Home Address",
        "Verification Status",
        "Admin Notes",
        "Registration Date",
        "Verified Date"
      ]);

      (studentsList || []).forEach((item, index) => {
        rows.push([
          index + 1,
          item.registrationId || "",
          item.name || "",
          item.mobile || "",
          item.email || "",
          item.school || "",
          item.district || "",
          item.taluk || "",
          item.passingYear || "2021-2022",
          item.schoolType || "",
          item.laptopStatus || "Not Received",
          item.currentEducation || "",
          item.address || "",
          item.status || "Submitted",
          item.adminNotes || "",
          formatDate(item.registeredAt),
          formatDate(item.verifiedAt)
        ]);
      });

      const worksheet = XLSX.utils.aoa_to_sheet(rows);

      worksheet["!cols"] = [
        { wch: 6 },
        { wch: 18 },
        { wch: 22 },
        { wch: 15 },
        { wch: 25 },
        { wch: 35 },
        { wch: 16 },
        { wch: 16 },
        { wch: 16 },
        { wch: 20 },
        { wch: 20 },
        { wch: 25 },
        { wch: 45 },
        { wch: 20 },
        { wch: 30 },
        { wch: 16 },
        { wch: 16 }
      ];

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Admin Master Data");
      XLSX.writeFile(workbook, filename);
    }
  };
})();
