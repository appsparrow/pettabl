import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface QuickActionsCardProps {
  onAction: (type: 'feed' | 'walk' | 'letout') => void;
}

const QuickActionsCard = ({ onAction }: QuickActionsCardProps) => {
  const actions = [
    { 
      key: 'feed' as const, 
      label: 'Fed', 
      emoji: '🍽️',
      color: 'bg-gradient-to-r from-green-400 to-green-600 hover:from-green-500 hover:to-green-700'
    },
    { 
      key: 'walk' as const, 
      label: 'Walk', 
      emoji: '🚶',
      color: 'bg-gradient-to-r from-blue-400 to-blue-600 hover:from-blue-500 hover:to-blue-700'
    },
    { 
      key: 'letout' as const, 
      label: 'Let Out', 
      emoji: '🏠',
      color: 'bg-gradient-to-r from-orange-400 to-orange-600 hover:from-orange-500 hover:to-orange-700'
    }
  ];

  return (
    <Card className="rounded-3xl shadow-xl bg-white/80 backdrop-blur-sm border-0">
      <CardHeader>
        <CardTitle className="text-center text-xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Top row - Fed and Let Out (big circles) */}
          <div className="grid grid-cols-2 gap-4">
            <Button
              onClick={() => onAction('feed')}
              className={`h-32 w-full rounded-full ${actions[0].color} text-white text-xl font-bold shadow-lg transition-all duration-200 hover:scale-105`}
            >
              <div className="flex flex-col items-center gap-2">
                <div className="text-4xl">{actions[0].emoji}</div>
                <span>{actions[0].label}</span>
              </div>
            </Button>
            <Button
              onClick={() => onAction('letout')}
              className={`h-32 w-full rounded-full ${actions[2].color} text-white text-xl font-bold shadow-lg transition-all duration-200 hover:scale-105`}
            >
              <div className="flex flex-col items-center gap-2">
                <div className="text-4xl">{actions[2].emoji}</div>
                <span>{actions[2].label}</span>
              </div>
            </Button>
          </div>

          {/* Bottom row - Walk (centered) */}
          <div className="flex justify-center">
            <Button
              onClick={() => onAction('walk')}
              className={`h-32 w-32 rounded-full ${actions[1].color} text-white text-xl font-bold shadow-lg transition-all duration-200 hover:scale-105`}
            >
              <div className="flex flex-col items-center gap-2">
                <div className="text-4xl">{actions[1].emoji}</div>
                <span>{actions[1].label}</span>
              </div>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickActionsCard;

