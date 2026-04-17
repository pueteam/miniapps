import { render } from '@testing-library/preact';
import { h } from 'preact';
import { useRef } from 'preact/hooks';
import { describe, expect, it } from 'vitest';
import { useProfileDrag } from './useProfileDrag';

// Component that uses the hook for testing
function TestComponent() {
  const ref = useRef<HTMLDivElement>(null);
  useProfileDrag({
    profileId: 'p1',
    currentIndex: 0,
    totalProfiles: 3,
    rowHeight: 48,
    ref,
  });

  return h('div', { ref }, 'test');
}

describe('useProfileDrag', () => {
  it('should be a valid function', () => {
    expect(typeof useProfileDrag).toBe('function');
  });

  it('should be usable within a component', () => {
    const { container } = render(h(TestComponent));
    expect(container.querySelector('div')).toBeTruthy();
  });
});
