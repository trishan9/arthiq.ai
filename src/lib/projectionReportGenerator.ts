import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { FinancialMetrics } from "@/hooks/useFinancialData";

export interface ProjectionConfig {
  businessName: string;
  businessType?: string;
  panNumber?: string;
  projectionMonths: number; // 6, 12, or 24 months
  growthScenario: "conservative" | "moderate" | "optimistic";
  loanAmount?: number;
  loanPurpose?: string;
  interestRate?: number;
  loanTermMonths?: number;
}

interface ProjectedMonth {
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
  cumulativeProfit: number;
}

interface ProjectionResult {
  projectedMonths: ProjectedMonth[];
  averageMonthlyRevenue: number;
  averageMonthlyExpenses: number;
  projectedAnnualRevenue: number;
  projectedAnnualProfit: number;
  growthRate: number;
  breakEvenMonth?: number;
  debtServiceCoverageRatio?: number;
}

// ANNUAL growth rates (realistic for SMEs) - will be converted to monthly
const ANNUAL_GROWTH_RATES = {
  conservative: { revenue: 0.05, expense: 0.04 }, // 5% annual revenue, 4% expense
  moderate: { revenue: 0.1, expense: 0.07 }, // 10% annual revenue, 7% expense
  optimistic: { revenue: 0.18, expense: 0.1 }, // 18% annual revenue, 10% expense
};

// Convert annual rate to monthly compound rate
function annualToMonthly(annualRate: number): number {
  return Math.pow(1 + annualRate, 1 / 12) - 1;
}

