import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { Student, DownloadFormat } from '@/types';

export const downloadStudentReport = (student: Student, format: DownloadFormat, semester?: number | 'all') => {
  if (format === 'pdf') {
    generatePDF(student, semester);
  } else {
    generateExcel(student, semester);
  }
};

export const downloadBulkReports = (students: Student[], format: DownloadFormat) => {
  if (format === 'pdf') {
    students.forEach(student => generatePDF(student, 'all'));
  } else {
    generateBulkExcel(students);
  }
};

const generatePDF = (student: Student, semester: number | 'all' = 'all') => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const resultsToInclude = semester === 'all'
    ? student.results.filter(r => r.isPublished)
    : student.results.filter(r => r.semester === semester && r.isPublished);

  if (resultsToInclude.length === 0) return;

  // Header Background
  doc.setFillColor(30, 58, 95);
  doc.rect(0, 0, pageWidth, 45, 'F');

  // App Title/Logo Text
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('EduTrack Student Hub', pageWidth / 2, 15, { align: 'center' });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Excellence in Education Management', pageWidth / 2, 22, { align: 'center' });

  // College Name & Address
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(student.collegeName.toUpperCase(), pageWidth / 2, 32, { align: 'center' });

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('City Campus, Educational District, Tamil Nadu - 600001', pageWidth / 2, 38, { align: 'center' });

  // Document Title
  doc.setFillColor(240, 240, 240);
  doc.rect(14, 50, pageWidth - 28, 10, 'F');
  doc.setTextColor(30, 58, 95);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  const docTitle = semester === 'all' ? 'CONSOLIDATED GRADE SHEET' : `SEMESTER ${semester} RESULT CARD`;
  doc.text(docTitle, pageWidth / 2, 56.5, { align: 'center' });

  // Student Info Section
  doc.setTextColor(30, 58, 95);
  doc.setFontSize(11);
  doc.text('STUDENT INFORMATION', 14, 72);
  doc.setDrawColor(30, 58, 95);
  doc.setLineWidth(0.5);
  doc.line(14, 74, 55, 74);

  doc.setTextColor(60, 60, 60);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');

  const topY = 82;
  const col1 = 14;
  const col2 = 60;
  const col3 = 110;
  const col4 = 155;

  const drawInfoRow = (y: number, label1: string, val1: string, label2: string, val2: string) => {
    doc.setFont('helvetica', 'bold');
    doc.text(label1, col1, y);
    doc.setFont('helvetica', 'normal');
    doc.text(val1, col2, y);
    doc.setFont('helvetica', 'bold');
    doc.text(label2, col3, y);
    doc.setFont('helvetica', 'normal');
    doc.text(val2, col4, y);
  };

  drawInfoRow(topY, 'Student Name:', student.name, 'Roll Number:', student.rollNumber);
  drawInfoRow(topY + 8, 'Course Name:', student.course, 'Admission No:', student.admissionNumber);
  drawInfoRow(topY + 16, 'Department:', student.course.split(' ')[0], 'Academic Year:', '2023-24');
  drawInfoRow(topY + 24, 'Semester:', semester === 'all' ? 'Consolidated' : semester.toString(), 'Issue Date:', new Date().toLocaleDateString());

  let yPos = topY + 35;

  // Results
  resultsToInclude.forEach((result, idx) => {
    if (idx > 0 && yPos > pageHeight - 100) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 58, 95);
    doc.text(`Academic Records - Semester ${result.semester}`, 14, yPos);

    yPos += 5;

    const tableData = result.subjects.map(sub => [
      sub.code,
      sub.name,
      '100', // Max Marks
      sub.totalMarks.toString(),
      sub.grade,
      sub.credits.toString(),
      sub.gradePoints.toString()
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [['Code', 'Subject Name', 'Max', 'Obtained', 'Grade', 'Credits', 'Points']],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: [30, 58, 95],
        textColor: [255, 255, 255],
        fontSize: 9,
        halign: 'center'
      },
      bodyStyles: {
        fontSize: 8,
        textColor: [50, 50, 50]
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 20 },
        1: { cellWidth: 60 },
        2: { halign: 'center', cellWidth: 15 },
        3: { halign: 'center', cellWidth: 20 },
        4: { halign: 'center', cellWidth: 15 },
        5: { halign: 'center', cellWidth: 15 },
        6: { halign: 'center', cellWidth: 15 },
      },
    });

    yPos = (doc as any).lastAutoTable.finalY + 10;

    // Semester Summary
    doc.setFillColor(245, 245, 245);
    doc.rect(14, yPos, pageWidth - 28, 25, 'F');
    doc.setDrawColor(220, 220, 220);
    doc.rect(14, yPos, pageWidth - 28, 25, 'S');

    doc.setFontSize(9);
    doc.setTextColor(30, 58, 95);
    doc.setFont('helvetica', 'bold');

    const totalMarks = result.subjects.reduce((s, b) => s + b.totalMarks, 0);
    const maxPossible = result.subjects.length * 100;
    const percentage = (totalMarks / maxPossible) * 100;

    doc.text(`TOTAL MARKS: ${totalMarks} / ${maxPossible}`, 20, yPos + 8);
    doc.text(`PERCENTAGE: ${percentage.toFixed(2)}%`, 20, yPos + 18);

    doc.text(`SGPA: ${result.sgpa.toFixed(2)}`, 100, yPos + 8);
    doc.text(`CGPA: ${result.cgpa.toFixed(2)}`, 100, yPos + 18);

    doc.setFontSize(11);
    doc.text('STATUS:', 150, yPos + 13);
    const statusColor = result.status === 'pass' ? [16, 185, 129] : [239, 68, 68];
    doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
    doc.text(result.status.toUpperCase(), 170, yPos + 13);

    yPos += 35;
  });

  // Footer
  const footerY = pageHeight - 20;
  doc.setDrawColor(200, 200, 200);
  doc.line(14, footerY - 5, pageWidth - 14, footerY - 5);

  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  doc.setFont('helvetica', 'italic');
  doc.text('This is a computer-generated document, no signature required.', pageWidth / 2, footerY, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.text(`Report ID: TR-${student.id.slice(0, 8)}-${semester}`, 14, footerY + 5);
  doc.text(`Generated on: ${new Date().toLocaleString()}`, pageWidth - 14, footerY + 5, { align: 'right' });

  const fileName = semester === 'all'
    ? `${student.name.replace(/\s+/g, '_')}_Consolidated_Report.pdf`
    : `${student.name.replace(/\s+/g, '_')}_Sem_${semester}_Report.pdf`;

  doc.save(fileName);
};

