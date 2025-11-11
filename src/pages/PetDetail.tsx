import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  Dog,
  Calendar,
  Heart,
  Plus,
  Stethoscope,
  UtensilsCrossed,
  Phone,
  NotebookPen,
  PawPrint,
  Edit,
} from "lucide-react";
import { Tables } from "@/integrations/supabase/types";
import { CreateSessionModal } from "@/components/CreateSessionModal";
import { EditCarePlanModal } from "@/components/EditCarePlanModal";

interface SessionWithAgents extends Tables<"sessions"> {
  session_agents: Array<{
    fur_agent_id: string;
    profiles: { name: string; email: string };
  }>;
}

interface PetWithDetails extends Tables<"pets"> {
  sessions: SessionWithAgents[];
  pet_care_plans: Array<{
    meal_plan: any;
    daily_frequency: number | null;
    feeding_notes: string | null;
    habits: any;
    updated_at: string;
  }>;
}

type MealPlan = Array<{
  label?: string;
  time_period?: string;
  quantity?: string;
  food_type?: string;
  notes?: string;
}>;

type HabitPlan = Array<{
  title?: string;
  notes?: string;
}>;

const PetDetail = () => {
  const { petId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [pet, setPet] = useState<PetWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateSession, setShowCreateSession] = useState(false);
  const [sessionToEdit, setSessionToEdit] = useState<SessionWithAgents | null>(null);
  const [showCarePlanModal, setShowCarePlanModal] = useState(false);

  useEffect(() => {
    if (petId) {
      fetchPetDetails();
    }
  }, [petId]);

  const fetchPetDetails = async () => {
    try {
      const { data: petData, error: petError } = await supabase
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
          ),
          pet_care_plans (
            meal_plan,
            daily_frequency,
            feeding_notes,
            habits,
            updated_at
          )
        `
        )
        .eq("id", petId)
        .single();

      if (petError) throw petError;

      setPet(petData as PetWithDetails);
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

  const carePlan = pet?.pet_care_plans?.[0] ?? null;
  const mealPlan: MealPlan = Array.isArray(carePlan?.meal_plan) ? (carePlan?.meal_plan as MealPlan) : [];
  const habits: HabitPlan = Array.isArray(carePlan?.habits) ? (carePlan?.habits as HabitPlan) : [];

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
            <Dog className="h-32 w-32 text-white/50" />
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

        {/* Care Plan Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Care Plan</h2>
            <Button
              variant="outline"
              size="sm"
              className="rounded-full"
              onClick={() => setShowCarePlanModal(true)}
            >
              <Edit className="h-4 w-4 mr-1" />
              Update Plan
            </Button>
          </div>
          <Card className="rounded-3xl border-0 shadow-lg">
            <CardContent className="space-y-4 py-6">
              {carePlan ? (
                <>
                  <div className="flex items-center justify-between bg-muted/60 rounded-2xl px-4 py-3">
                    <div>
                      <p className="text-sm text-muted-foreground">Daily visits / feedings</p>
                      <p className="text-lg font-semibold">{carePlan.daily_frequency ?? "—"}</p>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Updated {new Date(carePlan.updated_at).toLocaleDateString()}
                    </div>
                  </div>

                  {mealPlan.length > 0 ? (
                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Meals</h3>
                      <div className="space-y-3">
                        {mealPlan.map((meal, index) => (
                          <div key={index} className="rounded-2xl border border-muted/60 px-4 py-3">
                            <p className="font-semibold flex items-center gap-2">
                              <UtensilsCrossed className="h-4 w-4 text-primary" />
                              {meal.label || meal.time_period || "Meal"}
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">
                              {meal.quantity ? `${meal.quantity}` : "Quantity not set"}
                              {meal.food_type ? ` • ${meal.food_type}` : ""}
                            </p>
                            {meal.notes && (
                              <p className="text-xs text-muted-foreground/80 mt-2 whitespace-pre-wrap">
                                {meal.notes}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No meals configured yet.</p>
                  )}

                  {carePlan.feeding_notes && (
                    <div>
                      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Notes</h3>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap mt-1">
                        {carePlan.feeding_notes}
                      </p>
                    </div>
                  )}

                  {habits.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Habits & Routines</h3>
                      <div className="space-y-2 mt-2">
                        {habits.map((habit, index) => (
                          <div key={index} className="flex items-start gap-3">
                            <div className="w-7 h-7 rounded-full bg-accent/20 flex items-center justify-center">
                              <PawPrint className="h-4 w-4 text-accent" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-foreground">{habit.title || "Habit"}</p>
                              {habit.notes && (
                                <p className="text-xs text-muted-foreground whitespace-pre-wrap">{habit.notes}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  No care plan yet. Add feeding instructions, portions, and routines so every Fur Agent follows the same playbook.
                </div>
              )}
            </CardContent>
          </Card>
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

      {/* Edit Care Plan Modal */}
      <EditCarePlanModal
        open={showCarePlanModal}
        onOpenChange={setShowCarePlanModal}
        petId={pet.id}
        petName={pet.name}
        onSave={fetchPetDetails}
      />
    </div>
  );
};

export default PetDetail;

