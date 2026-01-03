import { Upload, Cpu, LineChart, BadgeCheck } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: Upload,
    title: "Upload Your Documents",
    description: "Simply upload your bank statements, invoices, bills, and receipts. We support PDFs, images, CSVs, and even screenshots.",
  },
  {
    number: "02",
    icon: Cpu,
    title: "AI Processes & Extracts",
    description: "Our AI automatically extracts, categorizes, and normalizes your financial data using Nepal-specific context.",
  },
  {
    number: "03",
    icon: LineChart,
    title: "Get Actionable Insights",
    description: "View comprehensive analytics, predictions, and personalized recommendations for your business growth.",
  },
  {
    number: "04",
    icon: BadgeCheck,
    title: "Build Verified Credibility",
    description: "Create blockchain-verified proofs of your financial health to share with lenders and partners.",
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Simple Steps to
            <span className="text-gradient"> Financial Intelligence</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            No accounting knowledge required. Transform your everyday business 
            data into structured intelligence in minutes.
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connection Line */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-accent/30 to-transparent -translate-y-1/2" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div
                key={step.number}
                className="relative group"
              >
                {/* Step Card */}
                <div className="relative bg-card rounded-2xl p-6 border border-border hover:border-accent/30 transition-all duration-300 hover:shadow-card h-full">
                  {/* Step Number */}
                  <div className="absolute -top-4 left-6 px-3 py-1 rounded-full bg-accent text-accent-foreground text-sm font-bold">
                    {step.number}
                  </div>
                  
                  {/* Icon */}
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4 mt-2 group-hover:bg-accent/10 transition-colors duration-300">
                    <step.icon className="w-7 h-7 text-primary group-hover:text-accent transition-colors duration-300" />
                  </div>
                  
                  {/* Content */}
                  <h3 className="text-xl font-semibold text-foreground mb-3">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {/* Arrow for desktop */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-8 text-accent/50">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
