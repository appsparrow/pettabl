import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Calendar, Check } from 'lucide-react';

interface ScheduleTime {
  id: string;
  activity_type: 'feed' | 'walk' | 'letout';
  time_period: 'morning' | 'afternoon' | 'evening';
}

interface Activity {
  id: string;
  activity_type: 'feed' | 'walk' | 'letout';
  time_period: 'morning' | 'afternoon' | 'evening';
  caretaker?: {
    name: string;
  };
  photo_url?: string;
  created_at: string;
}

interface TodayScheduleChecklistProps {
  scheduleTimes: ScheduleTime[];
  completedActivities: Activity[];
  onCheckActivity: (activityType: 'feed' | 'walk' | 'letout', timePeriod: 'morning' | 'afternoon' | 'evening') => void;
  onUnmarkActivity?: (activityId: string) => void;
}

const TodayScheduleChecklist = ({ 
  scheduleTimes, 
  completedActivities,
  onCheckActivity,
  onUnmarkActivity
}: TodayScheduleChecklistProps) => {
  const getActivityEmoji = (type: string) => {
    switch (type) {
      case 'feed': return '🍽️';
      case 'walk': return '🚶';
      case 'letout': return '🏠';
      default: return '⏰';
    }
  };

  const getActivityLabel = (type: string) => {
    switch (type) {
      case 'feed': return 'Feed';
      case 'walk': return 'Walk';
      case 'letout': return 'Let Out';
      default: return type;
    }
  };

  const getTimePeriodColor = (timePeriod: string) => {
    switch (timePeriod) {
      case 'morning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'afternoon': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'evening': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTimePeriodIcon = (timePeriod: string) => {
    switch (timePeriod) {
      case 'morning': return '☀️';
      case 'afternoon': return '🌤️';
      case 'evening': return '🌙';
      default: return '⏰';
    }
  };

  const isCompleted = (activityType: string, timePeriod: string) => {
    return completedActivities.some(
      activity => activity.activity_type === activityType && activity.time_period === timePeriod
    );
  };

  const getCompletedActivity = (activityType: string, timePeriod: string) => {
    return completedActivities.find(
      activity => activity.activity_type === activityType && activity.time_period === timePeriod
    );
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  // Group schedule times by time period
  const groupedSchedule = scheduleTimes.reduce((acc, item) => {
    if (!acc[item.time_period]) {
      acc[item.time_period] = [];
    }
    acc[item.time_period].push(item);
    return acc;
  }, {} as Record<string, ScheduleTime[]>);

  const periods = ['morning', 'afternoon', 'evening'] as const;

  return (
    <Card className="rounded-3xl shadow-xl bg-white/80 backdrop-blur-sm border-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          <Calendar className="h-6 w-6 text-blue-500" />
          Today's Schedule
        </CardTitle>
      </CardHeader>
      <CardContent>
        {scheduleTimes.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">📋</div>
            <p className="text-gray-500">No schedule set yet</p>
            <p className="text-sm text-gray-400 mt-1">Ask your Fur Boss to set up the daily schedule!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {periods.map((period) => {
              const periodItems = groupedSchedule[period] || [];
              if (periodItems.length === 0) return null;

              return (
                <div key={period} className="space-y-2">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{getTimePeriodIcon(period)}</span>
                    <h3 className="font-semibold text-gray-700 capitalize">{period}</h3>
                  </div>
                  
                  <div className="space-y-2">
                    {periodItems.map((item) => {
                      const completed = isCompleted(item.activity_type, item.time_period);
                      const activity = getCompletedActivity(item.activity_type, item.time_period);

                      return (
                        <div
                          key={`${item.activity_type}-${item.time_period}`}
                          className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all ${
                            completed
                              ? 'bg-green-50 border-green-200'
                              : 'bg-white border-gray-200 hover:border-purple-300'
                          }`}
                        >
                          <div className="flex items-center gap-3 flex-1">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              completed ? 'bg-green-100' : 'bg-gray-100'
                            }`}>
                              {completed ? (
                                <Check className="h-5 w-5 text-green-600" />
                              ) : (
                                <span className="text-xl">{getActivityEmoji(item.activity_type)}</span>
                              )}
                            </div>
                            
                            <div className="flex-1">
                              <p className={`font-semibold ${completed ? 'text-green-700 line-through' : 'text-gray-700'}`}>
                                {getActivityLabel(item.activity_type)}
                              </p>
                              {completed && activity && (
                                <div className="flex items-center gap-2 mt-1">
                                  <p className="text-xs text-green-600">
                                    ✓ by {activity.caretaker?.name || 'Agent'} at {formatTime(activity.created_at)}
                                  </p>
                                  {activity.photo_url && (
                                    <Badge variant="outline" className="text-xs">📷</Badge>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>

                          {completed && onUnmarkActivity && activity ? (
                            <Button
                              onClick={() => onUnmarkActivity(activity.id)}
                              size="sm"
                              variant="outline"
                              className="rounded-full border-green-300 text-green-700 hover:bg-green-50"
                            >
                              Undo
                            </Button>
                          ) : !completed ? (
                            <Button
                              onClick={() => onCheckActivity(item.activity_type, item.time_period as any)}
                              size="sm"
                              className="rounded-full bg-gradient-to-r from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 text-white"
                            >
                              Mark Done
                            </Button>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TodayScheduleChecklist;

