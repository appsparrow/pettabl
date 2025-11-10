import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Dog, CheckCircle, Camera, LogOut, Award } from "lucide-react";

interface Profile {
  name: string;
  paw_points: number;
}

const AgentDashboard = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data: profileData, error } = await supabase
        .from("profiles")
        .select("name, paw_points, role")
        .eq("id", user.id)
        .single();

      if (error) throw error;

      if (profileData.role === "fur_boss") {
        navigate("/boss-dashboard");
        return;
      }

      setProfile(profileData);
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "Failed to load profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-accent/5 via-background to-secondary/5 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Dog className="h-10 w-10 text-accent animate-tail-wag" />
            <div>
              <h1 className="text-3xl font-bold text-accent">
                Hello, {profile?.name}! 🐾
              </h1>
              <p className="text-muted-foreground">Ready to spread some paw-sitivity?</p>
            </div>
          </div>
          <Button variant="outline" onClick={handleSignOut}>
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>

        {/* Paw Points Card */}
        <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">Your Paw Points</CardTitle>
                <CardDescription>Keep up the great work!</CardDescription>
              </div>
              <Award className="h-12 w-12 text-accent" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-5xl font-bold text-accent mb-2">
              {profile?.paw_points || 0}
            </div>
            <p className="text-sm text-muted-foreground">
              Earned from caring for furry friends
            </p>
          </CardContent>
        </Card>

        {/* Today's Tasks */}
        <Card>
          <CardHeader>
            <CardTitle>Today's Tasks</CardTitle>
            <CardDescription>Complete tasks to earn Paw Points!</CardDescription>
          </CardHeader>
          <CardContent className="text-center py-12">
            <CheckCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground mb-2">No tasks assigned yet</p>
            <p className="text-sm text-muted-foreground">
              Once a Fur Boss assigns you to a care session, your tasks will appear here
            </p>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Camera className="h-8 w-8 text-secondary" />
                <div>
                  <CardTitle>Photo Journal</CardTitle>
                  <CardDescription>View your uploaded moments</CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Award className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle>My Achievements</CardTitle>
                  <CardDescription>Badges and streaks</CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AgentDashboard;