const generateExcel = (student: Student, semester: number | 'all' = 'all') => {
  const workbook = XLSX.utils.book_new();

  const resultsToInclude = semester === 'all'
    ? student.results.filter(r => r.isPublished)
    : student.results.filter(r => r.semester === semester && r.isPublished);

  if (resultsToInclude.length === 0) return;

  // Student Info Summary
  const infoData = [
    ['EduTrack - Student Academic Report'],
    ['College:', student.collegeName],
    ['Report Type:', semester === 'all' ? 'Consolidated' : `Semester ${semester}`],
    [],
    ['Roll Number', student.rollNumber],
    ['Student Name', student.name],
    ['Course', student.course],
    ['Academic Year', '2023-24'],
    [],
  ];

  const infoSheet = XLSX.utils.aoa_to_sheet(infoData);
  XLSX.utils.book_append_sheet(workbook, infoSheet, 'Summary');

  // Results Sheet
  resultsToInclude.forEach(result => {
    const resultData = [
      [`SEMESTER ${result.semester} GRADE SHEET`],
      [],
      ['SGPA', result.sgpa.toFixed(2), 'CGPA', result.cgpa.toFixed(2), 'Status', result.status.toUpperCase()],
      [],
      ['Code', 'Subject Name', 'Max Marks', 'Obtained Marks', 'Credits', 'Grade', 'Grade Points'],
      ...result.subjects.map(sub => [
        sub.code,
        sub.name,
        100,
        sub.totalMarks,
        sub.credits,
        sub.grade,
        sub.gradePoints,
      ]),
      [],
      ['Total Obtained', result.subjects.reduce((s, b) => s + b.totalMarks, 0)],
      ['Total Max', result.subjects.length * 100],
    ];

    const resultSheet = XLSX.utils.aoa_to_sheet(resultData);

    // Set column widths
    resultSheet['!cols'] = [
      { wch: 15 },
      { wch: 35 },
      { wch: 12 },
      { wch: 15 },
      { wch: 10 },
      { wch: 10 },
      { wch: 12 },
    ];

    XLSX.utils.book_append_sheet(workbook, resultSheet, `Semester ${result.semester}`);
  });

  const fileName = semester === 'all'
    ? `${student.name.replace(/\s+/g, '_')}_Consolidated_Report.xlsx`
    : `${student.name.replace(/\s+/g, '_')}_Sem_${semester}_Report.xlsx`;

  XLSX.writeFile(workbook, fileName);
};

const generateBulkExcel = (students: Student[]) => {
  const workbook = XLSX.utils.book_new();

  // Summary Sheet
  const summaryData = [
    ['EduTrack - Bulk Student Report'],
    [`Generated: ${new Date().toLocaleDateString('en-IN')}`],
    [],
    ['Roll Number', 'Name', 'Course', 'Semester', 'Latest CGPA', 'Status'],
    ...students.map(s => {
      const latestResult = s.results[s.results.length - 1];
      return [
        s.rollNumber,
        s.name,
        s.course,
        s.semester,
        latestResult?.cgpa.toFixed(2) || 'N/A',
        latestResult?.status.toUpperCase() || 'N/A',
      ];
    }),
  ];

  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

  // Individual sheets for each student
  students.forEach(student => {
    const latestResult = student.results[student.results.length - 1];
    if (latestResult) {
      const studentData = [
        [student.name],
        ['Roll Number', student.rollNumber],
        ['Course', student.course],
        [],
        ['Code', 'Subject', 'Credits', 'Internal', 'External', 'Total', 'Grade'],
        ...latestResult.subjects.map(sub => [
          sub.code,
          sub.name,
          sub.credits,
          sub.internalMarks,
          sub.externalMarks,
          sub.totalMarks,
          sub.grade,
        ]),
        [],
        ['SGPA', latestResult.sgpa.toFixed(2)],
        ['CGPA', latestResult.cgpa.toFixed(2)],
      ];

      const studentSheet = XLSX.utils.aoa_to_sheet(studentData);
      XLSX.utils.book_append_sheet(workbook, studentSheet, student.rollNumber.slice(0, 31));
    }
  });

  XLSX.writeFile(workbook, `Bulk_Student_Reports_${new Date().toISOString().split('T')[0]}.xlsx`);
};
