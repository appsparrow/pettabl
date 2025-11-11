import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { LogOut, Award, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import PetAssignmentCard from "@/components/PetAssignmentCard";
import { RoleSwitcher } from "@/components/RoleSwitcher";
import { useRole } from "@/contexts/RoleContext";
import { eachDayOfInterval, format, parseISO, isAfter } from "date-fns";

interface Profile {
  name: string;
  paw_points: number;
}

interface PetAssignment {
  session_id: string;
  pet_id: string;
  pet_name: string;
  pet_photo_url: string | null;
  start_date: string;
  end_date: string;
  status: string;
  activities_today: number;
  total_activities_today: number;
  day_statuses: { date: string; status: "future" | "none" | "partial" | "complete" }[];
  isLastDayToday: boolean;
  isUpcoming: boolean;
}

const AgentDashboard = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [assignments, setAssignments] = useState<PetAssignment[]>([]);
  const [activeTab, setActiveTab] = useState<"current" | "upcoming">("current");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { activeRole, loading: roleLoading } = useRole();

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

      setProfile(profileData);
      await loadAssignments(user.id);
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

  // Role guard: redirect if not in Agent mode
  useEffect(() => {
    if (!roleLoading && activeRole && activeRole !== "fur_agent") {
      navigate("/boss-dashboard");
    }
  }, [activeRole, roleLoading, navigate]);

  const loadAssignments = async (agentId: string) => {
    try {
      const today = new Date().toISOString().split("T")[0];

      // Get all assigned sessions with pet info
      const { data: sessionData, error: sessionError } = await supabase
        .from("session_agents")
        .select(`
          session_id,
          sessions!inner (
            id,
            pet_id,
            start_date,
            end_date,
            status,
            pets (
              id,
              name,
              photo_url
            )
          )
        `)
        .eq("fur_agent_id", agentId)
        .in("sessions.status", ["active", "planned"]);

      if (sessionError) throw sessionError;

      if (!sessionData) {
        setAssignments([]);
        return;
      }

      // For each session, get schedule times and today's activities
      const assignmentsWithDetails = await Promise.all(
        sessionData.map(async (item) => {
          const session = item.sessions;
          const pet = session.pets;
          const start = parseISO(session.start_date);
          const end = parseISO(session.end_date);
          const daysInSession = eachDayOfInterval({ start, end });
          const todayDate = new Date();
          const todayStr = format(todayDate, "yyyy-MM-dd");

          // Get schedule times count
          const { data: scheduleData } = await supabase
            .from("schedules")
            .select("id")
            .eq("pet_id", session.pet_id)
            .is("session_id", null)
            .maybeSingle();

          let totalActivitiesToday = 0;
          if (scheduleData) {
            const { count } = await supabase
              .from("schedule_times")
              .select("*", { count: 'exact', head: true })
              .eq("schedule_id", scheduleData.id);
            totalActivitiesToday = count || 0;
          }

          // Get today's completed activities count
          const { count: activitiesCount } = await supabase
            .from("activities")
            .select("*", { count: 'exact', head: true })
            .eq("session_id", session.id)
            .eq("date", today);

          // Get all activities for the session to build timeline statuses
          const { data: activitiesAll } = await supabase
            .from("activities")
            .select("date")
            .eq("session_id", session.id)
            .gte("date", session.start_date)
            .lte("date", session.end_date);

          const activityMap = (activitiesAll || []).reduce<Record<string, number>>((acc, activity) => {
            acc[activity.date] = (acc[activity.date] || 0) + 1;
            return acc;
          }, {});

          const scheduleTasksPerDay = totalActivitiesToday;

          const dayStatuses = daysInSession.map((day) => {
            const dayStr = format(day, "yyyy-MM-dd");
            if (isAfter(day, todayDate)) {
              return { date: dayStr, status: "future" as const };
            }

            const completed = activityMap[dayStr] || 0;
            if (scheduleTasksPerDay === 0) {
              return {
                date: dayStr,
                status: completed > 0 ? ("complete" as const) : ("future" as const),
              };
            }
            if (completed === 0) {
              return { date: dayStr, status: "none" as const };
            }
            if (completed < scheduleTasksPerDay) {
              return { date: dayStr, status: "partial" as const };
            }
            return { date: dayStr, status: "complete" as const };
          });

          const isUpcoming = isAfter(start, todayDate);
          const isLastDayToday = format(end, "yyyy-MM-dd") === todayStr;

          return {
            session_id: session.id,
            pet_id: session.pet_id,
            pet_name: pet?.name || "Unknown Pet",
            pet_photo_url: pet?.photo_url || null,
            start_date: session.start_date,
            end_date: session.end_date,
            status: session.status,
            activities_today: activitiesCount || 0,
            total_activities_today: totalActivitiesToday,
            day_statuses: dayStatuses,
            isLastDayToday,
            isUpcoming,
          };
        })
      );

      setAssignments(assignmentsWithDetails);
    } catch (error) {
      console.error("Error loading assignments:", error);
      toast({
        title: "Error",
        description: "Failed to load assignments",
        variant: "destructive",
      });
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const handlePetClick = (sessionId: string) => {
    navigate(`/agent/pet/${sessionId}`);
  };

  const currentAssignments = assignments.filter((assignment) => !assignment.isUpcoming);
  const upcomingAssignments = assignments.filter((assignment) => assignment.isUpcoming);
  const visibleAssignments = activeTab === "current" ? currentAssignments : upcomingAssignments;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50">
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
            <div className="flex gap-2">
              <RoleSwitcher />
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => navigate("/profile")}
                className="text-white hover:bg-white/20"
              >
                <User className="h-5 w-5" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={handleSignOut}
                className="text-white hover:bg-white/20"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
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
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">My Assignments</h2>
            <div className="flex items-center gap-2">
              <Button
                variant={activeTab === "current" ? "default" : "outline"}
                size="sm"
                className="rounded-full"
                onClick={() => setActiveTab("current")}
              >
                Current
              </Button>
              <Button
                variant={activeTab === "upcoming" ? "default" : "outline"}
                size="sm"
                className="rounded-full"
                onClick={() => setActiveTab("upcoming")}
              >
                Upcoming
              </Button>
            </div>
          </div>

          {(activeTab === "current" && currentAssignments.length === 0) ||
          (activeTab === "upcoming" && upcomingAssignments.length === 0) ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🐕</div>
              <p className="text-gray-500 mb-2">
                {activeTab === "current" ? "No active assignments" : "No upcoming assignments yet"}
              </p>
              <p className="text-sm text-gray-400">
                You'll see your pet assignments here once a Fur Boss assigns you!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {visibleAssignments.map((assignment) => (
                <PetAssignmentCard
                  key={assignment.session_id}
                  assignment={assignment}
                  onClick={() => handlePetClick(assignment.session_id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AgentDashboard;
