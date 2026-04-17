import { render } from '@testing-library/preact';
import { describe, expect, it, vi } from 'vitest';
import { Toolbar } from './Toolbar';

vi.mock('./ProfileCreateForm', () => ({ ProfileCreateForm: () => <div>profile-form</div> }));
vi.mock('./ViewToggle', () => ({ ViewToggle: () => <div>view-toggle</div> }));
vi.mock('./ExportButton', () => ({ ExportButton: () => <div>export-button</div> }));
vi.mock('./ZoomControl', () => ({ ZoomControl: () => <div>zoom-control</div> }));

describe('Toolbar', () => {
  it('renders grouped toolbar structure with separators and right-aligned export', () => {
    const { container } = render(<Toolbar />);

    expect(container.querySelectorAll('.toolbar__group').length).toBeGreaterThanOrEqual(3);
    expect(container.querySelectorAll('.toolbar__sep').length).toBeGreaterThanOrEqual(1);
    expect(container.querySelector('.toolbar__spacer')).toBeTruthy();
  });

  it('does not render stale summary text', () => {
    const { queryByText } = render(<Toolbar />);
    expect(queryByText(/DAY · 60 periods/)).toBeNull();
  });

  it('does not duplicate view controls', () => {
    const { getAllByText } = render(<Toolbar />);

    expect(getAllByText('view-toggle')).toHaveLength(1);
    expect(getAllByText('zoom-control')).toHaveLength(1);
  });

  it('does not render an empty summary group', () => {
    const { container } = render(<Toolbar />);

    expect(container.querySelector('.toolbar__group--summary')).toBeNull();
  });
});
