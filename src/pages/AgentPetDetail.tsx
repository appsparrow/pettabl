import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Dog } from "lucide-react";
import TodayScheduleChecklist from "@/components/TodayScheduleChecklist";
import ActivityConfirmDialog from "@/components/ActivityConfirmDialog";
import { format, parseISO } from "date-fns";

interface Schedule {
  id: string;
  feeding_instruction: string;
  walking_instruction: string;
  letout_instruction: string;
}

interface ScheduleTime {
  id: string;
  activity_type: 'feed' | 'walk' | 'letout';
  time_period: 'morning' | 'afternoon' | 'evening';
}

interface Activity {
  id: string;
  activity_type: 'feed' | 'walk' | 'letout';
  time_period: 'morning' | 'afternoon' | 'evening';
  caretaker_id: string;
  created_at: string;
  photo_url?: string;
  notes?: string;
  caretaker?: {
    name: string;
    email: string;
  };
}

interface Pet {
  id: string;
  name: string;
  photo_url: string | null;
  breed: string | null;
}

const AgentPetDetail = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [pet, setPet] = useState<Pet | null>(null);
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [scheduleTimes, setScheduleTimes] = useState<ScheduleTime[]>([]);
  const [activitiesData, setActivitiesData] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [showActivityDialog, setShowActivityDialog] = useState(false);
  const [selectedActivityType, setSelectedActivityType] = useState<'feed' | 'walk' | 'letout' | null>(null);
  const [selectedTimePeriod, setSelectedTimePeriod] = useState<'morning' | 'afternoon' | 'evening' | null>(null);
  const [sessionInfo, setSessionInfo] = useState<{ start_date: string; end_date: string } | null>(null);

  useEffect(() => {
    if (sessionId) {
      loadPetAndSchedule();
    }
  }, [sessionId]);

  const loadPetAndSchedule = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      // Get session and pet info
      const { data: sessionData, error: sessionError } = await supabase
        .from("sessions")
        .select(`
          id,
          pet_id,
          start_date,
          end_date,
          pets (
            id,
            name,
            photo_url,
            breed
          )
        `)
        .eq("id", sessionId)
        .single();

      if (sessionError) throw sessionError;

      if (sessionData?.pets) {
        setPet(sessionData.pets as Pet);
        setSessionInfo({
          start_date: sessionData.start_date,
          end_date: sessionData.end_date,
        });

        // Get schedule for this pet
        const { data: scheduleData } = await supabase
          .from("schedules")
          .select("*")
          .eq("pet_id", sessionData.pet_id)
          .is("session_id", null)
          .maybeSingle();

        if (scheduleData) {
          setSchedule(scheduleData);

          // Get schedule times
          const { data: timesData } = await supabase
            .from("schedule_times")
            .select("*")
            .eq("schedule_id", scheduleData.id);

          if (timesData) {
            setScheduleTimes(timesData as ScheduleTime[]);
          }
        }

        // Get today's activities
        const today = new Date().toISOString().split("T")[0];
        const { data: activitiesData } = await supabase
          .from("activities")
          .select(`
            *,
            caretaker:profiles!activities_caretaker_id_fkey (
              name,
              email
            )
          `)
          .eq("session_id", sessionId)
          .eq("date", today)
          .order("created_at", { ascending: false });

        if (activitiesData) {
          setActivitiesData(activitiesData as any);
        }
      }
    } catch (error) {
      console.error("Error loading data:", error);
      toast({
        title: "Error",
        description: "Failed to load pet information",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCheckActivity = (type: 'feed' | 'walk' | 'letout', timePeriod: 'morning' | 'afternoon' | 'evening') => {
    setSelectedActivityType(type);
    setSelectedTimePeriod(timePeriod);
    setShowActivityDialog(true);
  };

  const handleActivityConfirm = async (
    timePeriod: string,
    date: string,
    photoFile?: File,
    notes?: string
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      if (!sessionId || !pet?.id) {
        throw new Error("Missing session or pet information");
      }

      // Upload photo if provided
      let photoUrl: string | undefined;
      if (photoFile) {
        const fileExt = photoFile.name.split('.').pop();
        const fileName = `${user.id}_${Date.now()}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('activity-photos')
          .upload(fileName, photoFile, { upsert: false });

        if (uploadError) {
          console.error("Photo upload error:", uploadError);
        } else {
          const { data: { publicUrl } } = supabase.storage
            .from('activity-photos')
            .getPublicUrl(uploadData.path);
          photoUrl = publicUrl;
        }
      }

      // Insert activity
      const { error: activityError } = await supabase
        .from("activities")
        .insert({
          session_id: sessionId,
          pet_id: pet.id,
          activity_type: selectedActivityType,
          time_period: timePeriod,
          date: date,
          caretaker_id: user.id,
          photo_url: photoUrl,
          notes: notes,
        });

      if (activityError) throw activityError;

      // Award paw points
      const { data: profileData } = await supabase
        .from("profiles")
        .select("paw_points")
        .eq("id", user.id)
        .single();

      const currentPawPoints = profileData?.paw_points || 0;

      await supabase
        .from("profiles")
        .update({ paw_points: currentPawPoints + 10 })
        .eq("id", user.id);

      toast({
        title: "Thank you! 😄",
        description: "Happy tail wiggles! Add a quick photo so Fur Boss can smile.",
      });

      const todayStr = format(new Date(), "yyyy-MM-dd");
      if (sessionInfo?.end_date === todayStr) {
        toast({
          title: "I'll miss you! 🥹",
          description: `${pet.name} will miss you. I'll miss you!!`,
        });
      }

      setShowActivityDialog(false);
      setSelectedActivityType(null);
      setSelectedTimePeriod(null);

      // Reload activities
      await loadPetAndSchedule();
    } catch (error: any) {
      console.error("Error saving activity:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save activity",
        variant: "destructive",
      });
    }
  };

  const handleUnmarkActivity = async (activityId: string) => {
    try {
      const { error } = await supabase
        .from("activities")
        .delete()
        .eq("id", activityId);

      if (error) throw error;

      toast({
        title: "Activity unmarked",
        description: "The activity has been removed from today's log.",
      });

      // Reload activities
      await loadPetAndSchedule();
    } catch (error: any) {
      console.error("Error unmarking activity:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to unmark activity",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!pet) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Pet not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50">
      <div className="max-w-md mx-auto pb-24">
        {/* Header */}
        <div className="bg-gradient-to-br from-secondary via-secondary/90 to-accent p-6 pt-12 pb-8 rounded-b-[2rem]">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/agent-dashboard")}
            className="text-white hover:bg-white/20 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>

          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-2xl bg-white/20 flex items-center justify-center overflow-hidden">
              {pet.photo_url ? (
                <img
                  src={pet.photo_url}
                  alt={pet.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Dog className="h-10 w-10 text-white" />
              )}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white mb-1">
                {pet.name}
              </h1>
              {pet.breed && (
                <p className="text-white/80">{pet.breed}</p>
              )}
            </div>
          </div>
        </div>

        <div className="p-4 space-y-4 mt-4">
          {sessionInfo && sessionInfo.start_date && sessionInfo.end_date && (
            <div className="rounded-3xl border border-purple-200 bg-purple-50/80 p-4 text-sm text-purple-700 shadow-sm">
              Session: {format(parseISO(sessionInfo.start_date), "MMM d")} -{" "}
              {format(parseISO(sessionInfo.end_date), "MMM d, yyyy")}
            </div>
          )}

          {sessionInfo && sessionInfo.end_date === format(new Date(), "yyyy-MM-dd") && (
            <div className="rounded-3xl border border-secondary/40 bg-secondary/10 p-4 text-secondary-foreground text-sm shadow-sm">
              🥹 Last day together! Give {pet.name} extra snuggles before you go.
            </div>
          )}

          {/* Today's Schedule Checklist */}
          <TodayScheduleChecklist 
            scheduleTimes={scheduleTimes}
            completedActivities={activitiesData}
            onCheckActivity={handleCheckActivity}
            onUnmarkActivity={handleUnmarkActivity}
          />
        </div>

        {/* Activity Confirmation Dialog */}
        <ActivityConfirmDialog
          open={showActivityDialog}
          onClose={() => setShowActivityDialog(false)}
          onConfirm={handleActivityConfirm}
          actionType={selectedActivityType}
          preselectedTimePeriod={selectedTimePeriod || undefined}
          schedule={schedule || undefined}
        />
      </div>
    </div>
  );
};

export default AgentPetDetail;

