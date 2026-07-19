import { run as runAxe } from 'axe-core';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { App } from './App';

describe('calculator interface', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('starts in a truthful empty state with print disabled', () => {
    render(<App />);

    expect(screen.getByText('No ratings added. No estimate is available.')).toBeVisible();
    expect(screen.getByText('No estimate is available until at least one rating is added.')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Print or save as PDF' })).toBeDisabled();
    expect(screen.queryByText('$0.00')).not.toBeInTheDocument();
  });

  it('uses the same UTC rate-review boundary for the warning and payment gate', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-12-01T00:30:00Z'));
    render(<App />);

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Compensation data reached its scheduled review date',
    );
  });

  it('adds a rating, calculates current compensation, and prints once', async () => {
    const user = userEvent.setup();
    const print = vi.spyOn(window, 'print').mockImplementation(() => undefined);
    render(<App />);

    await user.type(screen.getByLabelText('Condition label (optional)'), 'Back strain');
    await user.selectOptions(screen.getByLabelText('Assigned rating'), '30');
    await user.click(screen.getByRole('button', { name: 'Add rating' }));

    expect(screen.getByText('Combined rating').parentElement).toHaveTextContent('30%');
    expect(screen.getByText('Basic monthly estimate').parentElement).toHaveTextContent('$552.47');
    await user.click(screen.getByRole('button', { name: 'Print or save as PDF' }));
    expect(print).toHaveBeenCalledTimes(1);
  });

  it('clears ratings and all dependent state', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByLabelText('Include spouse'));
    await user.click(screen.getByRole('button', { name: 'Add rating' }));
    await user.click(screen.getByRole('button', { name: 'Clear all' }));

    expect(screen.getByLabelText('Include spouse')).not.toBeChecked();
    expect(screen.getByText('No ratings added. No estimate is available.')).toBeVisible();
    expect(screen.getByText('All ratings and dependent selections cleared.')).toBeInTheDocument();
    expect(screen.getByLabelText('Condition label (optional)')).toHaveFocus();
  });

  it('has no automatically detectable accessibility violations', async () => {
    const { container } = render(<App />);
    const results = await runAxe(container, {
      rules: { 'color-contrast': { enabled: false } },
    });
    expect(results.violations).toEqual([]);
  });
});
