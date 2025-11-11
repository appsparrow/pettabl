import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Calendar as CalendarIcon, Loader2, Plus, X, Dog, Cat, Fish, Bird, Rabbit, Origami } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface SessionAgentInfo {
  fur_agent_id: string;
  profiles?: { name: string; email: string };
}

interface SessionSummary {
  id: string;
  start_date: string;
  end_date: string;
  notes: string | null;
  session_agents: SessionAgentInfo[];
}

interface CreateSessionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  petId?: string | null;
  petName?: string | null;
  onSuccess: () => void;
  session?: SessionSummary;
  pets?: Array<{ id: string; name: string; photo_url: string | null; pet_type: string | null }>;
}

interface AgentOption {
  id: string;
  name: string;
  email: string;
}

export const CreateSessionModal = ({
  open,
  onOpenChange,
  petId: initialPetId,
  petName: initialPetName,
  onSuccess,
  session,
  pets = [],
}: CreateSessionModalProps) => {
  const [loading, setLoading] = useState(false);
  const [selectedPetId, setSelectedPetId] = useState<string | null>(initialPetId || null);
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [notes, setNotes] = useState("");
  const [searchEmail, setSearchEmail] = useState("");
  const [selectedAgents, setSelectedAgents] = useState<AgentOption[]>([]);
  const [searchResults, setSearchResults] = useState<AgentOption[]>([]);
  const { toast } = useToast();

  const isEditMode = Boolean(session);

  const getPetIcon = (petType: string | null) => {
    const iconClass = "h-6 w-6";
    switch (petType) {
      case "dog":
        return <Dog className={iconClass} />;
      case "cat":
        return <Cat className={iconClass} />;
      case "fish":
        return <Fish className={iconClass} />;
      case "bird":
        return <Bird className={iconClass} />;
      case "rabbit":
        return <Rabbit className={iconClass} />;
      default:
        return <Origami className={iconClass} />;
    }
  };

  useEffect(() => {
    if (open) {
      prefillSession();
    }
  }, [open, session]);

  useEffect(() => {
    if (initialPetId) {
      setSelectedPetId(initialPetId);
    }
  }, [initialPetId]);

  const prefillSession = () => {
    if (session) {
      setStartDate(new Date(session.start_date));
      setEndDate(new Date(session.end_date));
      setNotes(session.notes ?? "");
      const existingAgents = session.session_agents.map((agent) => ({
        id: agent.fur_agent_id,
        name: agent.profiles?.name ?? "Agent",
        email: agent.profiles?.email ?? "",
      }));
      setSelectedAgents(existingAgents);
    } else {
      setStartDate(undefined);
      setEndDate(undefined);
      setNotes("");
      setSelectedAgents([]);
      setSelectedPetId(initialPetId || null);
    }
    setSearchEmail("");
    setSearchResults([]);
  };

  const searchAgents = async () => {
    if (!searchEmail || searchEmail.length < 3) {
      setSearchResults([]);
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from("profiles")
        .select("id, name, email")
        .eq("role", "fur_agent")
        .neq("id", user?.id || "") // Don't show current user in agent list
        .ilike("email", `%${searchEmail}%`)
        .limit(5);

      if (error) throw error;
      setSearchResults((data || []).map((agent) => ({
        id: agent.id,
        name: agent.name,
        email: agent.email,
      })));
    } catch (error) {
      console.error("Error searching agents:", error);
    }
  };

  useEffect(() => {
    const debounce = setTimeout(() => {
      searchAgents();
    }, 300);

    return () => clearTimeout(debounce);
  }, [searchEmail]);

  const addAgent = async (agent: AgentOption) => {
    // Prevent self-assignment
    const { data: { user } } = await supabase.auth.getUser();
    if (agent.id === user?.id) {
      toast({
        title: "Cannot assign yourself",
        description: "You cannot be the caretaker for your own pet",
        variant: "destructive",
      });
      return;
    }
    
    // Check if agent already added
    if (selectedAgents.find((a) => a.id === agent.id)) {
      toast({
        title: "Agent already added",
        variant: "destructive",
      });
      return;
    }
    
    setSelectedAgents([...selectedAgents, agent]);
    setSearchEmail("");
    setSearchResults([]);
  };

  const removeAgent = (agentId: string) => {
    setSelectedAgents(selectedAgents.filter((a) => a.id !== agentId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedPetId) {
      toast({
        title: "Select a pet",
        description: "Please select a pet for this session",
        variant: "destructive",
      });
      return;
    }

    if (!startDate || !endDate) {
      toast({
        title: "Missing dates",
        description: "Please select start and end dates",
        variant: "destructive",
      });
      return;
    }

    if (endDate < startDate) {
      toast({
        title: "Invalid dates",
        description: "End date must be after start date",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      // Determine status based on dates
      let computedStatus: "planned" | "active" | "completed";
      if (session?.status) {
        computedStatus = session.status;
      } else {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(endDate);
        end.setHours(0, 0, 0, 0);
        
        if (end < today) {
          computedStatus = "completed";
        } else if (start <= today && end >= today) {
          computedStatus = "active";
        } else {
          computedStatus = "planned";
        }
      }

      const payload = {
        pet_id: selectedPetId,
        start_date: format(startDate, "yyyy-MM-dd"),
        end_date: format(endDate, "yyyy-MM-dd"),
        notes: notes || null,
        status: computedStatus,
      };

      let sessionId = session?.id;

      if (isEditMode && sessionId) {
        const { error: updateError } = await supabase
          .from("sessions")
          .update(payload)
          .eq("id", sessionId);
        if (updateError) throw updateError;

        // reset agent assignments before inserting new ones
        const { error: deleteError } = await supabase
          .from("session_agents")
          .delete()
          .eq("session_id", sessionId);
        if (deleteError) throw deleteError;
      } else {
        const { data: sessionData, error: sessionError } = await supabase
          .from("sessions")
          .insert({
            ...payload,
            fur_boss_id: user.id,
          })
          .select()
          .single();

        if (sessionError) throw sessionError;
        sessionId = sessionData.id;
      }

      if (!sessionId) throw new Error("Missing session id");

      if (selectedAgents.length > 0) {
        const agentAssignments = selectedAgents.map((agent) => ({
          session_id: sessionId,
          fur_agent_id: agent.id,
        }));

        const { error: agentError } = await supabase
          .from("session_agents")
          .insert(agentAssignments);

        if (agentError) throw agentError;
      }

      const selectedPet = pets.find(p => p.id === selectedPetId);
      toast({
        title: isEditMode ? "Session updated!" : "Session created!",
        description: `Care session for ${selectedPet?.name || initialPetName || 'your pet'} has been ${isEditMode ? "updated" : "scheduled"}.`,
      });

      setSearchEmail("");
      setSearchResults([]);
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "Failed to save session. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            {isEditMode ? "Update Care Session" : "Create Care Session 🗓"}
          </DialogTitle>
          <DialogDescription>
            {pets.length > 1 
              ? "Select a pet and schedule care dates"
              : isEditMode
              ? `Adjust timing or agents for ${initialPetName}'s care session.`
              : `Schedule care dates for ${initialPetName} and assign Fur Agents`}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Pet Selection - Show when multiple pets available */}
          {pets.length > 1 && !isEditMode && (
            <div className="space-y-2">
              <Label className="text-sm font-semibold">
                Select Pet <span className="text-destructive">*</span>
              </Label>
              <div className="grid grid-cols-2 gap-2">
                {pets.map((pet) => (
                  <button
                    key={pet.id}
                    type="button"
                    onClick={() => setSelectedPetId(pet.id)}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-2xl border-2 transition-all text-left",
                      selectedPetId === pet.id
                        ? "border-primary bg-primary/10"
                        : "border-gray-200 hover:border-primary/50"
                    )}
                  >
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center",
                      selectedPetId === pet.id ? "bg-primary/20 text-primary" : "bg-gray-100 text-gray-600"
                    )}>
                      {pet.photo_url ? (
                        <img src={pet.photo_url} alt={pet.name} className="w-full h-full object-cover rounded-full" />
                      ) : (
                        getPetIcon(pet.pet_type)
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{pet.name}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
          {/* Date Range Selector */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">
              Care Period <span className="text-destructive">*</span>
            </Label>
            <div className="grid grid-cols-2 gap-3">
              {/* Start Date */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal rounded-2xl border-2",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <div className="flex flex-col items-start w-full">
                      <span className="text-xs text-muted-foreground mb-0.5">From</span>
                      <span className="font-semibold">
                        {startDate ? format(startDate, "MMM d, yyyy") : "Select date"}
                      </span>
                    </div>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 rounded-2xl">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={(date) => {
                      setStartDate(date);
                      // Auto-advance to end date if not set
                      if (date && !endDate) {
                        // Optionally set a default end date (e.g., 7 days later)
                        const defaultEnd = new Date(date);
                        defaultEnd.setDate(defaultEnd.getDate() + 7);
                        setEndDate(defaultEnd);
                      }
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>

              {/* End Date */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal rounded-2xl border-2",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <div className="flex flex-col items-start w-full">
                      <span className="text-xs text-muted-foreground mb-0.5">To</span>
                      <span className="font-semibold">
                        {endDate ? format(endDate, "MMM d, yyyy") : "Select date"}
                      </span>
                    </div>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 rounded-2xl">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    initialFocus
                    disabled={(date) => (startDate ? date < startDate : false)}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Session Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-sm font-semibold">
              Notes (Optional)
            </Label>
            <Textarea
              id="notes"
              placeholder="Any special instructions or notes for this care period..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="rounded-2xl border-2 min-h-[80px]"
            />
          </div>

          {/* Assign Fur Agents */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Assign Fur Agents</Label>
            <div className="relative">
              <Input
                placeholder="Search by email..."
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
                className="rounded-2xl border-2"
              />
              {searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border-2 rounded-2xl shadow-lg z-10 max-h-48 overflow-y-auto">
                  {searchResults.map((agent) => (
                    <button
                      key={agent.id}
                      type="button"
                      onClick={() => addAgent(agent)}
                      className="w-full p-3 text-left hover:bg-muted transition-colors flex items-center justify-between"
                    >
                      <div>
                        <p className="font-medium text-sm">{agent.name}</p>
                        <p className="text-xs text-muted-foreground">{agent.email}</p>
                      </div>
                      <Plus className="h-4 w-4 text-primary" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Selected Agents */}
            {selectedAgents.length > 0 && (
              <div className="space-y-2 mt-3">
                {selectedAgents.map((agent) => (
                  <div
                    key={agent.id}
                    className="flex items-center justify-between bg-primary/10 rounded-2xl p-3"
                  >
                    <div>
                      <p className="font-medium text-sm">{agent.name}</p>
                      <p className="text-xs text-muted-foreground">{agent.email}</p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeAgent(agent.id)}
                      className="rounded-full"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={loading || !startDate || !endDate}
            className="w-full rounded-full h-12 text-base font-semibold bg-gradient-to-r from-primary to-secondary hover:opacity-90"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {isEditMode ? "Updating Session..." : "Creating Session..."}
              </>
            ) : (
              isEditMode ? "Save Changes" : "Create Session 🎉"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

