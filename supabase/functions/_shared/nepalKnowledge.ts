// Nepal SME Financial & Regulatory Knowledge Base
// Last Updated: FY 2082/83 (2025-2026)
// Sources: IRD Nepal, Labor Act 2074, Company Act 2063, SSF Guidelines

export const NEPAL_TAX_DATA = {
  metadata: {
    fiscal_year: "2082/83",
    effective_date: "2025-07-16",
    country: "NP",
    currency: "NPR"
  },
  
  // VAT Regulations
  vat: {
    standard_rate: 0.13,
    registration_threshold: 5000000,
    filing_deadline: "25th of each Nepali month",
    penalties: {
      late_filing: "0.05% per day of tax due",
      non_registration: "100% of VAT due + NPR 10,000 fine"
    },
    exempt_goods: [
      "Basic agricultural products",
      "Educational services",
      "Healthcare services",
      "Books and newspapers",
      "Electricity up to 20 units",
      "Financial services (interest)",
      "Life insurance services"
    ],
    zero_rated: [
      "Exports",
      "International transportation",
      "Goods to diplomatic missions"
    ],
    invoice_requirements: [
      "PAN of seller and buyer",
      "Invoice date and serial number",
      "Description of goods/services",
      "Quantity, rate, and total amount",
      "VAT amount separately shown",
      "Signature and stamp"
    ]
  },

  // Income Tax Rates
  income_tax: {
    corporate: {
      general: 0.25,
      manufacturing: 0.20,
      banks_financial: 0.30,
      it_export: 0.05, // Effective rate after rebates
      special_industries: 0.20,
      cooperative: 0.20
    },
    individual_slabs_single: [
      { limit: 500000, rate: 0.01, label: "Social Security Tax" },
      { limit: 700000, rate: 0.10 },
      { limit: 1000000, rate: 0.20 },
      { limit: 2000000, rate: 0.30 },
      { limit: 5000000, rate: 0.36 },
      { limit: null, rate: 0.39 }
    ],
    individual_slabs_married: [
      { limit: 600000, rate: 0.01, label: "Social Security Tax" },
      { limit: 800000, rate: 0.10 },
      { limit: 1100000, rate: 0.20 },
      { limit: 2000000, rate: 0.30 },
      { limit: 5000000, rate: 0.36 },
      { limit: null, rate: 0.39 }
    ],
    filing_deadline: "Within 3 months of fiscal year end (Kartik end)",
    advance_tax_installments: ["Poush end", "Chaitra end", "Ashadh end"]
  },

  // TDS Rates
  tds: {
    service_vat_registered: 0.015,
    service_non_vat: 0.15,
    house_rent_company: 0.10,
    house_rent_individual: "As per local government rate",
    consultancy_vat: 0.015,
    consultancy_non_vat: 0.15,
    contract_over_50k: 0.015,
    interest_resident: 0.05,
    interest_non_resident: 0.15,
    dividend: 0.05,
    royalty: 0.15
  },

  // Social Security Fund (SSF)
  ssf: {
    employer_contribution: 0.20,
    employee_contribution: 0.11,
    total_contribution: 0.31,
    minimum_employees_required: 10,
    allocation: {
      medical_health_maternity: 0.01,
      accident_disability: 0.014,
      dependent_family: 0.0027,
      old_age_pension: 0.2833
    },
    waive_sst_if_active: true,
    penalties: {
      non_contribution: "10% additional charge per month",
      non_registration: "NPR 10,000 + 1% of contribution due"
    }
  },

  // Key Thresholds
  thresholds: {
    vat_registration: 5000000,
    audit_requirement: 10000000,
    large_taxpayer: 100000000, // 10 crore
    ssf_employee_count: 10,
    tds_threshold: 50000
  },

  // Fiscal Calendar
  fiscal_calendar: {
    year_start: "Shrawan 1 (mid-July)",
    year_end: "Ashadh end (mid-July)",
    vat_return_due: "25th of each month",
    advance_tax_due: ["Poush end", "Chaitra end", "Ashadh end"],
    annual_return_due: "Kartik end (mid-November)",
    current_fy: "2082/83 (2025-2026)"
  }
};

