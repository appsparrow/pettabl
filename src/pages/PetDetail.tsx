import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  Dog,
  Cat,
  Fish,
  Bird,
  Rabbit,
  Origami,
  Calendar,
  Heart,
  Plus,
  Stethoscope,
  UtensilsCrossed,
  Phone,
  NotebookPen,
  PawPrint,
  Edit,
  Trash2,
} from "lucide-react";
import { Tables } from "@/integrations/supabase/types";
import { CreateSessionModal } from "@/components/CreateSessionModal";
import SimpleScheduleEditor from "@/components/SimpleScheduleEditor";
import { ActivityLog } from "@/components/ActivityLog";
import { EditPetModal } from "@/components/EditPetModal";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface SessionWithAgents extends Tables<"sessions"> {
  session_agents: Array<{
    fur_agent_id: string;
    profiles: { name: string; email: string };
  }>;
}

interface Activity {
  id: string;
  activity_type: 'feed' | 'walk' | 'letout';
  time_period: 'morning' | 'afternoon' | 'evening';
  date: string;
  photo_url?: string | null;
  notes?: string | null;
  created_at: string;
  caretaker?: {
    name: string;
    email: string;
  };
}

interface PetWithDetails extends Tables<"pets"> {
  sessions: SessionWithAgents[];
}

