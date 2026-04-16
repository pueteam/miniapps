import { describe, it, expect } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/preact';
import { DeleteConfirm } from './DeleteConfirm';

describe('DeleteConfirm', () => {
  it('renders confirmation text and Yes/No buttons', () => {
    render(<DeleteConfirm onConfirm={() => {}} onCancel={() => {}} />);
    expect(screen.getByText('Delete profile?')).toBeTruthy();
    expect(screen.getByText('Yes')).toBeTruthy();
    expect(screen.getByText('No')).toBeTruthy();
  });

  it('calls onConfirm when Yes is clicked', () => {
    let confirmed = false;
    render(<DeleteConfirm onConfirm={() => { confirmed = true; }} onCancel={() => {}} />);
    screen.getByText('Yes').click();
    expect(confirmed).toBe(true);
  });

  it('calls onCancel when No is clicked', () => {
    let cancelled = false;
    render(<DeleteConfirm onConfirm={() => {}} onCancel={() => { cancelled = true; }} />);
    screen.getByText('No').click();
    expect(cancelled).toBe(true);
  });

  it('renders alertdialog semantics and focuses the safe action', () => {
    render(<DeleteConfirm onConfirm={() => {}} onCancel={() => {}} />);

    const dialog = screen.getByRole('alertdialog', { name: 'Delete profile confirmation' });
    const cancel = screen.getByRole('button', { name: 'No' });

    expect(dialog.getAttribute('aria-describedby')).toBeTruthy();
    expect(document.activeElement).toBe(cancel);
  });

  it('cancels on Escape', () => {
    let cancelled = false;
    render(<DeleteConfirm onConfirm={() => {}} onCancel={() => { cancelled = true; }} />);

    fireEvent.keyDown(screen.getByRole('alertdialog', { name: 'Delete profile confirmation' }), { key: 'Escape' });

    expect(cancelled).toBe(true);
  });
});
