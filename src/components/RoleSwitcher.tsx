import { useRole } from "@/contexts/RoleContext";
import { Button } from "@/components/ui/button";
import { Dog, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

export const RoleSwitcher = () => {
  const { activeRole, canSwitchRoles, switchRole } = useRole();
  const navigate = useNavigate();
  const { toast } = useToast();

  if (!canSwitchRoles) return null;

  const handleSwitch = () => {
    const newRole = activeRole === "fur_boss" ? "fur_agent" : "fur_boss";
    switchRole(newRole);
    
    toast({
      title: `Switched to ${newRole === "fur_boss" ? "Boss" : "Agent"} Mode`,
      description: `Now viewing as ${newRole === "fur_boss" ? "Pet Owner" : "Caretaker"}`,
    });

    navigate(newRole === "fur_boss" ? "/boss-dashboard" : "/agent-dashboard");
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleSwitch}
      className="flex items-center gap-2 rounded-full text-white hover:bg-white/20 border border-white/30"
    >
      {activeRole === "fur_boss" ? (
        <>
          <Heart className="h-4 w-4" />
          <span className="hidden sm:inline text-xs">Agent</span>
        </>
      ) : (
        <>
          <Dog className="h-4 w-4" />
          <span className="hidden sm:inline text-xs">Boss</span>
        </>
      )}
    </Button>
  );
};

