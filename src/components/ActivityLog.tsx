import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { Camera, Utensils, Footprints, DoorOpen, User, Clock } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface Activity {
  id: string;
  activity_type: 'feed' | 'walk' | 'letout';
  time_period: 'morning' | 'afternoon' | 'evening';
  date: string;
  photo_url?: string | null;
  notes?: string | null;
  created_at: string;
  caretaker?: {
    name: string;
    email: string;
  };
}

interface ActivityLogProps {
  activities: Activity[];
}

export const ActivityLog = ({ activities }: ActivityLogProps) => {
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'feed':
        return <Utensils className="h-4 w-4" />;
      case 'walk':
        return <Footprints className="h-4 w-4" />;
      case 'letout':
        return <DoorOpen className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'feed':
        return "bg-orange-100 text-orange-700 border-orange-200";
      case 'walk':
        return "bg-blue-100 text-blue-700 border-blue-200";
      case 'letout':
        return "bg-green-100 text-green-700 border-green-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getActivityLabel = (type: string) => {
    switch (type) {
      case 'feed':
        return "Fed";
      case 'walk':
        return "Walk";
      case 'letout':
        return "Let Out";
      default:
        return type;
    }
  };

  const getTimePeriodEmoji = (period: string) => {
    switch (period) {
      case 'morning':
        return "🌅";
      case 'afternoon':
        return "☀️";
      case 'evening':
        return "🌙";
      default:
        return "";
    }
  };

  if (activities.length === 0) {
    return (
      <Card className="rounded-3xl border-0 shadow-lg">
        <CardContent className="p-6">
          <p className="text-muted-foreground text-center py-4">No activities logged yet</p>
        </CardContent>
      </Card>
    );
  }

  // Group activities by date
  const groupedActivities = activities.reduce((acc, activity) => {
    const date = activity.date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(activity);
    return acc;
  }, {} as Record<string, Activity[]>);

  return (
    <>
      <div className="space-y-4">
        {Object.entries(groupedActivities)
          .sort(([dateA], [dateB]) => new Date(dateB).getTime() - new Date(dateA).getTime())
          .map(([date, dayActivities]) => (
            <div key={date}>
              <h3 className="text-sm font-semibold text-muted-foreground mb-2">
                {format(new Date(date), "EEEE, MMMM d, yyyy")}
              </h3>
              <div className="space-y-2">
                {dayActivities.map((activity) => (
                  <Card key={activity.id} className="rounded-2xl border-0 shadow-md overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        {/* Photo Thumbnail */}
                        {activity.photo_url ? (
                          <button
                            onClick={() => setSelectedPhoto(activity.photo_url!)}
                            className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 hover:opacity-80 transition-opacity"
                          >
                            <img
                              src={activity.photo_url}
                              alt="Activity"
                              className="w-full h-full object-cover"
                            />
                          </button>
                        ) : (
                          <div className="w-16 h-16 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                            <Camera className="h-6 w-6 text-muted-foreground/40" />
                          </div>
                        )}

                        {/* Activity Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getActivityColor(
                                activity.activity_type
                              )}`}
                            >
                              {getActivityIcon(activity.activity_type)}
                              {getActivityLabel(activity.activity_type)}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {getTimePeriodEmoji(activity.time_period)} {activity.time_period}
                            </span>
                          </div>

                          {activity.notes && (
                            <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                              {activity.notes}
                            </p>
                          )}

                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            {activity.caretaker && (
                              <div className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                <span>{activity.caretaker.name}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>{format(new Date(activity.created_at), "h:mm a")}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
      </div>

      {/* Photo Viewer Dialog */}
      <Dialog open={!!selectedPhoto} onOpenChange={() => setSelectedPhoto(null)}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden rounded-3xl">
          {selectedPhoto && (
            <img
              src={selectedPhoto}
              alt="Activity"
              className="w-full h-auto"
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

