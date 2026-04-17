import { fireEvent, render, screen, waitFor } from '@testing-library/preact';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createProfile } from '../state/actions';
import { ProfileCreateForm } from './ProfileCreateForm';

vi.mock('../state/actions', () => ({
  createProfile: vi.fn(async () => 'p-1'),
}));

const ROLE_OPTIONS = [
  'Jefe de Proyecto',
  'Arquitecto',
  'Data Engineer Sr',
  'Data Engineer Jr',
  'Data Scientist',
  'DevOps',
  'QA / Testing',
] as const;

describe('ProfileCreateForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders an editable role selector anchored to the input wrapper', () => {
    render(<ProfileCreateForm />);

    const input = screen.getByPlaceholderText('Role or profile name…') as HTMLInputElement;
    expect(input).toBeTruthy();
    const toggle = screen.getByRole('button', { name: 'Show role suggestions' });
    fireEvent.click(toggle);

    const menu = document.querySelector('.profile-create__menu');
    expect(menu).toBeTruthy();

    const wrapper = document.querySelector('.profile-create__input-wrap');
    expect(wrapper).toBeTruthy();
    expect(wrapper?.contains(menu)).toBe(true);

    const values = Array.from(menu?.querySelectorAll('.profile-create__menu-item') ?? []).map((option) => option.textContent ?? '');
    expect(values).toEqual(ROLE_OPTIONS);
  });

  it('submits a selected or typed role as profile name', async () => {
    render(<ProfileCreateForm />);

    const input = screen.getByPlaceholderText('Role or profile name…') as HTMLInputElement;
    const submit = screen.getByRole('button', { name: 'Add profile' });

    fireEvent.input(input, { target: { value: 'Data Engineer Sr' } });
    fireEvent.click(submit);

    await waitFor(() => {
      expect(createProfile).toHaveBeenCalledWith('Data Engineer Sr');
    });
  });
});
