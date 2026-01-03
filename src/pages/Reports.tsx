import { useState } from "react";
import { FileText, Download, Calendar, Clock, CheckCircle, Plus, Loader2, Building2, FileCheck, Landmark } from "lucide-react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFinancialData } from "@/hooks/useFinancialData";
import { useRegulationInsights } from "@/hooks/useRegulationInsights";
import { 
  generateFinancialHealthReport, 
  generateVATReport, 
  generateLoanApplicationReport,
  generateTransactionReport,
  generateComplianceReport,
  downloadPDF 
} from "@/lib/pdfReportGenerator";
import {
  generateVATReturnForm,
  generateTDSStatement,
  generateAnnualTaxReturn,
  generateProfitLossStatement,
  generateBalanceSheet,
  generateBankLoanApplication,
  generateSSFReport,
  generateAuditPackage,
  type OfficialDocumentConfig
} from "@/lib/officialDocumentGenerator";
import BusinessInfoDialog from "@/components/reports/BusinessInfoDialog";
import { toast } from "sonner";

interface GeneratedReport {
  id: string;
  name: string;
  type: string;
  createdAt: string;
  status: "ready" | "generating";
}

// Analytics report templates (data analysis)
const analyticsTemplates = [
  {
    id: "financial-health",
    name: "Financial Health Report",
    description: "Overall business financial health analysis",
    icon: "💹",
    category: "Analysis",
  },
  {
    id: "transaction-report",
    name: "Transaction Report",
    description: "Detailed list of all transactions from your documents",
    icon: "📊",
    category: "Analysis",
  },
  {
    id: "compliance",
    name: "Compliance Checklist",
    description: "Regulatory compliance status and requirements",
    icon: "✅",
    category: "Compliance",
  },
];

// Official document templates (government/bank submissions)
const officialDocumentTemplates = [
  {
    id: "vat-return-form",
    name: "VAT Return Form",
    description: "Official VAT return document as per IRD format",
    icon: "📋",
    category: "Tax",
    recipient: "IRD",
  },
  {
    id: "tds-statement",
    name: "TDS Deposit Statement",
    description: "Tax Deducted at Source report for IRD submission",
    icon: "🧾",
    category: "Tax",
    recipient: "IRD",
  },
  {
    id: "annual-tax-return",
    name: "Annual Tax Return",
    description: "Income tax computation statement for annual filing",
    icon: "📑",
    category: "Tax",
    recipient: "IRD",
  },
  {
    id: "profit-loss",
    name: "Profit & Loss Statement",
    description: "Official P&L statement for stakeholders and auditors",
    icon: "📈",
    category: "Financial",
    recipient: "Banks/Partners",
  },
  {
    id: "balance-sheet",
    name: "Balance Sheet",
    description: "Statement of assets, liabilities and equity",
    icon: "⚖️",
    category: "Financial",
    recipient: "Banks/Auditors",
  },
  {
    id: "bank-loan-app",
    name: "Bank Loan Application",
    description: "Financial summary package for loan applications",
    icon: "🏦",
    category: "Banking",
    recipient: "Banks",
  },
  {
    id: "ssf-report",
    name: "SSF Contribution Report",
    description: "Social Security Fund contribution statement",
    icon: "👥",
    category: "Compliance",
    recipient: "SSF",
  },
  {
    id: "audit-package",
    name: "Audit-Ready Package",
    description: "Comprehensive documentation for external audit",
    icon: "📁",
    category: "Audit",
    recipient: "Auditors",
  },
];

