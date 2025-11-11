import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Clock, Check, Save } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SimpleScheduleEditorProps {
  petId: string;
  onSaved?: () => void;
}

const SimpleScheduleEditor = ({ petId, onSaved }: SimpleScheduleEditorProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [scheduleId, setScheduleId] = useState<string | null>(null);
  const { toast } = useToast();

  // Instructions
  const [feedingInstruction, setFeedingInstruction] = useState('Give 1/2 cup food and fresh water');
  const [walkingInstruction, setWalkingInstruction] = useState('Walk around the block for 15-20 minutes');
  const [letoutInstruction, setLetoutInstruction] = useState('Let out in backyard for 5-10 minutes');

  // Schedule times
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

  useEffect(() => {
    fetchSchedule();
  }, [petId]);

  const fetchSchedule = async () => {
    try {
      // Fetch schedule for this pet (not tied to any specific session)
      const { data: scheduleData } = await supabase
        .from('schedules')
        .select('*')
        .eq('pet_id', petId)
        .is('session_id', null)
        .maybeSingle();

      if (scheduleData) {
        setScheduleId(scheduleData.id);
        setFeedingInstruction(scheduleData.feeding_instruction || '');
        setWalkingInstruction(scheduleData.walking_instruction || '');
        setLetoutInstruction(scheduleData.letout_instruction || '');

        // Fetch schedule times
        const { data: timesData } = await supabase
          .from('schedule_times')
          .select('*')
          .eq('schedule_id', scheduleData.id);

        // Reset times
        setFeedTimes({ morning: false, afternoon: false, evening: false });
        setWalkTimes({ morning: false, afternoon: false, evening: false });
        setLetoutTimes({ morning: false, afternoon: false, evening: false });

        // Set times from database
        timesData?.forEach((timeEntry) => {
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
    } catch (error) {
      console.error('Error fetching schedule:', error);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      let currentScheduleId = scheduleId;

      if (!currentScheduleId) {
        // Create new schedule
        const { data: newSchedule, error: scheduleError } = await supabase
          .from('schedules')
          .insert({
            pet_id: petId,
            session_id: null, // Pet-level schedule, not session-specific
            feeding_instruction: feedingInstruction,
            walking_instruction: walkingInstruction,
            letout_instruction: letoutInstruction,
          })
          .select()
          .single();

        if (scheduleError) throw scheduleError;
        currentScheduleId = newSchedule.id;
        setScheduleId(currentScheduleId);
      } else {
        // Update existing schedule
        const { error: scheduleError } = await supabase
          .from('schedules')
          .update({
            feeding_instruction: feedingInstruction,
            walking_instruction: walkingInstruction,
            letout_instruction: letoutInstruction,
          })
          .eq('id', currentScheduleId);

        if (scheduleError) throw scheduleError;
      }

      // Clear existing schedule times
      await supabase
        .from('schedule_times')
        .delete()
        .eq('schedule_id', currentScheduleId);

      // Insert new schedule times
      const scheduleTimesToInsert = [];

      // Add feed times
      Object.entries(feedTimes).forEach(([period, enabled]) => {
        if (enabled) {
          scheduleTimesToInsert.push({
            schedule_id: currentScheduleId,
            activity_type: 'feed',
            time_period: period,
          });
        }
      });

      // Add walk times
      Object.entries(walkTimes).forEach(([period, enabled]) => {
        if (enabled) {
          scheduleTimesToInsert.push({
            schedule_id: currentScheduleId,
            activity_type: 'walk',
            time_period: period,
          });
        }
      });

      // Add letout times
      Object.entries(letoutTimes).forEach(([period, enabled]) => {
        if (enabled) {
          scheduleTimesToInsert.push({
            schedule_id: currentScheduleId,
            activity_type: 'letout',
            time_period: period,
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
        title: "Schedule Saved! 🎉",
        description: "Your pet's schedule has been updated successfully.",
      });

      onSaved?.();
    } catch (error: any) {
      console.error('Error saving schedule:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save schedule. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="rounded-3xl shadow-xl bg-white/80 backdrop-blur-sm border-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
          <Clock className="h-6 w-6 text-orange-500" />
          Daily Schedule
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Feeding Schedule */}
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-2 block flex items-center gap-2">
              <span className="text-2xl">🍽️</span>
              Feed Times
            </Label>
            <div className="grid grid-cols-3 gap-2">
              {(['morning', 'afternoon', 'evening'] as const).map((period) => (
                <Button
                  key={period}
                  variant={feedTimes[period] ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFeedTimes(prev => ({ ...prev, [period]: !prev[period] }))}
                  className={`rounded-2xl capitalize ${
                    feedTimes[period] 
                      ? 'bg-gradient-to-r from-green-400 to-green-600 hover:from-green-500 hover:to-green-700' 
                      : ''
                  }`}
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
              placeholder="Give 1/2 cup food and fresh water"
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
            <Label className="text-sm font-medium text-gray-700 mb-2 block flex items-center gap-2">
              <span className="text-2xl">🚶</span>
              Walk Times
            </Label>
            <div className="grid grid-cols-3 gap-2">
              {(['morning', 'afternoon', 'evening'] as const).map((period) => (
                <Button
                  key={period}
                  variant={walkTimes[period] ? "default" : "outline"}
                  size="sm"
                  onClick={() => setWalkTimes(prev => ({ ...prev, [period]: !prev[period] }))}
                  className={`rounded-2xl capitalize ${
                    walkTimes[period] 
                      ? 'bg-gradient-to-r from-blue-400 to-blue-600 hover:from-blue-500 hover:to-blue-700' 
                      : ''
                  }`}
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
            <Label className="text-sm font-medium text-gray-700 mb-2 block flex items-center gap-2">
              <span className="text-2xl">🏠</span>
              Let Out Times
            </Label>
            <div className="grid grid-cols-3 gap-2">
              {(['morning', 'afternoon', 'evening'] as const).map((period) => (
                <Button
                  key={period}
                  variant={letoutTimes[period] ? "default" : "outline"}
                  size="sm"
                  onClick={() => setLetoutTimes(prev => ({ ...prev, [period]: !prev[period] }))}
                  className={`rounded-2xl capitalize ${
                    letoutTimes[period] 
                      ? 'bg-gradient-to-r from-orange-400 to-orange-600 hover:from-orange-500 hover:to-orange-700' 
                      : ''
                  }`}
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
              placeholder="Let out in backyard for 5-10 minutes"
              value={letoutInstruction}
              onChange={(e) => setLetoutInstruction(e.target.value)}
              className="rounded-2xl"
              rows={2}
            />
          </div>
        </div>

        <Button
          onClick={handleSave}
          disabled={isLoading}
          className="w-full rounded-2xl bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
        >
          <Save className="h-4 w-4 mr-2" />
          {isLoading ? 'Saving...' : 'Save Schedule'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default SimpleScheduleEditor;

