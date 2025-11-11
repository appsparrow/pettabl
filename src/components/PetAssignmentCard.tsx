import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dog, Calendar } from 'lucide-react';
import { format, parseISO } from 'date-fns';

type DayStatus = 'future' | 'none' | 'partial' | 'complete';

interface DayStatusEntry {
  date: string;
  status: DayStatus;
}

interface PetAssignment {
  session_id: string;
  pet_id: string;
  pet_name: string;
  pet_photo_url: string | null;
  start_date: string;
  end_date: string;
  status: string;
  activities_today: number;
  total_activities_today: number;
  day_statuses: DayStatusEntry[];
  isLastDayToday: boolean;
}

interface PetAssignmentCardProps {
  assignment: PetAssignment;
  onClick: () => void;
}

const statusClasses: Record<DayStatus, string> = {
  future: 'bg-gray-300',
  none: 'bg-red-500',
  partial: 'bg-orange-500',
  complete: 'bg-green-500',
};

const statusLabel: Record<DayStatus, string> = {
  future: 'Upcoming day',
  none: 'No activities logged yet',
  partial: 'Some activities logged',
  complete: 'All activities completed',
};

const PetAssignmentCard = ({ assignment, onClick }: PetAssignmentCardProps) => {
  const startDate = parseISO(assignment.start_date);
  const endDate = parseISO(assignment.end_date);

  const completionPercentage =
    assignment.total_activities_today > 0
      ? Math.round((assignment.activities_today / assignment.total_activities_today) * 100)
      : assignment.activities_today > 0
        ? 100
        : 0;

  return (
    <Card 
      className="rounded-3xl border-0 shadow-lg hover:shadow-xl transition-all cursor-pointer"
      onClick={onClick}
    >
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          {/* Pet Photo */}
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-secondary/20 to-accent/20 flex items-center justify-center overflow-hidden shrink-0">
            {assignment.pet_photo_url ? (
              <img
                src={assignment.pet_photo_url}
                alt={assignment.pet_name}
                className="w-full h-full object-cover"
              />
            ) : (
              <Dog className="h-8 w-8 text-secondary" />
            )}
          </div>

          {/* Pet Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="text-lg font-bold text-foreground truncate">
                {assignment.pet_name}
              </h3>
              <Badge 
                variant={assignment.status === 'active' ? 'default' : 'secondary'}
                className="shrink-0 capitalize"
              >
                {assignment.status}
              </Badge>
            </div>

            {/* Session Dates */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
              <Calendar className="h-4 w-4" />
              <span>
                {format(startDate, 'MMM d')} - {format(endDate, 'MMM d, yyyy')}
              </span>
            </div>

            {/* Timeline Dots */}
            <div className="mb-3">
              <div className="flex items-center gap-1 flex-wrap">
                {assignment.day_statuses.slice(0, 14).map((entry, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full ${statusClasses[entry.status]}`}
                    title={`${format(parseISO(entry.date), 'MMM d, yyyy')} • ${statusLabel[entry.status]}`}
                  />
                ))}
                {assignment.day_statuses.length > 14 && (
                  <span className="text-xs text-muted-foreground ml-1">
                    +{assignment.day_statuses.length - 14} more
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Red = nothing logged • Orange = partially logged • Green = all done
              </p>
            </div>

            {/* Today's Progress */}
            {assignment.total_activities_today > 0 && (
              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Today's Tasks</span>
                  <span className="font-semibold">
                    {assignment.activities_today}/{assignment.total_activities_today}
                  </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-400 to-green-600 transition-all"
                    style={{ width: `${completionPercentage}%` }}
                  />
                </div>
              </div>
            )}

            {assignment.isLastDayToday && (
              <div className="mt-3 text-sm text-purple-600 font-semibold">
                🥹 Last day with {assignment.pet_name}! Leave it sparkling clean.
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PetAssignmentCard;