const PetDetail = () => {
  const { petId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [pet, setPet] = useState<PetWithDetails | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateSession, setShowCreateSession] = useState(false);
  const [sessionToEdit, setSessionToEdit] = useState<SessionWithAgents | null>(null);
  const [showEditPet, setShowEditPet] = useState(false);
  const [showDeletePet, setShowDeletePet] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);

  useEffect(() => {
    if (petId) {
      fetchPetDetails();
    }
  }, [petId]);

  const fetchPetDetails = async () => {
    try {
      const { data: petData, error: petError} = await supabase
        .from("pets")
        .select(
          `
          *,
          sessions (
            *,
            session_agents (
              fur_agent_id,
              profiles (name, email)
            )
          )
        `
        )
        .eq("id", petId)
        .single();

      if (petError) throw petError;

      setPet(petData as PetWithDetails);

      // Fetch all activities for this pet
      const { data: activitiesData, error: activitiesError } = await supabase
        .from("activities")
        .select(`
          *,
          caretaker:profiles!activities_caretaker_id_fkey (
            name,
            email
          )
        `)
        .eq("pet_id", petId)
        .order("date", { ascending: false })
        .order("created_at", { ascending: false });

      if (activitiesError) {
        console.error("Error fetching activities:", activitiesError);
      } else {
        setActivities(activitiesData as Activity[] || []);
      }
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "Failed to load pet details",
        variant: "destructive",
      });
      navigate("/boss-dashboard");
    } finally {
      setLoading(false);
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!pet) return null;

  const activeSessions = pet.sessions.filter((s) => s.status === "active");
  const plannedSessions = pet.sessions.filter((s) => s.status === "planned");

  const handleEditSession = (session: SessionWithAgents) => {
    setSessionToEdit(session);
    setShowCreateSession(true);
  };

  const handleCreateSessionClosed = (open: boolean) => {
    if (!open) {
      setShowCreateSession(false);
      setSessionToEdit(null);
    } else {
      setShowCreateSession(true);
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    try {
      const { error } = await supabase
        .from("sessions")
        .delete()
        .eq("id", sessionId);

      if (error) throw error;

      toast({
        title: "Session deleted",
        description: "The care session has been removed.",
      });

      fetchPetDetails();
      setSessionToDelete(null);
    } catch (error) {
      console.error("Error deleting session:", error);
      toast({
        title: "Error",
        description: "Failed to delete session. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeletePet = async () => {
    if (!pet) return;

    try {
      const { error } = await supabase
        .from("pets")
        .delete()
        .eq("id", pet.id);

      if (error) throw error;

      toast({
        title: "Pet removed",
        description: `${pet.name} has been removed from your pets.`,
      });

      navigate("/boss-dashboard");
    } catch (error) {
      console.error("Error deleting pet:", error);
      toast({
        title: "Error",
        description: "Failed to delete pet. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getPetIcon = () => {
    const iconClass = "h-20 w-20 text-white";
    switch (pet?.pet_type) {
      case 'dog':
        return <Dog className={iconClass} />;
      case 'cat':
        return <Cat className={iconClass} />;
      case 'fish':
        return <Fish className={iconClass} />;
      case 'bird':
        return <Bird className={iconClass} />;
      case 'rabbit':
        return <Rabbit className={iconClass} />;
      case 'turtle':
      case 'hamster':
      case 'other':
        return <Origami className={iconClass} />;
      default:
        return <Dog className={iconClass} />;
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header with Pet Photo */}
      <div className="relative">
        <div className="h-64 bg-gradient-to-br from-primary via-secondary to-accent flex items-center justify-center relative">
          {pet.photo_url ? (
            <img
              src={pet.photo_url}
              alt={pet.name}
              className="w-full h-full object-cover"
            />
          ) : (
            getPetIcon()
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50" />

          {/* Back Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/boss-dashboard")}
            className="absolute top-4 left-4 text-white bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-full"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>

          {/* Edit & Delete Buttons */}
          <div className="absolute top-4 right-4 flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowEditPet(true)}
              className="text-white bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-full"
            >
              <Edit className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowDeletePet(true)}
              className="text-white bg-destructive/80 backdrop-blur-sm hover:bg-destructive rounded-full"
            >
              <Trash2 className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Pet Name Card */}
        <div className="max-w-md mx-auto px-4 -mt-16 relative z-10">
          <Card className="rounded-3xl border-0 shadow-2xl">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-3xl font-bold mb-1">{pet.name}</h1>
                  {pet.breed && (
                    <p className="text-muted-foreground">{pet.breed}</p>
                  )}
                </div>
                {pet.age && (
                  <div className="bg-primary/10 rounded-full px-4 py-2">
                    <p className="text-sm font-semibold text-primary">
                      {pet.age} {pet.age === 1 ? "year" : "years"}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-md mx-auto px-4 mt-6 space-y-4">
        {/* Pet Information */}
        <div className="space-y-3">
          {pet.food_preferences && (
            <Card className="rounded-3xl border-0 shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <UtensilsCrossed className="h-5 w-5 text-primary" />
                  Food Preferences
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {pet.food_preferences}
                </p>
              </CardContent>
            </Card>
          )}

          {pet.medical_info && (
            <Card className="rounded-3xl border-0 shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Stethoscope className="h-5 w-5 text-secondary" />
                  Medical Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {pet.medical_info}
                </p>
              </CardContent>
            </Card>
          )}

          {pet.vet_contact && (
            <Card className="rounded-3xl border-0 shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Phone className="h-5 w-5 text-accent" />
                  Vet Contact
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{pet.vet_contact}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Daily Schedule Section */}
        <div className="space-y-3">
          <SimpleScheduleEditor 
            petId={pet.id}
            onSaved={fetchPetDetails}
          />
        </div>

        {/* Care Sessions Section */}
        <div className="pt-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Care Sessions</h2>
            <Button
              onClick={() => setShowCreateSession(true)}
              size="sm"
              className="rounded-full bg-gradient-to-r from-primary to-secondary"
            >
              <Plus className="h-4 w-4 mr-1" />
              New Session
            </Button>
          </div>

          {/* Active Sessions */}
          {activeSessions.length > 0 && (
            <div className="space-y-3 mb-4">
              <h3 className="text-sm font-semibold text-primary">Active</h3>
              {activeSessions.map((session) => (
                <Card key={session.id} className="rounded-3xl border-0 shadow-lg">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                          <span className="text-xs font-semibold text-green-600">
                            ACTIVE
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {new Date(session.start_date).toLocaleDateString()} -{" "}
                            {new Date(session.end_date).toLocaleDateString()}
                          </span>
                        </div>
                        {session.session_agents.length > 0 && (
                          <div className="flex items-center gap-2 flex-wrap">
                            <Heart className="h-4 w-4 text-secondary" />
                            <span className="text-xs text-muted-foreground">
                              {session.session_agents.length}{" "}
                              {session.session_agents.length === 1
                                ? "Fur Agent"
                                : "Fur Agents"}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {session.session_agents
                                .map((agent) => agent.profiles?.name || "Agent")
                                .join(", ")}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="rounded-full text-secondary"
                          onClick={() => handleEditSession(session)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="rounded-full text-destructive"
                          onClick={() => setSessionToDelete(session.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Planned Sessions */}
          {plannedSessions.length > 0 && (
            <div className="space-y-3 mb-4">
              <h3 className="text-sm font-semibold text-secondary">Planned</h3>
              {plannedSessions.map((session) => (
                <Card key={session.id} className="rounded-3xl border-0 shadow-lg">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-2 h-2 bg-secondary rounded-full" />
                          <span className="text-xs font-semibold text-secondary">
                            PLANNED
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {new Date(session.start_date).toLocaleDateString()} -{" "}
                            {new Date(session.end_date).toLocaleDateString()}
                          </span>
                        </div>
                        {session.session_agents.length > 0 && (
                          <div className="flex items-center gap-2">
                            <Heart className="h-4 w-4 text-secondary" />
                            <span className="text-xs text-muted-foreground">
                              {session.session_agents.length}{" "}
                              {session.session_agents.length === 1
                                ? "Fur Agent"
                                : "Fur Agents"}
                            </span>
                          </div>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="rounded-full text-secondary"
                        onClick={() => handleEditSession(session)}
                      >
                        Manage
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {pet.sessions.length === 0 && (
            <Card className="rounded-3xl border-0 shadow-lg">
              <CardContent className="p-8 text-center">
                <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="h-10 w-10 text-muted-foreground/40" />
                </div>
                <p className="text-muted-foreground mb-4">
                  No care sessions yet for {pet.name}
                </p>
                <Button
                  onClick={() => setShowCreateSession(true)}
                  className="rounded-full bg-gradient-to-r from-primary to-secondary"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Session
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Activity Log Section */}
        <div className="pt-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Activity Log</h2>
            <span className="text-sm text-muted-foreground">
              {activities.length} {activities.length === 1 ? "activity" : "activities"}
            </span>
          </div>
          <ActivityLog activities={activities} />
        </div>
      </div>

      {/* Create / Edit Session Modal */}
      <CreateSessionModal
        open={showCreateSession}
        onOpenChange={handleCreateSessionClosed}
        petId={pet.id}
        petName={pet.name}
        onSuccess={fetchPetDetails}
        session={sessionToEdit || undefined}
      />

      {/* Edit Pet Modal */}
      <EditPetModal
        open={showEditPet}
        onOpenChange={setShowEditPet}
        pet={pet}
        onSuccess={fetchPetDetails}
      />

      {/* Delete Pet Confirmation */}
      <AlertDialog open={showDeletePet} onOpenChange={setShowDeletePet}>
        <AlertDialogContent className="rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {pet.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {pet.name} and all associated sessions and activities. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeletePet}
              className="rounded-full bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Session Confirmation */}
      <AlertDialog open={!!sessionToDelete} onOpenChange={() => setSessionToDelete(null)}>
        <AlertDialogContent className="rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Session?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this care session and all associated activities. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => sessionToDelete && handleDeleteSession(sessionToDelete)}
              className="rounded-full bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
};

export default PetDetail;

