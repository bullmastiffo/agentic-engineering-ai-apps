import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
// waitFor is used for async React state updates triggered by void async handlers
import type { SettingsResponse } from '../../api/types';
import { SettingsModal } from '../SettingsModal';

const defaultSettings: SettingsResponse = { focus_minutes: 25, break_minutes: 5 };

describe('SettingsModal', () => {
  it('shows current settings values on open', () => {
    render(
      <SettingsModal
        settings={defaultSettings}
        onSave={vi.fn()}
        onClose={vi.fn()}
      />,
    );
    expect(screen.getByLabelText(/focus duration/i)).toHaveValue(25);
    expect(screen.getByLabelText(/break duration/i)).toHaveValue(5);
  });

  it('calls onSave with new values on Save', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn().mockResolvedValue(undefined);
    render(
      <SettingsModal
        settings={defaultSettings}
        onSave={onSave}
        onClose={vi.fn()}
      />,
    );

    const focusInput = screen.getByLabelText(/focus duration/i);
    await user.clear(focusInput);
    await user.type(focusInput, '50');

    await user.click(screen.getByRole('button', { name: /save/i }));

    expect(onSave).toHaveBeenCalledWith({ focus_minutes: 50, break_minutes: 5 });
  });

  it('shows validation error when focus_minutes is 0', async () => {
    const user = userEvent.setup();
    render(
      <SettingsModal
        settings={defaultSettings}
        onSave={vi.fn()}
        onClose={vi.fn()}
      />,
    );
    const focusInput = screen.getByLabelText(/focus duration/i);
    await user.clear(focusInput);
    await user.type(focusInput, '0');
    await user.click(screen.getByRole('button', { name: /save/i }));

    expect(await screen.findByRole('alert')).toBeInTheDocument();
  });

  it('does not call onSave with invalid input', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    render(
      <SettingsModal
        settings={defaultSettings}
        onSave={onSave}
        onClose={vi.fn()}
      />,
    );
    const focusInput = screen.getByLabelText(/focus duration/i);
    await user.clear(focusInput);
    await user.type(focusInput, '0');
    await user.click(screen.getByRole('button', { name: /save/i }));
    expect(onSave).not.toHaveBeenCalled();
  });

  it('calls onClose when Cancel is clicked', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <SettingsModal
        settings={defaultSettings}
        onSave={vi.fn()}
        onClose={onClose}
      />,
    );
    await user.click(screen.getByRole('button', { name: /cancel/i }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('calls onClose on Escape key', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <SettingsModal
        settings={defaultSettings}
        onSave={vi.fn()}
        onClose={onClose}
      />,
    );
    await user.keyboard('{Escape}');
    await waitFor(() => expect(onClose).toHaveBeenCalledOnce());
  });

  it('closes after successful save', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const onSave = vi.fn().mockResolvedValue(undefined);
    render(
      <SettingsModal
        settings={defaultSettings}
        onSave={onSave}
        onClose={onClose}
      />,
    );
    await user.click(screen.getByRole('button', { name: /save/i }));
    await waitFor(() => expect(onClose).toHaveBeenCalledOnce());
  });
});
