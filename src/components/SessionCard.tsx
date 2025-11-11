import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Dog, User } from "lucide-react";
import { format } from "date-fns";
import { Tables } from "@/integrations/supabase/types";

interface SessionCardProps {
  session: Tables<"sessions"> & {
    pets: { name: string; photo_url: string | null; pet_type: string | null };
    session_agents: Array<{
      profiles: { name: string };
    }>;
  };
  onClick?: () => void;
}

export const SessionCard = ({ session, onClick }: SessionCardProps) => {
  const statusColors = {
    active: "bg-green-100 text-green-700 border-green-200",
    planned: "bg-blue-100 text-blue-700 border-blue-200",
    completed: "bg-gray-100 text-gray-700 border-gray-200",
  };

  return (
    <Card
      className="rounded-3xl border-0 shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition-all active:scale-98"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center overflow-hidden flex-shrink-0">
            {session.pets.photo_url ? (
              <img
                src={session.pets.photo_url}
                alt={session.pets.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <Dog className="h-7 w-7 text-primary" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-base mb-1 truncate">
              {session.pets.name}
            </h3>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
              <Calendar className="h-3 w-3" />
              <span>
                {format(new Date(session.start_date), "MMM d")} -{" "}
                {format(new Date(session.end_date), "MMM d, yyyy")}
              </span>
            </div>
            {session.session_agents.length > 0 && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <User className="h-3 w-3" />
                <span className="truncate">
                  {session.session_agents.map((a) => a.profiles.name).join(", ")}
                </span>
              </div>
            )}
          </div>

          <div
            className={`px-3 py-1 rounded-full text-xs font-medium border ${
              statusColors[session.status as keyof typeof statusColors]
            }`}
          >
            {session.status}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