export function calculateProjections(
  metrics: FinancialMetrics,
  config: ProjectionConfig
): ProjectionResult {
  const monthlyData = metrics.monthlyData;
  const annualGrowth = ANNUAL_GROWTH_RATES[config.growthScenario];

  // Convert to monthly rates
  const monthlyRevenueGrowth = annualToMonthly(annualGrowth.revenue);
  const monthlyExpenseGrowth = annualToMonthly(annualGrowth.expense);

  // Calculate base values from historical data
  let baseRevenue = metrics.totalRevenue / Math.max(monthlyData.length, 1);
  let baseExpenses = metrics.totalExpenses / Math.max(monthlyData.length, 1);

  // If we have monthly data, use the average of recent months (more accurate)
  if (monthlyData.length >= 3) {
    const recentMonths = monthlyData.slice(-3);
    baseRevenue =
      recentMonths.reduce((sum, m) => sum + m.income, 0) / recentMonths.length;
    baseExpenses =
      recentMonths.reduce((sum, m) => sum + m.expenses, 0) /
      recentMonths.length;
  }

  // Calculate historical trend from data (month-over-month)
  let historicalMonthlyTrend = 0;
  if (monthlyData.length >= 4) {
    // Calculate average month-over-month growth from historical data
    let totalGrowth = 0;
    let growthCount = 0;
    for (let i = 1; i < monthlyData.length; i++) {
      if (monthlyData[i - 1].income > 0) {
        const monthGrowth =
          (monthlyData[i].income - monthlyData[i - 1].income) /
          monthlyData[i - 1].income;
        // Clamp extreme values to reasonable range (-20% to +20% monthly)
        totalGrowth += Math.max(-0.2, Math.min(0.2, monthGrowth));
        growthCount++;
      }
    }
    if (growthCount > 0) {
      historicalMonthlyTrend = totalGrowth / growthCount;
    }
  }

  // Blend scenario growth with historical trend (30% historical, 70% scenario)
  // Also clamp the final rate to realistic bounds (-5% to +3% monthly max)
  const blendedGrowthRate =
    monthlyRevenueGrowth * 0.7 + historicalMonthlyTrend * 0.3;
  const effectiveGrowthRate = Math.max(
    -0.05,
    Math.min(0.03, blendedGrowthRate)
  );

  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() + 1);

  const projectedMonths: ProjectedMonth[] = [];
  let cumulativeProfit = 0;
  let currentRevenue = baseRevenue;
  let currentExpenses = baseExpenses;

  // Add loan EMI to expenses if applicable
  let monthlyEMI = 0;
  if (config.loanAmount && config.interestRate && config.loanTermMonths) {
    const monthlyRate = config.interestRate / 100 / 12;
    monthlyEMI =
      (config.loanAmount *
        monthlyRate *
        Math.pow(1 + monthlyRate, config.loanTermMonths)) /
      (Math.pow(1 + monthlyRate, config.loanTermMonths) - 1);
  }

  for (let i = 0; i < config.projectionMonths; i++) {
    const date = new Date(startDate);
    date.setMonth(startDate.getMonth() + i);
    const monthName = monthNames[date.getMonth()];
    const year = date.getFullYear().toString().slice(-2);

    // Apply growth
    if (i > 0) {
      currentRevenue *= 1 + effectiveGrowthRate;
      currentExpenses *= 1 + monthlyExpenseGrowth;
    }

    const totalExpenses = currentExpenses + monthlyEMI;
    const profit = currentRevenue - totalExpenses;
    cumulativeProfit += profit;

    projectedMonths.push({
      month: `${monthName} '${year}`,
      revenue: Math.round(currentRevenue),
      expenses: Math.round(totalExpenses),
      profit: Math.round(profit),
      cumulativeProfit: Math.round(cumulativeProfit),
    });
  }

  // Calculate summary metrics
  const totalProjectedRevenue = projectedMonths.reduce(
    (sum, m) => sum + m.revenue,
    0
  );
  const totalProjectedExpenses = projectedMonths.reduce(
    (sum, m) => sum + m.expenses,
    0
  );
  const annualizedRevenue =
    (totalProjectedRevenue / config.projectionMonths) * 12;
  const annualizedProfit =
    ((totalProjectedRevenue - totalProjectedExpenses) /
      config.projectionMonths) *
    12;

  // Debt Service Coverage Ratio
  let dscr: number | undefined;
  if (monthlyEMI > 0) {
    const avgProfit =
      projectedMonths.reduce((sum, m) => sum + m.profit + monthlyEMI, 0) /
      projectedMonths.length;
    dscr = avgProfit / monthlyEMI;
  }

  // Find break-even month
  let breakEvenMonth: number | undefined;
  for (let i = 0; i < projectedMonths.length; i++) {
    if (projectedMonths[i].cumulativeProfit > 0) {
      breakEvenMonth = i + 1;
      break;
    }
  }

  // Calculate effective annual growth rate from the monthly rate
  const effectiveAnnualGrowth =
    (Math.pow(1 + effectiveGrowthRate, 12) - 1) * 100;

  return {
    projectedMonths,
    averageMonthlyRevenue: Math.round(
      totalProjectedRevenue / config.projectionMonths
    ),
    averageMonthlyExpenses: Math.round(
      totalProjectedExpenses / config.projectionMonths
    ),
    projectedAnnualRevenue: Math.round(annualizedRevenue),
    projectedAnnualProfit: Math.round(annualizedProfit),
    growthRate: effectiveAnnualGrowth, // Now shows annual % growth
    breakEvenMonth,
    debtServiceCoverageRatio: dscr,
  };
}

