import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';

import { useWeatherStore } from '@/features/citySearch/store/citySearchStore';
import { useToastStore } from '@/shared/store/toastStore';
import { render } from '@/test/render';

import { SearchBar } from './SearchBar';
import { searchBarLabels } from './SearchBar.labels';

describe('SearchBar', () => {
  beforeEach(() => {
    useWeatherStore.setState({ activeCity: '', history: [], lastRemovedItems: [] });
    useToastStore.setState({ toasts: [] });
  });

  it('renders input and search button', () => {
    render(SearchBar);
    expect(screen.getByRole('searchbox', { name: /city name/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: searchBarLabels.submit })).toBeInTheDocument();
  });

  it('does not update activeCity when input is empty', async () => {
    render(SearchBar);
    await userEvent.click(screen.getByRole('button', { name: searchBarLabels.submit }));
    expect(useWeatherStore.getState().activeCity).toBe('');
  });

  it('shows toast error when submitted with empty input', async () => {
    render(SearchBar);
    await userEvent.click(screen.getByRole('button', { name: searchBarLabels.submit }));
    expect(useToastStore.getState().toasts[0]?.message).toMatch(/please enter a city name/i);
  });

  it('sets activeCity with trimmed value on button click', async () => {
    render(SearchBar);
    await userEvent.type(screen.getByRole('searchbox'), '  London  ');
    await userEvent.click(screen.getByRole('button', { name: searchBarLabels.submit }));
    expect(useWeatherStore.getState().activeCity).toBe('London');
  });

  it('sets activeCity when Enter key is pressed', async () => {
    render(SearchBar);
    await userEvent.type(screen.getByRole('searchbox'), 'Paris{Enter}');
    expect(useWeatherStore.getState().activeCity).toBe('Paris');
  });

  it('does not update activeCity for whitespace-only input', async () => {
    render(SearchBar);
    await userEvent.type(screen.getByRole('searchbox'), '   ');
    await userEvent.click(screen.getByRole('button', { name: searchBarLabels.submit }));
    expect(useWeatherStore.getState().activeCity).toBe('');
    expect(useToastStore.getState().toasts[0]?.message).toMatch(/please enter a city name/i);
  });

  it('submits via form submit event (not only button click)', async () => {
    render(SearchBar);
    const input = screen.getByRole('searchbox');
    await userEvent.type(input, 'Tokyo');
    await userEvent.type(input, '{Enter}');
    expect(useWeatherStore.getState().activeCity).toBe('Tokyo');
  });
});
