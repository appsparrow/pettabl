
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Settings, Users, X, LogOut, Clock, Utensils, Home, Check, Save, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import UninstallPWAButton from './UninstallPWAButton';
import NotificationSettings from './NotificationSettings';

interface Profile {
  id: string;
  name: string;
  short_name: string;
  session_code: string;
  is_admin: boolean;
  phone_number?: string;
  user_group?: string;
}

interface Schedule {
  id: string;
  session_code: string;
  feeding_instruction: string;
  walking_instruction: string;
  letout_instruction: string;
  letout_count: number;
  pet_name?: string;
  pet_image_url?: string;
}

interface SetupScreenProps {
  profile: Profile;
  onClose: () => void;
  onLogout: () => void;
}

const SetupScreen = ({ profile, onClose, onLogout }: SetupScreenProps) => {
  const [newCaretakerName, setNewCaretakerName] = useState('');
  const [newCaretakerShortName, setNewCaretakerShortName] = useState('');
  const [newCaretakerPhone, setNewCaretakerPhone] = useState('');
  const [newCaretakerGroup, setNewCaretakerGroup] = useState('default');
  const [isLoading, setIsLoading] = useState(false);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [selectedGroup, setSelectedGroup] = useState('all');
  const { toast } = useToast();
  const { logout } = useAuth();

  // Schedule configuration
  const [feedingInstruction, setFeedingInstruction] = useState('');
  const [walkingInstruction, setWalkingInstruction] = useState('');
  const [letoutInstruction, setLetoutInstruction] = useState('');
  const [letoutCount, setLetoutCount] = useState(3);

  // Schedule times configuration
  const [feedTimes, setFeedTimes] = useState<{ [key: string]: boolean }>({
    morning: false,
    afternoon: false,
    evening: false
  });
  const [walkTimes, setWalkTimes] = useState<{ [key: string]: boolean }>({
    morning: false,
    afternoon: false,
    evening: false
  });
  const [letoutTimes, setLetoutTimes] = useState<{ [key: string]: boolean }>({
    morning: false,
    afternoon: false,
    evening: false
  });

  // Passcode editing
  const [newPasscode, setNewPasscode] = useState('');
  const [showAddCaretaker, setShowAddCaretaker] = useState(false);
  const [editingAdminCode, setEditingAdminCode] = useState(false);
  const [newAdminCode, setNewAdminCode] = useState('');

  // Fetch profiles and schedule for this session
  const fetchData = async () => {
    try {
      // Only fetch profiles if user is admin
      if (profile.is_admin) {
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('*')
          .eq('session_code', profile.session_code);
        
        setProfiles(profilesData || []);
      }

      // Fetch schedule
      const { data: scheduleData } = await supabase
        .from('schedules')
        .select('*')
        .eq('session_code', profile.session_code)
        .single();
      
      if (scheduleData) {
        setSchedule(scheduleData);
        setFeedingInstruction(scheduleData.feeding_instruction);
        setWalkingInstruction(scheduleData.walking_instruction);
        setLetoutInstruction(scheduleData.letout_instruction);
        setLetoutCount(scheduleData.letout_count);
        // @ts-ignore - pet_name and pet_image_url might not be in the type yet
        // setPetName(schedule?.pet_name || ''); // Removed pet-related state
        // @ts-ignore - pet_name and pet_image_url might not be in the type yet
        // setPetImageUrl(schedule?.pet_image_url || defaultPetImageUrl); // Removed pet-related state
        
        // Fetch schedule times
        const { data: scheduleTimesData } = await supabase
          .from('schedule_times')
          .select('*')
          .eq('schedule_id', scheduleData.id);
        
        // Reset all times to false first
        setFeedTimes({ morning: false, afternoon: false, evening: false });
        setWalkTimes({ morning: false, afternoon: false, evening: false });
        setLetoutTimes({ morning: false, afternoon: false, evening: false });
        
        // Set times based on database data
        if (scheduleTimesData) {
          scheduleTimesData.forEach((timeEntry) => {
            const { activity_type, time_period } = timeEntry;
            switch (activity_type) {
              case 'feed':
                setFeedTimes(prev => ({ ...prev, [time_period]: true }));
                break;
              case 'walk':
                setWalkTimes(prev => ({ ...prev, [time_period]: true }));
                break;
              case 'letout':
                setLetoutTimes(prev => ({ ...prev, [time_period]: true }));
                break;
            }
          });
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  // Load data on mount
  useEffect(() => {
    fetchData();
  }, [profile.session_code]);

  const handleAddCaretaker = async () => {
    if (!newCaretakerName.trim() || !newCaretakerShortName.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter both name and short name",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .insert({
          name: newCaretakerName.trim(),
          short_name: newCaretakerShortName.trim().toUpperCase(),
          phone_number: newCaretakerPhone.trim() || null,
          session_code: profile.session_code,
          is_admin: false,
          user_group: newCaretakerGroup
        });

      if (error) throw error;

      toast({
        title: "Caretaker Added",
        description: `${newCaretakerName} has been added successfully!`,
        variant: "default"
      });

      // Clear form
      setNewCaretakerName('');
      setNewCaretakerShortName('');
      setNewCaretakerPhone('');
      setNewCaretakerGroup('default');
      setShowAddCaretaker(false);
      fetchData();
    } catch (error) {
      console.error('Error adding caretaker:', error);
      toast({
        title: "Error",
        description: "Failed to add caretaker. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSchedule = async () => {
    setIsLoading(true);
    try {
      let scheduleId = schedule?.id;

      if (!scheduleId) {
        // Create new schedule
        const { data: newSchedule, error: scheduleError } = await supabase
          .from('schedules')
          .insert({
            session_code: profile.session_code,
            feeding_instruction: feedingInstruction,
            walking_instruction: walkingInstruction,
            letout_instruction: letoutInstruction,
            letout_count: letoutCount,
            // pet_name: petName, // Removed pet-related state
            // pet_image_url: petImageUrl, // Removed pet-related state
          })
          .select()
          .single();

        if (scheduleError) throw scheduleError;
        scheduleId = newSchedule.id;
      } else {
        // Update existing schedule
        const { error: scheduleError } = await supabase
          .from('schedules')
          .update({
            feeding_instruction: feedingInstruction,
            walking_instruction: walkingInstruction,
            letout_instruction: letoutInstruction,
            letout_count: letoutCount,
            // pet_name: petName, // Removed pet-related state
            // pet_image_url: petImageUrl, // Removed pet-related state
          })
          .eq('id', scheduleId);

        if (scheduleError) throw scheduleError;
      }

      // Clear existing schedule times
      await supabase
        .from('schedule_times')
        .delete()
        .eq('schedule_id', scheduleId);

      // Insert new schedule times
      const scheduleTimesToInsert = [];
      
      // Add feed times
      Object.entries(feedTimes).forEach(([period, enabled]) => {
        if (enabled) {
          scheduleTimesToInsert.push({
            schedule_id: scheduleId,
            activity_type: 'feed',
            time_period: period,
            time_of_day: period
          });
        }
      });

      // Add walk times
      Object.entries(walkTimes).forEach(([period, enabled]) => {
        if (enabled) {
          scheduleTimesToInsert.push({
            schedule_id: scheduleId,
            activity_type: 'walk',
            time_period: period,
            time_of_day: period
          });
        }
      });

      // Add letout times
      Object.entries(letoutTimes).forEach(([period, enabled]) => {
        if (enabled) {
          scheduleTimesToInsert.push({
            schedule_id: scheduleId,
            activity_type: 'letout',
            time_period: period,
            time_of_day: period
          });
        }
      });

      if (scheduleTimesToInsert.length > 0) {
        const { error: timesError } = await supabase
          .from('schedule_times')
          .insert(scheduleTimesToInsert);

        if (timesError) throw timesError;
      }

      toast({
        title: "Schedule Saved",
        description: "Your schedule has been updated successfully!",
        variant: "default"
      });

      fetchData();
    } catch (error) {
      console.error('Error saving schedule:', error);
      toast({
        title: "Error",
        description: "Failed to save schedule. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePasscode = async () => {
    if (!newPasscode.trim()) {
      toast({
        title: "Missing Passcode",
        description: "Please enter a new passcode",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ phone_number: newPasscode.trim() })
        .eq('id', profile.id);

      if (error) throw error;

      toast({
        title: "Passcode Updated",
        description: "Your passcode has been updated successfully!",
        variant: "default"
      });

      setNewPasscode('');
      fetchData();
    } catch (error) {
      console.error('Error updating passcode:', error);
      toast({
        title: "Error",
        description: "Failed to update passcode. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateAdminCode = async () => {
    if (!newAdminCode.trim()) {
      toast({
        title: "Missing Admin Code",
        description: "Please enter a new admin code",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ session_code: newAdminCode.trim() })
        .eq('id', profile.id);

      if (error) throw error;

      toast({
        title: "Admin Code Updated",
        description: "Your admin code has been updated successfully!",
        variant: "default"
      });

      setNewAdminCode('');
      setEditingAdminCode(false);
      fetchData();
    } catch (error) {
      console.error('Error updating admin code:', error);
      toast({
        title: "Error",
        description: "Failed to update admin code. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    onLogout();
  };

  // Removed handlePetImageUpload, handlePetImageChange, and defaultPetImageUrl

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50">
      <div className="h-full overflow-y-auto">
        <div className="max-w-md mx-auto p-6 pb-20">
          {/* Header */}
          <Card className="rounded-3xl shadow-xl bg-white/80 backdrop-blur-sm border-0 mb-6 sticky top-0 z-10">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  <Settings className="h-6 w-6 text-purple-500" />
                  Settings
                </CardTitle>
                <Button onClick={onClose} variant="ghost" size="sm" className="rounded-full">
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </CardHeader>
          </Card>

          {/* User Profile Information */}
          <Card className="rounded-3xl shadow-xl bg-white/80 backdrop-blur-sm border-0 mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                <span className="text-2xl">👤</span>
                User Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* User Name */}
              <div className="space-y-2">
                <Label htmlFor="userName" className="text-sm font-medium text-gray-700">Name</Label>
                <Input
                  id="userName"
                  placeholder="Enter your full name"
                  value={profile.name}
                  disabled
                  className="rounded-2xl bg-gray-50"
                />
                <p className="text-xs text-gray-500">Name cannot be changed</p>
              </div>

              {/* User Email */}
              <div className="space-y-2">
                <Label htmlFor="userEmail" className="text-sm font-medium text-gray-700">Email</Label>
                <Input
                  id="userEmail"
                  type="email"
                  placeholder="Enter your email"
                  value={`user-${profile.session_code}@dingdongdog.com`}
                  disabled
                  className="rounded-2xl bg-gray-50"
                />
                <p className="text-xs text-gray-500">Email is auto-generated from session code</p>
              </div>

              {/* User Phone */}
              <div className="space-y-2">
                <Label htmlFor="userPhone" className="text-sm font-medium text-gray-700">Phone Number</Label>
                <Input
                  id="userPhone"
                  type="tel"
                  placeholder="Enter your phone number"
                  value={profile.phone_number || ''}
                  disabled
                  className="rounded-2xl bg-gray-50"
                />
                <p className="text-xs text-gray-500">Phone number cannot be changed</p>
              </div>

              {/* 4-Digit Passcode */}
              <div className="space-y-2">
                <Label htmlFor="userPasscode" className="text-sm font-medium text-gray-700">4-Digit Passcode</Label>
                <div className="flex gap-2">
                  <Input
                    id="userPasscode"
                    type="password"
                    placeholder="Enter new 4-digit passcode"
                    value={newPasscode}
                    onChange={(e) => setNewPasscode(e.target.value)}
                    maxLength={4}
                    className="rounded-2xl flex-1"
                  />
                  <Button
                    onClick={handleUpdatePasscode}
                    disabled={!newPasscode || newPasscode.length !== 4 || isLoading}
                    className="rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                  >
                    {isLoading ? 'Updating...' : 'Update'}
                  </Button>
                </div>
                <p className="text-xs text-gray-500">Use this passcode to log in to your account</p>
              </div>

              {/* Session Code */}
              <div className="space-y-2">
                <Label htmlFor="sessionCode" className="text-sm font-medium text-gray-700">Session Code</Label>
                <Input
                  id="sessionCode"
                  value={profile.session_code}
                  disabled
                  className="rounded-2xl bg-gray-50 font-mono"
                />
                <p className="text-xs text-gray-500">Your unique session identifier</p>
              </div>
            </CardContent>
          </Card>

          {/* Schedule Management - Admin Only */}
          {profile.is_admin && (
            <Card className="rounded-3xl shadow-xl bg-white/80 backdrop-blur-sm border-0 mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                  <Clock className="h-5 w-5 text-orange-500" />
                  Schedule Setup
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Feeding Schedule */}
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">Feed Times</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['morning', 'afternoon', 'evening'] as const).map((period) => (
                        <Button
                          key={period}
                          variant={feedTimes[period] ? "default" : "outline"}
                          size="sm"
                          onClick={() => setFeedTimes(prev => ({ ...prev, [period]: !prev[period] }))}
                          className="rounded-2xl capitalize"
                        >
                          {feedTimes[period] && <Check className="h-3 w-3 mr-1" />}
                          {period}
                        </Button>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="feedingInstruction">Feeding Instructions</Label>
                    <Textarea
                      id="feedingInstruction"
                      placeholder="Give 1/2 cup food and let him out before"
                      value={feedingInstruction}
                      onChange={(e) => setFeedingInstruction(e.target.value)}
                      className="rounded-2xl"
                      rows={2}
                    />
                  </div>
                </div>

                {/* Walking Schedule */}
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">Walk Times</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['morning', 'afternoon', 'evening'] as const).map((period) => (
                        <Button
                          key={period}
                          variant={walkTimes[period] ? "default" : "outline"}
                          size="sm"
                          onClick={() => setWalkTimes(prev => ({ ...prev, [period]: !prev[period] }))}
                          className="rounded-2xl capitalize"
                        >
                          {walkTimes[period] && <Check className="h-3 w-3 mr-1" />}
                          {period}
                        </Button>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="walkingInstruction">Walking Instructions</Label>
                    <Textarea
                      id="walkingInstruction"
                      placeholder="Walk around the block for 15-20 minutes"
                      value={walkingInstruction}
                      onChange={(e) => setWalkingInstruction(e.target.value)}
                      className="rounded-2xl"
                      rows={2}
                    />
                  </div>
                </div>

                {/* Let Out Schedule */}
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">Let Out Times</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['morning', 'afternoon', 'evening'] as const).map((period) => (
                        <Button
                          key={period}
                          variant={letoutTimes[period] ? "default" : "outline"}
                          size="sm"
                          onClick={() => setLetoutTimes(prev => ({ ...prev, [period]: !prev[period] }))}
                          className="rounded-2xl capitalize"
                        >
                          {letoutTimes[period] && <Check className="h-3 w-3 mr-1" />}
                          {period}
                        </Button>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="letoutInstruction">Let Out Instructions</Label>
                    <Textarea
                      id="letoutInstruction"
                      placeholder="Let out for 5-10 minutes in the backyard"
                      value={letoutInstruction}
                      onChange={(e) => setLetoutInstruction(e.target.value)}
                      className="rounded-2xl"
                      rows={2}
                    />
                  </div>
                </div>

                <Button
                  onClick={handleSaveSchedule}
                  disabled={isLoading}
                  className="w-full rounded-2xl bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isLoading ? 'Saving...' : 'Save Schedule'}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Add Caretaker (Admin Only) */}
          {profile.is_admin && (
            <Card className="rounded-3xl shadow-xl bg-white/80 backdrop-blur-sm border-0 mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  <Users className="h-5 w-5 text-green-500" />
                  Current Caretakers
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Group Filter */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Filter by Group</Label>
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      variant={selectedGroup === 'all' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedGroup('all')}
                      className="rounded-2xl"
                    >
                      All ({profiles.length})
                    </Button>
                    {Array.from(new Set(profiles.map(p => p.user_group || 'default'))).map(group => (
                      <Button
                        key={group}
                        variant={selectedGroup === group ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedGroup(group)}
                        className="rounded-2xl"
                      >
                        {group.charAt(0).toUpperCase() + group.slice(1)} ({profiles.filter(p => (p.user_group || 'default') === group).length})
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Current Caretakers List */}
                <div className="space-y-3">
                  {profiles
                    .filter(caretaker => selectedGroup === 'all' || (caretaker.user_group || 'default') === selectedGroup)
                    .map((caretaker) => (
                    <div key={caretaker.id} className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-slate-50 rounded-2xl">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold">
                          {caretaker.short_name}
                        </div>
                        <div>
                          <p className="font-medium text-gray-700">{caretaker.name}</p>
                          <div className="flex items-center gap-2">
                            {caretaker.phone_number && (
                              <p className="text-sm text-gray-500">{caretaker.phone_number}</p>
                            )}
                            <Badge variant="secondary" className="text-xs">
                              {caretaker.user_group || 'default'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {caretaker.is_admin && (
                          <Badge variant="default">Owner</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add Caretaker Button */}
                <Button
                  onClick={() => setShowAddCaretaker(!showAddCaretaker)}
                  className="w-full rounded-2xl bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {showAddCaretaker ? 'Cancel' : 'Add Caretaker'}
                </Button>

                {/* Add Caretaker Form - Expandable */}
                {showAddCaretaker && (
                  <div className="space-y-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-200">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        placeholder="Enter full name"
                        value={newCaretakerName}
                        onChange={(e) => setNewCaretakerName(e.target.value)}
                        className="rounded-2xl"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="shortName">Short Name (2 letters)</Label>
                      <Input
                        id="shortName"
                        placeholder="e.g., JD"
                        maxLength={2}
                        value={newCaretakerShortName}
                        onChange={(e) => setNewCaretakerShortName(e.target.value.toUpperCase())}
                        className="rounded-2xl"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number (Optional)</Label>
                      <Input
                        id="phone"
                        placeholder="Enter phone number"
                        value={newCaretakerPhone}
                        onChange={(e) => setNewCaretakerPhone(e.target.value)}
                        className="rounded-2xl"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="group">User Group</Label>
                      <select
                        id="group"
                        value={newCaretakerGroup}
                        onChange={(e) => setNewCaretakerGroup(e.target.value)}
                        className="w-full rounded-2xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="default">Default</option>
                        <option value="family">Family</option>
                        <option value="neighbors">Neighbors</option>
                        <option value="sitters">Pet Sitters</option>
                        <option value="friends">Friends</option>
                      </select>
                    </div>

                    <Button
                      onClick={handleAddCaretaker}
                      disabled={isLoading}
                      className="w-full rounded-2xl bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                    >
                      {isLoading ? 'Adding...' : 'Add Caretaker'}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Current Session Info - Admin Only */}
          {profile.is_admin && (
            <Card className="rounded-3xl shadow-xl bg-white/80 backdrop-blur-sm border-0 mb-6">
              <CardHeader>
                <CardTitle className="text-lg bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Session Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Session Code:</span>
                  <Badge variant="outline" className="text-lg font-bold">
                    {profile.session_code}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Your Role:</span>
                  <Badge variant={profile.is_admin ? "default" : "secondary"}>
                    {profile.is_admin ? "Owner" : "Caretaker"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notification Settings */}
          <NotificationSettings profile={profile} />

          {/* Admin Code and User Code Management (Admin Only) */}
          {profile.is_admin && (
            <Card className="rounded-3xl shadow-xl bg-white/80 backdrop-blur-sm border-0 mb-6">
              <CardHeader>
                <CardTitle className="text-lg bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Code Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Admin Code */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-gray-700">Admin Code</Label>
                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl">
                    <span className="text-gray-600">Current Admin Code:</span>
                    <Badge variant="outline" className="text-lg font-bold">
                      {profile.session_code}
                    </Badge>
                  </div>
                  {editingAdminCode ? (
                    <div className="flex gap-2">
                      <Input
                        value={newAdminCode}
                        onChange={(e) => setNewAdminCode(e.target.value)}
                        placeholder="Enter new admin code"
                        maxLength={4}
                        className="rounded-2xl flex-1"
                      />
                      <Button
                        onClick={handleUpdateAdminCode}
                        disabled={isLoading || !newAdminCode.trim()}
                        className="rounded-2xl bg-purple-500 hover:bg-purple-600"
                      >
                        Save
                      </Button>
                      <Button
                        onClick={() => {
                          setEditingAdminCode(false);
                          setNewAdminCode('');
                        }}
                        variant="outline"
                        className="rounded-2xl"
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <Button
                      onClick={() => setEditingAdminCode(true)}
                      variant="outline"
                      className="w-full rounded-2xl"
                    >
                      Change Admin Code
                    </Button>
                  )}
                </div>

                {/* User Code (Passcode) */}
                <div className="space-y-3 pt-4 border-t border-gray-200">
                  <Label className="text-sm font-medium text-gray-700">User Code (Your Passcode)</Label>
                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl">
                    <span className="text-gray-600">Current User Code:</span>
                    <Badge variant="outline" className="text-lg font-bold">
                      {profile.phone_number || 'Not set'}
                    </Badge>
                  </div>
                  {/* Removed editingPasscode logic */}
                  <Button
                    onClick={() => {
                      // This button is no longer relevant for the user profile
                      // It was for changing the user's own passcode, which is now handled by handleUpdatePasscode
                    }}
                    variant="outline"
                    className="w-full rounded-2xl"
                  >
                    Change User Code
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* App Actions */}
          <Card className="rounded-3xl shadow-xl bg-white/80 backdrop-blur-sm border-0">
            <CardContent className="pt-6 space-y-4">
              <Button
                onClick={handleLogout}
                variant="outline"
                className="w-full rounded-2xl border-2 border-purple-200 text-purple-600 hover:bg-purple-50 hover:border-purple-300"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
              
              <UninstallPWAButton />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SetupScreen;
