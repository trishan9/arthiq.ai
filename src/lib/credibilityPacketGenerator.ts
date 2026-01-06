import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { CredibilityScore } from "@/hooks/use-credibility-score";
import type { FinancialMetrics } from "@/hooks/useFinancialData";

export interface CredibilityPacketConfig {
  businessName: string;
  businessType?: string;
  registrationNumber?: string;
  lenderName: string;
  requestType: "loan" | "partnership";
  requestedAmount?: number;
  packetId: string;
  generatedAt: Date;
}

const formatCurrency = (amount: number): string => {
  return `NPR ${amount.toLocaleString("en-NP", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
};

const formatDate = (date: Date): string => {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const getScoreColor = (score: number): [number, number, number] => {
  if (score >= 80) return [16, 185, 129]; // Emerald
  if (score >= 60) return [59, 130, 246]; // Blue
  if (score >= 40) return [245, 158, 11]; // Amber
  return [239, 68, 68]; // Red
};

const getTierLabel = (tier: number): string => {
  const labels = [
    "Self-Declared",
    "Document-Backed",
    "Bank-Supported",
    "Verified",
  ];
  return labels[tier] || "Unknown";
};

const getVerificationStrengthLabel = (strength: string): string => {
  const labels: Record<string, string> = {
    weak: "Low Confidence",
    moderate: "Moderate Confidence",
    strong: "High Confidence",
    verified: "Fully Verified",
  };
  return labels[strength] || "Unknown";
};

export const generateCredibilityPacket = (
  credibilityScore: CredibilityScore,
  metrics: FinancialMetrics,
  config: CredibilityPacketConfig
): jsPDF => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // === PAGE 1: Cover & Overview ===

  // Header with gradient effect
  doc.setFillColor(15, 23, 42); // Slate 900
  doc.rect(0, 0, pageWidth, 70, "F");

  // Accent line
  const scoreColor = getScoreColor(credibilityScore.totalScore);
  doc.setFillColor(scoreColor[0], scoreColor[1], scoreColor[2]);
  doc.rect(0, 70, pageWidth, 4, "F");

  // Logo/Brand
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(28);
  doc.setFont("helvetica", "bold");
  doc.text("CREDIBILITY PACKET", 20, 30);

  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(148, 163, 184); // Slate 400
  doc.text("Verified Financial Credibility Report", 20, 42);

  // Packet ID and Date
  doc.setFontSize(9);
  doc.text(`Packet ID: ${config.packetId}`, pageWidth - 70, 25);
  doc.text(`Generated: ${formatDate(config.generatedAt)}`, pageWidth - 70, 35);
  doc.text(`Valid for: 30 days`, pageWidth - 70, 45);

  // Business Info Section
  let yPos = 90;

  doc.setFillColor(248, 250, 252); // Slate 50
  doc.rect(15, yPos - 5, pageWidth - 30, 45, "F");

  doc.setTextColor(30, 41, 59); // Slate 800
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("BUSINESS INFORMATION", 20, yPos + 5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(71, 85, 105); // Slate 600
  doc.text(`Business Name: ${config.businessName}`, 20, yPos + 18);
  doc.text(
    `Business Type: ${config.businessType || "Not specified"}`,
    20,
    yPos + 28
  );
  doc.text(
    `Registration: ${config.registrationNumber || "Not provided"}`,
    120,
    yPos + 18
  );
  doc.text(
    `Request Type: ${
      config.requestType.charAt(0).toUpperCase() + config.requestType.slice(1)
    }`,
    120,
    yPos + 28
  );
  if (config.requestedAmount) {
    doc.text(
      `Requested Amount: ${formatCurrency(config.requestedAmount)}`,
      20,
      yPos + 38
    );
  }

  yPos += 55;

  // Credibility Score Hero Section
  doc.setFillColor(scoreColor[0], scoreColor[1], scoreColor[2]);
  doc.roundedRect(15, yPos, 80, 60, 4, 4, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(48);
  doc.setFont("helvetica", "bold");
  doc.text(`${credibilityScore.totalScore}`, 35, yPos + 40);
  doc.setFontSize(14);
  doc.text("/100", 70, yPos + 40);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("CREDIBILITY SCORE", 25, yPos + 52);

  // Trust Tier & Confidence
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Trust Tier", 110, yPos + 15);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(16);
  doc.text(
    `Tier ${credibilityScore.trustTier.tier}: ${getTierLabel(
      credibilityScore.trustTier.tier
    )}`,
    110,
    yPos + 28
  );

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Verification Strength", 110, yPos + 45);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(14);
  doc.text(
    getVerificationStrengthLabel(
      credibilityScore.trustTier.verificationStrength
    ),
    110,
    yPos + 56
  );

  yPos += 75;

  // Score Breakdown Cards
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Score Breakdown", 20, yPos);
  yPos += 10;

  const scores = [
    {
      label: "Evidence Quality",
      score: credibilityScore.evidenceQuality.score,
      desc: "Document verification & data quality",
    },
    {
      label: "Financial Stability",
      score: credibilityScore.stabilityGrowth.score,
      desc: "Revenue consistency & growth trends",
    },
    {
      label: "Compliance Readiness",
      score: credibilityScore.complianceReadiness.score,
      desc: "Regulatory alignment & risk indicators",
    },
  ];

  const cardWidth = (pageWidth - 50) / 3;
  scores.forEach((item, index) => {
    const x = 20 + index * (cardWidth + 5);
    const color = getScoreColor(item.score);

    doc.setFillColor(248, 250, 252);
    doc.roundedRect(x, yPos, cardWidth, 50, 3, 3, "F");

    doc.setFillColor(color[0], color[1], color[2]);
    doc.roundedRect(x, yPos, cardWidth, 6, 3, 3, "F");
    doc.rect(x, yPos + 3, cardWidth, 3, "F"); // Square bottom

    doc.setTextColor(30, 41, 59);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text(item.label, x + 5, yPos + 18);

    doc.setFontSize(20);
    doc.text(`${Math.round(item.score)}%`, x + 5, yPos + 35);

    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139);
    doc.text(item.desc, x + 5, yPos + 45, { maxWidth: cardWidth - 10 });
  });

  yPos += 60;

  // Anti-Fraud Summary
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Anti-Fraud Analysis", 20, yPos);
  yPos += 8;

  const criticalAnomalies = credibilityScore.anomalies.filter(
    (a) => a.severity === "critical"
  ).length;
  const highAnomalies = credibilityScore.anomalies.filter(
    (a) => a.severity === "high"
  ).length;
  const mediumAnomalies = credibilityScore.anomalies.filter(
    (a) => a.severity === "medium"
  ).length;

  const antifraudColor =
    criticalAnomalies > 0
      ? [239, 68, 68]
      : highAnomalies > 0
      ? [245, 158, 11]
      : [16, 185, 129];

  doc.setFillColor(
    antifraudColor[0],
    antifraudColor[1],
    antifraudColor[2],
    0.1
  );
  doc.setDrawColor(antifraudColor[0], antifraudColor[1], antifraudColor[2]);
  doc.setLineWidth(0.5);
  doc.roundedRect(15, yPos, pageWidth - 30, 30, 3, 3, "FD");

  doc.setTextColor(antifraudColor[0], antifraudColor[1], antifraudColor[2]);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");

  if (criticalAnomalies === 0 && highAnomalies === 0) {
    doc.text("✓ No Critical Issues Detected", 25, yPos + 12);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(71, 85, 105);
    doc.text(
      `Anti-Fraud Score: ${credibilityScore.trustTier.antifraudScore}/100 | ${mediumAnomalies} minor flags`,
      25,
      yPos + 23
    );
  } else {
    doc.text(
      `⚠ ${criticalAnomalies} Critical, ${highAnomalies} High Priority Issues`,
      25,
      yPos + 12
    );
    doc.setFont("helvetica", "normal");
    doc.setTextColor(71, 85, 105);
    doc.text(
      `Anti-Fraud Score: ${credibilityScore.trustTier.antifraudScore}/100 - Review recommended`,
      25,
      yPos + 23
    );
  }

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text(
    `Page 1 of 3 | Arthiq.ai Credibility Packet | Prepared for: ${config.lenderName}`,
    pageWidth / 2,
    pageHeight - 10,
    { align: "center" }
  );

  // === PAGE 2: Financial Details ===
  doc.addPage();

  // Header
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, pageWidth, 35, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Financial Performance Details", 20, 23);
  doc.setFontSize(9);
  doc.setTextColor(148, 163, 184);
  doc.text(config.businessName, pageWidth - 60, 23);

  yPos = 50;

  // Financial Summary Table
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Financial Summary", 20, yPos);
  yPos += 8;

  const profitMargin =
    metrics.totalRevenue > 0
      ? ((metrics.totalRevenue - metrics.totalExpenses) /
          metrics.totalRevenue) *
        100
      : 0;

  const financialData = [
    ["Total Revenue", formatCurrency(metrics.totalRevenue)],
    ["Total Expenses", formatCurrency(metrics.totalExpenses)],
    [
      "Net Profit/Loss",
      formatCurrency(metrics.totalRevenue - metrics.totalExpenses),
    ],
    ["Profit Margin", `${profitMargin.toFixed(1)}%`],
    ["VAT Collected", formatCurrency(metrics.vatCollected)],
    ["Documents Analyzed", metrics.documentCount.toString()],
    ["Average Transaction", formatCurrency(metrics.averageTransactionValue)],
  ];

  autoTable(doc, {
    startY: yPos,
    head: [["Metric", "Value"]],
    body: financialData,
    theme: "plain",
    headStyles: {
      fillColor: [241, 245, 249],
      textColor: [30, 41, 59],
      fontStyle: "bold",
    },
    styles: {
      fontSize: 10,
      cellPadding: 5,
      lineColor: [226, 232, 240],
      lineWidth: 0.1,
    },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 80 },
      1: { halign: "right" },
    },
    alternateRowStyles: { fillColor: [248, 250, 252] },
  });

  yPos = (doc as any).lastAutoTable.finalY + 15;

  // Monthly Trend
  if (metrics.monthlyData.length > 0) {
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Monthly Cash Flow Trend", 20, yPos);
    yPos += 8;

    const monthlyData = metrics.monthlyData
      .slice(-6)
      .map((m) => [
        m.month,
        formatCurrency(m.income),
        formatCurrency(m.expenses),
        formatCurrency(m.income - m.expenses),
        m.income > 0
          ? `${(((m.income - m.expenses) / m.income) * 100).toFixed(0)}%`
          : "0%",
      ]);

    autoTable(doc, {
      startY: yPos,
      head: [["Month", "Revenue", "Expenses", "Net", "Margin"]],
      body: monthlyData,
      theme: "plain",
      headStyles: {
        fillColor: [241, 245, 249],
        textColor: [30, 41, 59],
        fontStyle: "bold",
      },
      styles: {
        fontSize: 9,
        cellPadding: 4,
        lineColor: [226, 232, 240],
        lineWidth: 0.1,
      },
      columnStyles: {
        1: { halign: "right" },
        2: { halign: "right" },
        3: { halign: "right" },
        4: { halign: "right" },
      },
      alternateRowStyles: { fillColor: [248, 250, 252] },
    });

    yPos = (doc as any).lastAutoTable.finalY + 15;
  }

  // Expense Breakdown
  if (metrics.expenseCategories.length > 0 && yPos < 200) {
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Expense Categories", 20, yPos);
    yPos += 8;

    const expenseData = metrics.expenseCategories
      .slice(0, 6)
      .map((c) => [
        c.name,
        formatCurrency(c.amount),
        `${((c.amount / metrics.totalExpenses) * 100).toFixed(1)}%`,
      ]);

    autoTable(doc, {
      startY: yPos,
      head: [["Category", "Amount", "% of Total"]],
      body: expenseData,
      theme: "plain",
      headStyles: {
        fillColor: [241, 245, 249],
        textColor: [30, 41, 59],
        fontStyle: "bold",
      },
      styles: {
        fontSize: 9,
        cellPadding: 4,
        lineColor: [226, 232, 240],
        lineWidth: 0.1,
      },
      columnStyles: {
        1: { halign: "right" },
        2: { halign: "right" },
      },
      alternateRowStyles: { fillColor: [248, 250, 252] },
    });
  }

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text(
    `Page 2 of 3 | Arthiq.ai Credibility Packet | Prepared for: ${config.lenderName}`,
    pageWidth / 2,
    pageHeight - 10,
    { align: "center" }
  );

  // === PAGE 3: Compliance & Verification ===
  doc.addPage();

  // Header
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, pageWidth, 35, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Compliance & Verification Details", 20, 23);
  doc.setFontSize(9);
  doc.setTextColor(148, 163, 184);
  doc.text(config.businessName, pageWidth - 60, 23);

  yPos = 50;

  // Compliance Breakdown
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Compliance Assessment", 20, yPos);
  yPos += 8;

  const complianceData = [
    [
      "Document Completeness",
      `${Math.round(
        credibilityScore.complianceReadiness.documentCompleteness
      )}%`,
    ],
    [
      "Risk Pattern Score",
      `${Math.round(
        100 - credibilityScore.complianceReadiness.riskPatterns * 10
      )}%`,
    ],
    [
      "Timeliness Score",
      `${Math.round(credibilityScore.complianceReadiness.timelinessScore)}%`,
    ],
    [
      "Overall Compliance",
      `${Math.round(credibilityScore.complianceReadiness.score)}%`,
    ],
  ];

  autoTable(doc, {
    startY: yPos,
    head: [["Compliance Area", "Score"]],
    body: complianceData,
    theme: "plain",
    headStyles: {
      fillColor: [241, 245, 249],
      textColor: [30, 41, 59],
      fontStyle: "bold",
    },
    styles: {
      fontSize: 10,
      cellPadding: 5,
      lineColor: [226, 232, 240],
      lineWidth: 0.1,
    },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 100 },
      1: { halign: "right" },
    },
    alternateRowStyles: { fillColor: [248, 250, 252] },
  });

  yPos = (doc as any).lastAutoTable.finalY + 15;

  // Detected Issues
  if (credibilityScore.anomalies.length > 0) {
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Detected Issues & Flags", 20, yPos);
    yPos += 8;

    const issueData = credibilityScore.anomalies
      .slice(0, 8)
      .map((a) => [
        a.severity.toUpperCase(),
        a.type.replace(/_/g, " "),
        a.description.substring(0, 50) +
          (a.description.length > 50 ? "..." : ""),
      ]);

    autoTable(doc, {
      startY: yPos,
      head: [["Severity", "Type", "Description"]],
      body: issueData,
      theme: "plain",
      headStyles: {
        fillColor: [241, 245, 249],
        textColor: [30, 41, 59],
        fontStyle: "bold",
      },
      styles: {
        fontSize: 8,
        cellPadding: 3,
        lineColor: [226, 232, 240],
        lineWidth: 0.1,
      },
      columnStyles: {
        0: { cellWidth: 25 },
        1: { cellWidth: 40 },
        2: { cellWidth: 110 },
      },
      didParseCell: (data) => {
        if (data.column.index === 0 && data.section === "body") {
          const value = data.cell.raw as string;
          if (value === "CRITICAL") {
            data.cell.styles.textColor = [239, 68, 68];
            data.cell.styles.fontStyle = "bold";
          } else if (value === "HIGH") {
            data.cell.styles.textColor = [245, 158, 11];
            data.cell.styles.fontStyle = "bold";
          }
        }
      },
    });

    yPos = (doc as any).lastAutoTable.finalY + 15;
  } else {
    doc.setFillColor(209, 250, 229); // Green 100
    doc.roundedRect(15, yPos, pageWidth - 30, 25, 3, 3, "F");
    doc.setTextColor(22, 163, 74); // Green 600
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("✓ No significant issues or anomalies detected", 25, yPos + 15);
    yPos += 35;
  }

  // Cross-Source Reconciliation
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Cross-Source Verification", 20, yPos);
  yPos += 8;

  const reconciliationColor = credibilityScore.crossSourceReconciliation.passed
    ? [16, 185, 129]
    : [245, 158, 11];

  doc.setFillColor(
    reconciliationColor[0],
    reconciliationColor[1],
    reconciliationColor[2],
    0.1
  );
  doc.roundedRect(15, yPos, pageWidth - 30, 35, 3, 3, "F");

  doc.setTextColor(
    reconciliationColor[0],
    reconciliationColor[1],
    reconciliationColor[2]
  );
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(
    credibilityScore.crossSourceReconciliation.passed
      ? "✓ Cross-Source Verification Passed"
      : "⚠ Limited Source Verification",
    25,
    yPos + 12
  );

  doc.setFont("helvetica", "normal");
  doc.setTextColor(71, 85, 105);
  doc.setFontSize(9);
  doc.text(
    `Reconciliation Score: ${Math.round(
      credibilityScore.crossSourceReconciliation.reconciliationScore
    )}%`,
    25,
    yPos + 23
  );
  if (credibilityScore.crossSourceReconciliation.mismatches.length > 0) {
    doc.text(
      `Mismatches: ${credibilityScore.crossSourceReconciliation.mismatches.length}`,
      120,
      yPos + 23
    );
  }

  yPos += 45;

  // Certification Box
  doc.setDrawColor(15, 23, 42);
  doc.setLineWidth(1);
  doc.roundedRect(15, yPos, pageWidth - 30, 50, 3, 3, "S");

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("CERTIFICATION STATEMENT", 25, yPos + 12);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(71, 85, 105);
  const certText = [
    "This Credibility Packet has been generated based on financial documents uploaded to the Arthiq.ai platform.",
    "The data has been analyzed using AI-powered verification and cross-source reconciliation.",
    "The accuracy of this report depends on the quality and authenticity of the source documents.",
    `Report valid until: ${formatDate(
      new Date(config.generatedAt.getTime() + 30 * 24 * 60 * 60 * 1000)
    )}`,
  ];
  certText.forEach((line, i) => {
    doc.text(line, 25, yPos + 22 + i * 7, { maxWidth: pageWidth - 50 });
  });

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text(
    `Page 3 of 3 | Arthiq.ai Credibility Packet | Prepared for: ${config.lenderName}`,
    pageWidth / 2,
    pageHeight - 10,
    { align: "center" }
  );

  return doc;
};

export const downloadCredibilityPacket = (
  credibilityScore: CredibilityScore,
  metrics: FinancialMetrics,
  config: CredibilityPacketConfig
): void => {
  const doc = generateCredibilityPacket(credibilityScore, metrics, config);
  const filename = `credibility-packet-${config.businessName
    .toLowerCase()
    .replace(/\s+/g, "-")}-${config.packetId}.pdf`;
  doc.save(filename);
};
