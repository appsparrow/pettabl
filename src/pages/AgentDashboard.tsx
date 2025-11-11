import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Dog, CheckCircle, Camera, LogOut, Award, Calendar, PawPrint } from "lucide-react";

type Assignment = {
  session_id: string;
  status: string;
  start_date: string;
  end_date: string;
  pet?: {
    id: string;
    name: string;
    photo_url: string | null;
  } | null;
};

type TaskToday = {
  id: string;
  title: string;
  time_period: string | null;
  session_id: string;
  pet_name: string;
};

interface Profile {
  name: string;
  paw_points: number;
}

const AgentDashboard = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [tasksToday, setTasksToday] = useState<TaskToday[]>([]);
  const [loading, setLoading] = useState(true);
  const [assignmentsLoading, setAssignmentsLoading] = useState(true);
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
      await loadAssignmentsAndTasks(user.id);
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

  const loadAssignmentsAndTasks = async (agentId: string) => {
    setAssignmentsLoading(true);
    try {
      const { data: assignmentsData, error: assignmentsError } = await supabase
        .from("session_agents")
        .select(`
          session_id,
          sessions (
            id,
            status,
            start_date,
            end_date,
            pets ( id, name, photo_url )
          )
        `)
        .eq("fur_agent_id", agentId)
        .order("created_at", { ascending: false });

      if (assignmentsError) throw assignmentsError;

      const mappedAssignments: Assignment[] = (assignmentsData || [])
        .map((item) => {
          const session = item.sessions;
          if (!session) return null;
          return {
            session_id: session.id,
            status: session.status,
            start_date: session.start_date,
            end_date: session.end_date,
            pet: session.pets ?? null,
          };
        })
        .filter(Boolean) as Assignment[];

      setAssignments(mappedAssignments);

      if (mappedAssignments.length > 0) {
        const sessionIds = mappedAssignments.map((assignment) => assignment.session_id);
        const today = new Date().toISOString().split("T")[0];

        const { data: tasksData, error: tasksError } = await supabase
          .from("care_tasks")
          .select(`
            id,
            title,
            time_period,
            session_id,
            valid_from,
            valid_to,
            sessions (
              id,
              pets ( name )
            )
          `)
          .in("session_id", sessionIds)
          .order("created_at", { ascending: true });

        if (tasksError) throw tasksError;

        const mappedTasks: TaskToday[] = (tasksData || [])
          .filter((task) => {
            const { valid_from, valid_to } = task as any;
            const withinStart = !valid_from || valid_from <= today;
            const withinEnd = !valid_to || valid_to >= today;
            return withinStart && withinEnd;
          })
          .map((task) => ({
            id: task.id,
            title: task.title,
            time_period: task.time_period,
            session_id: task.session_id,
            pet_name: task.sessions?.pets?.name ?? "",
          }));

        setTasksToday(mappedTasks);
      } else {
        setTasksToday([]);
      }
    } catch (error) {
      console.error("Error loading assignments:", error);
      toast({
        title: "Error",
        description: "We couldn't load your assignments."
      });
    } finally {
      setAssignmentsLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const tasksCountLabel = useMemo(() => {
    if (assignmentsLoading) return "";
    return tasksToday.length === 1 ? "1 task" : `${tasksToday.length} tasks`;
  }, [assignmentsLoading, tasksToday.length]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-md mx-auto pb-24">
        {/* Header */}
        <div className="bg-gradient-to-br from-secondary via-secondary/90 to-accent p-6 pt-12 pb-8 rounded-b-[2rem]">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                <Award className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-white/80 text-sm">Hello</p>
                <h1 className="text-2xl font-bold text-white">
                  {profile?.name}! 🐾
                </h1>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={handleSignOut}
              className="text-white hover:bg-white/20"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>

          {/* Paw Points */}
          <div className="bg-white/20 backdrop-blur-sm rounded-3xl p-4 flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm mb-1">Your Paw Points</p>
              <p className="text-3xl font-bold text-white">{profile?.paw_points || 0}</p>
            </div>
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <Award className="h-8 w-8 text-white" />
            </div>
          </div>
        </div>

        <div className="p-4 space-y-4 mt-4">
          {/* Today's Tasks */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold">Today's Tasks</h2>
              <span className="text-sm text-muted-foreground">{tasksCountLabel}</span>
            </div>
            <Card className="rounded-3xl border-0 shadow-lg overflow-hidden">
              <CardContent className="p-6">
                {assignmentsLoading ? (
                  <div className="flex flex-col items-center justify-center py-6 text-muted-foreground">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-3"></div>
                    <p>Loading your tasks…</p>
                  </div>
                ) : tasksToday.length === 0 ? (
                  <div className="text-center py-6">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                      <Calendar className="h-8 w-8 text-muted-foreground/40" />
                    </div>
                    <p className="text-muted-foreground mb-2">No tasks today</p>
                    <p className="text-sm text-muted-foreground">You're all caught up! 🎉</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {tasksToday.slice(0, 3).map((task) => (
                      <div key={task.id} className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <CheckCircle className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-foreground">{task.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {task.pet_name ? `${task.pet_name} • ` : ""}
                            {task.time_period ? task.time_period : "Any time"}
                          </p>
                        </div>
                        <button className="text-sm text-secondary font-medium">Open</button>
                      </div>
                    ))}
                    {tasksToday.length > 3 && (
                      <button className="w-full text-sm text-secondary font-medium">View all tasks</button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* My Assignments */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold">My Assignments</h2>
              <button className="text-sm text-secondary font-medium">View All</button>
            </div>
            <div className="space-y-3">
              {assignmentsLoading ? (
                <Card className="rounded-3xl border-0 shadow-lg">
                  <CardContent className="p-6 flex flex-col items-center justify-center text-muted-foreground">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary mb-3"></div>
                    <p>Loading your assignments…</p>
                  </CardContent>
                </Card>
              ) : assignments.length === 0 ? (
                <Card className="rounded-3xl border-0 shadow-lg">
                  <CardContent className="p-6 text-center text-muted-foreground">
                    No assignments yet
                  </CardContent>
                </Card>
              ) : (
                assignments.slice(0, 3).map((assignment) => (
                  <Card key={assignment.session_id} className="rounded-3xl border-0 shadow-lg">
                    <CardContent className="p-5 flex items-start gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary">
                        {assignment.pet?.photo_url ? (
                          <img
                            src={assignment.pet.photo_url}
                            alt={assignment.pet.name}
                            className="w-full h-full object-cover rounded-2xl"
                          />
                        ) : (
                          <PawPrint className="h-6 w-6" />
                        )}
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="font-semibold text-foreground">
                          {assignment.pet?.name ?? "Assigned Pet"}
                        </p>
                        <p className="text-sm text-muted-foreground capitalize">
                          {assignment.status.replace("_", " ")}
                        </p>
                        <p className="text-xs text-muted-foreground/70">
                          {new Date(assignment.start_date).toLocaleDateString()} — {new Date(assignment.end_date).toLocaleDateString()}
                        </p>
                      </div>
                      <button className="text-sm text-secondary font-medium">Open</button>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <h2 className="text-lg font-bold mb-3">Recent Activity</h2>
            <div className="space-y-3">
              <Card className="rounded-3xl border-0 shadow-lg bg-gradient-to-br from-mint/20 to-mint/5">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 bg-mint/30 rounded-full flex items-center justify-center">
                    <Award className="h-5 w-5 text-mint-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Welcome to DingDongDog!</p>
                    <p className="text-sm text-muted-foreground">Start earning Paw Points</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentDashboard;
