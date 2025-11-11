import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

type Role = "fur_boss" | "fur_agent";

interface RoleContextType {
  primaryRole: Role | null;
  activeRole: Role | null;
  canSwitchRoles: boolean;
  switchRole: (role: Role) => void;
  loading: boolean;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export const RoleProvider = ({ children }: { children: ReactNode }) => {
  const [primaryRole, setPrimaryRole] = useState<Role | null>(null);
  const [activeRole, setActiveRole] = useState<Role | null>(null);
  const [canSwitchRoles, setCanSwitchRoles] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRoleData();
  }, []);

  const loadRoleData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      // Get user's primary role
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (!profile) return;

      setPrimaryRole(profile.role);

      // Check if user can switch roles
      if (profile.role === "fur_agent") {
        // Check if agent owns any pets
        const { data: pets } = await supabase
          .from("pets")
          .select("id")
          .eq("fur_boss_id", user.id)
          .limit(1);
        
        setCanSwitchRoles((pets?.length || 0) > 0);
      } else {
        // Check if boss is assigned as agent to any session
        const { data: assignments } = await supabase
          .from("session_agents")
          .select("id")
          .eq("fur_agent_id", user.id)
          .limit(1);
        
        setCanSwitchRoles((assignments?.length || 0) > 0);
      }

      // Get active role from localStorage or use primary
      const stored = localStorage.getItem("activeRole") as Role;
      setActiveRole(stored || profile.role);
    } catch (error) {
      console.error("Error loading role data:", error);
    } finally {
      setLoading(false);
    }
  };

  const switchRole = (role: Role) => {
    setActiveRole(role);
    localStorage.setItem("activeRole", role);
    // Trigger reload of role data to update canSwitchRoles
    loadRoleData();
  };

  return (
    <RoleContext.Provider value={{ primaryRole, activeRole, canSwitchRoles, switchRole, loading }}>
      {children}
    </RoleContext.Provider>
  );
};

export const useRole = () => {
  const context = useContext(RoleContext);
  if (!context) throw new Error("useRole must be used within RoleProvider");
  return context;
};

