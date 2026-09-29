/**
 * ==========================================================================
 * TAMIL NADU STUDENT LAPTOP SCHEME - REPRESENTATION PORTAL
 * PDF Generation Utility using jsPDF & jsPDF-AutoTable
 * ==========================================================================
 */

const PortalPDF = (function() {
  function getDistrictSummary(studentsList) {
    const counts = {};
    (studentsList || []).forEach(s => {
      const d = s.district || "Unspecified";
      if (!counts[d]) {
        counts[d] = { total: 0, verified: 0 };
      }
      counts[d].total += 1;
      if (s.status === "Verified") {
        counts[d].verified += 1;
      }
    });

    return Object.keys(counts).sort().map(d => ({
      district: d,
      total: counts[d].total,
      verified: counts[d].verified
    }));
  }

  return {
    /**
     * Generate Public Representation PDF
     */
    generatePublicRepresentationPDF: function(studentsList) {
      if (!window.jspdf || !window.jspdf.jsPDF) {
        alert("PDF generator library (jsPDF) is loading, please try again in a moment.");
        return;
      }

      const { jsPDF } = window.jspdf;
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });

      const totalStudents = (studentsList || []).length;
      const verifiedStudents = (studentsList || []).filter(s => s.status === "Verified").length;
      const districtSummaries = getDistrictSummary(studentsList);
      const districtsCount = districtSummaries.length;

      // Header Color Bar
      doc.setFillColor(29, 78, 216);
      doc.rect(0, 0, 210, 10, "F");

      // Title & Subtitle
      doc.setTextColor(15, 23, 42);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(15);
      doc.text("TAMIL NADU STUDENT LAPTOP SCHEME", 105, 20, { align: "center" });

      doc.setFontSize(12);
      doc.setTextColor(29, 78, 216);
      doc.text("STUDENT REPRESENTATION PORTAL", 105, 26, { align: "center" });

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      doc.setTextColor(100, 116, 139);
      doc.text("Batches: 2020-2021, 2021-2022 & 2022-2023 | Tamil Nadu", 105, 32, { align: "center" });

      // KPI Metric Boxes
      const boxY = 40;
      const boxWidth = 52;
      const boxHeight = 16;

      doc.setFillColor(241, 245, 249);
      doc.roundedRect(20, boxY, boxWidth, boxHeight, 2, 2, "F");
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      doc.text("TOTAL REGISTERED", 20 + boxWidth / 2, boxY + 5, { align: "center" });
      doc.setFontSize(13);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(15, 23, 42);
      doc.text(totalStudents.toLocaleString("en-IN"), 20 + boxWidth / 2, boxY + 12.5, { align: "center" });

      doc.setFillColor(239, 246, 255);
      doc.roundedRect(79, boxY, boxWidth, boxHeight, 2, 2, "F");
      doc.setFontSize(7.5);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(29, 78, 216);
      doc.text("VERIFIED BY ADMIN", 79 + boxWidth / 2, boxY + 5, { align: "center" });
      doc.setFontSize(13);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(29, 78, 216);
      doc.text(verifiedStudents.toLocaleString("en-IN"), 79 + boxWidth / 2, boxY + 12.5, { align: "center" });

      doc.setFillColor(241, 245, 249);
      doc.roundedRect(138, boxY, boxWidth, boxHeight, 2, 2, "F");
      doc.setFontSize(7.5);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 116, 139);
      doc.text("DISTRICTS REPRESENTED", 138 + boxWidth / 2, boxY + 5, { align: "center" });
      doc.setFontSize(13);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(15, 23, 42);
      doc.text(districtsCount.toString(), 138 + boxWidth / 2, boxY + 12.5, { align: "center" });

      // District Summary AutoTable
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10.5);
      doc.setTextColor(30, 41, 59);
      doc.text("District-wise Summary", 20, 70);

      const districtTableRows = districtSummaries.map((item, idx) => [
        idx + 1,
        item.district,
        item.total,
        item.verified
      ]);

      let startStudentY = 75;

      if (typeof doc.autoTable === "function") {
        doc.autoTable({
          startY: 73,
          head: [["S.No", "District", "Total Registered", "Verified"]],
          body: districtTableRows,
          theme: "grid",
          headStyles: { fillColor: [30, 58, 138], textColor: 255, fontSize: 8 },
          bodyStyles: { fontSize: 8 },
          styles: { cellPadding: 1.6 },
          margin: { left: 20, right: 20 },
          pageBreak: "avoid"
        });

        startStudentY = doc.lastAutoTable.finalY + 8;
      }

      if (startStudentY > 215) {
        doc.addPage();
        startStudentY = 20;
      }

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10.5);
      doc.setTextColor(30, 41, 59);
      doc.text("Student Representation Summary", 20, startStudentY);

      const studentTableRows = (studentsList || []).map((item, idx) => [
        idx + 1,
        item.registrationId || "",
        item.name || "",
        item.school || "",
        item.district || "",
        item.passingYear || "2021-2022",
        item.status === "Verified" ? "Verified" : (item.status || "Submitted")
      ]);

      if (typeof doc.autoTable === "function") {
        doc.autoTable({
          startY: startStudentY + 3,
          head: [["S.No", "Reg ID", "Student Name", "School", "District", "Batch", "Status"]],
          body: studentTableRows,
          theme: "striped",
          headStyles: { fillColor: [29, 78, 216], textColor: 255, fontSize: 7.5 },
          bodyStyles: { fontSize: 7 },
          columnStyles: {
            0: { cellWidth: 8 },
            1: { cellWidth: 24 },
            2: { cellWidth: 28 },
            3: { cellWidth: 50 },
            4: { cellWidth: 22 },
            5: { cellWidth: 20 },
            6: { cellWidth: 18 }
          },
          margin: { left: 20, right: 20, bottom: 22 },
          didDrawPage: function(data) {
            const pageSize = doc.internal.pageSize;
            const pageHeight = pageSize.height ? pageSize.height : pageSize.getHeight();
            const pageWidth = pageSize.width ? pageSize.width : pageSize.getWidth();

            doc.setFillColor(248, 250, 252);
            doc.rect(0, pageHeight - 16, pageWidth, 16, "F");

            doc.setFont("helvetica", "normal");
            doc.setFontSize(7.5);
            doc.setTextColor(100, 116, 139);

            const websiteUrl = window.location.origin || "https://tn-laptop-portal.web.app";
            const footerInfo = "Tamil Nadu Student Laptop Scheme Portal | " + websiteUrl + " | Generated on: " + new Date().toLocaleDateString("en-IN");
            doc.text(footerInfo, pageWidth / 2, pageHeight - 6, { align: "center" });
          }
        });
      }

      doc.save("TamilNadu_Student_Laptop_Representation.pdf");
    },

    /**
     * Generate Detailed Confidential PDF for Admin Use
     */
    generateConfidentialAdminPDF: function(studentsList) {
      if (!window.jspdf || !window.jspdf.jsPDF) {
        alert("PDF generator library (jsPDF) is loading, please try again in a moment.");
        return;
      }

      const { jsPDF } = window.jspdf;
      const doc = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4"
      });

      doc.setFillColor(185, 28, 28);
      doc.rect(0, 0, 297, 8, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.setTextColor(185, 28, 28);
      doc.text("CONFIDENTIAL — ADMIN INTERNAL AUDIT REPORT", 148.5, 16, { align: "center" });

      doc.setFontSize(10.5);
      doc.setTextColor(15, 23, 42);
      doc.text("Tamil Nadu Student Laptop Scheme — Master Candidate Register", 148.5, 22, { align: "center" });

      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 116, 139);
      doc.text("Strict Data Privacy Controlled — Contains Student Personal & Contact Details — For Authorized Use Only", 148.5, 27, { align: "center" });

      const confidentialRows = (studentsList || []).map((s, idx) => [
        idx + 1,
        s.registrationId || "",
        s.name || "",
        s.mobile || "",
        s.email || "",
        s.school || "",
        s.district || "",
        s.passingYear || "2021-2022",
        s.schoolType || "",
        s.status || "Submitted",
        s.adminNotes || ""
      ]);

      if (typeof doc.autoTable === "function") {
        doc.autoTable({
          startY: 32,
          head: [["S.No", "Reg ID", "Name", "Mobile", "Email", "School Name", "District", "Batch", "School Type", "Status", "Admin Notes"]],
          body: confidentialRows,
          theme: "grid",
          headStyles: { fillColor: [15, 23, 42], textColor: 255, fontSize: 8 },
          bodyStyles: { fontSize: 7.5 },
          margin: { left: 10, right: 10, bottom: 15 }
        });
      }

      doc.save("CONFIDENTIAL_TamilNadu_Laptop_Master_Audit.pdf");
    }
  };
})();
