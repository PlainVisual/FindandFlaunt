import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  message?: string;
  size?: number;
  className?: string;
}

export function LoadingSpinner({ message, size = 48, className }: LoadingSpinnerProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-4 py-8", className)}>
      <Loader2 className="animate-spin text-primary" style={{ width: `${size}px`, height: `${size}px` }} />
      {message && <p className="text-muted-foreground text-center">{message}</p>}
    </div>
  );
}