export const NEPAL_LABOR_LAW = {
  source: "Labor Act 2074 (2017)",
  
  // Employment Types
  employment: {
    written_agreement_required: true,
    exception: "Casual workers exempt from written agreement",
    probation_period_max: "6 months",
    termination_notice: "30 days or payment in lieu"
  },

  // Working Hours
  working_hours: {
    daily_max: 8,
    weekly_max: 48,
    overtime_rate: 1.5, // 150% of regular wage
    rest_break: "30 minutes after 5 continuous hours",
    weekly_off: "1 paid day per week"
  },

  // Leave Entitlements
  leave: {
    annual_leave: "18 days per year (after 1 year service)",
    sick_leave: "12 days per year (50% paid)",
    home_leave: "1 day per 20 working days",
    mourning_leave: "13 days",
    maternity_leave: "98 days (60 days full pay)",
    paternity_leave: "15 days",
    public_holidays: "13 days minimum"
  },

  // Compensation
  compensation: {
    minimum_wage_monthly: 17300, // NPR (as of 2081)
    dearness_allowance: 3500, // NPR
    total_minimum: 20800, // NPR
    annual_increment: "Half day's wage per year of service",
    festival_allowance: "1 month basic salary (after 1 year)",
    gratuity: "50% of last month salary per year (after 3 years)"
  },

  // Women Workers
  women_protections: {
    night_work: "Safe transport and security required",
    equal_pay: "Mandated by law",
    maternity_discrimination: "Prohibited",
    nursing_breaks: "1 hour per day for 1 year after birth"
  },

  // Penalties
  penalties: {
    no_written_contract: "NPR 10,000 per instance",
    overtime_violation: "NPR 5,000 - 50,000",
    wage_delay: "10% additional per month delayed",
    ssf_non_compliance: "10% per month + registration fine",
    discrimination: "NPR 50,000 - 500,000"
  }
};

export const NEPAL_COMPANY_ACT = {
  source: "Company Act 2063 (2006)",
  
  // Company Types
  types: {
    private_limited: {
      min_shareholders: 1,
      max_shareholders: 101,
      min_capital: "No minimum specified",
      suffix: "Pvt. Ltd."
    },
    public_limited: {
      min_shareholders: 7,
      max_shareholders: "Unlimited",
      min_capital: 10000000, // NPR 1 crore
      suffix: "Ltd."
    }
  },

  // Compliance Requirements
  compliance: {
    annual_general_meeting: "Within 6 months of fiscal year end",
    board_meetings: "Minimum 4 per year, at least 1 per quarter",
    annual_return: "Within 3 months of AGM",
    audit: "Mandatory for all companies",
    registered_office: "Must have in Nepal"
  },

  // Record Keeping
  records: {
    retention_period: "10 years minimum",
    required_documents: [
      "Memorandum and Articles of Association",
      "Minutes of board and shareholder meetings",
      "Register of shareholders and directors",
      "Financial statements and audit reports",
      "Contracts exceeding NPR 500,000"
    ]
  }
};

