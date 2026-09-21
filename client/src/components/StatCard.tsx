import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'default' | 'primary' | 'secondary' | 'accent';
  className?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  description,
  trend,
  variant = 'default',
  className,
}) => {
  const variants = {
    default: 'bg-card',
    primary: 'gradient-primary text-white',
    secondary: 'gradient-accent text-white',
    accent: 'bg-accent/10 border-accent/20',
  };

  const iconVariants = {
    default: 'bg-primary/10 text-primary',
    primary: 'bg-white/20 text-white',
    secondary: 'bg-white/20 text-white',
    accent: 'bg-accent/20 text-accent',
  };

  const textVariants = {
    default: 'text-muted-foreground',
    primary: 'text-white/80',
    secondary: 'text-white/80',
    accent: 'text-muted-foreground',
  };

  return (
    <Card className={cn(
      'overflow-hidden transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1',
      variants[variant],
      className
    )}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className={cn('text-sm font-medium', textVariants[variant])}>
              {title}
            </p>
            <p className="text-3xl font-heading font-bold tracking-tight">
              {typeof value === 'number' ? value.toLocaleString() : value}
            </p>
            {description && (
              <p className={cn('text-xs', textVariants[variant])}>
                {description}
              </p>
            )}
            {trend && (
              <div className={cn(
                'inline-flex items-center text-xs font-medium',
                trend.isPositive ? 'text-success' : 'text-destructive'
              )}>
                <span>{trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%</span>
                <span className={cn('ml-1', textVariants[variant])}>vs last month</span>
              </div>
            )}
          </div>
          <div className={cn('p-3 rounded-xl', iconVariants[variant])}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatCard;
