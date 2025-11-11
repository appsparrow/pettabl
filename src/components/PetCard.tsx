import { Card, CardContent } from "@/components/ui/card";
import { Dog, Cat, Fish, Bird, Rabbit, Origami, Calendar, Heart, Turtle, Rat } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";

interface PetCardProps {
  pet: Tables<"pets">;
  onClick: () => void;
}

export const PetCard = ({ pet, onClick }: PetCardProps) => {
  const getPetIcon = () => {
    const iconClass = "h-16 w-16 text-primary/40";
    switch (pet.pet_type) {
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
        return <Turtle className={iconClass} />;
      case 'hamster':
        return <Rat className={iconClass} />;
      case 'other':
        return <Origami className={iconClass} />;
      default:
        return <Dog className={iconClass} />;
    }
  };

  return (
    <Card
      onClick={onClick}
      className="rounded-3xl border-0 shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
    >
      <CardContent className="p-0">
        {/* Pet Photo / Avatar */}
        <div className="relative h-32 bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 flex items-center justify-center">
          {pet.photo_url ? (
            <img
              src={pet.photo_url}
              alt={pet.name}
              className="w-full h-full object-cover"
            />
          ) : (
            getPetIcon()
          )}
          {/* Floating Heart Badge */}
          <div className="absolute top-3 right-3 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg">
            <Heart className="h-5 w-5 text-secondary fill-secondary animate-paw-bounce" />
          </div>
        </div>

        {/* Pet Info */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xl font-bold text-foreground">{pet.name}</h3>
            {pet.age && (
              <span className="text-sm font-medium text-muted-foreground bg-muted px-3 py-1 rounded-full">
                {pet.age} {pet.age === 1 ? "year" : "years"}
              </span>
            )}
          </div>

          {pet.breed && (
            <p className="text-sm text-muted-foreground mb-3">{pet.breed}</p>
          )}

          {/* Quick Stats */}
          <div className="flex gap-2 flex-wrap">
            <div className="flex items-center gap-1 bg-primary/10 rounded-full px-3 py-1">
              <Calendar className="h-3 w-3 text-primary" />
              <span className="text-xs font-medium text-primary">0 sessions</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

