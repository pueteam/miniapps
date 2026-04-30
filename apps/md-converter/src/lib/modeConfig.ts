import { STORAGE_PREFIX } from './constants';

export type ModeConfigData = {
  title?: string;
  author?: string;
  lang?: string;
  toc?: boolean;
  tocDepth?: number;
  splitLevel?: number;
  css?: string;
  mathRendering?: string;
  highlightStyle?: string;
};

const STORAGE_KEY = `${STORAGE_PREFIX}mode-configs`;

function loadAllConfigs(): Record<string, ModeConfigData> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, ModeConfigData>;
  } catch {
    return {};
  }
}

function saveAllConfigs(configs: Record<string, ModeConfigData>): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(configs));
}

export function getModeConfig(mode: string): ModeConfigData | null {
  const configs = loadAllConfigs();
  return configs[mode] ?? null;
}

export function saveModeConfig(mode: string, config: ModeConfigData): void {
  const configs = loadAllConfigs();
  configs[mode] = { ...(configs[mode] ?? {}), ...config };
  saveAllConfigs(configs);
}

export function clearConfig(): void {
  localStorage.removeItem(STORAGE_KEY);
}
