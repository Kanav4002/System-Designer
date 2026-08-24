import Link from 'next/link';
import { Boxes } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Logo({ className, showText = true }: { className?: string; showText?: boolean }) {
  return (
    <Link href="/dashboard" className={cn('flex items-center gap-2', className)}>
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
        <Boxes className="h-5 w-5 text-primary-foreground" />
      </div>
      {showText && (
        <span className="text-sm font-semibold tracking-tight">
          System Designer
        </span>
      )}
    </Link>
  );
}
