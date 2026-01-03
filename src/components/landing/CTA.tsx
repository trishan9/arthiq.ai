import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

const CTA = () => {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-hero p-8 sm:p-12 lg:p-16">
          {/* Background Elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-accent/20 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-info/10 rounded-full blur-[120px]" />
          
          {/* Grid Pattern */}
          <div 
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)`,
              backgroundSize: '40px 40px',
            }}
          />

          <div className="relative z-10 text-center max-w-3xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-8">
              <Sparkles className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium text-primary-foreground/80">
                Start your free trial today
              </span>
            </div>

            {/* Heading */}
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-primary-foreground mb-6">
              Ready to Transform Your
              <br />
              <span className="text-gradient">Financial Future?</span>
            </h2>

            {/* Description */}
            <p className="text-lg text-primary-foreground/70 mb-10 max-w-2xl mx-auto">
              Join hundreds of Nepali SMEs who are already using Arthiq.ai to 
              gain financial clarity, build credibility, and access formal financial services.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/dashboard">
                <Button variant="hero" size="xl" className="group">
                  Get Started Free
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="hero-outline" size="xl">
                  Schedule a Demo
                </Button>
              </Link>
            </div>

            {/* Trust Note */}
            <p className="text-sm text-primary-foreground/50 mt-8">
              No credit card required • Free 14-day trial • Cancel anytime
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
