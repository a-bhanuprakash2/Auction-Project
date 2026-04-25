
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  description?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  className?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  description,
  trend,
  trendValue,
  className,
}) => {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon && <div className="w-4 h-4 text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {(description || trend) && (
          <p className="text-xs text-muted-foreground mt-1 flex items-center">
            {description}
            {trend && (
              <span className={cn(
                "ml-1 flex items-center",
                trend === "up" ? "text-green-500" : trend === "down" ? "text-red-500" : ""
              )}>
                {trend === "up" ? "↑" : trend === "down" ? "↓" : "→"}
                {trendValue && <span className="ml-1">{trendValue}</span>}
              </span>
            )}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default StatCard;
