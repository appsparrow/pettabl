import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Camera, Loader2, User, Mail, Phone, MapPin, Edit2, Save, X, Plus } from "lucide-react";
import { useRole } from "@/contexts/RoleContext";
import { PetCard } from "@/components/PetCard";
import { AddPetModal } from "@/components/AddPetModal";
import { uploadImageToR2, deleteImageFromR2 } from "@/lib/r2-storage";

interface Profile {
  id: string;
  name: string;
  email: string;
  role: string;
  photo_url: string | null;
  phone: string | null;
  address: string | null;
  bio: string | null;
  paw_points: number;
}

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pets, setPets] = useState<any[]>([]);
  const [showAddPet, setShowAddPet] = useState(false);
  const { activeRole } = useRole();

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    bio: "",
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) throw error;

      setProfile(data);
      setFormData({
        name: data.name || "",
        phone: data.phone || "",
        address: data.address || "",
        bio: data.bio || "",
      });
      setPhotoPreview(data.photo_url);
      
      // Load pets
      await loadPets(user.id);
    } catch (error) {
      console.error("Error loading profile:", error);
      toast({
        title: "Error",
        description: "Failed to load profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadPets = async (userId: string) => {
    try {
      const { data } = await supabase
        .from("pets")
        .select("*")
        .eq("fur_boss_id", userId)
        .order("created_at", { ascending: false });
      setPets(data || []);
    } catch (error) {
      console.error("Error loading pets:", error);
    }
  };

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setPhotoFile(file);

    const reader = new FileReader();
    reader.onload = (e) => {
      setPhotoPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);

    try {
      let photoUrl = profile.photo_url;

      // Upload new photo to R2 if selected
      if (photoFile) {
        // Delete old photo from R2 if exists
        if (profile.photo_url && profile.photo_url.includes('r2.cloudflarestorage.com')) {
          try {
            await deleteImageFromR2(profile.photo_url);
          } catch (error) {
            console.error('Error deleting old photo:', error);
            // Continue with upload even if delete fails
          }
        }

        // Upload new photo to R2
        photoUrl = await uploadImageToR2(photoFile, 'profiles', true);
        
        toast({
          title: "Photo uploaded! 📸",
          description: "Your profile photo has been updated.",
        });
      }

      const { error } = await supabase
        .from("profiles")
        .update({
          name: formData.name,
          phone: formData.phone || null,
          address: formData.address || null,
          bio: formData.bio || null,
          photo_url: photoUrl,
        })
        .eq("id", profile.id);

      if (error) throw error;

      toast({
        title: "Profile updated! 🎉",
        description: "Your profile has been saved successfully.",
      });

      setEditing(false);
      setPhotoFile(null);
      await loadProfile();
    } catch (error) {
      console.error("Error saving profile:", error);
      toast({
        title: "Error",
        description: "Failed to save profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        name: profile.name || "",
        phone: profile.phone || "",
        address: profile.address || "",
        bio: profile.bio || "",
      });
      setPhotoPreview(profile.photo_url);
      setPhotoFile(null);
    }
    setEditing(false);
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "fur_boss":
        return "Fur Boss 🐕";
      case "fur_agent":
        return "Fur Agent 🐾";
      case "super_admin":
        return "Super Admin 👑";
      default:
        return role;
    }
  };

  const getDashboardRoute = () => {
    if (profile?.role === "fur_boss") return "/boss-dashboard";
    if (profile?.role === "fur_agent") return "/agent-dashboard";
    return "/";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary via-secondary to-accent p-6 pt-12 pb-32 relative">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(getDashboardRoute())}
          className="text-white hover:bg-white/20 mb-4"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>

        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-2">My Profile</h1>
          <p className="text-white/80">{getRoleLabel(profile.role)}</p>
        </div>

        {!editing && (
          <Button
            onClick={() => setEditing(true)}
            size="icon"
            className="absolute top-12 right-6 bg-white/20 hover:bg-white/30 text-white"
          >
            <Edit2 className="h-5 w-5" />
          </Button>
        )}
      </div>

      {/* Profile Content */}
      <div className="max-w-md mx-auto px-4 -mt-24 relative z-10">
        <Card className="rounded-3xl border-0 shadow-2xl">
          <CardContent className="pt-6 space-y-6">
            {/* Profile Photo */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                  {photoPreview ? (
                    <img src={photoPreview} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <User className="h-16 w-16 text-primary/40" />
                  )}
                </div>
                {editing && (
                  <>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-0 right-0 w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center shadow-lg hover:bg-primary/90"
                    >
                      <Camera className="h-5 w-5" />
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handlePhotoChange}
                    />
                  </>
                )}
              </div>
            </div>

            {/* Paw Points Badge */}
            {profile.role === "fur_agent" && (
              <div className="text-center">
                <div className="inline-block bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-2 rounded-full font-bold">
                  🐾 {profile.paw_points} Paw Points
                </div>
              </div>
            )}

            {/* Form Fields */}
            <div className="space-y-4">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2">
                  <User className="h-4 w-4 text-primary" />
                  Name
                </Label>
                {editing ? (
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="rounded-2xl border-2"
                    placeholder="Your name"
                  />
                ) : (
                  <p className="text-lg font-semibold">{profile.name}</p>
                )}
              </div>

              {/* Email (Read-only) */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-primary" />
                  Email
                </Label>
                <p className="text-muted-foreground">{profile.email}</p>
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-primary" />
                  Phone
                </Label>
                {editing ? (
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="rounded-2xl border-2"
                    placeholder="(555) 123-4567"
                    type="tel"
                  />
                ) : (
                  <p className="text-muted-foreground">{profile.phone || "Not set"}</p>
                )}
              </div>

              {/* Address */}
              <div className="space-y-2">
                <Label htmlFor="address" className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  Address
                </Label>
                {editing ? (
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="rounded-2xl border-2"
                    placeholder="123 Main St, City, State 12345"
                    rows={2}
                  />
                ) : (
                  <p className="text-muted-foreground whitespace-pre-wrap">{profile.address || "Not set"}</p>
                )}
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <Label htmlFor="bio">About Me</Label>
                {editing ? (
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    className="rounded-2xl border-2"
                    placeholder="Tell us about yourself..."
                    rows={3}
                  />
                ) : (
                  <p className="text-muted-foreground whitespace-pre-wrap">{profile.bio || "No bio yet"}</p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            {editing && (
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleCancel}
                  variant="outline"
                  className="flex-1 rounded-full"
                  disabled={saving}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  className="flex-1 rounded-full bg-gradient-to-r from-primary to-secondary"
                  disabled={saving || !formData.name}
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save
                    </>
                  )}
                </Button>
              </div>
            )}

            {/* My Pets Section - Show for all users */}
            {!editing && (
              <div className="space-y-4 pt-6 border-t mt-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">My Pets</h3>
                  <Button
                    size="sm"
                    onClick={() => setShowAddPet(true)}
                    className="rounded-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Pet
                  </Button>
                </div>
                
                {pets.length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-muted-foreground mb-3">
                      No pets yet. Add your first pet to get started!
                    </p>
                    {profile?.role === "fur_agent" && (
                      <p className="text-xs text-muted-foreground">
                        💡 Adding a pet will allow you to switch between Agent and Boss modes
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {pets.map((pet) => (
                      <PetCard
                        key={pet.id}
                        pet={pet}
                        onClick={() => navigate(`/pet/${pet.id}`)}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add Pet Modal */}
      {profile && (
        <AddPetModal
          open={showAddPet}
          onOpenChange={setShowAddPet}
          userId={profile.id}
          onSuccess={() => {
            loadPets(profile.id);
            setShowAddPet(false);
          }}
        />
      )}
    </div>
  );
};

export default Profile;

