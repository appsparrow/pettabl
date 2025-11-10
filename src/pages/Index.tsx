import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dog, Heart, Calendar, Camera, Award, CheckCircle } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10">
      {/* Hero Section */}
      <div className="container mx-auto px-4 pt-20 pb-16">
        <div className="text-center space-y-6 max-w-4xl mx-auto">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <Dog className="h-24 w-24 text-primary animate-tail-wag" />
              <Heart className="h-10 w-10 text-secondary absolute -top-2 -right-2 animate-paw-bounce" />
            </div>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-primary mb-4">
            DingDongDog
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
            Your playful, mobile-first pet care coordination app that keeps every pet happy, healthy, and loved—even when you're away! 🐾
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Button 
              size="lg" 
              className="text-lg px-8"
              onClick={() => navigate("/auth")}
            >
              Get Started
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="text-lg px-8"
              onClick={() => navigate("/auth")}
            >
              Sign In
            </Button>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Notion × Duolingo × Tamagotchi for Real Pets
          </h2>
          <p className="text-lg text-muted-foreground">
            Structured routines, joyful check-ins, and a touch of gamified fun
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Calendar className="h-12 w-12 text-primary mb-4" />
              <CardTitle>Care Sessions</CardTitle>
              <CardDescription>
                Schedule care periods with start/end dates and assign trusted Fur Agents
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CheckCircle className="h-12 w-12 text-secondary mb-4" />
              <CardTitle>Daily Tasks</CardTitle>
              <CardDescription>
                Complete feeding, walking, and medication tasks with photo proof
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Camera className="h-12 w-12 text-accent mb-4" />
              <CardTitle>Photo Journal</CardTitle>
              <CardDescription>
                Share moments and updates with automatic daily summaries
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Award className="h-12 w-12 text-primary mb-4" />
              <CardTitle>Paw Points</CardTitle>
              <CardDescription>
                Earn rewards for task completion, streaks, and consistent care
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Heart className="h-12 w-12 text-secondary mb-4" />
              <CardTitle>Mood Meter</CardTitle>
              <CardDescription>
                Track your pet's happiness based on timely care and attention
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Dog className="h-12 w-12 text-accent mb-4" />
              <CardTitle>Pet Profiles</CardTitle>
              <CardDescription>
                Manage multiple pets with medical info, preferences, and routines
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-16">
        <Card className="max-w-3xl mx-auto bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20">
          <CardHeader className="text-center space-y-4">
            <CardTitle className="text-3xl">Ready to Start Your Pet Care Journey?</CardTitle>
            <CardDescription className="text-lg">
              Join DingDongDog today and experience the joy of coordinated pet care!
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center pb-8">
            <Button 
              size="lg" 
              className="text-lg px-12"
              onClick={() => navigate("/auth")}
            >
              Create Free Account
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
