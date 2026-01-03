import { 
  FileText, 
  Brain, 
  BarChart3, 
  MessageSquare, 
  Shield, 
  FileCheck,
  Zap,
  Globe
} from "lucide-react";

const features = [
  {
    icon: FileText,
    title: "Smart Document Processing",
    description: "Upload bank statements, invoices, bills, and receipts. Our AI extracts and normalizes financial data automatically.",
    color: "text-info",
    bgColor: "bg-info/10",
  },
  {
    icon: Brain,
    title: "AI Financial Intelligence",
    description: "Advanced analytics powered by AI that understands Nepal's business context, regulations, and financial patterns.",
    color: "text-accent",
    bgColor: "bg-accent/10",
  },
  {
    icon: BarChart3,
    title: "Predictive Analytics",
    description: "Cashflow forecasting, revenue predictions, and risk analysis to help you make informed business decisions.",
    color: "text-success",
    bgColor: "bg-success/10",
  },
  {
    icon: MessageSquare,
    title: "AI Financial Assistant",
    description: "Ask questions in plain language. Get insights about your finances, tax obligations, and compliance requirements.",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    icon: Shield,
    title: "Blockchain Verification",
    description: "Create verifiable proofs of your financial health without exposing sensitive data. Build credibility with lenders.",
    color: "text-warning",
    bgColor: "bg-warning/10",
  },
  {
    icon: FileCheck,
    title: "Automated Reports",
    description: "Generate loan applications, tax summaries, and compliance reports formatted for Nepal's financial institutions.",
    color: "text-destructive",
    bgColor: "bg-destructive/10",
  },
  {
    icon: Globe,
    title: "Nepal Regulatory Knowledge",
    description: "Built-in knowledge of NRB regulations, IRD tax rules, and VAT frameworks. Always compliant, always current.",
    color: "text-info",
    bgColor: "bg-info/10",
  },
  {
    icon: Zap,
    title: "Real-time Insights",
    description: "Monitor your business health in real-time. Get alerts for unusual patterns, compliance deadlines, and opportunities.",
    color: "text-accent",
    bgColor: "bg-accent/10",
  },
];

const Features = () => {
  return (
    <section id="features" className="py-24 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Everything You Need for
            <span className="text-gradient"> Financial Clarity</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            From document processing to blockchain verification, Arthiq.ai provides 
            a complete financial intelligence ecosystem tailored for Nepali SMEs.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group relative p-6 rounded-2xl bg-card border border-border hover:border-accent/30 transition-all duration-300 hover:shadow-card"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Icon */}
              <div className={`w-12 h-12 rounded-xl ${feature.bgColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className={`w-6 h-6 ${feature.color}`} />
              </div>
              
              {/* Content */}
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>

              {/* Hover Glow Effect */}
              <div className="absolute inset-0 rounded-2xl bg-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
