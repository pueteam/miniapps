import { useCallback, useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { ReactFlow, ReactFlowProvider, Background, Controls, Handle, Position, NodeResizer, EdgeLabelRenderer, useReactFlow, type NodeChange, type Node, type Edge, type NodeProps, type EdgeProps } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import type { Diagram, DiagramElement, DiagramEdge, Kind, Point, Selection, Viewport } from '../model/types';
import { moveElements } from '../model/operations';
import { ElementView } from './ElementView';
import { routeEdge, edgePath } from '../model/routes';
import { diagramBounds } from '../export/bounds';
import { orderElements } from './order';
import { createEdgeFromConnection } from './connect';
import { applyTextEdit } from './editText';
import { randomId } from '../../../lib/id';

export const MIN_NODE_WIDTH = 80;
export const MIN_NODE_HEIGHT = 48;

type NodeData = { element: DiagramElement; edit: (id: string, text: string) => void };
type EdgeData = { doc: Diagram; edge: DiagramEdge; commit: (doc: Diagram) => void };
const ports = { top: Position.Top, right: Position.Right, bottom: Position.Bottom, left: Position.Left };

function PlatonNode({ data, selected }: NodeProps<Node<NodeData>>) {
  const e = data.element;
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState('');
  const cancelled = useRef(false);
  const finish = () => { if (!editing) return; setEditing(false); if (cancelled.current) { cancelled.current = false; return; } data.edit(e.id, text); };
  const cancel = () => { cancelled.current = true; setEditing(false); };
  return <div className={`platon-node ${e.kind === 'group' ? 'platon-group' : ''} ${selected ? 'is-selected' : ''}`} style={{ width: '100%', height: '100%' }}
    onDblClick={event => { event.stopPropagation(); cancelled.current = false; setText(e.kind === 'text' ? e.data.text : e.kind === 'header' ? e.data.description : e.data.name); setEditing(true); }}>
    <NodeResizer isVisible={selected} minWidth={MIN_NODE_WIDTH} minHeight={MIN_NODE_HEIGHT} />
    <ElementView element={e} />
    {e.kind === 'group' && <div className="group-drag-handle" title="Mover grupo" aria-label="Mover grupo" />}
    {editing && <input className="nodrag inline-edit" aria-label="Editar texto" autoFocus value={text} onInput={event => setText(event.currentTarget.value)} onBlur={finish} onKeyDown={event => { event.stopPropagation(); if (event.key === 'Enter') finish(); if (event.key === 'Escape') cancel(); }} />}
    {(e.kind === 'job' || e.kind === 'action') && Object.entries(ports).map(([port, position]) => <span key={port}>
      <Handle type="target" position={position} id={`in-${port}`} className="port-target" />
      <Handle type="source" position={position} id={`out-${port}`} className="port-source" />
    </span>)}
  </div>;
}

function PlatonEdge({ data, selected }: EdgeProps<Edge<EdgeData>>) {
  const { screenToFlowPosition } = useReactFlow();
  if (!data) return null;
  const { doc, edge, commit } = data;
  const path = edgePath(routeEdge(doc, edge));
  return <>
    <defs><marker id={`arrow-${edge.id}`} markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto" markerUnits="userSpaceOnUse"><path d="M0,0 L8,4 L0,8 Z" fill={edge.color} /></marker></defs>
    <path d={path} fill="none" stroke="transparent" strokeWidth={18} className="react-flow__edge-interaction" />
    <path d={path} fill="none" stroke={selected ? '#2487bc' : edge.color} strokeWidth={edge.width + (selected ? 1 : 0)} markerEnd={`url(#arrow-${edge.id})`} className="react-flow__edge-path" />
    {selected && <EdgeLabelRenderer>{edge.waypoints.map((p, index) => <button key={index} className="waypoint nodrag nopan" aria-label={`Mover punto ${index + 1}`} style={{ transform: `translate(-50%, -50%) translate(${p.x}px, ${p.y}px)` }}
      onPointerDown={event => {
        event.stopPropagation(); event.preventDefault();
        const button = event.currentTarget; button.setPointerCapture(event.pointerId);
        let next = p;
        const cleanup = () => { button.removeEventListener('pointermove', move); button.removeEventListener('pointerup', end); button.removeEventListener('pointercancel', cancel); try { button.releasePointerCapture(event.pointerId); } catch { /* ya liberada */ } };
        const move = (ev: PointerEvent) => { next = screenToFlowPosition({ x: ev.clientX, y: ev.clientY }); button.style.transform = `translate(-50%, -50%) translate(${next.x}px, ${next.y}px)`; };
        const end = () => { cleanup(); commit({ ...doc, edges: doc.edges.map(e => e.id === edge.id ? { ...e, waypoints: e.waypoints.map((v, i) => i === index ? next : v) } : e) }); };
        const cancel = () => { cleanup(); button.style.transform = `translate(-50%, -50%) translate(${p.x}px, ${p.y}px)`; };
        button.addEventListener('pointermove', move); button.addEventListener('pointerup', end); button.addEventListener('pointercancel', cancel);
      }} />)}</EdgeLabelRenderer>}
  </>;
}
const nodeTypes = { platon: PlatonNode };
const edgeTypes = { platon: PlatonEdge };
type Props = { doc: Diagram; selection: Selection; viewport: Viewport; onCommit: (doc: Diagram) => void; onSelection: (selection: Selection) => void; onViewport: (viewport: Viewport) => void; onAdd: (kind: Kind, point?: Point) => void };

function Canvas(props: Props) {
  const { doc, selection, viewport, onCommit, onSelection, onViewport, onAdd } = props;
  const [draft, setDraft] = useState<Diagram | null>(null);
  const draftRef = useRef<Diagram | null>(null);
  const startRef = useRef<Diagram | null>(null);
  const { screenToFlowPosition, fitBounds } = useReactFlow();
  const scene = draft ?? doc;
  const preview = (next: Diagram | null) => { draftRef.current = next; setDraft(next); };
  useEffect(() => { preview(null); startRef.current = null; }, [doc]);
  useEffect(() => { const esc = (event: KeyboardEvent) => { if (event.key === 'Escape') { preview(null); startRef.current = null; } }; window.addEventListener('keydown', esc); return () => window.removeEventListener('keydown', esc); }, []);
  const edit = useCallback((id: string, text: string) => {
    const base = draftRef.current ?? doc;
    onCommit(applyTextEdit(base, id, text));
  }, [doc, onCommit]);
  const nodes = useMemo(() => {
    const ordered = orderElements(scene.elements);
    return ordered.map(e => ({ id: e.id, type: 'platon', parentId: e.parentId, position: e.position, width: e.width, height: e.height,
      style: { width: e.width, height: e.height }, dragHandle: e.kind === 'group' ? '.group-drag-handle' : undefined,
      zIndex: e.kind === 'group' ? 0 : 20, selected: selection.elementIds.includes(e.id), data: { element: e, edit } }));
  }, [scene, selection, edit]);
  const edges = useMemo(() => scene.edges.map(edge => ({ ...edge, type: 'platon' as const, sourceHandle: `out-${edge.sourcePort}`, targetHandle: `in-${edge.targetPort}`, zIndex: 10, selected: selection.edgeIds.includes(edge.id), data: { doc: scene, edge, commit: onCommit } })), [scene, selection.edgeIds, onCommit]);
  const finish = () => { if (draftRef.current) onCommit(draftRef.current); preview(null); startRef.current = null; };
  const changes = (list: NodeChange[]) => {
    const selected = list.filter(c => c.type === 'select');
    if (selected.length) {
      const ids = new Set(selection.elementIds);
      for (const change of selected) if (change.type === 'select') { if (change.selected) ids.add(change.id); else ids.delete(change.id); }
      onSelection({ ...selection, elementIds: [...ids] });
    }
    const isResize = (c: NodeChange): c is Extract<NodeChange, { type: 'dimensions' }> =>
      c.type === 'dimensions' && (c.resizing === true || c.resizing === false);
    const sizes = list.filter(isResize);
    if (!sizes.length) return;
    const base = draftRef.current ?? doc;
    preview({ ...base, elements: base.elements.map(e => { const change = sizes.find(c => c.id === e.id); return change?.type === 'dimensions' && change.dimensions ? { ...e, width: Math.max(MIN_NODE_WIDTH, change.dimensions.width), height: Math.max(MIN_NODE_HEIGHT, change.dimensions.height) } : e; }) });
    if (sizes.some(c => c.type === 'dimensions' && c.resizing === false)) finish();
  };
  return <div className="canvas-wrap" onDragOver={event => { event.preventDefault(); if(event.dataTransfer) event.dataTransfer.dropEffect = 'copy'; }} onDrop={event => { event.preventDefault(); const kind = event.dataTransfer?.getData('application/platon-kind') as Kind; if (['job','action','text','group','header'].includes(kind)) onAdd(kind, screenToFlowPosition({ x: event.clientX, y: event.clientY })); }}>
    <ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes} edgeTypes={edgeTypes} viewport={viewport} onMoveEnd={(_, v) => onViewport(v)}
      onNodesChange={changes} onEdgesChange={changes => {
        const ids = new Set(selection.edgeIds);
        for (const change of changes) if (change.type === 'select') { if (change.selected) ids.add(change.id); else ids.delete(change.id); }
        onSelection({ ...selection, edgeIds: [...ids] });
      }}
      onNodeDragStart={() => { startRef.current = doc; }} onNodeDrag={(_, n) => { const base = startRef.current; if (!base) return; const origin = base.elements.find(e=>e.id===n.id); if (!origin) return; const ids = selection.elementIds.includes(n.id) ? selection.elementIds : [n.id]; preview(moveElements(base, ids, { x:n.position.x-origin.position.x, y:n.position.y-origin.position.y })); }} onNodeDragStop={finish}
      onConnect={connection => { const base = draftRef.current ?? doc;
        const edge = createEdgeFromConnection(base, connection, () => randomId());
        if (!edge) return;
        onCommit({ ...base, edges: [...base.edges, edge] }); }}
      deleteKeyCode={null} multiSelectionKeyCode="Shift" selectionOnDrag panOnDrag={[1,2]} panActivationKeyCode="Space" zoomOnScroll={false} zoomActivationKeyCode="Control" minZoom={0.15} maxZoom={3} onlyRenderVisibleElements={false} proOptions={{ hideAttribution: false }}>
      <Background gap={24} size={1} color="#cdd8e1" /><Controls showFitView={false} showInteractive={false} />
    </ReactFlow>
    <button className="fit-button" onClick={() => fitBounds(diagramBounds(doc), { padding:0.15, duration:200 })}>Ajustar contenido</button>
    {!doc.elements.length && <div className="canvas-empty"><div className="empty-diagram">▢ → ◇</div><h2>Tu próxima cadena empieza aquí</h2><p>Arrastra un elemento al lienzo o empieza con un JOB.</p><button type="button" onClick={() => onAdd('job')}>Empezar con un JOB</button><span>Espacio + arrastrar para desplazarte · Ctrl + rueda para ampliar</span></div>}
    <div className="canvas-status">{Math.round(viewport.zoom * 100)}% <span>·</span> {doc.elements.length} elementos <span>·</span> {doc.edges.length} enlaces</div>
  </div>;
}
export function FlowCanvas(props: Props) { return <ReactFlowProvider><Canvas {...props} /></ReactFlowProvider>; }
