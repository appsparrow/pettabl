import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Dog, Heart, Calendar, Users, Shield, Smartphone, Check } from "lucide-react";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="text-center max-w-4xl mx-auto">
          <div className="flex justify-center mb-8">
            <img 
              src="/logo-pettabl.png" 
              alt="Pettabl Logo" 
              className="h-24 md:h-32 w-auto"
            />
          </div>
          
          <p className="text-2xl md:text-3xl text-muted-foreground mb-8">
            Modern Pet Care Coordination 🐾
          </p>
          
          <p className="text-lg md:text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
            Seamlessly coordinate pet care between owners and caretakers. 
            Track activities, manage schedules, and keep your furry friends happy — anywhere, anytime.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="text-lg px-8 py-6 shadow-xl hover:shadow-2xl transition-all"
              onClick={() => navigate("/auth")}
            >
              Get Started Free 🚀
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8 py-6"
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Learn More
            </Button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="py-20 bg-gradient-to-b from-background to-primary/5">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 text-primary">
            Everything Your Pets Need
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Feature Cards */}
            <FeatureCard
              icon={<Calendar className="h-8 w-8" />}
              title="Smart Scheduling"
              description="Create custom care schedules for feeding, walks, and playtime. Set recurring tasks and never miss a beat."
            />
            
            <FeatureCard
              icon={<Users className="h-8 w-8" />}
              title="Easy Coordination"
              description="Invite trusted caretakers, assign tasks, and track completion in real-time. Everyone stays in sync."
            />
            
            <FeatureCard
              icon={<Heart className="h-8 w-8" />}
              title="Activity Tracking"
              description="Photo updates, notes, and timestamps for every interaction. See exactly how your pet's day went."
            />
            
            <FeatureCard
              icon={<Shield className="h-8 w-8" />}
              title="Secure & Private"
              description="Your pet's data is protected with enterprise-grade security. Only authorized users can access information."
            />
            
            <FeatureCard
              icon={<Smartphone className="h-8 w-8" />}
              title="Mobile & Web"
              description="Access from any device — iPhone, Android, or web browser. Your pet care hub is always with you."
            />
            
            <FeatureCard
              icon={<Dog className="h-8 w-8" />}
              title="Multi-Pet Support"
              description="Manage multiple pets effortlessly. Each pet gets their own profile, schedule, and care history."
            />
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="py-20 bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 text-primary">
            How It Works
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <StepCard
              number="1"
              title="Create Your Account"
              description="Sign up as a Pet Owner (Fur Boss) or Caretaker (Fur Agent) in seconds."
            />
            
            <StepCard
              number="2"
              title="Add Your Pets"
              description="Set up profiles for your furry friends with photos, schedules, and care instructions."
            />
            
            <StepCard
              number="3"
              title="Start Coordinating"
              description="Invite caretakers, assign sessions, and track activities. It's that simple!"
            />
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-gradient-to-br from-primary to-secondary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Transform Pet Care?
          </h2>
          
          <p className="text-xl md:text-2xl mb-12 opacity-90 max-w-2xl mx-auto">
            Join pet owners and caretakers who trust Pettabl for seamless coordination.
          </p>
          
          <Button
            size="lg"
            variant="secondary"
            className="text-lg px-12 py-6 shadow-2xl hover:scale-105 transition-transform"
            onClick={() => navigate("/auth")}
          >
            Get Started — It's Free! 🎉
          </Button>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-12 bg-muted/30">
        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-center mb-6">
            <img 
              src="/logo-pettabl.png" 
              alt="Pettabl Logo" 
              className="h-16 w-auto"
            />
          </div>
          
          <p className="text-muted-foreground mb-4">
            © 2025 Pettabl. Made with ❤️ for pets everywhere.
          </p>
          
          <div className="flex justify-center gap-6 text-sm text-muted-foreground">
            <a href="/auth" className="hover:text-primary transition-colors">Sign In</a>
            <span>•</span>
            <a href="mailto:contact@pettabl.com" className="hover:text-primary transition-colors">
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Feature Card Component
const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) => (
  <div className="bg-card border border-border rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all hover:scale-105">
    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-6">
      {icon}
    </div>
    <h3 className="text-xl font-bold mb-3 text-foreground">{title}</h3>
    <p className="text-muted-foreground leading-relaxed">{description}</p>
  </div>
);

// Step Card Component
const StepCard = ({ number, title, description }: { number: string; title: string; description: string }) => (
  <div className="text-center">
    <div className="w-16 h-16 rounded-full bg-primary text-white text-2xl font-bold flex items-center justify-center mx-auto mb-6 shadow-lg">
      {number}
    </div>
    <h3 className="text-2xl font-bold mb-3 text-foreground">{title}</h3>
    <p className="text-muted-foreground leading-relaxed">{description}</p>
  </div>
);

export default Landing;

