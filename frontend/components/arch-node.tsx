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

  return (
    <div
      className={cn(
        'min-w-[160px] max-w-[220px] rounded-xl border-2 bg-card px-4 py-3 shadow-md transition-all',
        style.color,
        selected && 'ring-2 ring-primary ring-offset-2 ring-offset-background'
      )}
    >
      <Handle type="target" position={Position.Top} className="!bg-primary" />
      <Handle type="target" position={Position.Left} className="!bg-primary" />

      <div className="flex items-center gap-2">
        <span className="text-lg">{style.icon}</span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{data.label}</p>
          <p className="truncate text-[10px] text-muted-foreground">{data.type}</p>
        </div>
      </div>
      {data.technology && (
        <p className="mt-1.5 truncate text-[10px] font-medium text-muted-foreground">
          {data.technology}
        </p>
      )}

      <Handle type="source" position={Position.Bottom} className="!bg-primary" />
      <Handle type="source" position={Position.Right} className="!bg-primary" />
    </div>
  );
}

export const ArchNode = memo(ArchNodeComponent);
