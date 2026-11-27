import type { ComponentChildren } from 'preact';

const previews: Record<string, ComponentChildren> = {
  'platon-editor': (
    <>
      <path d="m48 51 20-12m-20 18 20 12m12-30 20 12m-20 18 20-12" stroke-opacity="0.65" />
      <g fill="currentColor" fill-opacity="0.12">
        <circle cx="43" cy="54" r="6" />
        <circle cx="74" cy="36" r="6" />
        <circle cx="74" cy="72" r="6" />
        <circle cx="105" cy="54" r="6" />
      </g>
    </>
  ),
  'template-mgr': (
    <>
      <rect x="25" y="33" width="41" height="44" rx="3" />
      <path d="M33 43h25M33 62h23M33 69h16" stroke-opacity="0.65" />
      <rect x="33" y="49" width="25" height="7" rx="2" fill="currentColor" fill-opacity="0.2" stroke="none" />
      <g fill="currentColor" fill-opacity="0.1" stroke-opacity="0.65">
        <rect x="81" y="36" width="42" height="15" rx="3" />
        <rect x="81" y="59" width="42" height="15" rx="3" />
      </g>
      <path d="M90 43.5h23M90 66.5h16" />
    </>
  ),
  'md-converter': (
    <>
      <rect x="22" y="35" width="38" height="38" rx="3" />
      <path d="M30 45h20M30 54h15M30 63h18" stroke-opacity="0.65" />
      <path d="M69 54h15m-5-5 5 5-5 5" />
      <g fill="currentColor" fill-opacity="0.12">
        <rect x="94" y="33" width="32" height="10" rx="3" />
        <rect x="94" y="49" width="32" height="10" rx="3" />
        <rect x="94" y="65" width="32" height="10" rx="3" />
      </g>
    </>
  ),
  'sticky-board': (
    <>
      <g fill="currentColor" stroke-opacity="0.75">
        <rect x="23" y="35" width="28" height="28" rx="2" fill-opacity="0.18" />
        <rect x="60" y="46" width="28" height="28" rx="2" fill-opacity="0.3" />
        <rect x="97" y="37" width="28" height="28" rx="2" fill-opacity="0.09" />
      </g>
      <path d="M29 43h14m-14 6h8m29 5h14m-14 6h8m29-15h14m-14 6h8" stroke-opacity="0.8" />
    </>
  ),
  'planning-board': (
    <>
      <path d="M21 47h106M21 62h106M49 32v45M75 32v45M101 32v45" stroke-opacity="0.35" />
      <path d="M25 39h15M25 54h11M25 69h15" stroke-opacity="0.75" />
      <g fill="currentColor" stroke="none">
        <rect x="55" y="35" width="32" height="8" rx="2" fill-opacity="0.8" />
        <rect x="81" y="50" width="40" height="8" rx="2" fill-opacity="0.5" />
        <rect x="66" y="65" width="34" height="8" rx="2" fill-opacity="0.65" />
      </g>
    </>
  ),
};

const fallbackPreview = (
  <>
    <rect x="21" y="34" width="106" height="14" rx="3" fill="currentColor" fill-opacity="0.15" stroke="none" />
    <rect x="21" y="55" width="38" height="21" rx="3" stroke-opacity="0.55" />
    <path d="M69 58h55M69 66h43M69 74h35" stroke-opacity="0.65" />
  </>
);

export function AppPreview({ name }: { name: string }) {
  return (
    <svg
      class="app-preview"
      width="148"
      height="92"
      viewBox="0 0 148 92"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M8 24V14a7 7 0 0 1 7-7h118a7 7 0 0 1 7 7v10Z" fill="currentColor" fill-opacity="0.08" stroke="none" />
      <rect x="8" y="7" width="132" height="78" rx="7" stroke-opacity="0.7" />
      <path d="M8 24h132" stroke-opacity="0.35" />
      <g fill="currentColor" fill-opacity="0.65" stroke="none">
        <circle cx="19" cy="16" r="1.6" />
        <circle cx="26" cy="16" r="1.6" />
        <circle cx="33" cy="16" r="1.6" />
      </g>
      {Object.hasOwn(previews, name) ? previews[name] : fallbackPreview}
    </svg>
  );
}
