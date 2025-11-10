import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Dog, Plus, Calendar, LogOut } from "lucide-react";

interface Profile {
  name: string;
  paw_points: number;
}

const BossDashboard = () => {
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

      if (profileData.role !== "fur_boss") {
        navigate("/agent-dashboard");
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
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-muted p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Dog className="h-10 w-10 text-primary animate-tail-wag" />
            <div>
              <h1 className="text-3xl font-bold text-primary">
                Welcome, {profile?.name}! 🐕
              </h1>
              <p className="text-muted-foreground">Your pet care command center</p>
            </div>
          </div>
          <Button variant="outline" onClick={handleSignOut}>
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">My Pets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">0</div>
              <p className="text-sm text-muted-foreground">Furry friends</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-secondary/10 to-secondary/5 border-secondary/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Active Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-secondary">0</div>
              <p className="text-sm text-muted-foreground">Care periods</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Fur Agents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-accent">0</div>
              <p className="text-sm text-muted-foreground">Trusted helpers</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Get started with your pet care journey</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button className="h-24 flex flex-col items-center justify-center gap-2">
              <Plus className="h-6 w-6" />
              <span className="font-semibold">Add Your Pet</span>
            </Button>
            <Button variant="outline" className="h-24 flex flex-col items-center justify-center gap-2">
              <Calendar className="h-6 w-6" />
              <span className="font-semibold">Create Care Session</span>
            </Button>
          </CardContent>
        </Card>

        {/* Coming Soon */}
        <Card>
          <CardHeader>
            <CardTitle>Your Pets</CardTitle>
            <CardDescription>Add your first pet to get started!</CardDescription>
          </CardHeader>
          <CardContent className="text-center py-12">
            <Dog className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">No pets yet. Add your first furry friend!</p>
            <Button className="mt-4">
              <Plus className="h-4 w-4 mr-2" />
              Add Pet
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BossDashboard;
