import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Camera, Loader2 } from "lucide-react";

interface AddPetModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  userId: string;
}

export const AddPetModal = ({ open, onOpenChange, onSuccess, userId }: AddPetModalProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    breed: "",
    age: "",
    medical_info: "",
    vet_contact: "",
    food_preferences: "",
  });
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.from("pets").insert({
        fur_boss_id: userId,
        name: formData.name,
        breed: formData.breed || null,
        age: formData.age ? parseInt(formData.age) : null,
        medical_info: formData.medical_info || null,
        vet_contact: formData.vet_contact || null,
        food_preferences: formData.food_preferences || null,
      });

      if (error) throw error;

      toast({
        title: "Success! 🐾",
        description: `${formData.name} has been added to your pack!`,
      });

      setFormData({
        name: "",
        breed: "",
        age: "",
        medical_info: "",
        vet_contact: "",
        food_preferences: "",
      });
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "Failed to add pet. Please try again.",
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
            Add Your Pet 🐕
          </DialogTitle>
          <DialogDescription>
            Tell us about your furry friend so we can take great care of them!
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Pet Photo Placeholder */}
          <div className="flex justify-center">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity">
              <Camera className="h-8 w-8 text-primary" />
            </div>
          </div>

          {/* Pet Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-semibold">
              Pet Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              placeholder="e.g., Zach"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="rounded-2xl border-2"
            />
          </div>

          {/* Breed */}
          <div className="space-y-2">
            <Label htmlFor="breed" className="text-sm font-semibold">
              Breed
            </Label>
            <Input
              id="breed"
              placeholder="e.g., Golden Retriever"
              value={formData.breed}
              onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
              className="rounded-2xl border-2"
            />
          </div>

          {/* Age */}
          <div className="space-y-2">
            <Label htmlFor="age" className="text-sm font-semibold">
              Age (years)
            </Label>
            <Input
              id="age"
              type="number"
              placeholder="e.g., 3"
              value={formData.age}
              onChange={(e) => setFormData({ ...formData, age: e.target.value })}
              className="rounded-2xl border-2"
              min="0"
            />
          </div>

          {/* Food Preferences */}
          <div className="space-y-2">
            <Label htmlFor="food_preferences" className="text-sm font-semibold">
              Food Preferences
            </Label>
            <Textarea
              id="food_preferences"
              placeholder="e.g., Dry kibble, 2 cups twice daily. Loves chicken treats!"
              value={formData.food_preferences}
              onChange={(e) => setFormData({ ...formData, food_preferences: e.target.value })}
              className="rounded-2xl border-2 min-h-[80px]"
            />
          </div>

          {/* Medical Info */}
          <div className="space-y-2">
            <Label htmlFor="medical_info" className="text-sm font-semibold">
              Medical Information
            </Label>
            <Textarea
              id="medical_info"
              placeholder="e.g., Allergies, medications, special needs..."
              value={formData.medical_info}
              onChange={(e) => setFormData({ ...formData, medical_info: e.target.value })}
              className="rounded-2xl border-2 min-h-[80px]"
            />
          </div>

          {/* Vet Contact */}
          <div className="space-y-2">
            <Label htmlFor="vet_contact" className="text-sm font-semibold">
              Vet Contact
            </Label>
            <Input
              id="vet_contact"
              placeholder="e.g., Dr. Smith - (555) 123-4567"
              value={formData.vet_contact}
              onChange={(e) => setFormData({ ...formData, vet_contact: e.target.value })}
              className="rounded-2xl border-2"
            />
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={loading || !formData.name}
            className="w-full rounded-full h-12 text-base font-semibold bg-gradient-to-r from-primary to-secondary hover:opacity-90"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Adding Pet...
              </>
            ) : (
              "Add Pet 🐾"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

