import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Brain, TrendingUp, Sparkles } from "lucide-react";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-hero">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Grid Pattern */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />
        
        {/* Glowing Orbs */}
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-accent/20 rounded-full blur-[120px] animate-pulse-subtle" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-info/20 rounded-full blur-[120px] animate-pulse-subtle" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[150px]" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-32 pb-20">
        <div className="max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-8 animate-fade-in">
            <Sparkles className="w-4 h-4 text-accent" />
            <span className="text-sm font-medium text-primary-foreground/80">
              Built for Nepal's SME Economy
            </span>
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-primary-foreground leading-tight mb-6 animate-slide-up">
            Financial Intelligence
            <br />
            <span className="text-gradient">for Real Businesses</span>
          </h1>

          {/* Subheading */}
          <p className="text-lg sm:text-xl text-primary-foreground/70 max-w-3xl mx-auto mb-10 leading-relaxed animate-slide-up delay-100">
            Transform fragmented financial data into actionable intelligence. 
            AI-powered insights built for Nepal's regulatory framework, 
            enabling SMEs to access formal financial services with confidence.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-slide-up delay-200">
            <Link to="/dashboard">
              <Button variant="hero" size="xl" className="group">
                Start Free Trial
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <a href="#how-it-works">
              <Button variant="hero-outline" size="xl">
                See How It Works
              </Button>
            </a>
          </div>

          {/* Trust Indicators */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto animate-slide-up delay-300">
            <div className="flex items-center justify-center gap-3 glass rounded-xl p-4">
              <div className="w-10 h-10 rounded-lg bg-success/20 flex items-center justify-center">
                <Brain className="w-5 h-5 text-success" />
              </div>
              <div className="text-left">
                <div className="text-2xl font-bold text-primary-foreground">AI-Powered</div>
                <div className="text-sm text-primary-foreground/60">Smart Analysis</div>
              </div>
            </div>
            
            <div className="flex items-center justify-center gap-3 glass rounded-xl p-4">
              <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
                <Shield className="w-5 h-5 text-accent" />
              </div>
              <div className="text-left">
                <div className="text-2xl font-bold text-primary-foreground">Blockchain</div>
                <div className="text-sm text-primary-foreground/60">Verified Trust</div>
              </div>
            </div>
            
            <div className="flex items-center justify-center gap-3 glass rounded-xl p-4">
              <div className="w-10 h-10 rounded-lg bg-info/20 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-info" />
              </div>
              <div className="text-left">
                <div className="text-2xl font-bold text-primary-foreground">Nepal-Ready</div>
                <div className="text-sm text-primary-foreground/60">Local Context</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};

export default Hero;
