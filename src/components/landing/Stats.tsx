const stats = [
  {
    value: "10K+",
    label: "Documents Processed",
    description: "Monthly financial documents analyzed",
  },
  {
    value: "98%",
    label: "Extraction Accuracy",
    description: "AI-powered data extraction rate",
  },
  {
    value: "500+",
    label: "SMEs Empowered",
    description: "Businesses gaining financial clarity",
  },
  {
    value: "₨50Cr+",
    label: "Loans Facilitated",
    description: "Credit access enabled through credibility",
  },
];

const Stats = () => {
  return (
    <section className="py-20 bg-gradient-hero relative overflow-hidden">
      {/* Background Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: '40px 40px',
        }}
      />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className="text-center group"
            >
              <div className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gradient mb-2 group-hover:scale-110 transition-transform duration-300">
                {stat.value}
              </div>
              <div className="text-lg font-semibold text-primary-foreground mb-1">
                {stat.label}
              </div>
              <div className="text-sm text-primary-foreground/60">
                {stat.description}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Stats;
