import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { FinancialMetrics, Transaction } from "@/hooks/useFinancialData";
import type { RegulationInsights } from "@/hooks/useRegulationInsights";

export interface ReportConfig {
  title: string;
  subtitle?: string;
  businessName?: string;
  dateRange?: string;
}

const formatCurrency = (amount: number): string => {
  return `NPR ${amount.toLocaleString("en-NP", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const formatDate = (date: Date): string => {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export const generateFinancialHealthReport = (
  metrics: FinancialMetrics,
  config: ReportConfig
): jsPDF => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header
  doc.setFillColor(26, 35, 126);
  doc.rect(0, 0, pageWidth, 45, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text(config.title, 20, 25);

  if (config.subtitle) {
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(config.subtitle, 20, 35);
  }

  // Report date
  doc.setTextColor(200, 200, 200);
  doc.setFontSize(10);
  doc.text(`Generated: ${formatDate(new Date())}`, pageWidth - 70, 25);

  if (config.businessName) {
    doc.text(config.businessName, pageWidth - 70, 35);
  }

  let yPos = 60;

  // Financial Overview Section
  doc.setTextColor(26, 35, 126);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Financial Overview", 20, yPos);
  yPos += 10;

  // Summary Cards
  const summaryData = [
    ["Total Revenue", formatCurrency(metrics.totalRevenue)],
    ["Total Expenses", formatCurrency(metrics.totalExpenses)],
    [
      "Net Profit/Loss",
      formatCurrency(metrics.totalRevenue - metrics.totalExpenses),
    ],
    ["VAT Collected", formatCurrency(metrics.vatCollected)],
    ["Documents Processed", metrics.documentCount.toString()],
    ["Avg Transaction Value", formatCurrency(metrics.averageTransactionValue)],
  ];

  autoTable(doc, {
    startY: yPos,
    head: [["Metric", "Value"]],
    body: summaryData,
    theme: "striped",
    headStyles: { fillColor: [26, 35, 126], textColor: 255 },
    styles: { fontSize: 11, cellPadding: 5 },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 80 },
      1: { halign: "right" },
    },
  });

  yPos = (doc as any).lastAutoTable.finalY + 20;

  // Financial Health Score
  doc.setTextColor(26, 35, 126);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Financial Health Score", 20, yPos);
  yPos += 10;

  const scoreColor =
    metrics.financialHealthScore >= 70
      ? [34, 197, 94]
      : metrics.financialHealthScore >= 40
      ? [234, 179, 8]
      : [239, 68, 68];

  doc.setFillColor(scoreColor[0], scoreColor[1], scoreColor[2]);
  doc.roundedRect(20, yPos, 60, 30, 3, 3, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text(`${metrics.financialHealthScore}`, 35, yPos + 20);
  doc.setFontSize(12);
  doc.text("/100", 55, yPos + 20);

  const healthStatus =
    metrics.financialHealthScore >= 70
      ? "Excellent"
      : metrics.financialHealthScore >= 40
      ? "Good"
      : "Needs Attention";
  doc.setTextColor(80, 80, 80);
  doc.setFontSize(12);
  doc.text(`Status: ${healthStatus}`, 90, yPos + 18);

  yPos += 45;

  // Monthly Breakdown
  if (metrics.monthlyData.length > 0) {
    doc.setTextColor(26, 35, 126);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Monthly Breakdown", 20, yPos);
    yPos += 10;

    const monthlyTableData = metrics.monthlyData.map((m) => [
      m.month,
      formatCurrency(m.income),
      formatCurrency(m.expenses),
      formatCurrency(m.income - m.expenses),
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [["Month", "Income", "Expenses", "Net"]],
      body: monthlyTableData,
      theme: "striped",
      headStyles: { fillColor: [26, 35, 126], textColor: 255 },
      styles: { fontSize: 10, cellPadding: 4 },
      columnStyles: {
        1: { halign: "right" },
        2: { halign: "right" },
        3: { halign: "right" },
      },
    });

    yPos = (doc as any).lastAutoTable.finalY + 20;
  }

  // Expense Categories
  if (metrics.expenseCategories.length > 0 && yPos < 220) {
    doc.setTextColor(26, 35, 126);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Expense Categories", 20, yPos);
    yPos += 10;

    const expenseTableData = metrics.expenseCategories.map((c) => [
      c.name,
      formatCurrency(c.amount),
      `${((c.amount / metrics.totalExpenses) * 100).toFixed(1)}%`,
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [["Category", "Amount", "Percentage"]],
      body: expenseTableData,
      theme: "striped",
      headStyles: { fillColor: [26, 35, 126], textColor: 255 },
      styles: { fontSize: 10, cellPadding: 4 },
      columnStyles: {
        1: { halign: "right" },
        2: { halign: "right" },
      },
    });
  }

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(
      `Page ${i} of ${pageCount} | Generated by Arthiq - Financial Management Platform`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: "center" }
    );
  }

  return doc;
};

export const generateVATReport = (
  metrics: FinancialMetrics,
  config: ReportConfig
): jsPDF => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header
  doc.setFillColor(26, 35, 126);
  doc.rect(0, 0, pageWidth, 45, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("VAT Return Summary", 20, 25);

  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text(config.dateRange || "Current Period", 20, 35);

  doc.setTextColor(200, 200, 200);
  doc.setFontSize(10);
  doc.text(`Generated: ${formatDate(new Date())}`, pageWidth - 70, 25);

  let yPos = 60;

  // VAT Summary
  doc.setTextColor(26, 35, 126);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("VAT Summary", 20, yPos);
  yPos += 10;

  const vatRate = 0.13; // Nepal VAT rate
  const outputVAT = metrics.totalRevenue * vatRate;
  const inputVAT = metrics.totalExpenses * vatRate;
  const netVAT = outputVAT - inputVAT;

  const vatData = [
    ["Total Sales (Taxable)", formatCurrency(metrics.totalRevenue)],
    ["Output VAT (13%)", formatCurrency(outputVAT)],
    ["Total Purchases (Taxable)", formatCurrency(metrics.totalExpenses)],
    ["Input VAT (13%)", formatCurrency(inputVAT)],
    ["Net VAT Payable", formatCurrency(netVAT > 0 ? netVAT : 0)],
    ["VAT Refund Due", formatCurrency(netVAT < 0 ? Math.abs(netVAT) : 0)],
  ];

  autoTable(doc, {
    startY: yPos,
    head: [["Description", "Amount (NPR)"]],
    body: vatData,
    theme: "striped",
    headStyles: { fillColor: [26, 35, 126], textColor: 255 },
    styles: { fontSize: 11, cellPadding: 5 },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 100 },
      1: { halign: "right" },
    },
  });

  yPos = (doc as any).lastAutoTable.finalY + 30;

  // Disclaimer
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text(
    "This is a summary report. Please verify with your accountant before filing.",
    20,
    yPos
  );
  doc.text("VAT rate applied: 13% (Nepal Standard Rate)", 20, yPos + 10);

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  doc.text(
    "Generated by Arthiq - Financial Management Platform",
    pageWidth / 2,
    doc.internal.pageSize.getHeight() - 10,
    { align: "center" }
  );

  return doc;
};

export const generateLoanApplicationReport = (
  metrics: FinancialMetrics,
  config: ReportConfig
): jsPDF => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header
  doc.setFillColor(26, 35, 126);
  doc.rect(0, 0, pageWidth, 50, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("Loan Application Summary", 20, 25);
  doc.setFontSize(14);
  doc.text("Financial Statement for Banking Purposes", 20, 38);

  doc.setTextColor(200, 200, 200);
  doc.setFontSize(10);
  doc.text(`Date: ${formatDate(new Date())}`, pageWidth - 60, 25);
  if (config.businessName) {
    doc.text(config.businessName, pageWidth - 60, 35);
  }

  let yPos = 65;

  // Business Financial Summary
  doc.setTextColor(26, 35, 126);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Business Financial Summary", 20, yPos);
  yPos += 10;

  const profitMargin =
    metrics.totalRevenue > 0
      ? (
          ((metrics.totalRevenue - metrics.totalExpenses) /
            metrics.totalRevenue) *
          100
        ).toFixed(1)
      : "0.0";

  const summaryData = [
    ["Gross Revenue", formatCurrency(metrics.totalRevenue)],
    ["Operating Expenses", formatCurrency(metrics.totalExpenses)],
    [
      "Net Profit",
      formatCurrency(metrics.totalRevenue - metrics.totalExpenses),
    ],
    ["Profit Margin", `${profitMargin}%`],
    ["Financial Health Score", `${metrics.financialHealthScore}/100`],
    [
      "Average Transaction Value",
      formatCurrency(metrics.averageTransactionValue),
    ],
  ];

  autoTable(doc, {
    startY: yPos,
    head: [["Metric", "Value"]],
    body: summaryData,
    theme: "grid",
    headStyles: { fillColor: [26, 35, 126], textColor: 255 },
    styles: { fontSize: 11, cellPadding: 6 },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 90 },
      1: { halign: "right" },
    },
  });

  yPos = (doc as any).lastAutoTable.finalY + 20;

  // Cash Flow Analysis
  if (metrics.monthlyData.length > 0) {
    doc.setTextColor(26, 35, 126);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Cash Flow Analysis", 20, yPos);
    yPos += 10;

    const cashFlowData = metrics.monthlyData
      .slice(-6)
      .map((m) => [
        m.month,
        formatCurrency(m.income),
        formatCurrency(m.expenses),
        formatCurrency(m.income - m.expenses),
      ]);

    autoTable(doc, {
      startY: yPos,
      head: [["Period", "Inflow", "Outflow", "Net Cash Flow"]],
      body: cashFlowData,
      theme: "grid",
      headStyles: { fillColor: [26, 35, 126], textColor: 255 },
      styles: { fontSize: 10, cellPadding: 4 },
      columnStyles: {
        1: { halign: "right" },
        2: { halign: "right" },
        3: { halign: "right" },
      },
    });

    yPos = (doc as any).lastAutoTable.finalY + 20;
  }

  // Document Verification
  doc.setTextColor(26, 35, 126);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Document Verification", 20, yPos);
  yPos += 10;

  doc.setTextColor(80, 80, 80);
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text(`Total Documents Processed: ${metrics.documentCount}`, 20, yPos);
  yPos += 8;
  doc.text(
    "Data extracted and verified using AI-powered document analysis.",
    20,
    yPos
  );

  // Certification Box
  yPos += 20;
  doc.setDrawColor(26, 35, 126);
  doc.setLineWidth(0.5);
  doc.rect(20, yPos, pageWidth - 40, 40);

  doc.setFontSize(10);
  doc.setTextColor(80, 80, 80);
  doc.text("CERTIFICATION", 25, yPos + 10);
  doc.setFontSize(9);
  doc.text(
    "This document has been generated based on actual financial records uploaded to",
    25,
    yPos + 20
  );
  doc.text(
    "the Arthiq platform. The data accuracy depends on the quality of source documents.",
    25,
    yPos + 28
  );

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  doc.text(
    "Generated by Arthiq - Financial Management Platform | For Banking Purposes",
    pageWidth / 2,
    doc.internal.pageSize.getHeight() - 10,
    { align: "center" }
  );

  return doc;
};

export const generateTransactionReport = (
  transactions: Transaction[],
  config: ReportConfig
): jsPDF => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header
  doc.setFillColor(26, 35, 126);
  doc.rect(0, 0, pageWidth, 45, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("Transaction Report", 20, 25);

  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text(config.dateRange || "All Transactions", 20, 35);

  doc.setTextColor(200, 200, 200);
  doc.setFontSize(10);
  doc.text(`Generated: ${formatDate(new Date())}`, pageWidth - 70, 25);

  let yPos = 55;

  // Transactions Table
  const transactionData = transactions
    .slice(0, 50)
    .map((t) => [
      t.date,
      t.description.substring(0, 30) + (t.description.length > 30 ? "..." : ""),
      t.type === "income" ? formatCurrency(t.amount) : "-",
      t.type === "expense" ? formatCurrency(t.amount) : "-",
      t.category || "-",
    ]);

  autoTable(doc, {
    startY: yPos,
    head: [["Date", "Description", "Income", "Expense", "Category"]],
    body: transactionData,
    theme: "striped",
    headStyles: { fillColor: [26, 35, 126], textColor: 255 },
    styles: { fontSize: 9, cellPadding: 3 },
    columnStyles: {
      0: { cellWidth: 25 },
      1: { cellWidth: 60 },
      2: { halign: "right", cellWidth: 30 },
      3: { halign: "right", cellWidth: 30 },
      4: { cellWidth: 35 },
    },
  });

  // Summary
  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  yPos = (doc as any).lastAutoTable.finalY + 15;

  doc.setFontSize(11);
  doc.setTextColor(26, 35, 126);
  doc.setFont("helvetica", "bold");
  doc.text(`Total Income: ${formatCurrency(totalIncome)}`, 20, yPos);
  doc.text(`Total Expenses: ${formatCurrency(totalExpense)}`, 100, yPos);
  doc.text(
    `Net: ${formatCurrency(totalIncome - totalExpense)}`,
    pageWidth - 60,
    yPos
  );

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(
      `Page ${i} of ${pageCount} | Generated by Arthiq`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: "center" }
    );
  }

  return doc;
};

export const generateComplianceReport = (
  insights: RegulationInsights,
  config: ReportConfig
): jsPDF => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header
  doc.setFillColor(26, 35, 126);
  doc.rect(0, 0, pageWidth, 50, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("Compliance Report", 20, 25);
  doc.setFontSize(12);
  doc.text("Nepal Regulatory Assessment", 20, 38);

  doc.setTextColor(200, 200, 200);
  doc.setFontSize(10);
  doc.text(`Generated: ${formatDate(new Date())}`, pageWidth - 70, 25);
  if (config.businessName) {
    doc.text(config.businessName, pageWidth - 70, 35);
  }

  let yPos = 65;

  // Compliance Score Section
  doc.setTextColor(26, 35, 126);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Compliance Overview", 20, yPos);
  yPos += 15;

  const scoreColor =
    insights.summary.complianceScore >= 70
      ? [34, 197, 94]
      : insights.summary.complianceScore >= 40
      ? [234, 179, 8]
      : [239, 68, 68];

  doc.setFillColor(scoreColor[0], scoreColor[1], scoreColor[2]);
  doc.roundedRect(20, yPos, 60, 30, 3, 3, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text(`${insights.summary.complianceScore}`, 35, yPos + 20);
  doc.setFontSize(12);
  doc.text("/100", 55, yPos + 20);

  doc.setTextColor(80, 80, 80);
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  const riskLabel = `Risk Level: ${insights.summary.riskLevel.toUpperCase()}`;
  doc.text(riskLabel, 90, yPos + 12);

  doc.setFontSize(9);
  const assessmentLines = doc.splitTextToSize(
    insights.summary.overallAssessment,
    90
  );
  doc.text(assessmentLines.slice(0, 2), 90, yPos + 22);

  yPos += 45;

  // Tax Obligations
  if (insights.taxObligations.length > 0) {
    doc.setTextColor(26, 35, 126);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Tax Obligations Status", 20, yPos);
    yPos += 8;

    const taxData = insights.taxObligations.map((tax) => [
      tax.type,
      tax.status.replace("_", " ").toUpperCase(),
      tax.description.substring(0, 40) +
        (tax.description.length > 40 ? "..." : ""),
      tax.deadline || "N/A",
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [["Tax Type", "Status", "Description", "Deadline"]],
      body: taxData,
      theme: "striped",
      headStyles: { fillColor: [26, 35, 126], textColor: 255, fontSize: 9 },
      styles: { fontSize: 8, cellPadding: 3 },
      columnStyles: {
        0: { cellWidth: 25 },
        1: { cellWidth: 25 },
        2: { cellWidth: 80 },
        3: { cellWidth: 30 },
      },
    });

    yPos = (doc as any).lastAutoTable.finalY + 15;
  }

  // Risks Section
  if (insights.risks.length > 0 && yPos < 200) {
    doc.setTextColor(26, 35, 126);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Identified Risks", 20, yPos);
    yPos += 8;

    const riskData = insights.risks.map((risk) => [
      risk.severity.toUpperCase(),
      risk.title,
      risk.recommendation.substring(0, 50) +
        (risk.recommendation.length > 50 ? "..." : ""),
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [["Severity", "Risk", "Recommendation"]],
      body: riskData,
      theme: "striped",
      headStyles: { fillColor: [26, 35, 126], textColor: 255, fontSize: 9 },
      styles: { fontSize: 8, cellPadding: 3 },
      didParseCell: function (data) {
        if (data.section === "body" && data.column.index === 0) {
          const severity = data.cell.raw as string;
          if (severity === "CRITICAL" || severity === "HIGH") {
            data.cell.styles.textColor = [239, 68, 68];
            data.cell.styles.fontStyle = "bold";
          } else if (severity === "MEDIUM") {
            data.cell.styles.textColor = [234, 179, 8];
          }
        }
      },
    });

    yPos = (doc as any).lastAutoTable.finalY + 15;
  }

  // New page for remaining sections if needed
  if (yPos > 220) {
    doc.addPage();
    yPos = 20;
  }

  // Missing Documents
  if (insights.missingDocuments.length > 0) {
    doc.setTextColor(26, 35, 126);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Missing Documents", 20, yPos);
    yPos += 8;

    const missingData = insights.missingDocuments.map((doc) => [
      doc.documentType,
      doc.importance.toUpperCase(),
      doc.reason.substring(0, 50) + (doc.reason.length > 50 ? "..." : ""),
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [["Document", "Importance", "Why Needed"]],
      body: missingData,
      theme: "striped",
      headStyles: { fillColor: [26, 35, 126], textColor: 255, fontSize: 9 },
      styles: { fontSize: 8, cellPadding: 3 },
    });

    yPos = (doc as any).lastAutoTable.finalY + 15;
  }

  // Recommendations
  if (insights.recommendations.length > 0 && yPos < 220) {
    doc.setTextColor(26, 35, 126);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Recommendations", 20, yPos);
    yPos += 8;

    const recData = insights.recommendations
      .slice(0, 5)
      .map((rec) => [
        rec.priority.replace("_", " ").toUpperCase(),
        rec.title,
        rec.expectedBenefit.substring(0, 40) +
          (rec.expectedBenefit.length > 40 ? "..." : ""),
      ]);

    autoTable(doc, {
      startY: yPos,
      head: [["Priority", "Action", "Expected Benefit"]],
      body: recData,
      theme: "striped",
      headStyles: { fillColor: [26, 35, 126], textColor: 255, fontSize: 9 },
      styles: { fontSize: 8, cellPadding: 3 },
    });

    yPos = (doc as any).lastAutoTable.finalY + 15;
  }

  // Threshold Alerts
  if (insights.thresholdAlerts.length > 0 && yPos < 240) {
    doc.setTextColor(26, 35, 126);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Threshold Alerts", 20, yPos);
    yPos += 8;

    const alertData = insights.thresholdAlerts.map((alert) => [
      alert.threshold,
      alert.currentValue,
      alert.thresholdValue,
      alert.status.toUpperCase(),
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [["Threshold", "Current", "Limit", "Status"]],
      body: alertData,
      theme: "striped",
      headStyles: { fillColor: [26, 35, 126], textColor: 255, fontSize: 9 },
      styles: { fontSize: 8, cellPadding: 3 },
    });
  }

  // Disclaimer
  const lastPage = doc.getNumberOfPages();
  doc.setPage(lastPage);
  const pageHeight = doc.internal.pageSize.getHeight();

  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text(
    "DISCLAIMER: This report is for informational purposes only and does not constitute legal or tax advice.",
    20,
    pageHeight - 25
  );
  doc.text(
    "Please consult with a qualified accountant or tax professional for compliance verification.",
    20,
    pageHeight - 18
  );

  // Footer on all pages
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(
      `Page ${i} of ${pageCount} | Generated by Arthiq - Nepal Compliance Report`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: "center" }
    );
  }

  return doc;
};

export const downloadPDF = (doc: jsPDF, filename: string): void => {
  doc.save(`${filename}.pdf`);
};
