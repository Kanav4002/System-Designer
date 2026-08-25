'use client';

import { memo } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';
import { cn } from '@/lib/utils';
import type { ArchNodeType } from '@/lib/types';

const NODE_STYLES: Record<ArchNodeType, { icon: string; color: string }> = {
  Frontend: { icon: '🎨', color: 'border-chart-1/40 bg-chart-1/5' },
  'Backend API': { icon: '⚙️', color: 'border-chart-2/40 bg-chart-2/5' },
  'API Gateway': { icon: '🌐', color: 'border-chart-4/40 bg-chart-4/5' },
  'Auth Service': { icon: '🔐', color: 'border-chart-3/40 bg-chart-3/5' },
  Database: { icon: '🗄️', color: 'border-chart-5/40 bg-chart-5/5' },
  Cache: { icon: '⚡', color: 'border-chart-3/40 bg-chart-3/5' },
  Queue: { icon: '📬', color: 'border-chart-4/40 bg-chart-4/5' },
  Storage: { icon: '📁', color: 'border-chart-2/40 bg-chart-2/5' },
  'Payment Service': { icon: '💳', color: 'border-chart-1/40 bg-chart-1/5' },
  'External API': { icon: '🔌', color: 'border-muted-foreground/40 bg-muted/20' },
  Microservice: { icon: '🧩', color: 'border-chart-5/40 bg-chart-5/5' },
};

export interface ArchNodeData {
  label: string;
  type: ArchNodeType;
  description: string;
  technology: string;
  responsibilities: string[];
  [key: string]: unknown;
}

function ArchNodeComponent({ data, selected }: NodeProps<ArchNodeData>) {
  const style = NODE_STYLES[data.type] || NODE_STYLES['Microservice'];
  const seqNumber = data.seqNumber as number | undefined;

  return (
    <div
      className={cn(
        'relative min-w-[170px] max-w-[230px] rounded-xl border bg-card/90 backdrop-blur-sm px-4 py-3 shadow-sm transition-all duration-200 hover:shadow-md',
        selected ? 'border-primary ring-1 ring-primary' : 'border-border/60'
      )}
    >
      {/* Custom Sequence Number Badge */}
      {seqNumber !== undefined && (
        <div className="absolute -right-2.5 -top-2.5 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground shadow-sm ring-2 ring-background">
          {seqNumber}
        </div>
      )}

      <Handle type="target" position={Position.Top} className="!bg-primary/80 !w-2 !h-2 !border-0" />
      <Handle type="target" position={Position.Left} className="!bg-primary/80 !w-2 !h-2 !border-0" />

      <div className="flex items-center gap-2.5">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-base">
          {style.icon}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-semibold tracking-tight text-foreground">{data.label}</p>
          <p className="truncate text-[9px] font-medium text-muted-foreground/80 uppercase tracking-wider">{data.type}</p>
        </div>
      </div>

      {data.technology && (
        <div className="mt-2 border-t border-border/40 pt-1.5">
          <p className="truncate text-[10px] font-medium text-primary bg-primary/5 rounded px-1.5 py-0.5 inline-block">
            {data.technology}
          </p>
        </div>
      )}

      <Handle type="source" position={Position.Bottom} className="!bg-primary/80 !w-2 !h-2 !border-0" />
      <Handle type="source" position={Position.Right} className="!bg-primary/80 !w-2 !h-2 !border-0" />
    </div>
  );
}

export const ArchNode = memo(ArchNodeComponent);
