import { useState, useRef, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Camera, Upload } from 'lucide-react';

interface Schedule {
  feeding_instruction: string;
  walking_instruction: string;
  letout_instruction: string;
}

interface ActivityConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (timePeriod: string, date: string, photoFile?: File, notes?: string) => void;
  actionType: 'feed' | 'walk' | 'letout' | null;
  preselectedTimePeriod?: 'morning' | 'afternoon' | 'evening';
  schedule?: Schedule;
}

const ActivityConfirmDialog = ({ 
  open, 
  onClose, 
  onConfirm, 
  actionType,
  preselectedTimePeriod,
  schedule
}: ActivityConfirmDialogProps) => {
  const [selectedTimePeriod, setSelectedTimePeriod] = useState<string>(preselectedTimePeriod || 'morning');
  const [selectedDate, setSelectedDate] = useState<string>('today');
  const [notes, setNotes] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update time period when preselected value changes
  useEffect(() => {
    if (preselectedTimePeriod) {
      setSelectedTimePeriod(preselectedTimePeriod);
    }
  }, [preselectedTimePeriod]);

  const getActionEmoji = (type: string | null) => {
    switch (type) {
      case 'feed': return '🍽️';
      case 'walk': return '🚶';
      case 'letout': return '🏠';
      default: return '⏰';
    }
  };

  const getActionLabel = (type: string | null) => {
    switch (type) {
      case 'feed': return 'Fed';
      case 'walk': return 'Walked';
      case 'letout': return 'Let Out';
      default: return 'Action';
    }
  };

  const getInstructions = (type: string | null) => {
    if (!schedule) return '';
    switch (type) {
      case 'feed': return schedule.feeding_instruction;
      case 'walk': return schedule.walking_instruction;
      case 'letout': return schedule.letout_instruction;
      default: return '';
    }
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleConfirm = () => {
    const actualDate = selectedDate === 'today' 
      ? new Date().toISOString().slice(0, 10)
      : new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    
    onConfirm(selectedTimePeriod, actualDate, photoFile || undefined, notes || undefined);
    
    // Reset form
    setNotes('');
    setSelectedTimePeriod('morning');
    setSelectedDate('today');
    setPhotoFile(null);
    setPhotoPreview(null);
    onClose();
  };

  const handleClose = () => {
    setNotes('');
    setSelectedTimePeriod('morning');
    setSelectedDate('today');
    setPhotoFile(null);
    setPhotoPreview(null);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto rounded-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-2xl">{getActionEmoji(actionType)}</span>
            {getActionLabel(actionType)}
          </DialogTitle>
          <DialogDescription>
            Mark this activity as complete and earn Paw Points!
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Instructions */}
          {getInstructions(actionType) && (
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-2xl">
              <p className="text-gray-700 text-center">{getInstructions(actionType)}</p>
            </div>
          )}

          {/* Show selected time period (read-only) */}
          {preselectedTimePeriod && (
            <div className="bg-blue-50 p-4 rounded-2xl text-center">
              <p className="text-sm text-gray-600">Marking for</p>
              <p className="text-lg font-semibold text-blue-700 capitalize">
                {preselectedTimePeriod === 'morning' && '🌅 Morning'}
                {preselectedTimePeriod === 'afternoon' && '☀️ Afternoon'}
                {preselectedTimePeriod === 'evening' && '🌙 Evening'}
              </p>
            </div>
          )}

          {/* When? - Only show if marking for yesterday */}
          <div>
            {/* <Label className="text-sm font-medium text-gray-700 mb-2 block">Marking for today?</Label> */}
            <div className="flex gap-2">
              <Button
                variant={selectedDate === 'today' ? "default" : "outline"}
                onClick={() => setSelectedDate('today')}
                className={`rounded-full flex-1 ${
                  selectedDate === 'today' 
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white' 
                    : ''
                }`}
              >
                 Today
              </Button>
              <Button
                variant={selectedDate === 'yesterday' ? "default" : "outline"}
                onClick={() => setSelectedDate('yesterday')}
                className={`rounded-full flex-1 ${
                  selectedDate === 'yesterday' 
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white' 
                    : ''
                }`}
              >
                 Yesterday
              </Button>
            </div>
          </div>
          
          {/* Photo Upload */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-2 block">Add Photo (optional)</Label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handlePhotoSelect}
              className="hidden"
            />
            {photoPreview ? (
              <div className="relative">
                <img src={photoPreview} alt="Preview" className="w-full h-48 object-cover rounded-2xl" />
                <Button
                  onClick={() => {
                    setPhotoFile(null);
                    setPhotoPreview(null);
                  }}
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2 rounded-full"
                >
                  Remove
                </Button>
              </div>
            ) : (
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                className="w-full h-32 rounded-2xl border-2 border-dashed border-gray-300 hover:border-purple-400"
              >
                <div className="flex flex-col items-center gap-2">
                  <Camera className="h-8 w-8 text-gray-400" />
                  <span className="text-sm text-gray-600">Take or Upload Photo</span>
                </div>
              </Button>
            )}
          </div>
          
          {/* Notes */}
          <div>
            <Label htmlFor="notes" className="text-sm font-medium text-gray-700 mb-2 block">
              Notes (optional)
            </Label>
            <Textarea
              id="notes"
              placeholder="Any additional notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="rounded-2xl"
              rows={3}
            />
          </div>

          {/* Submit Button */}
          <Button 
            onClick={handleConfirm} 
            className="w-full h-14 rounded-2xl bg-gradient-to-r from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 text-lg font-medium"
          >
            Mark as {getActionLabel(actionType)} ✓
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ActivityConfirmDialog;

