import type { DiagramElement } from '../model/types';

function Shape({ element }: { element: DiagramElement }) {
  const common = { fill: element.style.fill, stroke: element.style.stroke, strokeWidth: element.style.strokeWidth, vectorEffect: 'non-scaling-stroke' as const };
  if (element.style.shape === 'diamond') return <polygon points="50,0 100,50 50,100 0,50" {...common} />;
  if (element.style.shape === 'hexagon') return <polygon points="15,0 85,0 100,50 85,100 15,100 0,50" {...common} />;
  return <rect x="0" y="0" width="100" height="100" rx={element.style.radius * 100 / element.width} ry={element.style.radius * 100 / element.height} {...common} />;
}

function HeaderContent({ element }: { element: DiagramElement }) {
  return <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', width: '100%', height: '100%', alignContent: 'center', gap: '4px 14px', padding: '12px 16px' }}>
    <strong style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{element.data.lote}</strong>
    <strong style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{element.data.cadena}</strong>
    <span style={{ gridColumn: '1 / -1', whiteSpace: 'pre-wrap', overflow: 'hidden' }}>{element.data.description}</span>
  </div>;
}

function MainContent({ element }: { element: DiagramElement }) {
  if (element.kind === 'text') return <div style={{ width: '100%', whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>{element.data.text}</div>;
  if (element.kind === 'header') return <HeaderContent element={element} />;
  if (element.kind === 'group') return <div style={{ position: 'absolute', top: '7px', left: '12px', right: '12px', height: '22px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: element.data.url ? '#075fa8' : element.style.color, textDecoration: element.data.url ? 'underline' : 'none', fontWeight: 650 }}>{element.data.name}</div>;
  return <div style={{ display: 'flex', flexDirection: 'column', alignItems: element.style.align === 'left' ? 'flex-start' : element.style.align === 'right' ? 'flex-end' : 'center', justifyContent: 'center', width: '100%', height: '100%', gap: '3px', padding: element.style.shape === 'rectangle' ? '10px 14px' : '10px 30px', overflow: 'hidden' }}>
    <strong style={{ maxWidth: '100%', overflowWrap: 'anywhere', lineHeight: 1.2, fontWeight: 'inherit' }}>{element.data.name}</strong>
    {element.data.schedule && <span style={{ fontSize: '0.82em', whiteSpace: 'pre-wrap' }}>{element.data.schedule}</span>}
    {(element.data.semaphore || element.data.value) && <span style={{ fontSize: '0.78em', whiteSpace: 'pre-wrap' }}>{[element.data.semaphore, element.data.value].filter(Boolean).join(' · ')}</span>}
  </div>;
}

export function ElementView({ element }: { element: DiagramElement }) {
  return <div data-element-kind={element.kind} style={{ position: 'relative', width: '100%', height: '100%', color: element.style.color, fontSize: `${element.style.fontSize}px`, fontWeight: element.style.bold ? 700 : 400, textAlign: element.style.align, lineHeight: 1.3, overflow: 'visible', userSelect: 'none' }}>
    {element.kind !== 'text' && element.kind !== 'header' && <svg aria-hidden="true" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'visible' }}><Shape element={element} /></svg>}
    <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: element.style.align === 'left' ? 'flex-start' : element.style.align === 'right' ? 'flex-end' : 'center', overflow: 'hidden' }}><MainContent element={element} /></div>
    {element.data.repetitive && <span aria-label="Repetitivo" style={{ position: 'absolute', top: '5px', right: '8px', display: 'grid', placeItems: 'center', width: '19px', height: '19px', borderRadius: '50%', background: element.style.color, color: element.style.fill === 'transparent' ? '#ffffff' : element.style.fill, fontSize: '11px', fontWeight: 800 }}>R</span>}
  </div>;
}
