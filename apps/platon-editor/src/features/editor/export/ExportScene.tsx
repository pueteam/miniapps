import { absolutePosition, ancestors } from '../model/geometry';
import type { Diagram } from '../model/types';
import { ElementView } from '../canvas/ElementView';
import { edgePath, routeEdge } from '../model/routes';
import type { Bounds } from './bounds';

export function ExportScene({ doc, bounds }: { doc: Diagram; bounds: Bounds }) {
  const groups = doc.elements.filter(element => element.kind === 'group').sort((a, b) => ancestors(doc, a.id).length - ancestors(doc, b.id).length);
  const elements = doc.elements.filter(element => element.kind !== 'group');
  const renderElement = (element: Diagram['elements'][number], layer: number) => {
    const position = absolutePosition(doc, element.id);
    return <div key={element.id} style={{ position: 'absolute', left: `${position.x - bounds.x}px`, top: `${position.y - bounds.y}px`, width: `${element.width}px`, height: `${element.height}px`, zIndex: layer }}><ElementView element={element} /></div>;
  };
  return <div data-export-scene style={{ position: 'relative', width: `${bounds.width}px`, height: `${bounds.height}px`, overflow: 'hidden', background: 'transparent' }}>
    {groups.map(element => renderElement(element, 0))}
    <svg aria-hidden="true" width={bounds.width} height={bounds.height} viewBox={`${bounds.x} ${bounds.y} ${bounds.width} ${bounds.height}`} style={{ position: 'absolute', inset: 0, overflow: 'visible', zIndex: 1 }}>
      <defs>{doc.edges.map((edge, index) => <marker key={edge.id} id={`export-arrow-${index}`} markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto" markerUnits="userSpaceOnUse"><path d="M0,0 L10,5 L0,10 Z" fill={edge.color} /></marker>)}</defs>
      {doc.edges.map((edge, index) => <path key={edge.id} d={edgePath(routeEdge(doc, edge))} fill="none" stroke={edge.color} strokeWidth={edge.width} markerEnd={`url(#export-arrow-${index})`} />)}
    </svg>
    {elements.map(element => renderElement(element, 2))}
  </div>;
}