// Formatted knowledge base for AI prompts
export function getFormattedKnowledgeBase(): string {
  return `
## Nepal Tax & Regulatory Framework (FY ${NEPAL_TAX_DATA.metadata.fiscal_year})

### VAT (Value Added Tax)
- **Registration Threshold**: NPR ${NEPAL_TAX_DATA.thresholds.vat_registration.toLocaleString()} annual turnover
- **Standard Rate**: ${(NEPAL_TAX_DATA.vat.standard_rate * 100)}%
- **Filing Deadline**: ${NEPAL_TAX_DATA.vat.filing_deadline}
- **Late Filing Penalty**: ${NEPAL_TAX_DATA.vat.penalties.late_filing}
- **Invoice Requirements**: ${NEPAL_TAX_DATA.vat.invoice_requirements.join(", ")}
- **Exempt Goods/Services**: ${NEPAL_TAX_DATA.vat.exempt_goods.join(", ")}

### Income Tax (Corporate)
- **General Rate**: ${(NEPAL_TAX_DATA.income_tax.corporate.general * 100)}%
- **Manufacturing**: ${(NEPAL_TAX_DATA.income_tax.corporate.manufacturing * 100)}%
- **IT/Export (Effective)**: ${(NEPAL_TAX_DATA.income_tax.corporate.it_export * 100)}%
- **Banks/Financial**: ${(NEPAL_TAX_DATA.income_tax.corporate.banks_financial * 100)}%
- **Filing Deadline**: ${NEPAL_TAX_DATA.income_tax.filing_deadline}
- **Advance Tax**: Due at ${NEPAL_TAX_DATA.income_tax.advance_tax_installments.join(", ")}

### Income Tax Slabs (Individual - Single)
${NEPAL_TAX_DATA.income_tax.individual_slabs_single.map(slab => 
  `- Up to NPR ${slab.limit?.toLocaleString() || 'Above 50L'}: ${(slab.rate * 100)}%${slab.label ? ` (${slab.label})` : ''}`
).join("\n")}

### TDS (Tax Deduction at Source)
- **Rent (Company)**: ${(NEPAL_TAX_DATA.tds.house_rent_company * 100)}%
- **Services (VAT Registered)**: ${(NEPAL_TAX_DATA.tds.service_vat_registered * 100)}%
- **Services (Non-VAT)**: ${(NEPAL_TAX_DATA.tds.service_non_vat * 100)}%
- **Contracts (>NPR 50K)**: ${(NEPAL_TAX_DATA.tds.contract_over_50k * 100)}%
- **Interest (Resident)**: ${(NEPAL_TAX_DATA.tds.interest_resident * 100)}%
- **Dividends**: ${(NEPAL_TAX_DATA.tds.dividend * 100)}%

### Social Security Fund (SSF)
- **Applicable**: Entities with ${NEPAL_TAX_DATA.ssf.minimum_employees_required}+ employees
- **Employer Contribution**: ${(NEPAL_TAX_DATA.ssf.employer_contribution * 100)}% of basic salary
- **Employee Contribution**: ${(NEPAL_TAX_DATA.ssf.employee_contribution * 100)}% of basic salary
- **Non-Compliance Penalty**: ${NEPAL_TAX_DATA.ssf.penalties.non_contribution}

### Labor Law Compliance (Labor Act 2074)
- **Minimum Wage**: NPR ${NEPAL_LABOR_LAW.compensation.minimum_wage_monthly.toLocaleString()} + NPR ${NEPAL_LABOR_LAW.compensation.dearness_allowance.toLocaleString()} allowance = NPR ${NEPAL_LABOR_LAW.compensation.total_minimum.toLocaleString()}/month
- **Working Hours**: Max ${NEPAL_LABOR_LAW.working_hours.daily_max} hours/day, ${NEPAL_LABOR_LAW.working_hours.weekly_max} hours/week
- **Overtime**: ${(NEPAL_LABOR_LAW.working_hours.overtime_rate * 100)}% of regular wage
- **Annual Leave**: ${NEPAL_LABOR_LAW.leave.annual_leave}
- **Sick Leave**: ${NEPAL_LABOR_LAW.leave.sick_leave}
- **Festival Allowance**: ${NEPAL_LABOR_LAW.compensation.festival_allowance}
- **Gratuity**: ${NEPAL_LABOR_LAW.compensation.gratuity}
- **Maternity Leave**: ${NEPAL_LABOR_LAW.leave.maternity_leave}
- **Written Contract Penalty**: ${NEPAL_LABOR_LAW.penalties.no_written_contract}

### Key Compliance Thresholds
- **VAT Registration**: NPR ${NEPAL_TAX_DATA.thresholds.vat_registration.toLocaleString()} turnover
- **Audit Requirement**: NPR ${NEPAL_TAX_DATA.thresholds.audit_requirement.toLocaleString()} turnover
- **Large Taxpayer**: NPR ${NEPAL_TAX_DATA.thresholds.large_taxpayer.toLocaleString()} annual tax
- **SSF Requirement**: ${NEPAL_TAX_DATA.thresholds.ssf_employee_count}+ employees

### Fiscal Year Calendar
- **Current FY**: ${NEPAL_TAX_DATA.fiscal_calendar.current_fy}
- **Year Period**: ${NEPAL_TAX_DATA.fiscal_calendar.year_start} to ${NEPAL_TAX_DATA.fiscal_calendar.year_end}
- **VAT Returns**: ${NEPAL_TAX_DATA.fiscal_calendar.vat_return_due}
- **Annual Tax Return**: ${NEPAL_TAX_DATA.fiscal_calendar.annual_return_due}

### Company Compliance (Company Act 2063)
- **AGM Deadline**: ${NEPAL_COMPANY_ACT.compliance.annual_general_meeting}
- **Board Meetings**: ${NEPAL_COMPANY_ACT.compliance.board_meetings}
- **Record Retention**: ${NEPAL_COMPANY_ACT.records.retention_period}
- **Audit**: ${NEPAL_COMPANY_ACT.compliance.audit}
`;
}