const Reports = () => {
  const { metrics, isLoading, hasData } = useFinancialData();
  const { insights, isLoading: insightsLoading, analyzeRegulations } = useRegulationInsights();
  const [generatingReport, setGeneratingReport] = useState<string | null>(null);
  const [generatedReports, setGeneratedReports] = useState<GeneratedReport[]>([]);
  const [showBusinessInfoDialog, setShowBusinessInfoDialog] = useState(false);
  const [selectedOfficialDoc, setSelectedOfficialDoc] = useState<string | null>(null);

  const handleGenerateAnalyticsReport = async (templateId: string) => {
    if (!hasData) {
      toast.error("No data available", {
        description: "Please upload some documents first to generate reports."
      });
      return;
    }

    setGeneratingReport(templateId);
    await new Promise(resolve => setTimeout(resolve, 500));

    try {
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0];
      const config = {
        title: "",
        businessName: "Your Business",
        dateRange: `As of ${now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`
      };

      let doc;
      let reportName;

      switch (templateId) {
        case "financial-health":
          config.title = "Financial Health Report";
          doc = generateFinancialHealthReport(metrics, config);
          reportName = `Financial Health Report - ${dateStr}`;
          break;
        case "transaction-report":
          config.title = "Transaction Report";
          doc = generateTransactionReport(metrics.recentTransactions, config);
          reportName = `Transaction Report - ${dateStr}`;
          break;
        case "compliance":
          if (!insights) {
            toast.info("Analyzing compliance...", {
              description: "Please wait while we analyze your documents."
            });
            await analyzeRegulations();
            setGeneratingReport(null);
            return;
          }
          config.title = "Compliance Report";
          doc = generateComplianceReport(insights, config);
          reportName = `Compliance Report - ${dateStr}`;
          break;
        default:
          toast.error("Report type not available");
          setGeneratingReport(null);
          return;
      }

      downloadPDF(doc, reportName);
      addToRecentReports(templateId, reportName, "Analytics");
      toast.success("Report generated!", { description: "Your PDF has been downloaded." });
    } catch (error) {
      console.error("Error generating report:", error);
      toast.error("Failed to generate report");
    } finally {
      setGeneratingReport(null);
    }
  };

  const handleOfficialDocClick = (templateId: string) => {
    if (!hasData) {
      toast.error("No data available", {
        description: "Please upload some documents first to generate official documents."
      });
      return;
    }
    setSelectedOfficialDoc(templateId);
    setShowBusinessInfoDialog(true);
  };

  const handleGenerateOfficialDocument = async (config: OfficialDocumentConfig) => {
    if (!selectedOfficialDoc) return;

    setGeneratingReport(selectedOfficialDoc);
    await new Promise(resolve => setTimeout(resolve, 500));

    try {
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0];
      let doc;
      let reportName;
      const template = officialDocumentTemplates.find(t => t.id === selectedOfficialDoc);

      switch (selectedOfficialDoc) {
        case "vat-return-form":
          doc = generateVATReturnForm(metrics, config);
          reportName = `VAT Return Form - ${dateStr}`;
          break;
        case "tds-statement":
          doc = generateTDSStatement(metrics, config);
          reportName = `TDS Statement - ${dateStr}`;
          break;
        case "annual-tax-return":
          doc = generateAnnualTaxReturn(metrics, config);
          reportName = `Annual Tax Return - ${dateStr}`;
          break;
        case "profit-loss":
          doc = generateProfitLossStatement(metrics, config);
          reportName = `Profit Loss Statement - ${dateStr}`;
          break;
        case "balance-sheet":
          doc = generateBalanceSheet(metrics, config);
          reportName = `Balance Sheet - ${dateStr}`;
          break;
        case "bank-loan-app":
          doc = generateBankLoanApplication(metrics, config);
          reportName = `Bank Loan Application - ${dateStr}`;
          break;
        case "ssf-report":
          doc = generateSSFReport(metrics, config);
          reportName = `SSF Report - ${dateStr}`;
          break;
        case "audit-package":
          doc = generateAuditPackage(metrics, insights, config);
          reportName = `Audit Package - ${dateStr}`;
          break;
        default:
          toast.error("Document type not available");
          setGeneratingReport(null);
          return;
      }

      doc.save(`${reportName}.pdf`);
      addToRecentReports(selectedOfficialDoc, reportName, template?.category || "Official");
      toast.success("Official document generated!", { description: "Your PDF has been downloaded." });
    } catch (error) {
      console.error("Error generating document:", error);
      toast.error("Failed to generate document");
    } finally {
      setGeneratingReport(null);
      setSelectedOfficialDoc(null);
    }
  };

  const addToRecentReports = (templateId: string, name: string, type: string) => {
    const newReport: GeneratedReport = {
      id: `${templateId}-${Date.now()}`,
      name,
      type,
      createdAt: new Date().toISOString().split('T')[0],
      status: "ready"
    };
    setGeneratedReports(prev => [newReport, ...prev]);
  };

  return (
    <div className="min-h-screen">
      <DashboardHeader 
        title="Reports & Documents" 
        subtitle="Generate analytics reports and official financial documents for government, banks, and partners"
        showAddButton
        addButtonText="New Document"
      />
      
      <div className="p-6 space-y-8">
        {/* Data Status Banner */}
        {!isLoading && !hasData && (
          <div className="bg-warning/10 border border-warning/30 rounded-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-warning/20 flex items-center justify-center">
              <FileText className="w-5 h-5 text-warning" />
            </div>
            <div>
              <h4 className="font-medium text-foreground">No documents uploaded yet</h4>
              <p className="text-sm text-muted-foreground">
                Upload bank statements, invoices, or receipts to generate accurate reports and official documents.
              </p>
            </div>
          </div>
        )}

        {/* Tabs for different document types */}
        <Tabs defaultValue="official" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="official" className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Official Documents
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <FileCheck className="w-4 h-4" />
              Analytics Reports
            </TabsTrigger>
          </TabsList>

          {/* Official Documents Tab */}
          <TabsContent value="official" className="mt-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Official Document Generator</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Generate official financial documents required for government submissions, bank applications, and partner reporting. 
                  All documents follow Nepal's regulatory formats.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {officialDocumentTemplates.map((template) => {
                  const isGenerating = generatingReport === template.id;
                  
                  return (
                    <div
                      key={template.id}
                      className="group bg-card rounded-xl border border-border p-5 hover:shadow-card hover:border-accent/30 transition-all"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="text-3xl">{template.icon}</div>
                        <div className="flex flex-col items-end gap-1">
                          <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                            {template.category}
                          </span>
                          <span className="text-xs text-accent">
                            → {template.recipient}
                          </span>
                        </div>
                      </div>
                      <h4 className="font-semibold text-foreground mb-2 group-hover:text-accent transition-colors">
                        {template.name}
                      </h4>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {template.description}
                      </p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full group-hover:border-accent group-hover:text-accent"
                        onClick={() => handleOfficialDocClick(template.id)}
                        disabled={isGenerating || isLoading}
                      >
                        {isGenerating ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <FileText className="w-4 h-4 mr-2" />
                            Generate
                          </>
                        )}
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          </TabsContent>

          {/* Analytics Reports Tab */}
          <TabsContent value="analytics" className="mt-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Analytics Reports</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Generate data analysis reports based on your uploaded financial documents.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {analyticsTemplates.map((template) => {
                  const isGenerating = generatingReport === template.id;
                  
                  return (
                    <div
                      key={template.id}
                      className="group bg-card rounded-xl border border-border p-5 hover:shadow-card hover:border-accent/30 transition-all"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="text-3xl">{template.icon}</div>
                        <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded-full">
                          {template.category}
                        </span>
                      </div>
                      <h4 className="font-semibold text-foreground mb-2 group-hover:text-accent transition-colors">
                        {template.name}
                      </h4>
                      <p className="text-sm text-muted-foreground mb-4">
                        {template.description}
                      </p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full group-hover:border-accent group-hover:text-accent"
                        onClick={() => handleGenerateAnalyticsReport(template.id)}
                        disabled={isGenerating || isLoading}
                      >
                        {isGenerating ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Plus className="w-4 h-4 mr-2" />
                            Generate PDF
                          </>
                        )}
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Recently Generated Reports */}
        {generatedReports.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">Recently Generated</h3>
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <table className="w-full">
                <thead className="bg-muted/50 border-b border-border">
                  <tr>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Document</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground hidden sm:table-cell">Type</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground hidden md:table-cell">Created</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {generatedReports.slice(0, 10).map((report) => (
                    <tr key={report.id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <FileText className="w-5 h-5 text-primary" />
                          </div>
                          <span className="font-medium text-foreground text-sm">{report.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 hidden sm:table-cell">
                        <span className="text-sm text-muted-foreground">{report.type}</span>
                      </td>
                      <td className="py-4 px-4 hidden md:table-cell">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          {report.createdAt}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-success bg-success/10 px-2 py-1 rounded-full">
                          <CheckCircle className="w-3 h-3" />
                          Ready
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Nepal-Specific Templates Info */}
        <div className="bg-gradient-hero rounded-2xl p-8 text-primary-foreground">
          <div className="flex flex-col md:flex-row items-start gap-6">
            <div className="w-16 h-16 rounded-2xl bg-accent/20 flex items-center justify-center flex-shrink-0">
              <Landmark className="w-8 h-8 text-accent" />
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2">Nepal-Compliant Official Documents</h3>
              <p className="text-primary-foreground/70 mb-4">
                All official documents are designed specifically for Nepal's regulatory requirements. 
                They follow IRD formats, NRB guidelines, and are accepted by major banks, the SSF, and government bodies.
                Save hours of manual documentation work.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 rounded-full bg-primary-foreground/10 text-sm">IRD Format</span>
                <span className="px-3 py-1 rounded-full bg-primary-foreground/10 text-sm">NRB Compliant</span>
                <span className="px-3 py-1 rounded-full bg-primary-foreground/10 text-sm">Bank Ready</span>
                <span className="px-3 py-1 rounded-full bg-primary-foreground/10 text-sm">SSF Compatible</span>
                <span className="px-3 py-1 rounded-full bg-primary-foreground/10 text-sm">Audit Ready</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Business Info Dialog */}
      <BusinessInfoDialog
        open={showBusinessInfoDialog}
        onOpenChange={setShowBusinessInfoDialog}
        onSubmit={handleGenerateOfficialDocument}
        documentType={officialDocumentTemplates.find(t => t.id === selectedOfficialDoc)?.name || "Document"}
      />
    </div>
  );
};

export default Reports;
