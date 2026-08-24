'use client';

import { useCallback, useState, useMemo, useRef } from 'react';
import { notFound } from 'next/navigation';
import ReactFlow, {
  type Node,
  type Edge,
  type Connection,
  type NodeChange,
  type EdgeChange,
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  ReactFlowProvider,
} from 'reactflow';
import 'reactflow/dist/style.css';
import {
  Network,
  Plus,
  Trash2,
  Pencil,
  Layout,
  Save,
  RefreshCw,
  X,
  Workflow,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { useStore } from '@/lib/store';
import { getArchNodeTypes } from '@/lib/mock-data';
import { uid } from '@/lib/mock-data';
import type { ArchNodeData, ArchNodeType } from '@/lib/types';
import { ArchNode } from '@/components/arch-node';
import { cn } from '@/lib/utils';

const nodeTypes = { archNode: ArchNode };

const NODE_TYPE_LIBRARY = getArchNodeTypes();

const DEFAULT_LAYOUT: Record<ArchNodeType, { x: number; y: number }> = {
  Frontend: { x: 350, y: 0 },
  'Backend API': { x: 350, y: 150 },
  'API Gateway': { x: 350, y: 75 },
  'Auth Service': { x: 100, y: 150 },
  Database: { x: 350, y: 300 },
  Cache: { x: 600, y: 150 },
  Queue: { x: 600, y: 300 },
  Storage: { x: 100, y: 300 },
  'Payment Service': { x: 600, y: 225 },
  'External API': { x: 100, y: 225 },
  Microservice: { x: 350, y: 225 },
};

function ArchitectureCanvas({ projectId }: { projectId: string }) {
  const project = useStore((s) => s.projects.find((p) => p.id === projectId));
  const addArchNode = useStore((s) => s.addArchNode);
  const updateArchNode = useStore((s) => s.updateArchNode);
  const removeArchNode = useStore((s) => s.removeArchNode);
  const setArchEdges = useStore((s) => s.setArchEdges);
  const addArchEdge = useStore((s) => s.addArchEdge);
  const removeArchEdge = useStore((s) => s.removeArchEdge);

  const [selectedNodeIndex, setSelectedNodeIndex] = useState<number | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newNodeType, setNewNodeType] = useState<ArchNodeType>('Microservice');
  const [newNodeLabel, setNewNodeLabel] = useState('');
  const [newNodeTech, setNewNodeTech] = useState('');
  const [newNodeDesc, setNewNodeDesc] = useState('');

  // Edit form
  const [editLabel, setEditLabel] = useState('');
  const [editTech, setEditTech] = useState('');
  const [editDesc, setEditDesc] = useState('');

  const labelToIndex = useMemo(() => {
    const map = new Map<string, number>();
    project?.archNodes.forEach((n, i) => map.set(n.label, i));
    return map;
  }, [project?.archNodes]);

  const nodes: Node<ArchNodeData>[] = useMemo(() => {
    if (!project) return [];
    return project.archNodes.map((data, index) => ({
      id: data.label,
      type: 'archNode',
      position: DEFAULT_LAYOUT[data.type] || { x: 100 * index, y: 100 * index },
      data,
      selected: selectedNodeIndex === index,
    }));
  }, [project, selectedNodeIndex]);

  const edges: Edge[] = useMemo(() => {
    if (!project) return [];
    return project.archEdges.map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      animated: true,
      style: { stroke: 'hsl(var(--muted-foreground))', strokeWidth: 2 },
    }));
  }, [project]);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      // Selection handling
      changes.forEach((change) => {
        if (change.type === 'select' && change.selected) {
          const idx = labelToIndex.get(change.id);
          if (idx !== undefined) setSelectedNodeIndex(idx);
        }
        if (change.type === 'select' && !change.selected) {
          setSelectedNodeIndex(null);
        }
        if (change.type === 'remove') {
          const idx = labelToIndex.get(change.id);
          if (idx !== undefined) removeArchNode(projectId, idx);
        }
      });
    },
    [projectId, labelToIndex, removeArchNode]
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      changes.forEach((change) => {
        if (change.type === 'remove') {
          removeArchEdge(projectId, change.id);
        }
      });
    },
    [projectId, removeArchEdge]
  );

  const onConnect = useCallback(
    (conn: Connection) => {
      if (conn.source && conn.target) {
        addArchEdge(projectId, conn.source, conn.target);
      }
    },
    [projectId, addArchEdge]
  );

  const handleAddNode = () => {
    const typeInfo = NODE_TYPE_LIBRARY.find((n) => n.type === newNodeType);
    const label = newNodeLabel || typeInfo?.label || 'New Component';
    const baseData: ArchNodeData = {
      label,
      type: newNodeType,
      description: newNodeDesc || `${newNodeType} component`,
      technology: newNodeTech || '',
      responsibilities: ['Custom component'],
    };
    addArchNode(projectId, baseData);
    setAddDialogOpen(false);
    setNewNodeLabel('');
    setNewNodeTech('');
    setNewNodeDesc('');
  };

  const openEditDialog = () => {
    if (selectedNodeIndex === null || !project) return;
    const node = project.archNodes[selectedNodeIndex];
    setEditLabel(node.label);
    setEditTech(node.technology);
    setEditDesc(node.description);
    setEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (selectedNodeIndex === null) return;
    updateArchNode(projectId, selectedNodeIndex, {
      label: editLabel,
      technology: editTech,
      description: editDesc,
    });
    setEditDialogOpen(false);
  };

  const handleDeleteNode = () => {
    if (selectedNodeIndex === null) return;
    removeArchNode(projectId, selectedNodeIndex);
    setSelectedNodeIndex(null);
  };

  const autoArrange = () => {
    // Trigger a re-render by saving edges (forces layout refresh)
    if (project) {
      setArchEdges(projectId, [...project.archEdges]);
    }
  };

  if (!project) return notFound();

  const selectedNode =
    selectedNodeIndex !== null ? project.archNodes[selectedNodeIndex] : null;

  return (
    <div className="flex h-full">
      {/* Left sidebar - component library */}
      <div className="hidden w-56 shrink-0 flex-col border-r border-border bg-card/30 lg:flex">
        <div className="border-b border-border p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Components
          </p>
        </div>
        <div className="flex-1 space-y-1 overflow-y-auto p-2">
          {NODE_TYPE_LIBRARY.map((item) => (
            <button
              key={item.type}
              onClick={() => {
                setNewNodeType(item.type);
                setNewNodeLabel(item.label);
                setAddDialogOpen(true);
              }}
              className="flex w-full items-center gap-2 rounded-md border border-border px-3 py-2 text-left text-xs transition-all hover:border-primary/30 hover:bg-accent"
            >
              <Plus className="h-3 w-3 shrink-0 text-muted-foreground" />
              <span className="truncate">{item.label}</span>
            </button>
          ))}
        </div>
        <div className="border-t border-border p-2">
          <Button
            size="sm"
            variant="outline"
            className="w-full"
            onClick={() => {
              setNewNodeType('Microservice');
              setNewNodeLabel('');
              setAddDialogOpen(true);
            }}
          >
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Custom Node
          </Button>
        </div>
      </div>

      {/* Canvas */}
      <div className="relative flex-1">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          defaultEdgeOptions={{ animated: true }}
          className="bg-dots"
        >
          <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="hsl(var(--border))" />
          <Controls className="!border-border !bg-card !shadow-md" />
          <MiniMap
            className="!border !border-border !bg-card"
            nodeColor="hsl(var(--primary))"
            maskColor="hsl(var(--background) / 0.7)"
          />
        </ReactFlow>

        {/* Top toolbar */}
        <div className="absolute left-3 top-3 z-10 flex gap-2">
          <Button size="sm" variant="secondary" onClick={autoArrange}>
            <Layout className="mr-1.5 h-3.5 w-3.5" />
            Auto Arrange
          </Button>
        </div>

        {/* Details panel */}
        {selectedNode && (
          <div className="absolute bottom-3 right-3 z-10 w-80 animate-fade-in">
            <Card className="shadow-xl">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-sm">{selectedNode.label}</CardTitle>
                    <Badge variant="outline" className="mt-1 text-[10px]">
                      {selectedNode.type}
                    </Badge>
                  </div>
                  <button
                    onClick={() => setSelectedNodeIndex(null)}
                    className="rounded-md p-1 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {selectedNode.technology && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Technology</p>
                    <p className="text-sm">{selectedNode.technology}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Description</p>
                  <p className="text-sm">{selectedNode.description}</p>
                </div>
                {selectedNode.responsibilities.length > 0 && (
                  <div>
                    <p className="mb-1 text-xs font-medium text-muted-foreground">
                      Responsibilities
                    </p>
                    <ul className="space-y-1">
                      {selectedNode.responsibilities.map((r, idx) => (
                        <li key={idx} className="flex items-start gap-1.5 text-xs">
                          <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-primary" />
                          {r}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <div>
                  <p className="mb-1 text-xs font-medium text-muted-foreground">Connections</p>
                  <div className="flex flex-wrap gap-1">
                    {project.archEdges
                      .filter(
                        (e) => e.source === selectedNode.label || e.target === selectedNode.label
                      )
                      .map((e) => {
                        const other = e.source === selectedNode.label ? e.target : e.source;
                        return (
                          <Badge key={e.id} variant="secondary" className="text-[10px]">
                            {other}
                          </Badge>
                        );
                      })}
                    {project.archEdges.filter(
                      (e) => e.source === selectedNode.label || e.target === selectedNode.label
                    ).length === 0 && (
                      <span className="text-xs text-muted-foreground">No connections yet</span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 pt-1">
                  <Button size="sm" variant="outline" className="flex-1" onClick={openEditDialog}>
                    <Pencil className="mr-1 h-3 w-3" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 hover:text-destructive"
                    onClick={handleDeleteNode}
                  >
                    <Trash2 className="mr-1 h-3 w-3" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Component</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={editLabel} onChange={(e) => setEditLabel(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Technology</Label>
              <Input value={editTech} onChange={(e) => setEditTech(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                rows={3}
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveEdit}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Node Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Component</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Type</Label>
              <Select
                value={newNodeType}
                onValueChange={(v) => {
                  setNewNodeType(v as ArchNodeType);
                  const info = NODE_TYPE_LIBRARY.find((n) => n.type === v);
                  if (info && !newNodeLabel) setNewNodeLabel(info.label);
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {NODE_TYPE_LIBRARY.map((n) => (
                    <SelectItem key={n.type} value={n.type}>
                      {n.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={newNodeLabel}
                onChange={(e) => setNewNodeLabel(e.target.value)}
                placeholder="Component name"
              />
            </div>
            <div className="space-y-2">
              <Label>Technology</Label>
              <Input
                value={newNodeTech}
                onChange={(e) => setNewNodeTech(e.target.value)}
                placeholder="e.g. Redis, AWS S3"
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                rows={2}
                value={newNodeDesc}
                onChange={(e) => setNewNodeDesc(e.target.value)}
                placeholder="What does this component do?"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddNode} disabled={!newNodeLabel.trim()}>Add Component</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function ArchitecturePage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  const project = useStore((s) => s.projects.find((p) => p.id === id));
  if (!project) return notFound();

  return (
    <div className="flex h-full flex-col">
      <div className="flex shrink-0 items-center justify-between border-b border-border px-6 py-4">
        <div className="flex items-center gap-2">
          <Network className="h-5 w-5 text-primary" />
          <h1 className="text-lg font-semibold">System Architecture</h1>
          <Badge variant="secondary" className="text-xs">
            {project.archNodes.length} components
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline">
            <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
            Regenerate
          </Button>
          <Button size="sm">
            <Save className="mr-1.5 h-3.5 w-3.5" />
            Save
          </Button>
        </div>
      </div>
      <div className="flex-1 overflow-hidden">
        <ReactFlowProvider>
          <ArchitectureCanvas projectId={id} />
        </ReactFlowProvider>
      </div>
    </div>
  );
}