// Get threshold alerts based on financial data
export function getThresholdAlerts(metrics: {
  totalRevenue: number;
  employeeCount?: number;
  vatCollected?: number;
}): Array<{
  threshold: string;
  currentValue: number;
  thresholdValue: number;
  status: "below" | "approaching" | "exceeded";
  implication: string;
}> {
  const alerts = [];
  
  // VAT Registration Threshold
  const vatThreshold = NEPAL_TAX_DATA.thresholds.vat_registration;
  const vatPercentage = (metrics.totalRevenue / vatThreshold) * 100;
  
  if (metrics.totalRevenue >= vatThreshold) {
    alerts.push({
      threshold: "VAT Registration",
      currentValue: metrics.totalRevenue,
      thresholdValue: vatThreshold,
      status: "exceeded" as const,
      implication: "MANDATORY VAT registration required. Must register within 30 days of crossing threshold."
    });
  } else if (vatPercentage >= 80) {
    alerts.push({
      threshold: "VAT Registration",
      currentValue: metrics.totalRevenue,
      thresholdValue: vatThreshold,
      status: "approaching" as const,
      implication: `At ${vatPercentage.toFixed(0)}% of threshold. Prepare for VAT registration.`
    });
  }
  
  // Audit Threshold
  const auditThreshold = NEPAL_TAX_DATA.thresholds.audit_requirement;
  if (metrics.totalRevenue >= auditThreshold) {
    alerts.push({
      threshold: "Mandatory Audit",
      currentValue: metrics.totalRevenue,
      thresholdValue: auditThreshold,
      status: "exceeded" as const,
      implication: "Tax audit by IRD-approved auditor is mandatory for your turnover level."
    });
  } else if ((metrics.totalRevenue / auditThreshold) >= 0.8) {
    alerts.push({
      threshold: "Mandatory Audit",
      currentValue: metrics.totalRevenue,
      thresholdValue: auditThreshold,
      status: "approaching" as const,
      implication: "Approaching mandatory audit threshold. Consider voluntary audit for credibility."
    });
  }
  
  // SSF Threshold
  if (metrics.employeeCount !== undefined) {
    const ssfThreshold = NEPAL_TAX_DATA.thresholds.ssf_employee_count;
    if (metrics.employeeCount >= ssfThreshold) {
      alerts.push({
        threshold: "SSF Registration",
        currentValue: metrics.employeeCount,
        thresholdValue: ssfThreshold,
        status: "exceeded" as const,
        implication: `With ${metrics.employeeCount} employees, SSF registration and contributions are mandatory.`
      });
    } else if (metrics.employeeCount >= ssfThreshold - 2) {
      alerts.push({
        threshold: "SSF Registration",
        currentValue: metrics.employeeCount,
        thresholdValue: ssfThreshold,
        status: "approaching" as const,
        implication: "Close to SSF threshold. Plan for SSF compliance costs (31% of basic salary)."
      });
    }
  }
  
  return alerts;
}

// Calculate estimated tax liability
export function calculateTaxEstimates(annualProfit: number, isMarried: boolean = false): {
  estimatedTax: number;
  effectiveRate: number;
  slabBreakdown: Array<{ slab: string; taxableAmount: number; tax: number; rate: number }>;
} {
  const slabs = isMarried 
    ? NEPAL_TAX_DATA.income_tax.individual_slabs_married 
    : NEPAL_TAX_DATA.income_tax.individual_slabs_single;
  
  let remainingProfit = annualProfit;
  let totalTax = 0;
  let previousLimit = 0;
  const breakdown = [];
  
  for (const slab of slabs) {
    const limit = slab.limit || Infinity;
    const slabAmount = Math.min(remainingProfit, limit - previousLimit);
    
    if (slabAmount <= 0) break;
    
    const slabTax = slabAmount * slab.rate;
    totalTax += slabTax;
    
    breakdown.push({
      slab: slab.limit ? `NPR ${previousLimit.toLocaleString()} - ${limit.toLocaleString()}` : `Above NPR ${previousLimit.toLocaleString()}`,
      taxableAmount: slabAmount,
      tax: slabTax,
      rate: slab.rate * 100
    });
    
    remainingProfit -= slabAmount;
    previousLimit = limit;
  }
  
  return {
    estimatedTax: totalTax,
    effectiveRate: annualProfit > 0 ? (totalTax / annualProfit) * 100 : 0,
    slabBreakdown: breakdown
  };
}

// Get SSF calculation
export function calculateSSF(basicSalary: number, employeeCount: number): {
  applicable: boolean;
  employerContribution: number;
  employeeContribution: number;
  totalMonthly: number;
  totalAnnual: number;
} {
  const applicable = employeeCount >= NEPAL_TAX_DATA.ssf.minimum_employees_required;
  
  if (!applicable) {
    return {
      applicable: false,
      employerContribution: 0,
      employeeContribution: 0,
      totalMonthly: 0,
      totalAnnual: 0
    };
  }
  
  const employerContribution = basicSalary * NEPAL_TAX_DATA.ssf.employer_contribution;
  const employeeContribution = basicSalary * NEPAL_TAX_DATA.ssf.employee_contribution;
  const totalMonthly = employerContribution + employeeContribution;
  
  return {
    applicable: true,
    employerContribution,
    employeeContribution,
    totalMonthly,
    totalAnnual: totalMonthly * 12
  };
}
