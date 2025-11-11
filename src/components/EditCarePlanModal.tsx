import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Trash2 } from "lucide-react";

interface EditCarePlanModalProps {
  petId: string;
  petName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
}

type MealBlock = {
  id: string;
  label: string;
  time_period: string;
  quantity: string;
  food_type: string;
  notes: string;
};

type Habit = {
  id: string;
  title: string;
  notes: string;
};

const DEFAULT_MEALS: MealBlock[] = [
  {
    id: "morning",
    label: "Morning Meal",
    time_period: "morning",
    quantity: "",
    food_type: "",
    notes: ""
  },
  {
    id: "afternoon",
    label: "Afternoon Meal",
    time_period: "afternoon",
    quantity: "",
    food_type: "",
    notes: ""
  },
  {
    id: "evening",
    label: "Evening Meal",
    time_period: "evening",
    quantity: "",
    food_type: "",
    notes: ""
  }
];

export const EditCarePlanModal = ({ petId, petName, open, onOpenChange, onSave }: EditCarePlanModalProps) => {
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);
  const [meals, setMeals] = useState<MealBlock[]>(DEFAULT_MEALS);
  const [dailyFrequency, setDailyFrequency] = useState<number>(2);
  const [feedingNotes, setFeedingNotes] = useState("");
  const [habits, setHabits] = useState<Habit[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      loadPlan();
    }
  }, [open]);

  const loadPlan = async () => {
    setInitialLoading(true);
    try {
      const { data, error } = await supabase
        .from("pet_care_plans")
        .select("meal_plan, daily_frequency, feeding_notes, habits")
        .eq("pet_id", petId)
        .single();

      if (error && error.code !== "PGRST116") throw error;

      if (data) {
        const parsedMeals: MealBlock[] = Array.isArray(data.meal_plan)
          ? (data.meal_plan as MealBlock[]).map((meal, index) => ({
              id: meal.id || `${meal.time_period || "meal"}-${index}`,
              label: meal.label || `${meal.time_period ?? "Meal"}`,
              time_period: meal.time_period || "custom",
              quantity: meal.quantity || "",
              food_type: meal.food_type || "",
              notes: meal.notes || "",
            }))
          : DEFAULT_MEALS;

        const ensureDefaults = DEFAULT_MEALS.map((defaultMeal) => {
          const match = parsedMeals.find((meal) => meal.time_period === defaultMeal.time_period);
          return match ? match : defaultMeal;
        });

        const additionalMeals = parsedMeals.filter(
          (meal) => !DEFAULT_MEALS.some((defaultMeal) => defaultMeal.time_period === meal.time_period)
        );

        setMeals([...ensureDefaults, ...additionalMeals]);
        setDailyFrequency(data.daily_frequency ?? 2);
        setFeedingNotes(data.feeding_notes ?? "");

        const parsedHabits: Habit[] = Array.isArray(data.habits)
          ? (data.habits as Habit[]).map((habit, index) => ({
              id: habit.id || `habit-${index}`,
              title: habit.title || "",
              notes: habit.notes || "",
            }))
          : [];
        setHabits(parsedHabits);
      } else {
        resetForm();
      }
    } catch (error) {
      console.error("Error loading care plan", error);
      toast({
        title: "Error",
        description: "Could not load the care plan.",
        variant: "destructive",
      });
      resetForm();
    } finally {
      setInitialLoading(false);
    }
  };

  const resetForm = () => {
    setMeals(DEFAULT_MEALS);
    setDailyFrequency(2);
    setFeedingNotes("");
    setHabits([]);
  };

  const handleMealChange = (id: string, field: keyof MealBlock, value: string) => {
    setMeals((prev) => prev.map((meal) => (meal.id === id ? { ...meal, [field]: value } : meal)));
  };

  const addCustomMeal = () => {
    const newMeal: MealBlock = {
      id: `custom-${Date.now()}`,
      label: "Custom Meal",
      time_period: "custom",
      quantity: "",
      food_type: "",
      notes: "",
    };
    setMeals((prev) => [...prev, newMeal]);
  };

  const removeMeal = (id: string) => {
    setMeals((prev) => prev.filter((meal) => meal.id !== id));
  };

  const handleHabitChange = (id: string, field: keyof Habit, value: string) => {
    setHabits((prev) => prev.map((habit) => (habit.id === id ? { ...habit, [field]: value } : habit)));
  };

  const addHabit = () => {
    setHabits((prev) => [
      ...prev,
      {
        id: `habit-${Date.now()}`,
        title: "",
        notes: "",
      },
    ]);
  };

  const removeHabit = (id: string) => {
    setHabits((prev) => prev.filter((habit) => habit.id !== id));
  };

  const preparedMeals = useMemo(() =>
    meals.map((meal) => ({
      time_period: meal.time_period,
      label: meal.label,
      quantity: meal.quantity,
      food_type: meal.food_type,
      notes: meal.notes,
    })),
  [meals]);

  const preparedHabits = useMemo(() =>
    habits.map((habit) => ({
      title: habit.title,
      notes: habit.notes,
    })),
  [habits]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No active user");

      const { error } = await supabase
        .from("pet_care_plans")
        .upsert(
          {
            pet_id: petId,
            meal_plan: preparedMeals,
            daily_frequency: dailyFrequency,
            feeding_notes: feedingNotes,
            habits: preparedHabits,
            updated_by: user.id,
          },
          {
            onConflict: "pet_id",
          }
        );

      if (error) throw error;

      toast({
        title: "Care plan saved",
        description: `${petName}'s care plan has been updated.`,
      });

      onSave();
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving care plan", error);
      toast({
        title: "Error",
        description: "We couldn't save the care plan."
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl rounded-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            {`Edit Care Plan for ${petName}`}
          </DialogTitle>
          <DialogDescription>
            Define meals, instructions, and habits so every Fur Agent follows the same playbook.
          </DialogDescription>
        </DialogHeader>

        {initialLoading ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mb-4"></div>
            <p>Loading care plan…</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Meals & Portions</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="rounded-full"
                  onClick={addCustomMeal}
                >
                  <Plus className="h-4 w-4 mr-1" /> Add meal
                </Button>
              </div>
              <div className="space-y-4">
                {meals.map((meal) => (
                  <div key={meal.id} className="rounded-2xl border border-muted p-4 space-y-3 bg-muted/40">
                    <div className="flex items-center justify-between">
                      <Label className="font-medium">{meal.label}</Label>
                      {meal.time_period === "custom" && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeMeal(meal.id)}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label>Quantity</Label>
                        <Input
                          placeholder="e.g., 1 cup"
                          value={meal.quantity}
                          onChange={(e) => handleMealChange(meal.id, "quantity", e.target.value)}
                          className="rounded-2xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Food</Label>
                        <Input
                          placeholder="e.g., Salmon kibble"
                          value={meal.food_type}
                          onChange={(e) => handleMealChange(meal.id, "food_type", e.target.value)}
                          className="rounded-2xl"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Instructions</Label>
                      <Textarea
                        placeholder="Special prep? Add meds?"
                        value={meal.notes}
                        onChange={(e) => handleMealChange(meal.id, "notes", e.target.value)}
                        className="rounded-2xl"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Daily visits / feedings</Label>
                <Input
                  type="number"
                  min={1}
                  max={10}
                  value={dailyFrequency}
                  onChange={(e) => setDailyFrequency(Number(e.target.value))}
                  className="rounded-2xl"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>General Notes</Label>
                <Textarea
                  placeholder="Feeding routine, meds schedule, reminders"
                  value={feedingNotes}
                  onChange={(e) => setFeedingNotes(e.target.value)}
                  className="rounded-2xl"
                />
              </div>
            </section>

            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Habits & Routines</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="rounded-full"
                  onClick={addHabit}
                >
                  <Plus className="h-4 w-4 mr-1" /> Add habit
                </Button>
              </div>
              {habits.length === 0 ? (
                <p className="text-sm text-muted-foreground">No habits added yet.</p>
              ) : (
                <div className="space-y-4">
                  {habits.map((habit) => (
                    <div key={habit.id} className="rounded-2xl border border-muted p-4 space-y-3 bg-muted/30">
                      <div className="flex items-center justify-between">
                        <Label className="font-medium">Habit</Label>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeHabit(habit.id)}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="space-y-2">
                        <Label>Title</Label>
                        <Input
                          placeholder="e.g., Morning walk"
                          value={habit.title}
                          onChange={(e) => handleHabitChange(habit.id, "title", e.target.value)}
                          className="rounded-2xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Notes</Label>
                        <Textarea
                          placeholder="Duration, toys, behaviors"
                          value={habit.notes}
                          onChange={(e) => handleHabitChange(habit.id, "notes", e.target.value)}
                          className="rounded-2xl"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <div className="flex flex-col sm:flex-row sm:justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                className="rounded-full"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="rounded-full bg-gradient-to-r from-primary to-secondary"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving…
                  </>
                ) : (
                  "Save Care Plan"
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};