export function generateProjectionReport(
  metrics: FinancialMetrics,
  config: ProjectionConfig
): jsPDF {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let yPos = 20;

  const projections = calculateProjections(metrics, config);

  // ===== HEADER =====
  doc.setFillColor(25, 118, 210);
  doc.rect(0, 0, pageWidth, 45, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("FINANCIAL PROJECTION REPORT", margin, 25);

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text(
    `${config.projectionMonths}-Month ${
      config.growthScenario.charAt(0).toUpperCase() +
      config.growthScenario.slice(1)
    } Scenario`,
    margin,
    35
  );

  doc.setFontSize(9);
  doc.text(
    `Generated: ${new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })}`,
    pageWidth - margin,
    35,
    { align: "right" }
  );

  yPos = 55;
  doc.setTextColor(0, 0, 0);

  // ===== BUSINESS INFO =====
  doc.setFillColor(245, 245, 245);
  doc.rect(margin, yPos, pageWidth - 2 * margin, 30, "F");

  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(config.businessName, margin + 5, yPos + 12);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  if (config.businessType) {
    doc.text(`Business Type: ${config.businessType}`, margin + 5, yPos + 22);
  }
  if (config.panNumber) {
    doc.text(`PAN: ${config.panNumber}`, pageWidth - margin - 5, yPos + 22, {
      align: "right",
    });
  }

  yPos += 40;

  // ===== LOAN DETAILS (if applicable) =====
  if (config.loanAmount) {
    doc.setFillColor(255, 248, 225);
    doc.rect(margin, yPos, pageWidth - 2 * margin, 35, "F");
    doc.setDrawColor(255, 193, 7);
    doc.rect(margin, yPos, pageWidth - 2 * margin, 35, "S");

    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(121, 85, 0);
    doc.text("LOAN REQUEST DETAILS", margin + 5, yPos + 10);

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(
      `Amount: NPR ${config.loanAmount.toLocaleString()}`,
      margin + 5,
      yPos + 20
    );
    doc.text(
      `Purpose: ${config.loanPurpose || "Business Expansion"}`,
      margin + 80,
      yPos + 20
    );
    doc.text(
      `Term: ${config.loanTermMonths || 12} months @ ${
        config.interestRate || 12
      }%`,
      margin + 5,
      yPos + 28
    );

    if (projections.debtServiceCoverageRatio) {
      const dscrColor =
        projections.debtServiceCoverageRatio >= 1.5
          ? [34, 139, 34]
          : projections.debtServiceCoverageRatio >= 1.0
          ? [255, 165, 0]
          : [220, 20, 60];
      doc.setTextColor(dscrColor[0], dscrColor[1], dscrColor[2]);
      doc.setFont("helvetica", "bold");
      doc.text(
        `DSCR: ${projections.debtServiceCoverageRatio.toFixed(2)}`,
        pageWidth - margin - 5,
        yPos + 24,
        { align: "right" }
      );
    }

    yPos += 45;
  }

  doc.setTextColor(0, 0, 0);

  // ===== KEY PROJECTIONS SUMMARY =====
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("KEY PROJECTIONS", margin, yPos);
  yPos += 8;

  const summaryData = [
    ["Metric", "Current (Monthly Avg)", "Projected (Monthly Avg)", "Change"],
    [
      "Revenue",
      `NPR ${Math.round(
        metrics.totalRevenue / Math.max(metrics.monthlyData.length, 1)
      ).toLocaleString()}`,
      `NPR ${projections.averageMonthlyRevenue.toLocaleString()}`,
      `+${projections.growthRate.toFixed(1)}%/yr`,
    ],
    [
      "Expenses",
      `NPR ${Math.round(
        metrics.totalExpenses / Math.max(metrics.monthlyData.length, 1)
      ).toLocaleString()}`,
      `NPR ${projections.averageMonthlyExpenses.toLocaleString()}`,
      `+${(ANNUAL_GROWTH_RATES[config.growthScenario].expense * 100).toFixed(
        1
      )}%/yr`,
    ],
    [
      "Net Profit",
      `NPR ${Math.round(
        (metrics.totalRevenue - metrics.totalExpenses) /
          Math.max(metrics.monthlyData.length, 1)
      ).toLocaleString()}`,
      `NPR ${(
        projections.averageMonthlyRevenue - projections.averageMonthlyExpenses
      ).toLocaleString()}`,
      "-",
    ],
    [
      "Annual Revenue (Projected)",
      "-",
      `NPR ${projections.projectedAnnualRevenue.toLocaleString()}`,
      "-",
    ],
    [
      "Annual Profit (Projected)",
      "-",
      `NPR ${projections.projectedAnnualProfit.toLocaleString()}`,
      "-",
    ],
  ];

  autoTable(doc, {
    startY: yPos,
    head: [summaryData[0]],
    body: summaryData.slice(1),
    theme: "striped",
    headStyles: {
      fillColor: [25, 118, 210],
      textColor: 255,
      fontStyle: "bold",
    },
    styles: { fontSize: 9, cellPadding: 4 },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 50 },
      1: { halign: "right" },
      2: { halign: "right" },
      3: { halign: "center" },
    },
    margin: { left: margin, right: margin },
  });

  yPos = (doc as any).lastAutoTable.finalY + 15;

  // ===== MONTHLY PROJECTIONS TABLE =====
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("MONTHLY PROJECTION BREAKDOWN", margin, yPos);
  yPos += 8;

  const monthlyTableData = projections.projectedMonths.map((m) => [
    m.month,
    `NPR ${m.revenue.toLocaleString()}`,
    `NPR ${m.expenses.toLocaleString()}`,
    `NPR ${m.profit.toLocaleString()}`,
    `NPR ${m.cumulativeProfit.toLocaleString()}`,
  ]);

  autoTable(doc, {
    startY: yPos,
    head: [["Month", "Revenue", "Expenses", "Net Profit", "Cumulative"]],
    body: monthlyTableData,
    theme: "grid",
    headStyles: { fillColor: [76, 175, 80], textColor: 255, fontStyle: "bold" },
    styles: { fontSize: 8, cellPadding: 3 },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 25 },
      1: { halign: "right" },
      2: { halign: "right" },
      3: { halign: "right" },
      4: { halign: "right" },
    },
    margin: { left: margin, right: margin },
    didParseCell: function (data) {
      if (data.section === "body" && data.column.index === 3) {
        const profit = projections.projectedMonths[data.row.index]?.profit || 0;
        if (profit < 0) {
          data.cell.styles.textColor = [220, 20, 60];
        } else {
          data.cell.styles.textColor = [34, 139, 34];
        }
      }
    },
  });

  // ===== PAGE 2: ANALYSIS & ASSUMPTIONS =====
  doc.addPage();
  yPos = 20;

  doc.setFillColor(25, 118, 210);
  doc.rect(0, 0, pageWidth, 25, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("ANALYSIS & ASSUMPTIONS", margin, 17);

  yPos = 35;
  doc.setTextColor(0, 0, 0);

  // Historical Data Summary
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("HISTORICAL DATA ANALYSIS", margin, yPos);
  yPos += 10;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  const historicalLines = [
    `• Data period analyzed: ${metrics.monthlyData.length} months`,
    `• Total historical revenue: NPR ${metrics.totalRevenue.toLocaleString()}`,
    `• Total historical expenses: NPR ${metrics.totalExpenses.toLocaleString()}`,
    `• Average monthly profit: NPR ${Math.round(
      (metrics.totalRevenue - metrics.totalExpenses) /
        Math.max(metrics.monthlyData.length, 1)
    ).toLocaleString()}`,
    `• Documents analyzed: ${metrics.totalDocuments}`,
    `• Financial health score: ${metrics.financialHealthScore}/100`,
  ];

  historicalLines.forEach((line) => {
    doc.text(line, margin, yPos);
    yPos += 7;
  });

  yPos += 10;

  // Projection Assumptions
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("PROJECTION ASSUMPTIONS", margin, yPos);
  yPos += 10;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  const scenarioDescriptions = {
    conservative:
      "Conservative growth assumes slower market conditions and focuses on sustainable growth.",
    moderate:
      "Moderate growth reflects typical market conditions with steady business expansion.",
    optimistic:
      "Optimistic growth assumes favorable market conditions and aggressive expansion.",
  };

  const assumptionLines = [
    `• Growth Scenario: ${
      config.growthScenario.charAt(0).toUpperCase() +
      config.growthScenario.slice(1)
    }`,
    `• ${scenarioDescriptions[config.growthScenario]}`,
    `• Revenue growth rate: ${(
      ANNUAL_GROWTH_RATES[config.growthScenario].revenue * 100
    ).toFixed(0)}% per year`,
    `• Expense growth rate: ${(
      ANNUAL_GROWTH_RATES[config.growthScenario].expense * 100
    ).toFixed(0)}% per year`,
    `• Projection period: ${config.projectionMonths} months`,
  ];

  assumptionLines.forEach((line) => {
    const lines = doc.splitTextToSize(line, pageWidth - 2 * margin);
    lines.forEach((l: string) => {
      doc.text(l, margin, yPos);
      yPos += 7;
    });
  });

  yPos += 10;

  // Key Insights
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("KEY INSIGHTS", margin, yPos);
  yPos += 10;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");

  const insights: string[] = [];

  if (projections.breakEvenMonth) {
    insights.push(
      `• Projected to achieve cumulative profitability in month ${projections.breakEvenMonth}`
    );
  }

  const profitMargin =
    ((projections.averageMonthlyRevenue - projections.averageMonthlyExpenses) /
      projections.averageMonthlyRevenue) *
    100;
  insights.push(
    `• Projected average profit margin: ${profitMargin.toFixed(1)}%`
  );

  if (projections.debtServiceCoverageRatio) {
    if (projections.debtServiceCoverageRatio >= 1.5) {
      insights.push(
        `• Strong debt service coverage ratio (${projections.debtServiceCoverageRatio.toFixed(
          2
        )}) indicates good loan repayment capacity`
      );
    } else if (projections.debtServiceCoverageRatio >= 1.0) {
      insights.push(
        `• Adequate debt service coverage ratio (${projections.debtServiceCoverageRatio.toFixed(
          2
        )}) - loan is serviceable`
      );
    } else {
      insights.push(
        `• Debt service coverage ratio (${projections.debtServiceCoverageRatio.toFixed(
          2
        )}) is below 1.0 - repayment may be challenging`
      );
    }
  }

  const revenueGrowth =
    (((projections.projectedMonths[projections.projectedMonths.length - 1]
      ?.revenue || 0) -
      (projections.projectedMonths[0]?.revenue || 0)) /
      (projections.projectedMonths[0]?.revenue || 1)) *
    100;
  insights.push(
    `• Total revenue growth over projection period: ${revenueGrowth.toFixed(
      1
    )}%`
  );

  insights.forEach((insight) => {
    const lines = doc.splitTextToSize(insight, pageWidth - 2 * margin);
    lines.forEach((l: string) => {
      doc.text(l, margin, yPos);
      yPos += 7;
    });
  });

  yPos += 15;

  // Revenue Categories
  if (metrics.revenueCategories.length > 0) {
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("REVENUE BREAKDOWN (Historical)", margin, yPos);
    yPos += 8;

    const revCatData = metrics.revenueCategories.map((cat) => [
      cat.name,
      `NPR ${cat.amount.toLocaleString()}`,
      `${((cat.amount / metrics.totalRevenue) * 100).toFixed(1)}%`,
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [["Category", "Amount", "% of Total"]],
      body: revCatData,
      theme: "striped",
      headStyles: { fillColor: [76, 175, 80], textColor: 255 },
      styles: { fontSize: 9 },
      columnStyles: { 1: { halign: "right" }, 2: { halign: "right" } },
      margin: { left: margin, right: margin },
    });

    yPos = (doc as any).lastAutoTable.finalY + 15;
  }

  // Expense Categories
  if (metrics.expenseCategories.length > 0) {
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("EXPENSE BREAKDOWN (Historical)", margin, yPos);
    yPos += 8;

    const expCatData = metrics.expenseCategories.map((cat) => [
      cat.name,
      `NPR ${cat.amount.toLocaleString()}`,
      `${((cat.amount / metrics.totalExpenses) * 100).toFixed(1)}%`,
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [["Category", "Amount", "% of Total"]],
      body: expCatData,
      theme: "striped",
      headStyles: { fillColor: [244, 67, 54], textColor: 255 },
      styles: { fontSize: 9 },
      columnStyles: { 1: { halign: "right" }, 2: { halign: "right" } },
      margin: { left: margin, right: margin },
    });
  }

  // ===== FOOTER =====
  const addFooter = (pageNum: number) => {
    doc.setPage(pageNum);
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(
      "This projection is based on historical data and assumptions. Actual results may vary.",
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: "center" }
    );
    doc.text(
      `Page ${pageNum} of 2`,
      pageWidth - margin,
      doc.internal.pageSize.getHeight() - 10,
      { align: "right" }
    );
  };

  addFooter(1);
  addFooter(2);

  return doc;
}
